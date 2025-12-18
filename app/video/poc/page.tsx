"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from '../../../lib/supabaseBrowser';
import * as Video from 'twilio-video';

export default function VideoPoCPage() {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [room, setRoom] = useState("poc-room");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up any ongoing call or media when the component unmounts.
      stopCall();
    };
  }, []);

  useEffect(() => {
    console.log("VideoPoC mounted");
  }, []);

  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs((l) => [...l.slice(-50), `${ts} ${msg}`]);
    console.log(msg);
  };

  const startLocal = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      // Ensure muted state reflects track state
      if (muted) {
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      return stream;
    } catch (e) {
      addLog('getUserMedia error');
      throw e;
    }
  };

  // Signaling server removed — connectSignal is deprecated. Use Twilio Programmable Video by clicking "Start Twilio Call".
  const connectSignal = async () => {
    addLog('Signaling deprecated; use Twilio instead');
  };

  // Signaling-based `handleOffer` removed — Twilio handles participant negotiation internally.
  const handleOffer = async (offer: any) => {
    addLog('handleOffer deprecated — using Twilio Rooms instead');
  };

  // StartCall (signaling-based) removed — use Twilio by clicking "Start Twilio Call" instead.
  const startCall = async () => {
    addLog('startCall deprecated — use Twilio Rooms');
  };

  const twilioRoomRef = useRef<any | null>(null);
  const twilioAttachedEls = useRef<HTMLElement[]>([]);
  const [twilioConnected, setTwilioConnected] = useState(false);

  const stopCall = () => {
    addLog('Stop clicked — ending call');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;

    // Also disconnect Twilio if connected
    if (twilioRoomRef.current) {
      try {
        twilioRoomRef.current.disconnect();
      } catch (e) { console.warn(e); }
      twilioRoomRef.current = null;
      setTwilioConnected(false);
      addLog('Disconnected Twilio Room (stop)');
    }

    // cleanup attached elements
    twilioAttachedEls.current.forEach((el) => { try { el.remove(); } catch(e){ } });
    twilioAttachedEls.current = [];
  };

  const startTwilioCall = async () => {
    addLog('startTwilioCall invoked');
    try {
      const sb = supabaseBrowser();
      const sess = await sb.auth.getSession();
      const authToken = (sess as any)?.data?.session?.access_token;
      if (!authToken) {
        addLog('No Supabase session available — authenticate first');
        return;
      }
      const res = await fetch(`/api/twilio/token?room=${encodeURIComponent(room)}`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        addLog('Failed to get Twilio token: ' + (body?.error || res.status));
        return;
      }
      const { token } = await res.json();
      const roomObj = await Video.connect(token, { name: room });
      twilioRoomRef.current = roomObj;
      setTwilioConnected(true);
      addLog('Connected to Twilio Room ' + (roomObj?.sid ?? room));

      // attach existing participants
      roomObj.participants.forEach((participant: any) => {
        addLog('Existing participant: ' + participant.identity);
        participant.tracks.forEach((pub: any) => {
          if (pub.track && pub.track.attach) {
            const el = pub.track.attach();
            twilioAttachedEls.current.push(el);
            remoteRef.current?.parentElement?.appendChild(el);
          }
        });
        participant.on('trackSubscribed', (track: any) => {
          const el = track.attach();
          twilioAttachedEls.current.push(el);
          remoteRef.current?.parentElement?.appendChild(el);
        });
      });

      // handle new participants
      roomObj.on('participantConnected', (participant: any) => {
        addLog('Participant connected: ' + participant.identity);
        participant.on('trackSubscribed', (track: any) => {
          const el = track.attach();
          twilioAttachedEls.current.push(el);
          remoteRef.current?.parentElement?.appendChild(el);
        });
      });

      roomObj.on('disconnected', () => {
        addLog('Twilio Room disconnected');
        setTwilioConnected(false);
        twilioAttachedEls.current.forEach((el) => { try { el.remove(); } catch (e) {} });
        twilioAttachedEls.current = [];
        twilioRoomRef.current = null;
      });

    } catch (e) {
      addLog('Twilio call error');
      console.error(e);
    }
  };

  const stopTwilioCall = () => {
    addLog('stopTwilioCall invoked');
    if (twilioRoomRef.current) {
      try { twilioRoomRef.current.disconnect(); } catch (e) { console.warn(e); }
      twilioRoomRef.current = null;
    }
    twilioAttachedEls.current.forEach((el) => { try { el.remove(); } catch (e) {} });
    twilioAttachedEls.current = [];
    setTwilioConnected(false);
  };

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) {
      addLog('No local stream to mute/unmute');
      return;
    }
    const newMuted = !muted;
    stream.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
    setMuted(newMuted);
    addLog(newMuted ? 'Microphone muted' : 'Microphone unmuted');
  };

  return (
    <div className="min-h-screen p-6 grid grid-cols-3 gap-4">
      <div className="col-span-1">
        <h2 className="font-semibold">Video</h2>
        <video ref={localRef} autoPlay muted className="w-full rounded border" />
        <video ref={remoteRef} autoPlay className="w-full rounded border mt-4" />
        <div className="mt-2 flex flex-col md:flex-row gap-2 relative z-10">
          <div className="flex gap-2">
            <input value={room} onChange={(e) => setRoom(e.target.value)} className="border p-2 rounded" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleMute()}
              className="px-3 py-2 bg-gray-600 text-white rounded"
            >
              {muted ? 'Unmute Mic' : 'Mute Mic'}
            </button>

            <button
              type="button"
              onClick={() => startTwilioCall()}
              disabled={twilioConnected}
              className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Start Twilio Call
            </button>

            <button
              type="button"
              onClick={() => stopTwilioCall()}
              disabled={!twilioConnected}
              className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Stop Twilio Call
            </button>

            <button
                type="button"
                onClick={() => stopCall()}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Stop Call
              </button>
          </div>
        </div>
        <div className="mt-3 bg-slate-50 border rounded p-2 col-span-1">
          <h4 className="text-sm font-semibold mb-2">Log</h4>
          <div className="text-xs h-40 overflow-auto bg-white p-2 border rounded">
            {logs.length === 0 ? <div className="text-slate-400">No events yet</div> : logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <h2 className="font-semibold">Chart</h2>
        <div className="border rounded p-4 h-full">Placeholder for patient chart / vitals</div>
      </div>
      <div className="col-span-1">
        <h2 className="font-semibold">Note</h2>
        <textarea className="w-full h-64 border rounded p-2" placeholder="Live transcript / editor" />
      </div>
    </div>
  );
}
