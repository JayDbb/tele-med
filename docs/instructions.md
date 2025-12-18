TeleHealth MVP — build & implementation guide (single-document deliverable)

A single, actionable markdown plan that revises and replaces the two uploaded files (scope.md and exampleAppJS.txt) and turns them into an implementation-ready MVP plan.
This document uses the UI / design concept captured in exampleAppJS.txt and the functional + non-functional requirements in scope.md as source material. 

scope

 

exampleAppJS

1) Executive summary (what we'll build)

A phone-first, secure web app for clinicians to:

Authenticate and access a Dashboard of patients, visits, and draft notes.

Create & maintain Patient Master Profiles (Document 1).

Start a Visit: record audio in-app or upload audio files; store audio tied to Visit.

Send audio to a transcription service and auto-generate a Draft Visit Note (Document 2).

Allow clinicians to review/edit the draft, then Finalize & Sign the visit note.

Secure storage, minimal admin UI, audit trail, and basic search/filter functionality. 

scope

2) Recommended tech stack (as discussed in scope.md)

Frontend / Backend framework: Next.js (TypeScript + React) — unified stack, server-side + API routes. 

scope

Styling: Tailwind CSS (matches the supplied design tokens). 

scope

Auth: BetterAuth (or equivalent OAuth/JWT provider) for clinician login. 

scope

Transcription / AI: HONO (ingest & orchestrate) + external model on Replicate or Whisper. (HONO = transcription service glue; Replicate/Whisper = actual model). 

scope

Database: PostgreSQL (hosted by Railway or other managed provider).

Storage: S3-compatible (for audio files) — Railway + managed object store (or use Railway attachments).

Deployment: Railway for both frontend and backend (fast CI/CD). 

scope

Hosting / env: Docker for local dev parity (optional).

Monitoring / logs: simple logging (structured JSON logs) + Railway logs; optional Sentry for errors. 

scope

3) High-level architecture
[Browser (Next.js app)] <--HTTPS--> [Next.js API routes (serverless on Railway)]
                                            |
                                            |---> PostgreSQL (Patient, Visits, Transcripts, Audit)
                                            |
                                            |---> Object Storage (audio files)
                                            |
                                            |---> Transcription Queue (HONO) ---> Replicate/Whisper (async)
                                            |
                                            |---> Background worker (process transcript -> structured draft note)
                                            |
                                            |---> Auth provider (BetterAuth)


Notes

Keep audio-to-transcription asynchronous via a queue (HONO or simple job queue). UX shows progress and flags low-confidence fields. 

scope

All traffic must be HTTPS; audio & PHI are encrypted at rest and in transit. 

scope

4) Minimal data model (Postgres tables — MVP)

Use simple normalized tables. Add indexes on patient name, visit date, and note status.

patients

id (uuid, PK)

mrn (string, e.g., 00001)

full_name, dob, sex_at_birth, gender_identity, address, phone, email, primary_language, preferred_comm_method

allergies (jsonb array), current_medications (jsonb), past_medical_history (jsonb)

created_by, created_at, updated_by, updated_at

visits

id (uuid, PK)

patient_id (FK)

clinician_id (FK)

visit_date, start_time, end_time, visit_type, location

status (enum: draft, pending_review, finalized)

transcript_id (FK)

audio_url (string)

created_at, updated_at

transcripts

id (uuid)

visit_id (FK)

raw_text (text)

segments (jsonb) — timestamps, confidence, speaker labels if available

created_at, processed_at

notes

id (uuid)

visit_id (FK)

chief_complaint, hpi, ros (jsonb), vitals (jsonb), exam (jsonb)

assessments (jsonb), plan (jsonb), orders (jsonb)

status, finalized_by, finalized_at

audit_history (jsonb)

users (clinicians + admins)

id, name, email, password_hash (if local), role, last_login, is_active

audit_logs

id, entity_type, entity_id, action, user_id, timestamp, delta

(These reflect the fields required in scope.md — patient & visit structure). 

scope

5) API design (Next.js API routes / REST-ish)

POST /api/auth/login — authenticate (BetterAuth / exchange token).

GET /api/patients?query= — search; paginated.

POST /api/patients — create patient.

GET /api/patients/[id] — patient profile + visits.

POST /api/patients/[id]/visits — start visit (minimal metadata).

