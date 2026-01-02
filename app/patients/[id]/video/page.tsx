"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import * as Video from "twilio-video";
import { Header } from "../../../../components/Header";
import { getPatient, createVisit, updateVisit, transcribeVisitAudio } from "../../../../lib/api";
import { uploadToPrivateBucket } from "../../../../lib/storage";
import { convertToMP3 } from "../../../../lib/audioConverter";

export default function PatientVideoPage() {
  // Patient video pages are accessible without authentication
  // Patients can join via email link without signing in
  const [ready, setReady] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingContextRef = useRef<{ audioContext: AudioContext; destination: MediaStreamAudioDestinationNode; addTrackToMix: (track: MediaStreamTrack) => void } | null>(null);

  const addLog = (m: string) => setLogs((l) => [...l.slice(-50), `${new Date().toLocaleTimeString()} ${m}`]);

  // Helper function to safely remove an element
  const safeRemoveElement = (el: HTMLElement | null | undefined) => {
    if (!el) return;
    try {
      // Use remove() which is safer - it checks if element is in DOM automatically
      // and doesn't throw if element is not a child of its parent
      if (el.remove) {
        el.remove();
      } else if (el.parentNode) {
        // Fallback for older browsers
        const parent = el.parentNode;
        if (parent.contains(el)) {
          parent.removeChild(el);
        }
      }
    } catch (e) {
      // Element already removed or not in DOM, ignore silently
      // This is expected behavior when container is cleared with innerHTML
    }
  };

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

  // Set ready immediately - no auth required for patient video pages
  useEffect(() => {
    // Check if we're in a secure context
    const secure = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsSecureContext(secure);

    if (!secure) {
      setPermissionMessage('⚠️ Camera and microphone access requires HTTPS. Please access this page via HTTPS or use localhost.');
    }

    setReady(true);
    // Optionally try to fetch patient name if authenticated, but don't block if not
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();
        setIsAuthenticated(!!session);

        // Only try to fetch patient data if authenticated
        if (session && patientId) {
          try {
            const data = await getPatient(patientId);
            setPatientName(data.patient?.full_name || null);
          } catch (e) {
            // Silently fail - patient name is optional
            console.warn('Could not load patient name (optional)', e);
          }
        }
      } catch (e) {
        // Guest access - no problem
        setIsAuthenticated(false);
      }
    })();
  }, [patientId]);

  // Attach local video when connected and overlay is available
  useEffect(() => {
    if (connected && localTracksRef.current.length > 0 && localOverlayRef.current) {
      const videoTrack = localTracksRef.current.find((t: any) => t.kind === 'video');
      if (videoTrack) {
        const attachVideo = () => {
          if (!localOverlayRef.current) return;
          let media = localOverlayRef.current.querySelector('.local-media') as HTMLElement | null;
          if (!media) {
            media = document.createElement('div');
            media.className = 'local-media w-full h-full';
            localOverlayRef.current.appendChild(media);
          }
          // Only attach if not already attached
          if (media.querySelector('video')) return;

          media.innerHTML = '';
          const el = (videoTrack as any).attach();
          el.classList.add('w-full', 'h-full', 'object-cover', 'rounded');
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.objectFit = 'cover';
          el.setAttribute('autoplay', 'true');
          el.setAttribute('playsinline', 'true');
          el.setAttribute('muted', 'true');
          media.appendChild(el);
          addLog('Local video attached to preview');
        };

        // Try immediately and with a delay
        attachVideo();
        const timeout = setTimeout(attachVideo, 300);
        return () => clearTimeout(timeout);
      }
    }
  }, [connected, localTracksRef.current.length]);

  const startLocal = async () => {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (!isSecureContext) {
        const errorMsg = 'Camera and microphone access requires a secure connection (HTTPS). Please access this page via HTTPS or use localhost.';
        setPermissionMessage(errorMsg);
        addLog('Insecure context - getUserMedia not available over HTTP');
        throw new Error(errorMsg);
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Your browser does not support camera/microphone access, or you are not using a secure connection (HTTPS).';
        setPermissionMessage(errorMsg);
        addLog('getUserMedia not supported');
        throw new Error(errorMsg);
      }

      // Use Twilio helper to create local tracks so they are published properly
      const opts: any = { audio: true, video: true };
      if (selectedDeviceId) opts.video = { deviceId: selectedDeviceId };
      const tracks = await Video.createLocalTracks(opts as any);
      localTracksRef.current = tracks;

      // Local video will be attached after connection is established
      // This ensures the overlay DOM element is available

      // keep the stream for non-Twilio uses
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = s;
      } catch (e) { }

      // detect virtual camera from track label
      const videoTrack = tracks.find((t: any) => t.kind === 'video');
      if (videoTrack) {
        const label = (videoTrack as any)?.mediaStreamTrack?.label ?? '';
        if (/test|fake|virtual|sample|pattern|demo/i.test(label)) {
          setPermissionMessage('A virtual/test camera appears to be selected. Choose a real camera from the selector or check your browser/OS camera settings.');
          addLog('Detected virtual/test camera: ' + label);
        } else {
          setPermissionMessage(null);
        }
      }

      // if localMuted is already set, apply to new audio track
      const audioTrack = tracks.find((t: any) => t.kind === 'audio');
      if (audioTrack && localMuted) {
        try { (audioTrack as any).enable(false); } catch (e) { }
      }

      return tracks;
    } catch (err: any) {
      console.error('createLocalTracks error', err);
      const errorMessage = err?.message || '';

      if (errorMessage.includes('secure') || errorMessage.includes('HTTPS') || errorMessage.includes('getUserMedia is not supported')) {
        // Already handled above with specific message
        setPermissionMessage(err?.message || 'Camera access requires HTTPS. Please use a secure connection.');
        addLog('Secure context required for camera access');
      } else if (err?.name === 'NotAllowedError' || errorMessage.toLowerCase().includes('permission')) {
        setPermissionMessage('Camera access was blocked. Please allow camera access in your browser and refresh the page.');
        addLog('Camera permission denied');
      } else if (err?.name === 'NotFoundError') {
        setPermissionMessage('No camera found. Please connect a camera or select a different video device.');
        addLog('No camera found');
      } else {
        setPermissionMessage(err?.message || 'Unable to access camera. Please ensure you are using HTTPS or localhost.');
        addLog('createLocalTracks error: ' + (err?.message || 'Unknown error'));
      }
      throw err;
    }
  };

  const start = async () => {
    try {
      addLog(`Starting video consultation (room ${roomName})`);

      // create and attach local tracks
      const localTracks = await startLocal();

      // Patient rooms don't require authentication - guest access is allowed
      const res = await fetch(`/api/twilio/token?room=${encodeURIComponent(roomName)}`);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        addLog('Failed to get Twilio token: ' + (b?.error || res.status));
        showToast('Failed to connect to video call');
        return;
      }
      const { token: jwt } = await res.json();

      const room = await Video.connect(jwt, { name: roomName, tracks: localTracks });
      twilioRoomRef.current = room;
      setConnected(true);
      addLog('Connected to Twilio Room ' + (room.sid ?? roomName));

      // Attach local video to overlay after connection
      const attachLocalVideo = () => {
        const videoTrack = localTracks.find((t: any) => t.kind === 'video');
        if (videoTrack && localOverlayRef.current) {
          let media = localOverlayRef.current.querySelector('.local-media') as HTMLElement | null;
          if (!media) {
            media = document.createElement('div');
            media.className = 'local-media w-full h-full';
            localOverlayRef.current.appendChild(media);
          }
          // Clear and reattach
          media.innerHTML = '';
          const el = (videoTrack as any).attach();
          el.classList.add('w-full', 'h-full', 'object-cover', 'rounded');
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.objectFit = 'cover';
          el.setAttribute('autoplay', 'true');
          el.setAttribute('playsinline', 'true');
          el.setAttribute('muted', 'true');
          media.appendChild(el);
          addLog('Local video attached to preview');
        }
      };

      // Try to attach immediately, then retry after a short delay if needed
      attachLocalVideo();
      setTimeout(attachLocalVideo, 200);

      // Remove all existing video elements before attaching new participants
      attachedEls.current.forEach((el: any) => {
        try {
          if (el.__twilioTrack && el.__twilioTrack.detach) {
            el.__twilioTrack.detach();
          }
          safeRemoveElement(el);
        } catch (e) {
          console.warn('Error removing element before reconnect:', e);
        }
      });
      attachedEls.current = [];

      // Attach existing participants - properly sized like Google Meet
      room.participants.forEach((p: any) => {
        p.tracks.forEach((pub: any) => {
          const track = pub.track || (pub as any).trackSubscribed;
          if (track && (track as any).attach) {
            const el = (track as any).attach();
            // Style video elements to fit container properly - centered
            if (track.kind === 'video') {
              el.style.maxWidth = '100%';
              el.style.maxHeight = '100%';
              el.style.width = 'auto';
              el.style.height = 'auto';
              el.style.objectFit = 'contain';
              el.style.margin = '0 auto';
              el.style.display = 'block';
              el.style.position = 'relative';
              el.style.left = 'auto';
              el.style.right = 'auto';
              // Store track reference on element for cleanup
              (el as any).__twilioTrack = track;
              (el as any).__participantIdentity = p.identity;
            } else {
              el.classList.add('hidden'); // Hide audio elements
            }
            attachedEls.current.push(el);
            if (remoteRef.current) {
              remoteRef.current.appendChild(el);
            }
          }
        });
        p.on('trackSubscribed', (track: any) => {
          const el = track.attach();
          if (track.kind === 'video') {
            el.style.maxWidth = '100%';
            el.style.maxHeight = '100%';
            el.style.width = 'auto';
            el.style.height = 'auto';
            el.style.objectFit = 'contain';
            el.style.margin = '0 auto';
            el.style.display = 'block';
            el.style.position = 'relative';
            el.style.left = 'auto';
            el.style.right = 'auto';
            el.style.float = 'none';
            // Store track reference on element for cleanup
            (el as any).__twilioTrack = track;
            (el as any).__participantIdentity = p.identity;
            attachedEls.current.push(el);
            if (remoteRef.current) {
              remoteRef.current.appendChild(el);
            }
          }
        });
        p.on('trackUnsubscribed', (track: any) => {
          // Find and remove the element for this track
          const elToRemove = attachedEls.current.find((el: any) => el.__twilioTrack === track);
          if (elToRemove) {
            try {
              if (track.detach) track.detach();
              safeRemoveElement(elToRemove);
              attachedEls.current = attachedEls.current.filter((el: any) => el !== elToRemove);
            } catch (e) {
              console.warn('Error removing track element:', e);
            }
          }
        });
      });

      room.on('participantConnected', (participant: any) => {
        addLog('Participant connected: ' + participant.identity);
        participant.on('trackSubscribed', (track: any) => {
          const el = track.attach();
          if (track.kind === 'video') {
            el.style.maxWidth = '100%';
            el.style.maxHeight = '100%';
            el.style.width = 'auto';
            el.style.height = 'auto';
            el.style.objectFit = 'contain';
            el.style.margin = '0 auto';
            el.style.display = 'block';
            el.style.position = 'relative';
            el.style.left = 'auto';
            el.style.right = 'auto';
            el.style.float = 'none';
            // Store track reference on element for cleanup
            (el as any).__twilioTrack = track;
            (el as any).__participantIdentity = participant.identity;
            attachedEls.current.push(el);
            if (remoteRef.current) {
              remoteRef.current.appendChild(el);
            }
          }
        });
        participant.on('trackUnsubscribed', (track: any) => {
          // Find and remove the element for this track
          const elToRemove = attachedEls.current.find((el: any) => el.__twilioTrack === track);
          if (elToRemove) {
            try {
              if (track.detach) track.detach();
              safeRemoveElement(elToRemove);
              attachedEls.current = attachedEls.current.filter((el: any) => el !== elToRemove);
            } catch (e) {
              console.warn('Error removing track element:', e);
            }
          }
        });
      });

      room.on('participantDisconnected', (participant: any) => {
        addLog('Participant disconnected: ' + participant.identity);
        // Remove all elements for this participant
        const elementsToRemove = attachedEls.current.filter((el: any) => el.__participantIdentity === participant.identity);
        elementsToRemove.forEach((el: any) => {
          try {
            if (el.__twilioTrack && el.__twilioTrack.detach) {
              el.__twilioTrack.detach();
            }
            safeRemoveElement(el);
          } catch (e) {
            console.warn('Error removing participant element:', e);
          }
        });
        attachedEls.current = attachedEls.current.filter((el: any) => el.__participantIdentity !== participant.identity);
      });

      room.on('disconnected', () => {
        addLog('Room disconnected');
        setConnected(false);
        // Stop recording if active (don't await - just trigger it)
        if (isRecording && mediaRecorderRef.current) {
          stopRecording().catch(err => console.error('Error stopping recording on disconnect:', err));
        }
        // Properly detach and remove all video elements
        attachedEls.current.forEach((el: any) => {
          try {
            if (el.__twilioTrack && el.__twilioTrack.detach) {
              el.__twilioTrack.detach();
            }
            safeRemoveElement(el);
          } catch (e) {
            console.warn('Error removing element on disconnect:', e);
          }
        });
        attachedEls.current = [];
        twilioRoomRef.current = null;
      });

    } catch (e) {
      console.error(e);
      addLog('Error starting Twilio call');
    }
  };

  const startRecording = async () => {
    if (!twilioRoomRef.current || !connected) {
      setRecordingError('Must be connected to a call to record');
      return;
    }

    // Recording requires authentication (to create visits)
    if (!isAuthenticated) {
      setRecordingError('Please sign in to record the call');
      showToast('Sign in required to record');
      return;
    }

    try {
      setRecordingError(null);

      // Create an audio context to mix audio from all participants
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      // Helper to add track to mix
      const addTrackToMix = (track: MediaStreamTrack) => {
        try {
          const source = audioContext.createMediaStreamSource(new MediaStream([track]));
          source.connect(destination);
        } catch (e) {
          console.warn('Failed to add track to mix:', e);
        }
      };

      // Add local audio tracks
      const localAudioTracks = localTracksRef.current.filter((t: any) => t.kind === 'audio');
      let tracksAdded = 0;

      localAudioTracks.forEach((track: any) => {
        if (track.mediaStreamTrack && track.mediaStreamTrack.enabled && track.mediaStreamTrack.readyState === 'live') {
          addTrackToMix(track.mediaStreamTrack);
          tracksAdded++;
          console.log(`Added local audio track: ${track.mediaStreamTrack.id}`);
        }
      });

      // Add remote participant audio tracks
      twilioRoomRef.current.participants.forEach((participant: any) => {
        participant.audioTracks.forEach((publication: any) => {
          const track = publication.track;
          if (track && track.mediaStreamTrack && track.mediaStreamTrack.enabled && track.mediaStreamTrack.readyState === 'live') {
            addTrackToMix(track.mediaStreamTrack);
            tracksAdded++;
            console.log(`Added remote audio track from ${participant.identity}: ${track.mediaStreamTrack.id}`);
          }
        });
      });

      if (tracksAdded === 0) {
        console.warn('WARNING: No active audio tracks found to record');
        setRecordingError('No active audio tracks detected. Make sure microphones are enabled.');
        setIsRecording(false);
        return;
      }

      console.log(`Recording with ${tracksAdded} audio track(s)`);

      // Store the audio context and destination for adding new tracks
      recordingContextRef.current = { audioContext, destination, addTrackToMix };

      // Listen for new remote tracks
      const handleTrackSubscribed = (track: any) => {
        if (track.kind === 'audio' && track.mediaStreamTrack && recordingContextRef.current) {
          recordingContextRef.current.addTrackToMix(track.mediaStreamTrack);
        }
      };

      twilioRoomRef.current.participants.forEach((participant: any) => {
        participant.on('trackSubscribed', handleTrackSubscribed);
      });

      twilioRoomRef.current.on('participantConnected', (participant: any) => {
        participant.on('trackSubscribed', handleTrackSubscribed);
      });

      recordingStreamRef.current = destination.stream;

      // Validate that the destination stream has audio tracks
      const audioTracks = destination.stream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.error('ERROR: Destination stream has no audio tracks');
        setRecordingError('Failed to create recording stream. No audio tracks available.');
        setIsRecording(false);
        recordingContextRef.current?.audioContext.close().catch(console.warn);
        recordingContextRef.current = null;
        return;
      }

      console.log(`Destination stream has ${audioTracks.length} audio track(s)`);
      audioTracks.forEach((track, idx) => {
        console.log(`  Track ${idx + 1}: ${track.id}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      });

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      console.log(`Using MediaRecorder mimeType: ${mimeType || 'default'}`);

      const mediaRecorder = new MediaRecorder(destination.stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordingChunksRef.current.push(e.data);
          console.log(`Received data chunk: ${e.data.size} bytes`);
        } else {
          console.warn('WARNING: Received empty data chunk');
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setRecordingError('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      console.log('Recording started');

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setRecordingError(err?.message || 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return;
    }

    try {
      const mediaRecorder = mediaRecorderRef.current;

      // Request final data before stopping
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData();
      }

      // Stop recording
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('WARNING: MediaRecorder stop timeout');
          resolve();
        }, 2000);

        mediaRecorder.onstop = () => {
          clearTimeout(timeout);
          console.log('MediaRecorder stopped');
          resolve();
        };

        mediaRecorder.stop();
      });

      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((t) => t.stop());
        recordingStreamRef.current = null;
      }

      if (recordingContextRef.current) {
        recordingContextRef.current.audioContext.close().catch(console.warn);
        recordingContextRef.current = null;
      }

      console.log('Recording stopped');

      // Wait a bit for all data to be available
      await new Promise(resolve => setTimeout(resolve, 500));

      if (recordingChunksRef.current.length === 0) {
        setRecordingError('No recording data captured');
        console.error('ERROR: No recording chunks available');
        return;
      }

      // Check total size of chunks
      const totalSize = recordingChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
      console.log(`Recording chunks: ${recordingChunksRef.current.length}, Total size: ${totalSize} bytes`);

      if (totalSize === 0) {
        setRecordingError('Recording is empty (0 bytes). No audio was captured.');
        console.error('ERROR: Recording blob is empty');
        return;
      }

      // Process the recording
      setIsSaving(true);
      setRecordingError(null);

      const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm;codecs=opus' });
      recordingChunksRef.current = [];

      console.log(`Blob created: ${blob.size} bytes, type: ${blob.type}`);

      // Validate blob before conversion
      if (blob.size === 0) {
        setRecordingError('Recording blob is empty. No audio was captured.');
        console.error('ERROR: Blob size is 0');
        setIsSaving(false);
        return;
      }

      // Get audio duration before conversion using AudioContext (more reliable)
      let originalDuration = 0;
      try {
        const audioContext = new AudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        originalDuration = audioBuffer.duration;
        await audioContext.close();
        console.log(`Original audio duration: ${originalDuration.toFixed(2)} seconds (${formatTime(Math.floor(originalDuration))})`);
      } catch (durationError) {
        console.warn('Could not get original audio duration via AudioContext, trying Audio element:', durationError);
        // Fallback to Audio element
        try {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              URL.revokeObjectURL(audioUrl);
              reject(new Error('Timeout loading audio metadata'));
            }, 5000);
            audio.onloadedmetadata = () => {
              clearTimeout(timeout);
              if (isFinite(audio.duration) && audio.duration > 0) {
                originalDuration = audio.duration;
              }
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            audio.onerror = (e) => {
              clearTimeout(timeout);
              URL.revokeObjectURL(audioUrl);
              reject(new Error('Failed to load audio metadata'));
            };
          });
          if (originalDuration > 0) {
            console.log(`Original audio duration (via Audio element): ${originalDuration.toFixed(2)} seconds (${formatTime(Math.floor(originalDuration))})`);
          } else {
            console.warn('Audio duration is not available or invalid');
          }
        } catch (audioError) {
          console.warn('Could not get original audio duration:', audioError);
        }
      }

      // Convert to MP3
      console.log('Converting audio to MP3...');
      let mp3Blob: Blob;
      try {
        mp3Blob = await convertToMP3(blob);
        console.log(`MP3 conversion complete: ${mp3Blob.size} bytes`);

        if (mp3Blob.size === 0) {
          setRecordingError('MP3 conversion resulted in empty file');
          console.error('ERROR: MP3 blob is empty after conversion');
          setIsSaving(false);
          return;
        }

        // Validate MP3 file structure
        const mp3ArrayBuffer = await mp3Blob.arrayBuffer();
        const mp3View = new Uint8Array(mp3ArrayBuffer);

        // Check for MP3 file signature (ID3v2 tag starts with "ID3" or MP3 frame sync starts with 0xFF 0xFB/0xFA/0xF2/0xF3)
        const hasID3v2 = mp3View.length >= 3 &&
          String.fromCharCode(mp3View[0], mp3View[1], mp3View[2]) === 'ID3';
        const hasMP3Sync = mp3View.length >= 2 && mp3View[0] === 0xFF &&
          (mp3View[1] & 0xE0) === 0xE0; // MP3 sync word: 0xFF followed by 0xE0-0xFF

        console.log(`MP3 file validation: size=${mp3Blob.size} bytes, hasID3v2=${hasID3v2}, hasMP3Sync=${hasMP3Sync}`);

        if (!hasID3v2 && !hasMP3Sync) {
          console.error('ERROR: MP3 file does not have valid MP3 headers');
          console.error(`First 20 bytes: ${Array.from(mp3View.slice(0, 20)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
          setRecordingError('MP3 conversion produced invalid file structure');
          setIsSaving(false);
          return;
        }

        // Get audio duration after conversion using AudioContext (more reliable for MP3)
        let mp3Duration = 0;
        try {
          // Try AudioContext first (more reliable for MP3)
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(mp3ArrayBuffer.slice(0));
          mp3Duration = audioBuffer.duration;
          await audioContext.close();
          console.log(`MP3 audio duration (via AudioContext): ${mp3Duration.toFixed(2)} seconds (${formatTime(Math.floor(mp3Duration))})`);

          if (mp3Duration === 0 || !isFinite(mp3Duration)) {
            throw new Error('MP3 duration is 0 or invalid');
          }
        } catch (audioContextError) {
          console.warn('Could not decode MP3 with AudioContext, trying Audio element:', audioContextError);
          // Fallback to Audio element
          try {
            const mp3Url = URL.createObjectURL(mp3Blob);
            const mp3Audio = new Audio(mp3Url);
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                URL.revokeObjectURL(mp3Url);
                reject(new Error('Timeout loading MP3 metadata'));
              }, 5000);
              mp3Audio.onloadedmetadata = () => {
                clearTimeout(timeout);
                if (isFinite(mp3Audio.duration) && mp3Audio.duration > 0) {
                  mp3Duration = mp3Audio.duration;
                }
                URL.revokeObjectURL(mp3Url);
                resolve();
              };
              mp3Audio.onerror = (e) => {
                clearTimeout(timeout);
                URL.revokeObjectURL(mp3Url);
                reject(new Error('Failed to load MP3 metadata'));
              };
            });
            if (mp3Duration > 0) {
              console.log(`MP3 audio duration (via Audio element): ${mp3Duration.toFixed(2)} seconds (${formatTime(Math.floor(mp3Duration))})`);
            } else {
              throw new Error('MP3 duration is 0 or invalid');
            }
          } catch (audioElementError) {
            console.error('ERROR: Could not get MP3 audio duration:', audioElementError);
            setRecordingError('MP3 file appears to be invalid or corrupted (cannot read duration)');
            setIsSaving(false);
            return;
          }
        }

        // Validate duration is reasonable
        if (mp3Duration === 0 || !isFinite(mp3Duration)) {
          console.error('ERROR: MP3 duration is 0 or invalid');
          setRecordingError('MP3 file has 0 duration - no audio content detected');
          setIsSaving(false);
          return;
        }

        if (originalDuration > 0) {
          const durationDiff = Math.abs(originalDuration - mp3Duration);
          const durationPercent = ((durationDiff / originalDuration) * 100).toFixed(2);
          console.log(`Duration difference: ${durationDiff.toFixed(2)} seconds (${durationPercent}%)`);
          if (durationDiff > 0.5) {
            console.warn(`WARNING: Significant duration difference detected (${durationDiff.toFixed(2)}s)`);
          }
        }

        console.log(`MP3 file validated: ${mp3Blob.size} bytes, ${mp3Duration.toFixed(2)}s duration - ready for upload`);

        // Final validation: Try to create an Audio element and verify it can load
        try {
          const testUrl = URL.createObjectURL(mp3Blob);
          const testAudio = new Audio(testUrl);
          let canPlay = false;
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              URL.revokeObjectURL(testUrl);
              resolve();
            }, 2000);
            testAudio.oncanplay = () => {
              clearTimeout(timeout);
              canPlay = true;
              URL.revokeObjectURL(testUrl);
              resolve();
            };
            testAudio.onerror = () => {
              clearTimeout(timeout);
              URL.revokeObjectURL(testUrl);
              resolve();
            };
            // Trigger loading
            testAudio.load();
          });

          if (!canPlay) {
            console.warn('WARNING: MP3 file could not be loaded by Audio element - may be corrupted');
          } else {
            console.log('MP3 file validation passed: file can be loaded and played');
          }
        } catch (testError) {
          console.warn('Could not test MP3 playback:', testError);
        }
      } catch (convertError: any) {
        console.error('MP3 conversion error:', convertError);
        setRecordingError(`Failed to convert audio: ${convertError.message}`);
        console.error(`ERROR: MP3 conversion failed: ${convertError.message}`);
        setIsSaving(false);
        return;
      }
      const mp3File = new File([mp3Blob], `video-call-${patientId}-${Date.now()}.mp3`, { type: 'audio/mpeg' });

      // Create visit
      console.log('Creating visit...');
      const newVisit = await createVisit({ patient_id: patientId, status: 'draft' });

      // Upload audio
      console.log(`Uploading audio: ${mp3File.name}, ${mp3File.size} bytes, type: ${mp3File.type}`);
      const upload = await uploadToPrivateBucket(mp3File);
      console.log(`Upload complete: path=${upload.path}, bucket=${upload.bucket}`);
      await updateVisit(newVisit.id, { audio_url: upload.path });
      console.log(`Visit updated with audio_url: ${upload.path}`);

      // Transcribe
      console.log('Transcribing audio...');
      setIsTranscribing(true);
      try {
        const transcriptionResult = await transcribeVisitAudio(upload.path, newVisit.id);
        console.log('Transcription completed');
        
        // Import appendVisitNote for saving transcription to notes
        const { appendVisitNote } = await import('../../../../lib/api');
        
        // Save the full transcript to visit notes as subjective (dictation source)
        if (transcriptionResult.transcript) {
          try {
            await appendVisitNote(
              newVisit.id,
              transcriptionResult.transcript,
              "subjective",
              "dictation"
            );
          } catch (noteError) {
            console.warn("Failed to save transcript to notes:", noteError);
          }
        }

        // Save the AI-generated summary to visit notes as assessment
        if (transcriptionResult.summary) {
          try {
            await appendVisitNote(
              newVisit.id,
              transcriptionResult.summary,
              "assessment",
              "dictation"
            );
          } catch (noteError) {
            console.warn("Failed to save summary to notes:", noteError);
          }
        }

        // Save structured data to notes if available
        if (transcriptionResult.structured) {
          const structured = transcriptionResult.structured;
          
          // Save diagnosis
          if (structured.diagnosis) {
            const diagnosis = Array.isArray(structured.diagnosis)
              ? structured.diagnosis.join(', ')
              : structured.diagnosis;
            try {
              await appendVisitNote(
                newVisit.id,
                `Diagnosis: ${diagnosis}`,
                "assessment",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save diagnosis to notes:", noteError);
            }
          }

          // Save treatment plan
          if (structured.treatment_plan && Array.isArray(structured.treatment_plan) && structured.treatment_plan.length > 0) {
            try {
              await appendVisitNote(
                newVisit.id,
                `Treatment Plan: ${structured.treatment_plan.join('\n')}`,
                "plan",
                "dictation"
              );
            } catch (noteError) {
              console.warn("Failed to save treatment plan to notes:", noteError);
            }
          }
        }
        
        showToast('Recording saved and transcribed successfully');
      } catch (transcribeErr) {
        console.error('Transcription error:', transcribeErr);
        console.error('Transcription failed: ' + (transcribeErr as Error).message);
        showToast('Recording saved but transcription failed');
      } finally {
        setIsTranscribing(false);
        setIsSaving(false);
      }

    } catch (err: any) {
      console.error('Failed to stop recording:', err);
      setRecordingError(err?.message || 'Failed to process recording');
      setIsSaving(false);
      setIsTranscribing(false);
    }
  };

  const stopCall = () => {
    addLog('Ending call');

    // Stop recording if active
    if (isRecording && mediaRecorderRef.current) {
      stopRecording();
    }

    // stop local tracks
    try {
      localTracksRef.current.forEach((t: any) => { try { t.stop(); } catch (e) { } });
      localTracksRef.current = [];
    } catch (e) { }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // Remove local overlay elements safely
    if (localOverlayRef.current) {
      // Remove children one by one to avoid React conflicts
      while (localOverlayRef.current.firstChild) {
        const child = localOverlayRef.current.firstChild;
        try {
          localOverlayRef.current.removeChild(child);
        } catch (e) {
          // Child might already be removed, break
          break;
        }
      }
    }

    // Properly detach and remove all video elements
    attachedEls.current.forEach((el: any) => {
      try {
        if (el.__twilioTrack && el.__twilioTrack.detach) {
          el.__twilioTrack.detach();
        }
        safeRemoveElement(el);
      } catch (e) {
        console.warn('Error removing element in stopCall:', e);
      }
    });
    attachedEls.current = [];

    if (twilioRoomRef.current) {
      try { twilioRoomRef.current.disconnect(); } catch (e) { console.warn(e); }
      twilioRoomRef.current = null;
    }
    setConnected(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      } catch (e) { }
    });
    setRemoteMuted(newState);
    addLog(newState ? 'Remote audio muted' : 'Remote audio unmuted');
    showToast(newState ? 'Remote audio muted' : 'Remote audio unmuted');
  };

  const toggleCamera = () => {
    const videoTrack = localTracksRef.current.find((t: any) => t.kind === 'video');
    if (!videoTrack) return;

    const newState = !cameraEnabled;
    try {
      videoTrack.enable(newState);
      setCameraEnabled(newState);
      addLog(newState ? 'Camera turned on' : 'Camera turned off');
      showToast(newState ? 'Camera turned on' : 'Camera turned off');
    } catch (e) {
      console.warn('Failed to toggle camera:', e);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .video-container {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          left: 0 !important;
          right: 0 !important;
          text-align: center !important;
        }
        .video-container video {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          margin: 0 auto !important;
          display: block !important;
          position: relative !important;
          left: auto !important;
          right: auto !important;
          float: none !important;
        }
        /* Ensure all direct children are centered */
        .video-container > * {
          margin-left: auto !important;
          margin-right: auto !important;
          display: block !important;
          position: relative !important;
          left: auto !important;
          right: auto !important;
        }
        .local-media {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
        }
        .local-media video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}} />
      <div className="bg-[#202124] min-h-screen flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        {!isSecureContext && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Secure Connection Required
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Camera and microphone access requires a secure connection (HTTPS).
                    You are currently accessing this page over HTTP.
                  </p>
                  <p className="mt-2 font-semibold">Solutions:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Use HTTPS instead of HTTP (e.g., <code className="bg-red-100 px-1 rounded">https://172.20.127.5:3000</code>)</li>
                    <li>Set up an SSL certificate for your development server</li>
                    <li>Use a tunneling service like ngrok with HTTPS</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top bar - minimal like Google Meet */}
        <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-lg font-medium">Video Consultation</h1>
            {patientName && (
              <span className="text-gray-400 text-sm">• {patientName}</span>
            )}
          </div>
          {connected && isAuthenticated && (
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isSaving || isTranscribing}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                  title="Record the video call"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Record
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  disabled={isSaving || isTranscribing}
                  className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  {formatTime(recordingTime)}
                </button>
              )}
              {(isSaving || isTranscribing) && (
                <span className="text-gray-400 text-xs">
                  {isSaving && !isTranscribing && 'Saving...'}
                  {isTranscribing && 'Transcribing...'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main video area - Google Meet style - properly sized */}
        <div className="flex-1 relative bg-black overflow-hidden" style={{ minHeight: 0 }}>
          {/* Remote video - main display - properly sized and centered */}
          <div ref={remoteRef} className="video-container absolute inset-0 w-full h-full" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            margin: '0'
          }}>
            {!connected && (
              <div className="text-center text-white max-w-md">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <span className="material-icons-outlined text-5xl text-gray-400">videocam</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-2">Ready to join</h2>
                  <p className="text-gray-400 text-sm">Click the button below to start the video consultation</p>
                </div>
                <button
                  onClick={start}
                  disabled={connected || !isSecureContext}
                  className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg flex items-center gap-3 mx-auto text-lg"
                >
                  <span className="material-icons-outlined text-xl">call</span>
                  Join Call
                </button>
                {!isSecureContext && (
                  <p className="text-yellow-400 text-xs mt-4">⚠️ HTTPS required for camera access</p>
                )}
              </div>
            )}
          </div>

          {/* Local video - bottom right corner - responsive sizing */}
          {connected && (
            <div ref={localOverlayRef} className="absolute bottom-20 right-2 md:right-4 w-[120px] sm:w-[160px] md:w-[200px] aspect-video rounded-lg overflow-hidden border-2 border-white shadow-2xl bg-gray-900 z-20">
              <div className="local-media w-full h-full"></div>
              {!cameraEnabled && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900 z-10">
                  <span className="material-icons-outlined text-white text-2xl md:text-3xl">videocam_off</span>
                </div>
              )}
              {/* Mic indicator on local video */}
              {localMuted && (
                <div className="absolute bottom-2 left-2 bg-red-600 rounded-full p-1 md:p-1.5 z-10">
                  <span className="material-icons-outlined text-white text-xs md:text-sm">mic_off</span>
                </div>
              )}
            </div>
          )}

          {/* Participant name labels */}
          {connected && (
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium">
                {patientName || `Patient ${patientId}`}
              </div>
            </div>
          )}

          {/* Camera selector - top right - only show on larger screens */}
          {connected && videoDevices.length > 1 && (
            <div className="absolute top-4 right-4 z-10 hidden md:block">
              <select
                aria-label="Select camera"
                className="bg-black/70 backdrop-blur-md text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={selectedDeviceId ?? ''}
                onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              >
                {videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-gray-800">
                    {d.label || 'Camera'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error messages */}
          {permissionMessage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500/90 text-white px-4 py-3 rounded-lg max-w-md text-center">
              {permissionMessage}
            </div>
          )}
          {recordingError && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
              {recordingError}
            </div>
          )}
        </div>

        {/* Bottom control bar - Google Meet style - always visible */}
        <div className="bg-[#1a1a1a] border-t border-gray-800 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Mute button */}
            <button
              onClick={toggleLocalMute}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${localMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
                } text-white`}
              title={localMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              <span className="material-icons-outlined text-lg sm:text-xl">
                {localMuted ? 'mic_off' : 'mic'}
              </span>
            </button>

            {/* Camera toggle */}
            <button
              onClick={toggleCamera}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${cameraEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              title={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
            >
              <span className="material-icons-outlined text-lg sm:text-xl">
                {cameraEnabled ? 'videocam' : 'videocam_off'}
              </span>
            </button>

            {/* Participants/More options */}
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-all"
              title="More options"
            >
              <span className="material-icons-outlined text-lg sm:text-xl">more_vert</span>
            </button>

            {/* Leave call button - prominent red */}
            <button
              onClick={stopCall}
              disabled={!connected}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Leave call"
            >
              <span className="material-icons-outlined text-lg sm:text-xl">call_end</span>
            </button>
          </div>
        </div>

        {/* Toast notifications */}
        {toast && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
