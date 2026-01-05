
# TeleHealth MVP — AI Build & Deployment Playbook (Supabase Edition)

This is the updated single-file playbook incorporating:
- **Supabase instead of Prisma/Postgres migrations**
- **EFFECT framework use where appropriate**
- **Improved clarity for AI execution**
- **Telemetry documentation**
- **Deployment to Railway**
- **Phase-based workflow optimized for single AI sessions**

---

# 1. Goals & MVP Scope

The TeleHealth MVP should allow clinicians to:
- Sign in using email and password
- Use a responsive dashboard showing recent patients
- Create simple patient profiles (name, sex, contact)
- Start a visit from patient profile
- Record conversation using in-browser MediaRecorder
- Automatically upload audio to private storage
- Transcribe via Replicate/OpenAI/HONO (Phase 2)
- Generate AI-driven structured notes (Phase 3)
- Review/edit structured fields, transcript, and summary
- Approve and save finalized visits
- View visit history by date on patient profile
- Use Supabase for authentication, database, APIs, and storage

**User Experience Focus:**
- Simple, clean interface with smooth animations
- Email-only authentication (no passwords)
- Minimal patient intake (name, sex M/F toggle, contact)
- Direct visit flow: Start visit → Record → Review → Save
- Visit cards show date, summary preview, status
- Green buttons for positive actions, blue for primary actions

Non-goals include: full EMR integration, org-wide compliance program, billing.

Note: **Video / teleconferencing** is part of the product vision in the governing documents (`Atlas Telemedicine Platform (Operating Document).md`) and is therefore scoped as a post‑MVP stream with a clear MVP build plan included below. It has been removed from permanent non-goals and added to the phased roadmap as a prioritized feature to integrate with the existing MVP.

---

# 2. Required Accounts & Services

You must create these BEFORE Phase 1:

### ✔ GitHub  
Source control + deployment integration.

### ✔ Railway  
Deploy:
- Next.js app  
- Worker process  
- Optional Redis queue  
- Environment secrets  

### ✔ Supabase (REPLACES Prisma/Postgres)
- Database (Postgres managed by Supabase)
- Supabase Auth (JWT-based)
- Row-level security (RLS)
- Supabase Storage — use a **private bucket** (set `STORAGE_BUCKET=telehealth_audio`) and serve via signed URLs
- SQL editor + migrations
- Edge Functions (optional)

### ✔ Object Storage  
Choose **one**:
- Supabase Storage (recommended)  
- Railway Storage  
- S3/Backblaze/Wasabi  

### ✔ Transcription API (Replicate or OpenAI Whisper)  
API keys needed.

### ✔ LLM Provider  
OpenAI, Anthropic, or Replicate.

### ✔ Optional Tools
- Redis queue (Railway)
- Sentry for monitoring
- PostHog for analytics/telemetry

---

# 3. Phase overview — split into sub-phases (implementation-aligned)

This section reconciles what is implemented today with the longer-term vision captured in the governing documents (`Atlas Telemedicine Platform (Operating Document).md`, `from_field_test_WorkFlow.md`, and `ai_medical_transcription_processing_guide.md`). When there is a conflict, those three documents take precedence in the order listed above.

Key implementation notes (current):
- The app is a Next.js TypeScript app with Supabase for Auth, Storage, and Database.
- Email + password authentication with signup (verification email flow) is implemented (server-side auth using Supabase password flows). This aligns with the Atlas operating doc (passworded accounts) and differs from earlier "email-only" ideas in the playbook — the Atlas doc governs.
- In-browser recording, signed upload URLs, `visits`, `patients`, `transcripts`, `notes` tables, and the client-side API wrapper are implemented.
- A server-side transcription route (`/api/transcribe`) currently runs Replicate directly; note that auth checks are commented out in that route and moving this work to an async worker is recommended for production.

Phase breakdown (atomic sub-phases with statuses and next actions):

Phase 0 — Prep & scaffold (done)
- 0.1 Repo scaffold, TypeScript, Tailwind, initial Next.js app (done)
- 0.2 `.env.example` and CI basics (done)