POST /api/visits/[id]/audio — upload audio (returns presigned URL or store directly).

POST /api/visits/[id]/recordings/start — optional: start a live recording session (websocket or client-side recorder).

POST /api/visits/[id]/transcribe — queue transcription.

GET /api/visits/[id]/transcript — get transcript + confidence metadata.

POST /api/visits/[id]/note/auto-generate — run text→structured mapping (LLM or rules).

PUT /api/visits/[id]/note — update note (editing).

POST /api/visits/[id]/finalize — finalize & sign note (store signature/time).

GET /api/dashboard — recent patients, draft notes, stats.

Auth: protect all routes via middleware; include clinician id in JWT claims.

6) Frontend: mapping exampleAppJS.txt UI to pages & components

The exampleAppJS.txt file contains the design system, flows and many visual components (login, dashboard, patient profile, new patient, new visit, recording modal, recording state, AI-generated notes UI). Reuse that structure and component naming for a fast implementation. 

exampleAppJS

Pages

/ → Login (mobile-first single-screen card, follows example).

/dashboard → Clinician dashboard (Recent Patients, Quick Stats, New Patient).

/patients/new → New patient form (voice-record button + manual fields).

/patients/[id] → Patient profile page (contact, details, recent visits).

/visits/[id]/new → New visit page with recording/upload and visit notes area.

/visits/[id]/recording → Recording modal (overlay) — inspired by exampleAppJS recording modal. 

exampleAppJS

Core React components (from exampleAppJS)

Header, SearchBar, PatientCard, VisitCard, RecordingModal, VoiceRecorderButton, AIFormPreview, NoteEditor.

Keep UI state in React + server-sync via API calls. Use SWR or React Query for caching & revalidation.

Design tokens & styles

Follow the style guide in scope.md: primary #004e98, spacing rules, card radius, typography. Use Tailwind config to add tokens. 

scope

7) Recording & transcription flow (detailed)

Start visit → clinician taps Record (client asks browser for mic permission).

Local buffer: capture audio in small chunks (MediaRecorder API) and stream/upload periodically (for reliability on spotty networks).

On Stop, upload final audio to object storage and POST /api/visits/[id]/transcribe to queue transcription. UI shows "Transcribing..." and progress.

Transcription worker (HONO) picks up job, sends audio to chosen model (Replicate / Whisper). Store transcript and segments (timestamps + confidence).

Auto-generate draft note: a background worker (or serverless function) runs an LLM/rules pipeline to extract Chief Complaint, HPI, ROS, Assessments & Plan; mark low-confidence fields (UI will highlight them). 

scope

Clinician reviews/edits note and Finalizes (sign -> status=finalized). Audit trail recorded.

UX details from example: provide both Audio / Transcript / AI Form tabs inside recording modal for quick review. Show the session timer and session id. 

exampleAppJS

8) Worker & infra details (transcription and extraction)

Queue: Redis or built-in job queue (e.g., BullMQ) or a managed queue in Railway.

Worker process:

Downloads audio from storage.

Submits audio to HONO orchestration (HONO -> Replicate/Whisper or another model).

Stores transcript and segments.

Runs extraction pipeline:

Use a deterministic LLM prompt that extracts required fields to JSON (chief complaint, HPI, ROS, meds, assesment, plan).

Validate & flag low-confidence fields (use the model's token-level or segment confidence where available; otherwise heuristics).

Fallback: If model fails, mark transcript status failed and notify clinician.

9) Security & compliance (must-haves)

TLS for all communication. NFRs call for encryption in transit and at rest. 

scope

Encrypt audio files and sensitive DB fields (PG encrypted columns or application-level encryption).

RBAC: clinician vs admin; initial MVP may treat all clinicians as same role but design to support RBAC. 

scope

Audit logs on all note edits, finalizations, and patient profile changes. 

scope

Data residency / legal: follow Jamaican Data Protection Act guidance (scope notes this requirement). 

scope

10) Acceptance criteria (MVP)

Each feature below must be testable and demonstrable:

Login: clinicians can login via BetterAuth and access dashboard. 

scope

Create a patient: new patient form (fields from scope.md), saved to DB. 

scope

Start Visit & Record: clinician can record and save audio, audio stored and attached to visit. 

scope

Transcribe: queued transcription completes and transcript appears in visit. 

scope

Auto-generated Draft Note: structured note pre-filled from transcript; low-confidence fields flagged. 

