export type Patient = {
  id: string;
  full_name: string;
  dob: string | null;
  sex_at_birth?: string | null;
  gender_identity?: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  primary_language?: string | null;
  preferred_comm_method?: string | null;
  allergies?: any;
  current_medications?: any;
  past_medical_history?: any;
  clinician_id?: string | null;
  created_at?: string;
  is_shared?: boolean;
};

export type Visit = {
  id: string;
  patient_id: string;
  clinician_id: string | null;
  audio_url: string | null;
  status: string;
  created_at?: string;
  notes?: VisitNote | null;
  transcripts?: Transcript | null;
};

export type Transcript = {
  raw_text: string;
  segments: {
    structured?: any;
    summary?: string;
  };
};

export type VisitNote = {
  note: any;
  status?: string;
};