Phase 1 — Core MVP (done / stable)
- 1.1 Auth (email + password, verification email) — DONE ✅
- 1.2 Patient CRUD (create / list / share) — DONE ✅
- 1.3 Visit lifecycle (create visit, visit detail page) — DONE ✅
- 1.4 Recording UI (MediaRecorder client) — DONE ✅
- 1.5 Signed upload flow (`/api/upload`) and storage policy — DONE ✅
- 1.6 Basic visit notes (upsert via `/api/visits/[id]/note`) — DONE ✅

Phase 2 — Upload stabilization & transcription (in-progress)
- 2.1 Client upload + signed URL flow — DONE ✅
- 2.2 Short-term transcription path: direct server route version (`/api/transcribe`) — IMPLEMENTED (needs hardening)
  - Issue: auth check in `app/api/transcribe/route.ts` is commented out — restore mandatory auth (`requireUser`) and validate token usage. (file: `app/api/transcribe/route.ts`)
  - Issue: direct Replicate calls in route are synchronous and may time out/cause cost spikes — move to async worker queue. (see 2.3)
- 2.3 Recommended: Transcription worker + job queue (Redis or Supabase Functions) — TODO
  - Worker downloads audio from private bucket, sends to Replicate/OpenAI Whisper, then saves `transcripts` row and enqueues LLM extraction job.
  - This satisfies the field test workflow's need for long-running, retriable jobs and ensures responsiveness for clients.
- 2.4 Transcription safety: add size/length checks, rate limiting, and per-user quotas — TODO

Phase 3 — AI extraction, validation & editor (todo / design ready)
- 3.1 LLM prompt & schema (based on `ai_medical_transcription_processing_guide.md`) — design ready, implement validation ✅ (partial)
  - Add strict JSON schema for the extraction result, with schema validation before writing to DB (prevent model hallucinations / bad shape).
- 3.2 Extraction worker (often same worker as transcription) — TODO
- 3.3 In-app review/editor UI (notes editor that loads structured fields + full transcript) — TODO
  - Must preserve audit trail, allow provider sign-off, and support the Field Test handoff flow (nurse → provider).
- 3.4 Support for EHR artifacts: SOAP note, SBAR, ICD-10 recommendations — TODO (generate but mark as suggestions only; follow AI guide rules not to invent or infer beyond transcript)

Phase 4 — Finalization, sign-off & audit (todo)
- 4.1 Finalize note UI (signature metadata, finalize -> locked note) — TODO (aligns with Atlas doc)
- 4.2 Audit logs and provenance (`audit_logs` table exists in schema; confirm population on critical actions) — TODO

