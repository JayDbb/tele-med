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
  allergies?: string;
  current_medications?: string;
  past_medical_history?: string;
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
    structured?: StructuredTranscriptData | string;
    summary?: string;
  };
};

export type VisitNote = {
  note: string;
  status?: string;
};

// Google Calendar API Types
export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
}

export interface GoogleCalendarEventsResponse {
  items?: GoogleCalendarEvent[];
}

// Appointment Types
export interface AppointmentData {
  patientName: string;
  type: 'consultation' | 'chemotherapy' | 'surgery' | 'follow-up' | 'meeting';
  date?: string;
  startTime?: string;
  endTime?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  notes?: string;
  patientId?: string;
}

// Drag and Drop Types
export interface DragEndEvent {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
}

// Structured Transcript Data Types
export interface Symptom {
  symptom: string;
  characteristics?: 'mild' | 'moderate' | 'severe' | 'unspecified' | string;
}

export interface Prescription {
  medication?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface StructuredTranscriptData {
  past_medical_history?: string[];
  current_symptoms?: Symptom[] | Record<string, string>;
  physical_exam_findings?: Record<string, string | object>;
  diagnosis?: string | string[];
  treatment_plan?: string[];
  prescriptions?: Prescription[];
  summary?: string;
  ros?: Record<string, string>;
  physicalExam?: Record<string, string>;
  assessmentPlan?: string;
  signature?: {
    signedBy: string;
    signedDate: string;
    status: string;
  };
}

// Order Types
export interface OrderData {
  medication?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  instructions?: string;
  refills?: number;
  diagnosis?: string;
  priority?: string;
  orderType?: string;
  patientId?: string;
  warnings?: string[];
  pediatricCalculation?: { dose: number; frequency: string; calculation: string } | null;
}

export interface DosingInfo {
  [key: string]: string | number;
}

export interface DrugInteraction {
  [key: string]: string | number;
}

export interface DrugAllergy {
  [key: string]: string | number;
}

// Replicate API Types
export interface TranscriptionPrediction {
  text?: string;
  transcription?: string;
  output?: string;
  [key: string]: unknown;
}

export interface ParsedTranscriptionData {
  past_medical_history?: string[];
  current_symptoms?: Symptom[] | Record<string, string>;
  physical_exam_findings?: Record<string, string | object>;
  diagnosis?: string | string[];
  treatment_plan?: string[];
  prescriptions?: Prescription[];
  summary?: string;
  raw?: string;
  [key: string]: unknown;
}

// Speech Recognition Types
export interface WebKitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  length: number;
  item: (index: number) => SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new (): WebKitSpeechRecognition;
    };
  }
}

// Medication Types
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
  category?: string;
}

// Macro Template Types
export interface MacroTemplate {
  [key: string]: string;
}

