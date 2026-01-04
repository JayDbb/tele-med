# Database: Current Tables (sparse list) ✅

**Source:** `schema_reference/reference_schema.sql`
**Generated:** 2026-01-02

> This is a sparse list of tables and their columns extracted from the reference schema. It is for documentation purposes only and not intended to be executed as-is.

---

## `public.notes` 🔧
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- visit_id — uuid, NOT NULL (FK → `public.visits(id)`)
- note — jsonb
- content — text
- status — text, DEFAULT 'draft'
- finalized_by — uuid
- finalized_at — timestamp with time zone
- created_at — timestamp with time zone, DEFAULT now()
- updated_at — timestamp with time zone, DEFAULT now()
- author_id — uuid

**Constraints:** PRIMARY KEY (id); FOREIGN KEY (visit_id) REFERENCES `public.visits(id)`

---

## `public.patient_shares` 🔒
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- patient_id — uuid, NOT NULL (FK → `public.patients(id)`)
- owner_id — uuid, NOT NULL
- shared_user_id — uuid, NOT NULL
- created_at — timestamp with time zone, DEFAULT now()

**Constraints:** PRIMARY KEY (id); FOREIGN KEY (patient_id) REFERENCES `public.patients(id)`

---

## `public.patients` 🧾
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- full_name — text, NOT NULL
- dob — date
- sex_at_birth — text
- gender_identity — text
- phone — text
- email — text
- address — text
- primary_language — text
- preferred_comm_method — text
- allergies — jsonb
- current_medications — jsonb
- past_medical_history — jsonb
- clinician_id — uuid
- created_at — timestamp with time zone, DEFAULT now()
- updated_at — timestamp with time zone, DEFAULT now()

**Constraints:** PRIMARY KEY (id)

---

## `public.recording_cache` 🎧
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- path — text, NOT NULL
- owner_id — uuid
- size — bigint
- metadata — jsonb
- status — text, DEFAULT 'cached'
- created_at — timestamp with time zone, DEFAULT now()
- deleted_at — timestamp with time zone

**Constraints:** PRIMARY KEY (id)

---

## `public.transcription_jobs` 📝
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- visit_id — uuid (FK → `public.visits(id)`)
- path — text
- cache_id — uuid
- status — text, DEFAULT 'pending'
- attempts — integer
- last_error — text
- next_attempt_at — timestamp with time zone
- processed_at — timestamp with time zone
- created_at — timestamp with time zone, DEFAULT now()
- updated_at — timestamp with time zone, DEFAULT now()

**Constraints:** PRIMARY KEY (id); FOREIGN KEY (visit_id) REFERENCES `public.visits(id)`

---

## `public.transcripts` 🎙️
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- visit_id — uuid, NOT NULL (FK → `public.visits(id)`)
- raw_text — text
- text — text
- segments — jsonb
- provider — text
- provider_metadata — jsonb
- status — text, DEFAULT 'completed'
- created_at — timestamp with time zone, DEFAULT now()

**Constraints:** PRIMARY KEY (id); FOREIGN KEY (visit_id) REFERENCES `public.visits(id)`

---

## `public.users` 👤
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- email — text, NOT NULL
- name — text
- role — text, DEFAULT 'patient'
- avatar_url — text
- metadata — jsonb
- created_at — timestamp with time zone, DEFAULT now()
- updated_at — timestamp with time zone, DEFAULT now()

**Constraints:** PRIMARY KEY (id)

---

## `public.visit_notes` 🗒️
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- visit_id — uuid (FK → `public.visits(id)`)
- author_id — uuid
- section — text
- content — text
- source — text, DEFAULT 'manual'
- created_at — timestamp with time zone, DEFAULT now()

**Constraints:** PRIMARY KEY (id); FOREIGN KEY (visit_id) REFERENCES `public.visits(id)`

---

## `public.visits` 🏥
- id — uuid, NOT NULL, DEFAULT gen_random_uuid()
- patient_id — uuid, NOT NULL (FK → `public.patients(id)`)
- clinician_id — uuid
- audio_url — text
- status — text, DEFAULT 'draft'
- created_at — timestamp with time zone, DEFAULT now()
- notes_status — text, DEFAULT 'draft'
- notes_finalized_by — uuid
- notes_finalized_at — timestamp with time zone