Phase 5 — Deployment & infra (partially done)
- 5.1 Railway deploy setup: web service + worker + env secrets — PARTIAL (docs and checklist exist; verify infra set up)
- 5.2 Environment & secret checklist — ensure all required env vars are set in production and worker: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REPLICATE_API_KEY`, `OPENAI_API_KEY`, `REDIS_URL` (if used), `STORAGE_BUCKET` — ACTION: create env checker script — TODO

Phase 6 — Security, telemetry & monitoring (todo)
- 6.1 RLS & row permissions review (Supabase) — TODO (validate RLS matches Atlas-permissions)
- 6.2 Error monitoring (Sentry) & usage telemetry (PostHog) — TODO
- 6.3 Quotas, rate-limiting, and billing controls for third-party AI usage — TODO

Phase 7 — Optional enhancements & full vision (post-MVP)
- 7.1 Streaming transcription / diarization — optional
- 7.2 More advanced clinician tooling (decision support, integrations with MOH systems) — optional

---

## Phase 7 — Teleconferencing & Live Sessions (MVP build plan)

The Atlas operating document names **WebRTC-based video** and a **three-pane Video | Chart | Note** UI as part of the product vision. This Phase brings video into the working MVP in a pragmatic, iterative way and ensures the feature aligns to clinical workflows, privacy, and audit requirements.

7.0 Goals (MVP scope)
- Provide secure, one-to-one browser video calls between clinician and patient
- Capture video session metadata & connection logs
- Record session audio (or full session) into the existing private Supabase storage bucket using signed URLs
- Provide an option to generate real-time or near-real-time transcripts from the live audio stream and save them to `transcripts` for post-processing
- Integrate video session into the visit flow (Start visit → Start call → Record/Transcribe → Save note)

7.1 Sub-phases & tasks
- 7.1.1 PoC: Browser-to-browser WebRTC call + signaling server (serverless or lightweight node service). Acceptance: two clients can establish a direct call in staging.
 - 7.1.1 PoC: Browser-to-browser WebRTC call + signaling server (serverless or lightweight node service). Acceptance: two clients can establish a direct call in staging. — **DONE (2025-12-16)** — `services/signaling/server.js`, `public/video_poc.html`
- 7.1.2 Recording & storage: implement a recording strategy (client-side chunked upload or server-side recording) that saves audio blobs to `STORAGE_BUCKET` with signed URLs. Acceptance: recorded file saved and accessible via signed URL for 1 hour.
- 7.1.3 Session metadata & UI: capture connection logs and show a minimal Video | Chart | Note layout (three panes). Acceptance: clinician can see video and existing patient chart side-by-side and start recording/transcription from the UI.
 - 7.1.3 Session metadata & UI: capture connection logs and show a minimal Video | Chart | Note layout (three panes). Acceptance: clinician can see video and existing patient chart side-by-side and start recording/transcription from the UI. — **DONE (2025-12-16)** — `app/video/poc/page.tsx`
- 7.1.4 Evaluate & optionally integrate Twilio Programmable Video: create a Twilio account (trial ok), generate API key (US1 region for Video), implement a secure server token endpoint to issue Access Tokens with a `VideoGrant`, and migrate the client to `twilio-video` SDK. Acceptance: tokens issued and two authenticated participants can join a Twilio Room; recordings can be retrieved and stored in Supabase.
- 7.1.4a Patient profile integration: add a **Start Video Consultation** action on the patient profile that opens a patient-specific full-screen video page at `/patients/{id}/video`. The page should derive the Twilio Room name as `patient-{id}` and require authenticated users to obtain a server-signed Twilio token (use `/api/twilio/token?room=patient-{id}`). Acceptance: clinician can open the patient page, start a Twilio call, and a patient/second clinician can join from another device using the same room name.

**Two-device smoke test (manual steps)**
1. Start the dev server: `npm run dev` and sign in with a clinician account.
2. Create or open a patient and click **Start Video Consultation** to open `/patients/{id}/video`, or open the public demo room at `/video/demo` for generic two-person testing.
3. On a separate device (or another browser/incognito), sign in with a different account and open the same patient URL (`/patients/{id}/video`) or `/video/demo`.
4. In both browsers, click **Start Call** / **Join Demo Room** (or have the clinician click Start and the other party click Join). Verify both clients show logs for connecting to the Twilio Room, and that audio/video are visible and participants appear in logs.
5. Verify `/api/twilio/token?room=patient-{id}` or `/api/twilio/token?room=demo-room` returns `{ token, room }` when called with a valid Supabase Bearer token. If auth fails, the API should return 401.

**Notes:**
- Use unique test accounts on each device to verify authentication + multi-device join.
- Room naming using `patient-{id}` avoids collisions across patients and keeps rooms human-readable.
- `/video/demo` is a public demo room for QA — it's a real Twilio room where two authenticated users can join to validate audio/video across devices.
- 7.1.5 Real-time transcription integration (incremental): stream audio (or short chunks) to worker/Replicate/OpenAI and show partial transcripts in the UI. Acceptance: partial transcript appears in review pane and is saved to `transcripts` on completion.
- 7.1.5 Consent & compliance: present consent prompts before starting recording/telehealth, store consent flag, ensure auditable logs for recording start/stop. Acceptance: consent required and recorded in the DB with timestamps and user ID.
- 7.1.6 Scaling & cost controls: rate-limit concurrent sessions per user and add quotas for transcription calls. Acceptance: system enforces a cap in staging and logs excess attempts.
- 7.1.7 Security & RLS: ensure session-recorded objects are stored in private buckets and accessible only via signed URLs; verify RLS and audit logs capture access. Acceptance: recorded objects are not publicly accessible and audit entries exist for uploader and accessor events.
- 7.1.8 End-to-end tests & deploy: automated tests for call setup, recording upload, transcription generation, and UI flows. Acceptance: tests pass in CI and the feature deploys to staging.

7.2 Notes / Implementation considerations
- Signaling: use WebSocket or serverless signaling (e.g., Supabase Realtime, Socket.io) with authenticated channels.
- Recording: prefer client-side recording + signed, chunked uploads to avoid server bandwidth costs; evaluate server-side recording if clients cannot record reliably.
- Transcription: use short-chunk batching for near-real-time transcription to control cost and latency.
- Governance: follow `from_field_test_WorkFlow.md` for multi-user handoffs; ensure provider/nurse role rules apply during live sessions.

This Teleconferencing MVP phase can be executed in parallel with other Phase 2/3 tasks but should have separate acceptance criteria and a focused rollout plan. If you'd like, I can draft the initial PoC PR (signaling + one-to-one WebRTC) and add tests — tell me to proceed and I will open the PR and start the design task in the TODO list.

Governing docs and conflict rule
- Primary: `Atlas Telemedicine Platform (Operating Document).md` (use as source-of-truth for clinical flows and sign-off rules)
- Secondary: `from_field_test_WorkFlow.md` (nursing & handoff specifics)
- Tertiary: `ai_medical_transcription_processing_guide.md` (transcription extraction rules & safety)

If you want, I can split high-priority tasks into granular PRs (e.g., "enforce auth on transcribe route", "add extraction schema & validation", "move transcription to worker + queue") and open them with tests. Tell me which one to prioritize and I'll start a draft PR and tests.

---

# 4. Phase 0 — Prep & Scaffold

### AI must generate:
- `pnpm-workspace.yaml`
- Root `package.json`
- Next.js scaffold in `apps/web`
- Worker scaffold in `apps/worker`
- Shared Supabase client in `packages/shared/supabase.ts`
- `.env.example`

### `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

