"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import * as Video from "twilio-video";
import { Header } from "../../../../components/Header";
import { getPatient } from "../../../../lib/api";
import { useAuthGuard } from "../../../../lib/useAuthGuard";

export default function PatientVideoPage() {
  const { ready } = useAuthGuard();
  const params = useParams() as { id: string };
  const patientId = params?.id;
  const roomName = `patient-${patientId}`;

  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const twilioRoomRef = useRef<any | null>(null);
  const attachedEls = useRef<HTMLElement[]>([]);
  const localTracksRef = useRef<any[]>([]);
  const localOverlayRef = useRef<HTMLDivElement | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const [localMuted, setLocalMuted] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  const addLog = (m: string) => setLogs((l) => [...l.slice(-50), `${new Date().toLocaleTimeString()} ${m}`]);

  useEffect(() => {
    // enumerate devices on mount
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

  // fetch patient name when auth is ready
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        if (patientId) {
          const data = await getPatient(patientId);
          setPatientName(data.patient?.full_name || null);
        }
      } catch (e) {
        console.warn('Failed to load patient for video page', e);
      }
    })();
  }, [ready, patientId]);

  const startLocal = async () => {
    try {
      // Use Twilio helper to create local tracks so they are published properly
      const opts: any = { audio: true, video: true };
      if (selectedDeviceId) opts.video = { deviceId: selectedDeviceId };
      const tracks = await Video.createLocalTracks(opts as any);
      localTracksRef.current = tracks;

      // attach local video track to the dedicated media container inside the overlay
      const videoTrack = tracks.find((t: any) => t.kind === 'video');
      if (videoTrack && localOverlayRef.current) {
        // ensure media container exists
        let media = localOverlayRef.current.querySelector('.local-media') as HTMLElement | null;
        if (!media) {
          media = document.createElement('div');
          media.className = 'local-media w-full h-full';
          localOverlayRef.current.appendChild(media);
        }
        // clear previous media only
        media.innerHTML = '';
        const el = (videoTrack as any).attach();
        el.classList.add('w-full', 'h-full', 'object-cover', 'rounded');
        media.appendChild(el);
      }

      // keep the stream for non-Twilio uses
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = s;
      } catch (e) {}

      // detect virtual camera from track label
      const label = (videoTrack as any)?.mediaStreamTrack?.label ?? ''; 
      if (/test|fake|virtual|sample|pattern|demo/i.test(label)) {
        setPermissionMessage('A virtual/test camera appears to be selected. Choose a real camera from the selector or check your browser/OS camera settings.');
        addLog('Detected virtual/test camera: ' + label);
      } else {
        setPermissionMessage(null);
      }

      // if localMuted is already set, apply to new audio track
      const audioTrack = tracks.find((t: any) => t.kind === 'audio');
      if (audioTrack && localMuted) {
        try { (audioTrack as any).enable(false); } catch (e) {}
      }

      return tracks;
    } catch (err: any) {
      console.error('createLocalTracks error', err);
      if (err?.name === 'NotAllowedError' || err?.message?.toLowerCase()?.includes('permission')) {
        setPermissionMessage('Camera access was blocked. Please allow camera access in your browser and refresh the page.');
        addLog('Camera permission denied');
      } else if (err?.name === 'NotFoundError') {
        setPermissionMessage('No camera found. Please connect a camera or select a different video device.');
        addLog('No camera found');
      } else {
        setPermissionMessage('Unable to access camera. See console for details.');
        addLog('createLocalTracks error');
      }
      throw err;
    }
  };

  const start = async () => {
    try {
      addLog(`Starting video consultation (room ${roomName})`);
      const sb = supabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        addLog('Sign in required');
        return;
      }

      // create and attach local tracks
      const localTracks = await startLocal();

      const res = await fetch(`/api/twilio/token?room=${encodeURIComponent(roomName)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        addLog('Failed to get Twilio token: ' + (b?.error || res.status));
        return;
      }
      const { token: jwt } = await res.json();

      const room = await Video.connect(jwt, { name: roomName, tracks: localTracks });
      twilioRoomRef.current = room;
      setConnected(true);
      addLog('Connected to Twilio Room ' + (room.sid ?? roomName));

      // Attach existing participants
      room.participants.forEach((p: any) => {
        p.tracks.forEach((pub: any) => {
          const track = pub.track || (pub as any).trackSubscribed;
          if (track && (track as any).attach) {
            const el = (track as any).attach();
            el.classList.add('w-full', 'h-full', 'object-cover');
            attachedEls.current.push(el);
            remoteRef.current?.appendChild(el);
          }
        });
        p.on('trackSubscribed', (track: any) => {
          const el = (track as any).attach();
          remoteRef.current?.appendChild(el);
        });
      });

      room.on('participantConnected', (participant: any) => {
        addLog('Participant connected: ' + participant.identity);
        participant.on('trackSubscribed', (track: any) => {
          const el = track.attach();
          el.classList.add('w-full', 'h-full', 'object-cover');
          attachedEls.current.push(el);
          remoteRef.current?.appendChild(el);
        });
      });

      room.on('disconnected', () => {
        addLog('Room disconnected');
        setConnected(false);
        attachedEls.current.forEach((el) => { try { el.remove(); } catch(e) {} });
        attachedEls.current = [];
        twilioRoomRef.current = null;
      });

    } catch (e) {
      console.error(e);
      addLog('Error starting Twilio call');
    }
  };

  const stopCall = () => {
    addLog('Ending call');

    // stop local tracks
    try {
      localTracksRef.current.forEach((t: any) => { try { t.stop(); } catch(e) {} });
      localTracksRef.current = [];
    } catch (e) {}

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

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
    } catch (e) { console.warn(e); }
  };

  const toggleRemoteMute = () => {
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

  return (
    <div className="bg-[#F3F6FD] min-h-screen">
      <Header />
      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold">Video Consultation</h2>
                    <p className="text-sm text-[#718096]">Patient: <strong>{patientName ?? patientId}</strong></p>
                    <p className="text-xs text-[#718096] mt-1">Room: <code className="bg-gray-100 px-2 py-1 rounded">{roomName}</code></p>
                  </div>
                </div>
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

              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={toggleRemoteMute} className="px-3 py-2 rounded border bg-white">{remoteMuted ? 'Unmute' : 'Mute'}</button>
                <button onClick={start} disabled={connected} className="px-3 py-2 rounded bg-[#5BB5E8] text-white disabled:opacity-50">Join Call</button>
                <button onClick={stopCall} disabled={!connected} className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50">Leave</button>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-2xl overflow-hidden h-[56vh] md:h-[72vh] relative flex items-center justify-center">
            <div ref={remoteRef} className="w-full h-full flex items-center justify-center"></div>

            {/* remote mute button bottom-left */}
            <button
              aria-label="Toggle remote audio"
              onClick={toggleRemoteMute}
              className="absolute left-4 bottom-4 flex flex-col items-center text-white bg-black/40 p-2 rounded-md"
            >
              <span className="material-icons-outlined">{remoteMuted ? 'volume_off' : 'volume_up'}</span>
              <span className="text-xs mt-1">{remoteMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <div ref={localOverlayRef} className="absolute bottom-4 right-4 w-[34%] max-w-[220px] aspect-[3/4] rounded overflow-hidden border-2 border-white shadow-md bg-black">
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

          <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
            <h4 className="font-semibold mb-2">Session Log</h4>
            <div className="text-xs h-40 overflow-auto bg-gray-50 p-3 rounded">
              {logs.length === 0 ? <div className="text-gray-400">No events yet</div> : logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
