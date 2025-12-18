"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import * as Video from "twilio-video";
import { Header } from "../../../components/Header";
import { getPatient, createVisit, transcribeAudio, updateVisit, upsertVisitNote } from '../../../lib/api';
import { uploadToPrivateBucket } from '../../../lib/storage';
import { convertToMP3 } from '../../../lib/audioConverter';
import { useAudioRecorder } from '../../../lib/useAudioRecorder';

// Note: the modal will embed the existing patient routes (/patients/:id and /patients/:id/visit) via iframes so the full visit experience is used.

export default function DemoVideoPage() {
  const roomName = "demo-room";
  const localOverlayRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);
  const localTracksRef = useRef<any[]>([]);
  const twilioRoomRef = useRef<any | null>(null);
  const attachedEls = useRef<HTMLElement[]>([]);

  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  // New: demo mode (patient/doctor)
  const [mode, setMode] = useState<'patient' | 'doctor'>('patient');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modal manager: allow both modals to be minimized/stacked but only one open at a time
  const [modals, setModals] = useState<{
    recent: { open: boolean; minimized: boolean };
    start: { open: boolean; minimized: boolean };
  }>({ recent: { open: false, minimized: false }, start: { open: false, minimized: false } });

  const anyModalVisible = Object.values(modals).some(m => m.open || m.minimized);

  const openModal = (which: 'recent' | 'start') => {
    setModals((prev) => {
      const next = { recent: { ...prev.recent }, start: { ...prev.start } };
      // if opening the same modal, just restore it
      next[which].open = true;
      next[which].minimized = false;
      // minimize/close others
      (['recent','start'] as const).forEach((k) => {
        if (k !== which) {
          if (prev[k].open) {
            next[k].open = false;
            next[k].minimized = true;
          }
        }
      });
      return next;
    });
  };

  const minimizeModal = (which: 'recent' | 'start') => {
    setModals((prev) => ({ ...prev, [which]: { open: false, minimized: true } }));
  };

  const restoreModal = (which: 'recent' | 'start') => {
    openModal(which);
  };

  const closeModal = (which: 'recent' | 'start') => {
    setModals((prev) => ({ ...prev, [which]: { open: false, minimized: false } }));
  };

  // Modal cloned components (do NOT modify original app routes — this clones logic & UX here)
  const ModalRecentVisits: React.FC<{ patientId: string }> = ({ patientId }) => {
    const [loading, setLoading] = useState(false);
    const [visits, setVisits] = useState<any[]>([]);
    const [patientName, setPatientName] = useState<string>('');

    useEffect(() => {
      let mounted = true;
      (async () => {
        setLoading(true);
        try {
          const data = await getPatient(patientId);
          if (!mounted) return;
          setVisits(data.visits || []);
          setPatientName(data.patient?.full_name || 'Patient');
        } catch (e) {
          console.warn('Failed to load visits', e);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [patientId]);

    if (loading) return <div>Loading visits...</div>;
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Patient: {patientName}</h3>
            <div className="text-sm text-[#718096]">Recent Visits</div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/patients/${patientId}`} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded text-sm">Open Patient Page</a>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-[#5BB5E8] rounded-2xl p-4 text-white">
          <div className="text-sm">Patient</div>
          <div className="text-xl font-bold mt-1">{patientName}</div>
        </div>

        {/* Visits List (full scrollable area) */}
        <div className="bg-white rounded-2xl p-4 border">
          <div className="text-sm text-[#4c739a] font-semibold mb-3">Previous Visits</div>
          <div className="space-y-3">
            {(!visits || visits.length === 0) && <div className="text-sm text-[#718096]">No previous visits</div>}
            {visits.map((v) => (
              <div key={v.id} className="p-3 border rounded flex items-center justify-between">
                <div className="text-sm">{v.status} • {new Date(v.created_at || Date.now()).toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <a className="text-blue-600 text-sm" href={`/visits/${v.id}`} target="_blank" rel="noreferrer">Open</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ModalStartVisit: React.FC<{ patientId: string; onCreated?: (id: string) => void }> = ({ patientId, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [visit, setVisit] = useState<any | null>(null);
    const [recording, setRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recorder = useAudioRecorder();

    // SOAP note fields cloned from visit page
    const [chiefComplaint, setChiefComplaint] = useState("");
    const [hpi, setHpi] = useState("");
    const [bp, setBp] = useState("");
    const [hr, setHr] = useState("");
    const [temp, setTemp] = useState("");
    const [weight, setWeight] = useState("");
    const [physicalExam, setPhysicalExam] = useState("");
    const [assessment, setAssessment] = useState("");
    const [treatmentPlan, setTreatmentPlan] = useState("");

    const startVisit = async () => {
      setLoading(true);
      try {
        const v = await createVisit({ patient_id: patientId, status: 'in_progress' } as any);
        setVisit(v);
        onCreated && onCreated(v.id);
      } catch (e) {
        console.warn('Failed to start visit', e);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    const handleStartRecording = async () => {
      setError(null);
      try {
        await recorder.startRecording();
        setRecording(true);
      } catch (e) {
        setError((e as Error).message);
      }
    };

    const handleStopRecording = async () => {
      try {
        const blob = await recorder.stopRecording();
        setRecording(false);
        if (!visit) {
          setError('No visit created yet');
          return;
        }
        setSaving(true);
        const mp3Blob = await convertToMP3(blob);
        const mp3File = new File([mp3Blob], `recording-${Date.now()}.mp3`, { type: 'audio/mp3' });
        const upload = await uploadToPrivateBucket(mp3File);
        await updateVisit(visit.id, { audio_url: upload.path });

        setTranscribing(true);
        try {
          const res = await transcribeAudio(upload.path, visit.id);
          // Optionally save or upsert notes based on transcription
          if (res?.structured) {
            try {
              await upsertVisitNote(visit.id, res.structured, 'draft');
            } catch (e) { /* ignore */ }
          }
        } catch (e) {
          console.warn('Transcription failed', e);
        } finally {
          setTranscribing(false);
          setSaving(false);
        }
      } catch (e) {
        setError((e as Error).message);
        setSaving(false);
      }
    };

    return (
      <div>
        <div className="mb-3 text-sm text-[#718096]">Start visit for <strong>{patients.find(p => p.id === patientId)?.full_name}</strong></div>
        {!visit && (
          <div className="p-3 border rounded bg-white">
            <p className="text-sm text-[#4c739a] mb-2">Create a new visit for this patient to begin recording.</p>
            <div className="flex gap-2">
              <button onClick={startVisit} disabled={loading} className="px-3 py-2 bg-[#5BB5E8] text-white rounded">{loading ? 'Starting...' : 'Start Visit'}</button>
              <a href={`/patients/${patientId}`} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded">Open patient page</a>
            </div>
            {error && <div className="mt-2 text-red-600">{error}</div>}
          </div>
        )}

        {visit && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="p-4 border rounded bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Visit: {visit.id}</div>
                  <a className="text-sm text-blue-600" href={`/visits/${visit.id}`} target="_blank" rel="noreferrer">Open Visit</a>
                </div>
              </div>

              <div className="border p-4 rounded bg-[#f6f7f8]">
                {!recording && !recorder.isRecording && !transcribing && (
                  <button onClick={handleStartRecording} className="px-4 py-2 bg-[#137fec] text-white rounded">Start Recording</button>
                )}
                {recording && (
                  <div className="flex gap-2 items-center">
                    <button onClick={handleStopRecording} className="px-4 py-2 bg-red-600 text-white rounded">Stop Recording</button>
                    <span className="text-sm text-red-600">Recording...</span>
                  </div>
                )}
                {saving && <div className="text-sm text-[#4c739a]">Saving recording...</div>}
                {transcribing && <div className="text-sm text-[#4c739a]">Transcribing...</div>}
              </div>

              {/* Previous Visits in left column */}
              <div className="bg-white rounded-2xl p-4 border">
                <div className="text-sm text-[#4c739a] font-semibold mb-3">Previous Visits</div>
                <div className="space-y-3">
                  <div className="text-sm text-[#718096]">Use patient page to view all historical visits.</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                <div className="border-b border-[#e7edf3] px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#137fec]/10 text-[#137fec] p-2 rounded-lg">
                      <span className="text-[20px]">📋</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#0d141b]">Visit Note</h2>
                  </div>
                </div>

                <div className="p-6 space-y-4 overflow-auto">
                  <div>
                    <label className="block text-xs font-semibold text-[#4c739a] uppercase tracking-wide mb-1.5">Current Symptoms</label>
                    <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} className="w-full bg-[#f6f7f8] border-[#e7edf3] rounded-lg text-sm text-[#0d141b] focus:ring-[#137fec] focus:border-[#137fec] placeholder:text-[#4c739a]/50 resize-none" rows={3} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4c739a] uppercase tracking-wide mb-1.5">Past Medical History</label>
                    <textarea value={hpi} onChange={(e) => setHpi(e.target.value)} className="w-full bg-[#f6f7f8] border-[#e7edf3] rounded-lg text-sm text-[#0d141b] focus:ring-[#137fec] focus:border-[#137fec] placeholder:text-[#4c739a]/50 resize-none" rows={4} />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={async () => {
                      if (!visit) return;
                      try {
                        setSaving(true);
                        const noteData = {
                          subjective: { chief_complaint: chiefComplaint, hpi },
                          objective: { vitals: { bp, hr, temp, weight }, physical_exam: physicalExam },
                          assessment, plan: treatmentPlan
                        };
                        await upsertVisitNote(visit.id, noteData, 'draft');
                        showToast('Saved draft');
                      } catch (e) {
                        console.warn(e);
                      } finally { setSaving(false); }
                    }} className="px-3 py-2 bg-[#5BB5E8] text-white rounded">Save Draft</button>

                    <a className="px-3 py-2 border rounded" href={`/visits/${visit.id}`} target="_blank" rel="noreferrer">Open Visit</a>
                  </div>

                  {saving && <div className="text-sm text-[#4c739a]">Saving...</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const [toast, setToast] = useState<string | null>(null);
  const addLog = (m: string) => setLogs((l) => [...l.slice(-50), `${new Date().toLocaleTimeString()} ${m}`]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // enumerate devices
    (async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(cams);
        if (cams.length > 0) setSelectedDeviceId(cams[0].deviceId || null);
      } catch (e) {
        console.warn('enumerateDevices failed', e);
      }
    })();

    return () => {
      stopCall();
    };
  }, []);

  // fetch patients list when doctor mode selected
  useEffect(() => {
    if (mode !== 'doctor') return;
    (async () => {
      try {
        const mod = await import('../../../lib/api');
        const p = await mod.getPatients();
        setPatients(p);
      } catch (e) {
        console.warn('Failed to load patients', e);
      }
    })();
  }, [mode]);

  const startLocal = async () => {
    const opts: any = { audio: true, video: true };
    if (selectedDeviceId) opts.video = { deviceId: selectedDeviceId };
    const tracks = await Video.createLocalTracks(opts as any);
    localTracksRef.current = tracks;
    const v = tracks.find((t: any) => t.kind === 'video');
    if (v && localOverlayRef.current) {
      // ensure media container exists
      let media = localOverlayRef.current.querySelector('.local-media') as HTMLElement | null;
      if (!media) {
        media = document.createElement('div');
        media.className = 'local-media w-full h-full';
        localOverlayRef.current.appendChild(media);
      }
      media.innerHTML = '';
      const el = (v as any).attach();
      el.classList.add('w-full','h-full','object-cover','rounded');
      media.appendChild(el);
    }

    const label = (v as any)?.mediaStreamTrack?.label ?? '';
    if (/test|fake|virtual|sample|pattern|demo/i.test(label)) {
      setPermissionMessage('A virtual/test camera appears to be selected. Choose a real camera from the selector or check your browser/OS camera settings.');
      addLog('Detected virtual/test camera: ' + label);
    } else {
      setPermissionMessage(null);
    }

    // if localMuted is set, apply to new audio track
    const audioTrack = tracks.find((t: any) => t.kind === 'audio');
    if (audioTrack && localMuted) {
      try { (audioTrack as any).enable(false); } catch (e) {}
    }

    return tracks;
  };

  const start = async () => {
    try {
      addLog('Joining demo room');
      const sb = supabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        addLog('Sign in required');
        return;
      }
      const tracks = await startLocal();
      const res = await fetch(`/api/twilio/token?room=${encodeURIComponent(roomName)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        addLog('Failed to get Twilio token: ' + (b?.error || res.status));
        return;
      }
      const { token: jwt } = await res.json();
      const room = await Video.connect(jwt, { name: roomName, tracks });
      twilioRoomRef.current = room;
      setConnected(true);
      addLog('Connected to demo room');

      room.participants.forEach((p: any) => {
        p.tracks.forEach((pub: any) => {
          if (pub.track && pub.track.attach) {
            const el = pub.track.attach();
            el.classList.add('w-full','h-full','object-cover');
            attachedEls.current.push(el);
            remoteRef.current?.appendChild(el);
          }
        });
        p.on('trackSubscribed', (track: any) => {
          const el = track.attach();
          el.classList.add('w-full','h-full','object-cover');
          attachedEls.current.push(el);
          remoteRef.current?.appendChild(el);
        });
      });

      room.on('participantConnected', (participant: any) => {
        addLog('Participant connected: ' + participant.identity);
        participant.on('trackSubscribed', (track: any) => {
          const el = track.attach();
          el.classList.add('w-full','h-full','object-cover');
          attachedEls.current.push(el);
          remoteRef.current?.appendChild(el);
        });
      });

      room.on('disconnected', () => {
        addLog('Disconnected');
        setConnected(false);
        attachedEls.current.forEach((el) => { try { el.remove(); } catch(e) {} });
        attachedEls.current = [];
        twilioRoomRef.current = null;
      });

    } catch (e) {
      console.error(e);
      addLog('Error joining demo room');
    }
  };

  const stopCall = () => {
    addLog('Leaving demo room');
    localTracksRef.current.forEach((t) => { try { t.stop(); } catch(e) {} });
    localTracksRef.current = [];
    if (localOverlayRef.current) localOverlayRef.current.innerHTML = '';
    attachedEls.current.forEach((el) => { try { el.remove(); } catch(e) {} });
    attachedEls.current = [];
    if (twilioRoomRef.current) {
      try { twilioRoomRef.current.disconnect(); } catch (e) { console.warn(e); }
      twilioRoomRef.current = null;
    }
    setConnected(false);
  };

  const toggleLocalMute = () => {
    const audioTrack = localTracksRef.current.find((t: any) => t.kind === 'audio');
    if (!audioTrack) return addLog('No local audio track');
    const enabled = audioTrack.isEnabled !== false;
    try {
      audioTrack.enable(!enabled);
      setLocalMuted(!enabled);
      addLog(enabled ? 'Local microphone muted' : 'Local microphone unmuted');
      showToast(enabled ? 'Local microphone muted' : 'Local microphone unmuted');
    } catch(e) {
      console.warn(e);
    }
  };

  const toggleRemoteMute = () => {
    // toggle mute on attached remote audio elements
    const newState = !remoteMuted;
    attachedEls.current.forEach((el) => {
      try {
        if ((el as HTMLAudioElement).tagName === 'AUDIO' || el instanceof HTMLAudioElement) {
          (el as HTMLAudioElement).muted = newState;
        }
      } catch (e) {}
    });
    setRemoteMuted(newState);
    addLog(newState ? 'Remote audio muted' : 'Remote audio unmuted');
    showToast(newState ? 'Remote audio muted' : 'Remote audio unmuted');
  };

  // ensure attached remote elements are moved into the active remote container when modal visibility changes
  useEffect(() => {
    if (!remoteRef.current) return;
    if (!attachedEls.current || attachedEls.current.length === 0) return;
    attachedEls.current.forEach((el) => {
      try { remoteRef.current?.appendChild(el); } catch (e) {}
    });
  }, [anyModalVisible]);

  return (
    <div className="bg-[#F3F6FD] min-h-screen">
      <Header />
      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Demo Room</h2>
                <p className="text-sm text-[#718096] mt-1">Room: <code className="bg-gray-100 px-2 py-1 rounded">{roomName}</code></p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs text-[#718096] mr-1">Mode</label>
                <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              {mode === 'doctor' && (
                <div className="flex items-center gap-3">
                  <label className="text-xs text-[#718096] mr-1">Patient</label>
                  <select value={selectedPatientId ?? ''} onChange={(e) => setSelectedPatientId(e.target.value || null)} className="border rounded px-2 py-1 text-sm">
                    <option value="">Select patient...</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-[#718096] mr-2">Camera</label>
                <select
                  aria-label="Select camera"
                  className="border rounded px-2 py-1 text-sm"
                  value={selectedDeviceId ?? ''}
                  onChange={(e) => setSelectedDeviceId(e.target.value || null)}
                >
                  {videoDevices.length === 0 && <option value="">(No cameras detected)</option>}
                  {videoDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera (permission required)'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {mode === 'doctor' && selectedPatientId && (
                <>
                  <button onClick={() => openModal('recent')} className="px-3 py-2 rounded border bg-white">View Recent Visits</button>
                  <button onClick={() => openModal('start')} className="px-3 py-2 rounded border bg-white">Start Visit</button>
                </>
              )}

              <button onClick={toggleRemoteMute} className="px-3 py-2 rounded border bg-white">{remoteMuted ? 'Unmute' : 'Mute'}</button>
              <button onClick={start} disabled={connected} className="px-3 py-2 rounded bg-[#5BB5E8] text-white disabled:opacity-50">Join Demo Room</button>
              <button onClick={stopCall} disabled={!connected} className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50">Leave</button>
            </div>
          </div>

          <div className="bg-black rounded-2xl overflow-hidden h-[56vh] md:h-[72vh] relative flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              {/* main remote area — hidden when modal overlay/mini widgets are visible */}
              {!anyModalVisible && <div ref={remoteRef} className="w-full h-full flex items-center justify-center"></div>}

              {/* remote mute button bottom-left — only when modal is not open */}
              {!anyModalVisible && (
                <button
                  aria-label="Toggle remote audio"
                  onClick={toggleRemoteMute}
                  className="absolute left-4 bottom-4 flex flex-col items-center text-white bg-black/40 p-2 rounded-md z-[50]"
                >
                  <span className="material-icons-outlined">{remoteMuted ? 'volume_off' : 'volume_up'}</span>
                  <span className="text-xs mt-1">{remoteMuted ? 'Unmute' : 'Mute'}</span>
                </button>
              )}



              <div ref={localOverlayRef} className="absolute bottom-4 right-4 w-[34%] max-w-[220px] aspect-[3/4] rounded overflow-hidden border-2 border-white shadow-md bg-black z-[55]">
                <div className="local-media w-full h-full"></div>
                {/* local mic button bottom-right of overlay - persists even if local media changes */}
                <button
                  aria-label="Toggle local mic"
                  onClick={toggleLocalMute}
                  className="absolute right-2 bottom-2 bg-black/50 text-white p-1 rounded-full flex flex-col items-center"
                >
                  <span className="material-icons-outlined">{localMuted ? 'mic_off' : 'mic'}</span>
                  <span className="text-[10px] mt-1">{localMuted ? 'Unmute' : 'Mute'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* fixed remote overlay above modal when modal open */}
          {anyModalVisible && selectedPatientId && (
            <div className="fixed top-4 right-4 w-[22%] max-w-[320px] aspect-[3/4] rounded overflow-hidden border-2 border-white shadow-lg bg-black z-[90]">
              <div ref={remoteRef} className="w-full h-full flex items-center justify-center"></div>
              <button aria-label="Toggle remote audio" onClick={toggleRemoteMute} className="absolute left-2 top-2 bg-black/50 text-white p-1 rounded-full">
                <span className="material-icons-outlined">{remoteMuted ? 'volume_off' : 'volume_up'}</span>
              </button>
            </div>
          )}

          <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="font-semibold mb-2">Session Log</h4>

          {/* Minimized modal widgets (stack in bottom-right) */}
          <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2 z-[95]">
            {['recent','start'].map((which, i) => {
              const state = modals[which as 'recent'|'start'];
              if (!state?.minimized) return null;
              return (
                <div key={which} className="bg-white shadow-lg rounded-md px-3 py-2 w-56 flex items-center justify-between border">
                  <div className="text-sm">{which === 'recent' ? 'Recent Visits' : 'Start Visit'}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => restoreModal(which as 'recent'|'start')} className="text-sm px-2 py-1">Open</button>
                    <button onClick={() => closeModal(which as 'recent'|'start')} className="text-sm px-2 py-1">Close</button>
                  </div>
                </div>
              );
            })}
          </div> 
            <div className="text-xs h-40 overflow-auto bg-gray-50 p-3 rounded">
              {logs.length === 0 ? <div className="text-gray-400">No events yet</div> : logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>

          {/* Modal area (inline cloned components, not iframes) */}
          {selectedPatientId && (
            (['recent','start'] as const).map((which) => (
              modals[which].open ? (
                <div key={which} className={`fixed inset-0 z-[70] flex items-start justify-center p-6`} onMouseDown={(e) => {
                  if (e.target === e.currentTarget) minimizeModal(which);
                }}>
                  <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl ${modals[which].minimized ? 'h-12' : 'max-h-[80vh] overflow-auto'}`}>
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 mr-2">
                          <button aria-label="Minimize" onClick={() => minimizeModal(which)} className="p-1 rounded bg-gray-100 hover:bg-gray-200"><span className="material-icons-outlined">minimize</span></button>
                          <button aria-label="Close" onClick={() => closeModal(which)} className="p-1 rounded bg-gray-100 hover:bg-gray-200"><span className="material-icons-outlined">close</span></button>
                        </div>
                        <div>
                          <div className="font-semibold">{which === 'recent' ? 'Recent Visits' : 'Start Visit'}</div>
                          <div className="text-sm text-[#718096]">for {patients.find(p => p.id === selectedPatientId)?.full_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                      </div>
                    </div>
                    {!modals[which].minimized && (
                      <div className="p-4">
                        {which === 'recent' && <ModalRecentVisits patientId={selectedPatientId} />}
                        {which === 'start' && <ModalStartVisit patientId={selectedPatientId} onCreated={(id) => { addLog('Visit created ' + id); }} />}
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            ))
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 bg-black text-white px-4 py-2 rounded-md shadow">{toast}</div>
      )}
    </div>
  );
}