REPLICATE_API_KEY=
OPENAI_API_KEY=

# Twilio credentials (optional, required if integrating Twilio Video)
TWILIO_ACCOUNT_SID=
TWILIO_API_KEY=
TWILIO_API_SECRET=

REDIS_URL=
STORAGE_BUCKET=
```

---

# 5. Phase 1 — Core MVP (Supabase)

### Tasks (status):
- [x] Set up Supabase Auth (email and password with verification email on signup)
- [x] Implement Users → Patients → Visits tables (see `supabase/schema.sql`)
- [x] Generate API routes with error handling (Next.js route handlers)
- [x] Create Dashboard UI with separate sections for "My Patients" and "Shared with Me"
- [x] Simplified patient creation: Full name, Sex (M/F toggle), Contact number
- [x] Patient detail page: Shows name, sex, contact, visit history with "Start visit" button
- [x] Visit flow: Start visit → Auto-creates visit → Redirects to visit detail → Recording interface → Review & save
- [x] Private storage prep: server route `/api/upload` returns signed upload URLs scoped to clinician/user; set `STORAGE_BUCKET=telehealth_audio`
- [x] Audio recording: in-browser MediaRecorder captures audio and automatically uploads to private storage bucket
- [x] Visit detail page (`/visits/[id]`): Recording interface, review screen structure (ready for transcript/summary)
- [x] Visit listing: Clickable cards showing date, summary preview, status badges (draft/pending/finalized)
- [x] Visit notes: upsert note text per visit (`/api/visits/[id]/note`)
- [x] Patient sharing: owner can share a patient with another user via email (`/api/patients/[id]/share`)
- [x] Shared patients display: Dashboard shows shared patients in separate "Shared with Me" section with visual distinction
- [x] UI/UX improvements: Animations (fade-in, slide-in), transitions, green success buttons, blue primary buttons, hover effects
- [x] Responsive design: Works on mobile and desktop
- [x] Git configuration: `.gitignore` excludes environment files

### Quick local smoke test (do this before Railway)
1) Copy env: `cp env.example .env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `STORAGE_BUCKET=telehealth_audio`
   - `REPLICATE_API_KEY` (OpenAI not used)
