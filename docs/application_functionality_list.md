# Application Functionality List ✅

**File:** `docs/application_functionality_list.md`
**Source:** codebase (app/, components/, contexts/, app/api/, lib/)
**Generated:** 2026-01-02

---

## High-level summary ✨
**TeleMed Portal** is a web-based clinical workflow application designed for clinicians (doctors and nurses) to manage patients, visits, appointments, audio transcription-based documentation, and telemedicine (video call) workflows. It integrates with Supabase for authentication, storage, and database, with Google Calendar for scheduling, and with Replicate (Whisper) plus a parsing step for transcript-to-structured-medical-data conversion.

The app is built with Next.js (app router), React, TypeScript, Tailwind CSS, and uses serverless API routes for backend actions. Key features are secure auth/session handling, patient CRUD, visit records, audio upload and transcription, AI parsing for clinical notes, calendar sync, and a (mockable) video call flow.

---

## Tech stack & integrations 🔧
- Frontend: Next.js (app router), React, TypeScript, Tailwind CSS
- Auth & Database: Supabase (Auth, Postgres, Storage)
- Transcription: Replicate (Whisper model) via signed URLs
- Parsing/NLP: Hosted/remote prompt-based parsing (server route wraps LLM/AI provider)
- Calendar: Google Calendar API (OAuth based integration)
- PWA: Service worker + `offline.html` (basic PWA support)
- File uploads: Signed upload URLs (Supabase storage)

---

## User roles & auth 🔐
- **Doctor** (primary user): full access to doctor portal routes (`/doctor`, `/dashboard`, `/patients`, `/inbox`, `/calendar`) and can manage patients, visits, notes, and appointments.
- **Nurse**: limited access through nurse portal (`/nurse-portal`), can view assigned patients and perform nurse-specific flows.
- Authentication: via Supabase / NextAuth session management (`components/AuthProvider.tsx`, `components/AuthWrapper.tsx`, `contexts/DoctorContext.tsx`, `contexts/NurseContext.tsx`). Login route: `/login`.

---

## Frontend: Pages & user-facing flows 🖥️
High-level pages (found under `app/`):
- `/login` — Sign-in page that routes users by role to nurse or doctor portals.
- `/(root) -> /login` — root redirects to login.
- `/doctor` & `/doctor/dashboard` — Doctor dashboard (KPIs, widgets, quick actions).
- `/nurse-portal` — Nurse portal (dashboard, schedule, messages).
- `/dashboard` — Doctor's main dashboard (overview, stats).
- `/patients` — Patients list and patient search.
- `/patients/new` & `/patients/create` — Create new patient flows.
- `/patients/[id]` and nested pages — Patient profile with tabs for vitals, medications, allergies, history, orders, visit flow, visits list, charts and documents.
- `/visits` & `/visits/new` — Create and view visit records.
- `/calendar` & `/doctor/calendar` — Calendar overview (Google Calendar integration via context and API).
- `/inbox` & `/doctor/inbox` — Messaging/inbox UI for clinician communication.
- `/medications` — Medication list and create flows.

Representative component functionality (in `components/`):
- `Header`, `Sidebar`, `NurseHeader`, `PatientsHeader` — Layout & navigation.
- `PatientsList`, `PatientCards`, `PatientDetail`, `PatientDetailSidebar` — Patient browsing & detail UI.
- `VisitDetail`, `VisitHistory`, `NewVisitForm`, `DoctorNewVisitForm`, `NurseNewVisitForm` — Visit clinical documentation UI.
- `PatientChart`, `VitalsChart`, `Timeline` — Clinical data visualizations.
- `Appointments`, `AppointmentDetail`, `Calendar` — Scheduling UI, calendar events display.
- `VideoCallWrapper`, `VideoCallPiP`, `VideoCallContext` — Video call UI and state for telemedicine flows (mocked provider accessible via API).
- `SearchBar`, `GlobalSearchBar` — Search functionality.
- `NewAppointmentModal`, `NewOrderModal` — Modal-based creation flows.
- `PwaManager`, `SyncManager` — PWA behavior & client syncing utilities.
- `AITransparency` — UI to show AI-based parsing/transcription details or disclaimers.