scope

Edit & Finalize: clinician edits draft and finalizes — finalized_at & finalized_by recorded; note locked from editing except via addendum. 

scope

Search: find patients by name and see recent visits/drafts. 

scope

Security: TLS, audit logging on key actions, and encrypted storage for PHI. 

scope

11) Minimal project structure & skeleton commands
/telehealth-mvp
  /apps
    /web        -> Next.js (pages/app router) + Tailwind
    /api        -> Next.js API routes (or /apps/web/src/pages/api)
  /packages
    /ui         -> shared React components (Header, Card, RecordingModal)
    /lib        -> shared helpers (auth, db)
  /workers
    /transcribe -> worker that handles HONO/Replicate + extraction
  /scripts
    start-dev.sh
    deploy.sh


Scripts (examples)

pnpm install

pnpm dev --filter web (Next dev)

pnpm build --filter web && pnpm start --filter web

docker-compose up (if you create a dev compose for Postgres + Redis)

12) Quick start — local dev checklist

Clone repo.

cp .env.example .env — set DATABASE_URL, STORAGE_BUCKET, BETTERAUTH_*, HONO_*, REPLICATE_KEY.

Run dev DB (local Postgres) or use Railway dev DB.

pnpm install

pnpm dev (start next + worker separately)

Login with test clinician and create a patient → start visit → record or upload audio → click Transcribe → verify draft note.

13) Implementation roadmap / prioritized tasks (2-week sprint split)

Sprint 1 (core MVP)

Project scaffolding (Next + Tailwind + TypeScript).

Auth integration (BetterAuth).

DB schema + migrations (Postgres).

Create patient UI + backend.

Dashboard + patient list + search.

Visit creation + audio upload API + storage.

Transcription queue + stub worker (simulate transcript).

Save transcript & auto-fill a basic note (simple parse rules).

Basic audit logs.

Sprint 2 (polish & AI)

Replace transcript stub with HONO -> Replicate/Whisper integration.

LLM-based extraction & low-confidence tagging.

Recording modal + streaming/resilience (chunked uploads). (UI already in exampleAppJS.txt — implement as components). 

exampleAppJS

Finalize & sign note; add constraints & locking.

Encryption at rest; add basic monitoring.

Sprint 3 (hardening & ops)

RBAC, admin console for users.

Tests (unit + E2E).

Deploy to Railway, configure CI/CD and environment secrets.

Sentry & uptime monitoring.

14) UX + design notes (from exampleAppJS + scope)

Phone-first card-based UI, rounded components, clear primary button (#004e98). Use the Recording Modal pattern in the example (session timer, Audio/Transcript/AI Form tabs, recording pulses). 

exampleAppJS

When a field was auto-filled with low confidence, highlight it and show Review needed badge. 

scope

Include voice input for patient intake (single-button “Record” that either fills all fields or single-field recording). Example file demonstrates both approaches — implement single-field and full-intake modes. 

exampleAppJS

15) Testing & QA

Unit tests for extraction functions (text → structured JSON).

Integration tests for upload → transcription → note flow (use recorded audio fixtures).

E2E: Login → create patient → record → transcribe → finalize.

Test for edge cases: long audio, noisy audio, multi-speaker, interrupted uploads.

16) Operational concerns & mitigations

Intermittent connectivity: chunked audio uploads + client-side buffering + retry logic.

Accent & noise: allow clinician to flag low-confidence segments; fallback manual transcription. 

scope

Data retention: define retention policy (e.g., retain audio & transcripts for X years per local law).

Scaling: worker horizontally scalable; DB indices for search; object storage scalable.

17) Deliverables & next steps (what I will hand over)

A deliverable repo scaffold with:

Next.js app (login, dashboard, patient CRUD, new visit flow skeleton).

Worker skeleton (transcription queue integration placeholder).

DB migrations and basic seed data.

Tailwind theme with tokens from scope.md. 

scope

Implementation checklist for connecting HONO → Replicate/Whisper and securing production credentials.

A small style guide & component map derived from exampleAppJS.txt. 

exampleAppJS

18) Appendix — references to the uploaded source files

Requirements and style guide used heavily from scope.md (MVP requirements, data model summary, UI tokens). 

scope

UI flows, recording modal, and component examples referenced from exampleAppJS.txt (use as direct implementation spec for components).