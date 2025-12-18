4# Teleconference PoC — Design & Runbook

Status: PoC implemented (2025-12-16) — minimal signaling server + public demo + three-pane page added.

Purpose
- Provide a small, secure Proof-of-Concept (PoC) for one-to-one WebRTC calls integrated into the existing TeleHealth app.
- Validate signaling, ICE exchange, and a minimal three-pane UI (Video | Chart | Note).

Architecture overview
- Twilio Programmable Video: the PoC uses Twilio Rooms and the `twilio-video` SDK for signaling/ICE and room management. This reduces the need for a self-hosted signaling server and simplifies TURN/ICE management.
- Client samples:
  - `app/video/poc/page.tsx` — Next.js client page that provides the three-pane layout and Twilio integration (token fetch + room join).
- Recording & transcription: out-of-scope for the initial PoC; next steps add client-side chunked uploads and worker-based transcription.

Security considerations
- Signaling channels are authenticated (use Supabase session tokens in headers or URL params in production).
- For the PoC, the signaling server accepts unauthenticated connections for fast testing — **do not** use this in production.
- Recordings must be uploaded to a private bucket with signed URLs and stored under clinician-scoped paths.

Files added / removed
- `app/video/poc/page.tsx` — Next.js page with minimal three-pane UI and Twilio integration.
- The previous local signaling demo (`services/signaling/server.js` and `public/video_poc.html`) has been removed in favor of Twilio Programmable Video.

How to run the PoC locally (Twilio-only)

1. Install dependencies (Twilio SDKs only):

```powershell
npm install twilio twilio-video
```

2. Start the app in dev mode (Next.js):

```powershell
npm run dev
```

3. Open two separate browser windows/tabs and load the demo page at `http://localhost:3000/video/poc`.
- Sign in to the app (Supabase Auth) in both browser windows so the client can fetch a token from `/api/twilio/token`.
- Ensure `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY`, and `TWILIO_API_SECRET` are set in `.env.local` and restart the dev server.
- In one window click **Start Twilio Call**; participants in the same room should see/hear each other and the PoC logs will show Twilio room events.
- Stop the call using **Stop Twilio Call** or **Stop Call**.

Run notes & limitations
- The previous local signaling demo used an unsecured WebSocket-based broadcast mechanism; it has been removed in favor of Twilio Programmable Video for production-ready signaling, TURN, and diagnostics. Production systems should still use authenticated channels and TLS.
- Recording is not implemented in the PoC. Prefer client-side recording + signed chunked uploads to Supabase Storage for reliability.

Controls added to PoC
- Mute/Unmute: You can mute your microphone during a call using the "Mute Mic" button next to Start Call. This toggles the local audio track enabled state; recordings (when implemented) will reflect mute state. Use this if you need immediate mic control during manual testing.
- Stop Call: The "Stop Call" button ends the current call — it sends a `hangup` message via the signaling channel, closes the local RTCPeerConnection, stops local media tracks, and clears local/remote video previews. Peers that receive the `hangup` message will also close their connections and stop local tracks.

Note about ports and client connection
- The local WebSocket signaling demo has been removed. Use the in-app Twilio PoC at `http://localhost:3000/video/poc` and the Twilio token endpoint (`/api/twilio/token`) to join rooms.

Next steps (priority)
1. Harden signaling server with authentication and TLS.
2. Implement client-side chunked recording and upload to `STORAGE_BUCKET` (server-side will validate and store metadata).
3. Integrate worker-based transcription for short chunks (near real-time) and full-session transcript.
4. Add consent/recording prompts and persistence to the DB.
5. Evaluate Twilio Programmable Video (optional): consider migrating the PoC signaling to Twilio Rooms/SDKs for production needs (managed signaling, TURN servers, recording/compositions, and Insights).

---

## Twilio Integration (Optional)