2) Install and run: `npm install` then `npm run dev` (or `pnpm install` + `pnpm dev`).
3) App flow:
   - Sign in with a Supabase Auth user.
   - Create a patient.
   - Create a visit for that patient.
   - Upload a small audio file via the visit flow (uses signed URL; bucket must be private).
4) Verify:
   - Supabase Storage shows the new object under `telehealth_audio/clinician/{userId}/...`.
   - Supabase tables: `patients` and `visits` rows are created (filter by your user).

### Railway deploy smoke test (after local passes)
1) Set the same env vars in the Railway web service (and worker when added).
2) Deploy; open the app.
3) Repeat the app flow: login → create patient → create visit → upload audio.
4) Confirm objects appear in the private bucket and rows are created in Supabase.

### Supabase SQL schema:
```
create table patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  dob date,
  phone text,
  email text,
  address text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  clinician_id uuid,
  audio_url text,
  status text default 'draft',
  created_at timestamp default now()
);

create table transcripts (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits(id) unique,
  raw_text text,
  segments jsonb,
  created_at timestamp default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid references visits(id) unique,
  note jsonb,
  status text default 'draft',
  finalized_by uuid,
  finalized_at timestamp,
  created_at timestamp default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity text,
  entity_id uuid,
  user_id uuid,
  delta jsonb,
  created_at timestamp default now()
);
```

Enable Row-Level Security (RLS) and allow:
```
authenticated users to access rows where clinician_id = auth.uid()
```

---

# 6. Phase 2 — Recording + Upload + Transcription

### Recording:
Use MediaRecorder to capture audio:
```
const recorder = new MediaRecorder(stream)
```

### Upload flow:
1. Client requests presigned upload URL from `/api/upload`
2. Next.js generates URL using Supabase Storage
3. Client uploads audio file directly
4. Client notifies backend of completion
5. Worker gets job via Redis or Supabase Function

### Worker job:
1. Worker downloads audio from storage
2. Sends to Replicate/OpenAI Whisper
3. Saves transcript in Supabase
4. Updates visit status

---

# 7. Phase 3 — AI Note Extraction & Editor

### Steps:
1. Transcript exists  
2. Worker fetches transcript  
3. Runs LLM extraction prompt  
4. Saves structured JSON → Supabase `notes` table  
5. UI loads note into editor  
6. Clinician reviews & finalizes  

### Extraction schema:
```
{
  "chief_complaint": "...",
  "hpi": "...",
  "ros": {...},
  "exam": {...},
  "assessment": [...],
  "plan": [...]
}
```

---

# 8. Phase 4 — Deployment to Railway

### Environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REPLICATE_API_KEY=
OPENAI_API_KEY=
REDIS_URL=
STORAGE_BUCKET=
```

### Steps:
1. Push repo → connect to Railway  
2. Create two services:
   - Web (Next.js)
   - Worker (Node/EFFECT)  
3. Add secrets  
4. Deploy  
5. Test end-to-end

---

# 9. Telemetry & Monitoring

### Railway:
- Logs
- Metrics
- CPU/memory usage
- Error reports

### Supabase:
- Auth logs
- Database logs
- Storage logs
- SQL Explorer usage tracking

### Sentry:
- Add DSN to env
- Initialize in `_app.tsx` and worker

---

# 10. Troubleshooting

| Issue | Potential Fix |
|------|----------------|
| Auth doesn't work | Check anon key & redirect URLs |
| Upload fails | Review bucket policies |
| Worker logs empty | Fix Railway start command |
| Transcription returns empty | Validate audio format |

---

# END OF DOCUMENT