---

## Backend & API routes (serverless) 🧭
Key server routes live in `app/api/` (detailed):

### Authentication & session
- `POST /api/auth/[...nextauth]` — NextAuth + Supabase integration for sign-in/sign-out and session management. Uses NextAuth handlers to establish server sessions and issue access tokens used by other server routes.
- `GET/POST /api/users` — New endpoint to GET the current `users` table row (server-authoritative profile) and POST to create/upsert a `users` row for the authenticated auth user (used during signup). The application now uses the `users.role` field (not `auth.user.user_metadata.role`) as the primary source of truth for routing and feature gating.

### Patients
- `GET /api/patients` — Requires authentication (`requireUser`); returns patients owned by the authenticated clinician and patients shared with them (combines `patients` and `patient_shares` tables).
- `POST /api/patients` — Creates a new patient record (supabase insert). Expects patient payload (full_name, email, dob, phone, sex_at_birth, address, allergies...). Returns created patient.
- `GET /api/patients/[id]` — Returns a single patient and related visits; auth-protected.
- `POST /api/patients/[id]/share` — Shares a patient with another user (creates `patient_shares` row). Input: email or user identifier. Auth protected.
- `GET/POST /api/patients/[id]/allergies` — CRUD-like endpoints for patient allergy records created and fetched via Supabase rows.

### Visits & notes
- `GET /api/visits` / `POST /api/visits` — List and create visit records (link to `patients`). Auth protected; POST expects visit payload and stores a `visits` row.
- `GET /api/visits/[id]` / `PUT /api/visits/[id]` — Fetch and update visit details. `PUT` can update status and visit metadata.
- `POST /api/visits/[id]/note` — Append-only notes for visits. Behaves as:
  - `POST` to append a new note entry (content, section, source) with timestamp and author stored in `visit_notes`.
  - `GET` returns aggregated visit note entries and status.
  - `PUT` updates visit note status (e.g., sign note). All endpoints are auth-protected and often use `requireUser` to validate.

### File uploads & recordings
- `POST /api/upload` — Server returns a signed upload URL & token for Supabase Storage (uses `supabaseServer()`), enabling direct client uploads to the configured `STORAGE_BUCKET`. Input: filename / contentType; Output: path, signedUrl, token, bucket.
- Recording cache and metadata are tracked in `recording_cache` for later transcription.

### Transcription & NLP (audio → structured data)
- `POST /api/transcribe/dictate` — Accepts { path } (Supabase storage path), creates a signed download URL, and calls Replicate Whisper models to transcribe audio. Returns `{ transcript }`. Requires `REPLICATE_API_KEY` and `STORAGE_BUCKET` env vars.
- `POST /api/transcribe/parse` — Accepts `{ transcript, prompt?, visit_id? }`. Sends transcript + prompt (defaults to a medical parsing prompt) to an LLM or parsing service and returns `{ structured, summary }`. The structured schema follows a strict format (past_medical_history, current_symptoms, physical_exam_findings with nested `vital_signs`, diagnosis, treatment_plan, prescriptions, summary).
- `POST /api/transcribe` — Legacy wrapper that sequentially calls `/dictate` and `/parse` and returns combined `{ transcript, structured, summary }`.
- Transcription flows use `supabaseServer()` for signed URLs and may record results to `transcripts` or `transcription_jobs` depending on implementation.