Why Twilio
- Twilio Programmable Video provides managed Video Rooms, client SDKs (Web/Android/iOS), automatic TURN servers, diagnostics/Insights, and first-class recording/composition APIs. This reduces complexity vs self-hosted signaling and gives production-grade features.

What you'll need
- A Twilio account (trial available, upgrade for production). Some features (e.g., permanent recordings, certain regions) require upgrading and enabling paid features.
- Create an API Key in the Twilio Console (Video API keys must be created in the **US1** region for Video tokens).
- Server-side helper library: `npm i twilio` to generate Access Tokens and Video grants.

Server-side token generation (example, Node)

```js
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY; // API Key SID
const twilioApiSecret = process.env.TWILIO_API_SECRET; // API Key secret

// In an authenticated server route
function generateToken(identity, room) {
  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, { identity });
  token.addGrant(new VideoGrant({ room }));
  return token.toJwt();
}
```

Note: The token API must be protected and only issued to authenticated users. Our PoC provides `/api/twilio/token?room=...` which expects an authenticated Supabase session (the client should send `Authorization: Bearer <access_token>` or call the endpoint from authenticated Next client code). For local testing: sign in to the app, then click **Start Twilio Call** in the PoC UI — the client will request the token and automatically connect to the Twilio Room.
Client-side (JS) quickstart

```js
// Install 'twilio-video' in the client app
import { connect } from 'twilio-video';

// fetch token from server e.g. GET /api/twilio/token?room=my-room
const token = await fetch('/api/twilio/token?room=room-name').then(r => r.text());
const room = await connect(token, { name: 'room-name' });
```

### Troubleshooting: "Failed to get Twilio token: Twilio credentials not configured"

- Cause: One or more Twilio env vars (`TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`) are missing from `.env.local`, or the dev server was not restarted after adding them.
- Quick fix: Add the three vars to `.env.local` (ensure the API Key is the *API Key SID*, not the secret) and restart the dev server (`npm run dev`). API Keys used for Video should be created in the **US1** region.
- Quick test: Sign into the app, then from an authenticated browser call `/api/twilio/token?room=test` (the client UI does this when you click **Start Twilio Call**) — the server will return JSON with `token` and `room` on success, or a helpful error message listing which env vars are missing.

### Using Twilio-only signaling (optional)

If you decide to use Twilio Programmable Video exclusively, the local signaling server (`services/signaling/server.js`) and the client WebSocket-based signaling code (`connectSignal`, `startCall`) can be removed. Keep the server-side token endpoint (`/api/twilio/token`) and add webhooks for recording/composition ingestion if you need recordings persisted to Supabase Storage.

- Before removing signaling: ensure Twilio Rooms meet your feature needs (recordings, composition, region, GDPR/compliance), and verify the token endpoint and two-browser join flow succeed.
- After removing signaling: update docs, delete `services/signaling`, and remove the sample `public/video_poc.html` signaling demo.


Recording & media
- Twilio supports Room recordings and Compositions; enable recording in your Twilio console and configure recording webhooks to get notified when media is available. Use the REST API to fetch media and move it into Supabase Storage (or your own storage) and save metadata to the `visits`/`transcripts` tables.

Costs and account notes
- You will need a Twilio account; a free trial is available for testing, but production usage (records, long sessions) will incur charges (participant-minute and recording fees). Monitor usage and set budget alerts.
- Trial accounts require phone/email verification; some features are limited until you upgrade.

Acceptance criteria (if Twilio is chosen)
- Server can issue Video Access Tokens for authenticated users.
- Two participants can join the same Twilio Room (JS client) and see/hear each other.
- Recordings (audio or composition) can be retrieved via webhook/REST and stored in Supabase Storage.
- Session metadata (room SID, participant SIDs, timestamps) saved to DB and stored in audit logs.


Acceptance criteria for PoC (done)
- Two browsers can join the same Twilio Room (JS client) and see/hear each other. ✅
- Minimal three-pane UI shows local/remote video, patient chart placeholder, and note editor. ✅

`</file>`