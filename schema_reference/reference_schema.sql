-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL,
  note jsonb,
  content text,
  status text DEFAULT 'draft'::text,
  finalized_by uuid,
  finalized_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  author_id uuid,
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id)
);
CREATE TABLE public.patient_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  shared_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_shares_pkey PRIMARY KEY (id),
  CONSTRAINT patient_shares_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  dob date,
  sex_at_birth text,
  gender_identity text,
  phone text,
  email text,
  address text,
  primary_language text,
  preferred_comm_method text,
  allergies jsonb,
  current_medications jsonb,
  past_medical_history jsonb,
  clinician_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recording_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  path text NOT NULL,
  owner_id uuid,
  size bigint,
  metadata jsonb,
  status text DEFAULT 'cached'::text,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT recording_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transcription_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visit_id uuid,
  path text,
  cache_id uuid,
  status text DEFAULT 'pending'::text,
  attempts integer,
  last_error text,
  next_attempt_at timestamp with time zone,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transcription_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT transcription_jobs_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id)
);
CREATE TABLE public.transcripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL,
  raw_text text,
  text text,
  segments jsonb,
  provider text,
  provider_metadata jsonb,
  status text DEFAULT 'completed'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transcripts_pkey PRIMARY KEY (id),
  CONSTRAINT transcripts_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  role text DEFAULT 'patient'::text,
  avatar_url text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.visit_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visit_id uuid,
  author_id uuid,
  section text,
  content text,
  source text DEFAULT 'manual'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT visit_notes_pkey PRIMARY KEY (id),
  CONSTRAINT visit_notes_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id)
);
CREATE TABLE public.visits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  clinician_id uuid,
  audio_url text,
  status text DEFAULT 'draft'::text,
  created_at timestamp with time zone DEFAULT now(),
  notes_status text DEFAULT 'draft'::text,
  notes_finalized_by uuid,
  notes_finalized_at timestamp with time zone,
  CONSTRAINT visits_pkey PRIMARY KEY (id),
  CONSTRAINT visits_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);