### Calendar & Appointments (Google Calendar integration)
- `GET /api/google-calendar/events` — Example server-side method showing how to list Google Calendar events using an OAuth2 client; in production it should use a stored `accessToken` from the session or secure store.
- `POST /api/appointments/create` — Creates a Google Calendar event on behalf of the authenticated clinician (uses `getServerSession(authOptions)` to fetch `accessToken`). Expects appointment payload (patientName, type, startDateTime, endDateTime, notes, location).
- `GET /api/google-calendar/auth` & `GET /api/google-calendar/callback` — OAuth flow endpoints for authorizing Google Calendar. Implementation notes: requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_URL` in env.

### Video call (mocked integration)
- `POST /api/video-call/start` — Mock endpoint that returns a `roomId` and `callUrl`. Intended to be replaced/extended with real providers (Zoom, Twilio, Agora, Google Meet) and to include email invite sending and DB logging in production.

---

### Server-side libraries in `lib/` (detailed)
- `lib/api.ts` — Client helpers that wrap server routes and attach auth tokens (`authFetch`). Exposes `login`, `signup`, `getPatients`, `createPatient`, `createVisit`, `getVisit`, `updateVisit`, transcription helpers (`dictateAudio`, `transcribeVisitAudio`), notes helpers (`getVisitNotes`, `appendVisitNote`, `updateVisitNoteStatus`), and other convenience methods.
- `lib/supabaseServer.ts` & `lib/supabaseBrowser.ts` — Initialize Supabase clients for server and browser contexts. `supabaseServer()` is used within API routes to perform privileged operations and create signed URLs.
- `lib/auth.ts` — `requireUser(req)` and similar helpers that validate session/cookie and return `userId` or error. Used across protected routes.
- `lib/storage.ts` — Helpers for interacting with Supabase storage (signed URLs, uploads, buckets).
- `lib/audioConverter.ts` — Utilities for normalizing or converting audio formats prior to transcription (if required by Replicate or other providers).

**Notes:**
- Many routes expect a valid session/access token and will return 401 when unauthenticated. The codebase uses both `requireUser` and NextAuth `getServerSession` patterns depending on the route context.
- External integrations require environment variables (Replicate, Google OAuth, STORAGE_BUCKET). See `.env` usage in routes.


---

## Data model & storage 📦
Primary database tables (from `schema_reference/reference_schema.sql` / documented in `schema_reference/database_current_tables.*`):
- `patients` — Patient demographics & metadata.
- `patient_shares` — Sharing relationships between users.
- `visits` — Visit records (status, notes status, relation to patient).
- `visit_notes` — Append-only note entries per visit.
- `notes` — Possibly higher-level notes (structured JSON and content), finalized metadata.
- `transcription_jobs` — Queue / job metadata for background transcription work.
- `transcripts` — Transcript results (raw_text, parsed text, segments, provider metadata).
- `recording_cache` — Cached uploaded recordings and metadata.
- `users` — Users table (id, email, role, metadata).

---

## Important workflows & flows description 🧭
1. **Login / Role routing**
   - User signs in via `/login`. After successful Supabase sign-in, role (from `user_metadata.role`) determines where the user is routed: doctor → `/doctor/dashboard`, nurse → `/nurse-portal`.

2. **Patient lifecycle**
   - Create patient via UI → `POST /api/patients` (supabase insert) → patient visible in clinician's list (owned or shared).
   - Share patient with another user via `POST /api/patients/[id]/share` → insert into `patient_shares`.

3. **Visit and notes**
   - Create visit → `POST /api/visits` and add notes via `POST /api/visits/[id]/note` (append-only entries).
   - Notes have statuses (draft, signed, pending). Finalization metadata stored on visit.

4. **Audio upload, transcription, and parsing**
   - Clinician uploads audio via the client → `POST /api/upload` to get signed upload URL → upload the file directly to Supabase storage.
   - Server-side transcription (`/api/transcribe/dictate`) uses Replicate (Whisper) to transcribe the signed URL audio.
   - Parsing (`/api/transcribe/parse`) applies structured medical prompt (careful instructions for vital signs extraction, etc.) to produce structured JSON (past_medical_history, symptoms, physical_exam_findings with nested `vital_signs`, diagnosis, treatment_plan, prescriptions) and a human-readable summary.
   - Legacy `POST /api/transcribe` wraps both steps to return transcript + structured result.

5. **Calendar & appointments**
   - App integrates with Google Calendar. App context fetches events using session access token; appointments can be created via `POST /api/appointments/create` which calls Google Calendar API.

6. **Video calls**
   - `/api/video-call/start` provides a mockable endpoint to create a video room and returns a meeting URL. Component-level flows (`VideoCallWrapper`, `VideoCallPiP`) handle opening/conserving call state.

---

## State management & contexts 🔁
This project uses React Contexts (client-side) to manage user identity, session-derived state, ephemeral UI state, and light persistence via `localStorage`. Contexts and hooks centralize common behaviors and make them easy to consume across components.

- `DoctorContext` — Manages doctor user identity and authentication state. Exposes: `doctor` (metadata), `login(email, password)`, `logout()`, `isAuthenticated`, and `loading`. Implementation notes: Uses Supabase session via `supabaseBrowser()` and `supabase.auth.onAuthStateChange` to keep state in sync.

- `NurseContext` — Similar to `DoctorContext` but focused on nurse role and department metadata. Exposes: `nurse`, `login` (placeholder), `logout`, `isAuthenticated`, `setNurse`, `setIsAuthenticated`, and `loading`.

- `AppointmentsContext` — Provides appointment lists and sync helpers. Key functions: `appointments` (array of calendar events), `addAppointment(appointment)`, `refreshAppointments()` which calls Google Calendar API using the user's access token. Persists demo appointments to `localStorage` under `demo-appointments`.

- `VideoCallContext` — Manages telemedicine call state (open/closed, patient details). API: `videoCall` object, `startVideoCall(patientName, patientEmail)`, `endVideoCall()`. State is persisted in `localStorage` under `video-call-state` to survive reloads.

- `ThemeContext` — Tracks UI theme preferences (dark/light, system preference). Used by `ClientThemeWrapper` to apply theme CSS classes.

- Utility hooks
  - `useAuthGuard` — Higher-level guard to enforce route-level access and optionally redirect to `/login`.
  - `usePatientRoutes` — Helpers for generating or validating patient-specific routes and breadcrumbs.
  - `useAudioRecorder` — Client-side audio recording helper used by dictate/transcription flows (handles media/device capture and chunking if implemented).

**Notes on data flow & persistence:**
- Server-authoritative data (patients, visits, transcripts) are stored in Supabase Postgres and fetched via `lib/api.ts` helper functions (which call protected API routes).
- Lightweight UI state (appointments demo list, video call state) is stored in `localStorage` for quick persistence and demo purposes.
- Auth state is primarily tied to Supabase sessions; provider components listen to auth state changes and update contexts accordingly.

---

## Review & final notes ✅
I spot-checked representative files and routes to ensure the document maps accurately to the codebase:
- Auth and routing: `app/login/page.tsx`, `components/AuthWrapper.tsx`, `contexts/DoctorContext.tsx`, `contexts/NurseContext.tsx`.
- Transcription pipeline: `app/api/transcribe/{dictate,parse}.ts`, `lib/api.ts`'s `transcribeVisitAudio` helper.
- Core CRUD and storage: `app/api/patients/*`, `app/api/visits/*`, `app/api/upload`, and `lib/supabaseServer.ts`.

Follow-ups I recommend:
- Add a short one-line summary for each top-level `app/.../page.tsx` file for quicker browsing by new contributors.
- Add sample `.env.example` showing required env vars (REPLICATE_API_KEY, STORAGE_BUCKET, GOOGLE_CLIENT_ID/SECRET, NEXTAUTH_URL).
- Consider adding integration tests for transcription and patient-sharing flows (mock external APIs).

If you’d like, I can now:
1. Add the one-line page summaries automatically and commit them to `application_functionality_list.md` (fast), or
2. Create a `docs/` directory, move `application_functionality_list.md` there and add `README` linking to it, and produce a CSV export.

Tell me which follow-up you prefer and I’ll continue (then I’ll mark the final tasks completed).
