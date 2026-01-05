# Overview

**Overview**

A secure, web-based telehealth and electronic medical records (EMR) application designed for doctors serving patients in Jamaica’s underserved and storm-affected communities.

What it is

* A browser-based app (phone/tablet/computer) where clinicians can:  
  * Log in securely  
  * View and update patient profiles  
  * Conduct telehealth consultations (video and/or audio)  
  * Record and store clinical encounters as structured medical records

What it’s used for

* Enabling remote consultations when patients can’t easily access in‑person care  
* Capturing complete visit history:  
  * Demographics and contact details  
  * Past medical history, current complaints, medications, surgeries  
  * Visit notes generated from recorded conversations using AI transcription  
* Providing a single, secure record that can be reused by multiple doctors over time  
* Supporting missions work (e.g., Christiana Friday missions) with consistent data capture

Impact / Why it matters

* Expands access to qualified doctors (including international volunteers) for patients in remote or disaster-affected areas  
* Reduces reliance on paper charts and fragmented records, improving continuity of care  
* Frees doctors to focus on the patient instead of typing, by using AI to structure notes  
* Lays the foundation for future integration with:  
  * Jamaican Ministry of Health systems  
  * Local pharmacies and labs  
  * Decision support (e.g., suggested diagnoses, labs, and medication safety checks)

# Prototype Requirements

MVP REQUIREMENTS – TELEHEALTH CLINICAL DOCUMENTATION APP  
 (v1.0 Requirements Document)

---

## **1\. Purpose & Scope**

This MVP is a telehealth documentation tool that allows clinicians to:

1. Log into a secure web application.

2. Create and maintain a **Patient Master Profile** (Document 1).

3. Record or upload an **audio conversation** from a telehealth visit.

4. Automatically **transcribe** the audio.

5. Automatically **populate a Visit Note** (Document 2\) from the transcript.

6. Review, edit, and **approve** the draft note.

7. Save the final note to a secure database, linked to the patient profile.

This document captures **functional and non-functional requirements**, including all data fields that must be supported in the MVP.

---

## **2\. Users & Roles**

### **2.1 Roles**

* **Clinician (Doctor / Provider)**

  * Can authenticate, manage their patient list, create/edit patient profiles, start visits, record/upload audio, review and finalize notes.

* **System Administrator**

  * Manages user accounts and high-level configuration (no clinical editing for MVP, unless specified later).

For MVP, we can treat all clinical users with the same permissions.

---

## **3\. Core User Flows**

### **3.1 Login & Access**

1. Clinician navigates to the app.

2. Enters credentials (e.g., email \+ password).

3. On success, lands on a **Dashboard** showing:

   * Recent patients

   * Recent visits

   * Draft notes pending review.

### **3.2 Create / Edit Patient Profile (Document 1\)**

1. From dashboard, clinician clicks **“New Patient”** or selects an existing patient to edit.

2. Clinician fills in required Patient Intake fields.

3. System validates required fields and saves a **Patient Master Profile** record.

### **3.3 Start a New Visit**

1. Clinician selects a patient.

2. Clicks **“Start New Visit”**.

3. Fills minimal **Visit Metadata** (visit date/time, visit type, location, clinician name).

4. Chooses to:

   * **Record Audio** inside the app, or

   * **Upload Audio File** (e.g., from another system).

### **3.4 Transcription & Draft Note Creation**

1. After recording/upload is complete, clinician clicks **“Transcribe”**.

2. System:

   * Sends audio for transcription.

   * Receives full transcript.

   * Uses rules/AI to map transcript into structured fields of the **Visit Note** (Document 2):

     * Chief complaint

     * HPI

     * Relevant ROS findings

     * Assessment (diagnoses)

     * Plan (medications, tests, referrals)

3. System creates a **Draft Visit Note** linked to the patient, with status \= **“Pending Review”**.

### **3.5 Review & Edit Draft Note**

1. Clinician opens the draft note, seeing:

   * Structured form fields pre-filled.

   * Full transcript.

2. Clinician can:

   * Edit any field (including adding vitals, exam findings, etc.).

   * Add missing information directly into fields.

3. When satisfied, clinician clicks **“Finalize & Sign”**.

4. System:

   * Captures electronic signature metadata (user ID, timestamp).

   * Updates note status to **“Finalized”**.

   * Locks the note from further edits (or restricts edits to addenda).

### **3.6 View Patient History**

1. Clinician opens a Patient Profile.

2. Can view:

   * Basic Patient Intake data.

   * List of all past visits.

3. Can click a visit to open the finalized visit note.

---

## **4\. Functional Requirements**

### **4.1 Authentication & User Management**

* **Login**

  * FR-1: Support secure login for clinicians (username/email \+ password).

  * FR-2: Passwords must be stored securely (hashed).

* **Session Management**

  * FR-3: Implement session timeout / auto-logout after inactivity.

* **Account Management**

  * FR-4: System admin can create, deactivate, or reset clinician accounts.

---

### **4.2 Patient Master Profile (Document 1\)**

The system must support creation and update of a **Patient Master Profile** with the following fields.

#### **4.2.1 Patient Identity**

* Full Legal Name (required)

* Date of Birth (required)

* Sex at Birth (required)

* Gender Identity (optional)

* National ID / Passport / Local Equivalent (optional)

* Address (required)

* Phone Number(s) (at least one required)

* Email Address (optional but recommended)

* Emergency Contact Name (optional for MVP, but field present)

* Emergency Contact Phone

* Relationship to Emergency Contact

#### **4.2.2 Demographic Information**

* Race / Ethnicity (optional)

* Primary Language (required)

* Interpreter Needed? (Yes/No)

* Employment Status (optional)

* Occupation (optional)

#### **4.2.3 Preferred Pharmacy Information**

* Pharmacy Name

* Pharmacy Address

* Pharmacy Phone Number

* Pharmacy Electronic ID (if applicable)

(Section can be optional depending on context, but model must support these fields.)

#### **4.2.4 Insurance Information (If Applicable)**

* Insurance Provider

* Policy Number

* Group Number

* Subscriber Name

* Subscriber Date of Birth

(For Jamaica/non-insurance systems, UI may hide this, but the data model must support these fields.)

#### **4.2.5 Allergies**

* Medication Allergies: list entries with:

  * Medication Name

  * Reaction Description

* Food Allergies: list entries with:

  * Food Item

  * Reaction Description

* Environmental Allergies: list entries with:

  * Allergen

  * Reaction Description

* “No Known Allergies” (boolean flag – when true, indicates no allergies recorded)

#### **4.2.6 Current Medications**

Each medication entry must store:

* Name

* Dose (e.g., “10 mg”)

* How Often Taken (frequency)

* Reason for Medication

* Prescribing Clinician (if known)

#### **4.2.7 Past Medical History**

* Structured flags or entries for:

  * Diabetes

  * High blood pressure (Hypertension)

  * Asthma

  * Heart disease

  * Epilepsy

  * Kidney disease

* Free-text field for additional conditions / details.

#### **4.2.8 Past Surgical History**

For each surgery:

* Type of Surgery

* Year

* Complications (if any; free text)

#### **4.2.9 Social History**

* Tobacco Use: (never / former / current)

* Alcohol Use: (none / occasional / weekly / daily)

* Drug Use: (none / type / frequency – free text \+ structured options)

* Living Situation: (alone / with family / with caregiver / other text)

* Access to Transportation (yes/no/free text)

* Access to Clean Water and Electricity (yes/no/free text)

* Occupational Hazards (free-text description; optional list of hazards)

#### **4.2.10 Family Medical History**

* Heart Disease (free text / yes-no \+ details)

* Diabetes

* Cancer (type – free text)

* Stroke

* Genetic Conditions

* Free-text field for additional family history information.

#### **4.2.11 Immunization History**           **Integrates with MOH reporting system if available and follows rules of reporting**

* Flu shot (date)

* Pneumonia vaccine (date)

* Tetanus (date)

* List of all vaccinations available on government immunization schedule website (ex: CDC)

#### **4.2.12 Consent & Communication Preferences**

* Consent to Telehealth (Yes/No)

* Consent to Electronic Messaging (Yes/No)

* Preferred Communication Method (phone / SMS / WhatsApp / email)

  Consent for Data Sharing Within ICF Mission Framework (Yes/No)

---

### **4.3 Visit Note (Document 2\)**

Each **Visit Note** is linked to a specific patient and a specific clinician.

#### **4.3.1 Visit Metadata**

* Visit ID (system-generated)

* Patient ID (FK to Patient Profile)

* Visit Date

* Visit Start Time

* Visit End Time (optional for MVP – can be derived)

* Visit Type (enum):

  * Telehealth (video)

  * Telehealth (audio only)

  * In-person

  * Home visit

* Clinician Name & Credentials (or Clinician ID referencing user account)

* Location (clinic, home, community site, etc.)

* Interpreter Used? (Yes/No)

#### **4.3.2 Chief Complaint**

* Chief Complaint (single sentence free text)

#### **4.3.3 History of Present Illness (HPI)**

* HPI Narrative (free text – main descriptive field)

* Additional structured fields (optional but supported):

  * Symptom Onset (when symptoms started)

  * Symptom Location

  * Severity (mild / moderate / severe)

  * Symptom Course (improving / worsening / unchanged)

  * Factors that improve or worsen symptoms

  * Associated symptoms (free text or list)

  * Impact on daily activities (free text)

#### **4.3.4 Review of Systems (ROS)**

For each body system, store:

* System Name

* Symptom(s) Present? (Yes/No)

* If Yes, a list / free text.

Core systems (minimum):

* General: fever, chills, weight loss

* Respiratory: cough, shortness of breath

* Cardiac: chest pain, palpitations

* GI: nausea, vomiting, diarrhea

* Neurologic: headache, dizziness

* Psychiatric: anxiety, depression

MVP may treat ROS as a structured checklist with multi-select and notes.

#### **4.3.5 Vitals**

If collected (in-person or patient-reported), store:

* Blood Pressure

* Heart Rate

* Respiratory Rate

* Temperature

* Oxygen Saturation

* Weight

* Height

All vitals are optional per visit but must be supported.

#### **4.3.6 Physical Exam**

For MVP, store:

* General Appearance (free text; with “normal/abnormal” quick toggle)

* Eyes (free text \+ normal/abnormal)

* Respiratory (free text \+ normal/abnormal)

* Skin (free text \+ normal/abnormal)

* Neurologic (free text \+ normal/abnormal)

* Additional Exams (free text fields; optional sections for heart, abdomen, etc.)

Clinician must be able to specify normal vs abnormal for each section and add details.

#### **4.3.7 Assessment (Diagnosis / Problem List)**

For each diagnosis:

* Diagnosis Name (free text, eventually mappable to a code)

* Optional: ICD-10 or local code (free text for MVP)

There can be multiple diagnoses per visit.

#### **4.3.8 Plan**

For each diagnosis or overall visit:

* Medications Prescribed:

  * Name

  * Dose

  * Frequency

  * Duration

* Tests Ordered:

  * Type (labs, imaging, etc.)

  * Name / description

* Referrals:

  * Specialty / destination

  * Reason / notes

* Home Care Instructions (free text)

* Follow-up Timeframe (e.g., “2 weeks”, date, or free text)

#### **4.3.9 Orders (Structured)**

Orders should be stored as structured objects, linked to the visit:

* Order ID

* Visit ID

* Order Type:

  * Medication Order

  * Laboratory Order

  * Imaging Order

  * Procedure

  * Vaccination

* Order Details (name, dose, parameters as needed)

* Status (pending / completed / canceled)

* Result Attachments:

  * File references (PDF, image, etc.)

  * Structured results (where applicable; free-text for MVP)

#### **4.3.10 Clinician Signature & Finalization**

* Clinician ID

* Electronic Signature Timestamp

* Visit Note Status:

  * Draft / Pending Review / Finalized

* Once status is “Finalized”, editing is restricted (e.g., only allow Addendum field).

---

### **4.4 Audio, Transcription, and Automation**

#### **4.4.1 Audio Capture & Upload**

* FR-5: Clinician must be able to **record audio** within the app for a visit.

* FR-6: Clinician must be able to **upload an audio file** for the visit (supported formats defined later).

* FR-7: Audio files are stored securely and tied to:

  * Patient ID

  * Visit ID

#### **4.4.2 Transcription**

* FR-8: Clinician can trigger a **“Transcribe”** action for the recorded/uploaded audio.

* FR-9: The system must:

  * Store the full raw transcript.

  * Associate the transcript with the Visit.

#### **4.4.3 Automated Draft Note Creation**

* FR-10: After transcription, the system generates a **Draft Visit Note** by:

  * Filling Chief Complaint (if identifiable).

  * Filling HPI narrative.

  * Extracting key ROS items if possible.

  * Suggesting Assessments (diagnoses) when clearly mentioned.

  * Suggesting Plan items (meds, tests, referrals) when mentioned.

* FR-11: The system flags uncertain or low-confidence fields for clinician attention (e.g., highlight or label “Review needed”).

* FR-12: Clinician must be able to override or delete any auto-filled data.

---

### **4.5 Dashboards & Navigation**

* FR-13: Provide a **Clinician Dashboard** showing:

  * Recent patients.

  * Draft visit notes (Pending Review).

  * Recently finalized visits.

* FR-14: Provide search/filter:

  * By patient name.

  * By date range.

  * By note status (draft vs finalized).

---

### **4.6 Audit Trail**

* FR-15: For each Visit Note, track:

  * Created by, created at.

  * Last edited by, edited at.

  * Finalized by, finalized at.

* FR-16: For each Patient Profile, track:

  * Created by, created at.

  * Last updated by, updated at.

---

## **5\. Non-Functional Requirements**

### **5.1 Security & Privacy**

* NFR-1: All data in transit must be encrypted (e.g., via HTTPS/TLS).

* NFR-2: All sensitive patient data must be stored encrypted at rest.

* NFR-3: Implement role-based access control (RBAC) at minimum:

  * Clinicians can access only patient records they are authorized to see (MVP assumption: single clinic, all clinicians share access, but architecture should allow future restriction).

* NFR-4: Audio and transcripts are treated as protected health information (PHI) and safeguarded accordingly.

* NFR-5: System must comply with applicable health data protection laws in operating regions (e.g., HIPAA-like standards, local Data Protection Acts).

### **5.2 Reliability & Performance**

* NFR-6: The system should handle concurrent use by multiple clinicians.

* NFR-7: Transcription completion time should be reasonable for a typical visit audio (e.g., not instantaneous, but the UX must clearly show progress/loading).

* NFR-8: Automatic data saving / draft saving must prevent data loss if the browser closes or the network drops mid-edit.

### **5.3 Scalability & Extensibility**

* NFR-9: System must be architected so it can later:

  * Support multiple clinics or organizations.

  * Integrate with external e-prescribing or lab systems.

* NFR-10: Data model must be extensible (e.g., adding new fields or sections without breaking existing records).

### **5.4 Logging & Monitoring**

* NFR-11: System must log:

  * Authentication events.

  * Key actions (create/update/finalize notes, profile edits).

* NFR-12: Provide basic monitoring for uptime and errors (even if simple logs in MVP).

---

## **6\. Data Model Relationship Summary**

* **Patient Profile (Document 1\)**

  * “Master” record created once and updated occasionally.

  * Contains identity, demographics, allergies, medical histories, consents, etc.

* **Visit Note (Document 2\)**

  * Created per encounter.

  * Linked to Patient Profile by Patient ID.

  * Contains visit metadata, HPI, ROS, exam, assessment, plan, orders, and clinician signature.

* **Audio & Transcript**

  * Each audio file links to exactly one Visit.

  * Each transcript links to exactly one Visit.

  * The transcript is the source text used to populate the Draft Visit Note.

  **APPENDED:** 

  # **Clinical Note Recording & Handoff Workflow – Scope**

  ## **1\. Roles Involved**

* **Nurse / Intake Staff**

* **Provider (MD, DO, NP, PA)**

* **(Optional) Support Staff / Additional Clinical Roles**

Each user logs in with their **own unique credentials**.

---

## **2\. Workflow Overview**

A single patient visit generates **one continuous note** that multiple authorized users can contribute to sequentially. The note must remain open until the provider completes and closes it.

---

## **3\. Detailed Workflow**

### **Step 1 — Nurse Initiates Visit Note**

1. Nurse logs into the application with their credentials.

2. Nurse selects the patient and opens a **New Visit Note** for that date.

3. System creates a note session with:

   * Visit ID

   * Patient ID

   * Note status: **In Progress**

   * Active user: Nurse

4. Nurse begins audio recording (if applicable).

5. Nurse completes:

   * Vitals

   * Patient demographics (if needed)

   * Reason for visit / Chief complaint

   * Any required triage forms

   ### **Step 2 — Nurse Stops Recording but Note Stays Open**

1. Nurse stops the audio recording once intake is complete.

2. Note remains in **In Progress** state.

3. Nurse cannot close or finalize the note.

4. System logs:

   * Nurse as the initial contributor

   * Timestamp of intake completion

   ### **Step 3 — Provider Takes Over Note**

1. Provider logs into the application with their own credentials.

2. Provider navigates to:

   * “Open Visits”

   * Selects the patient’s visit in **In Progress** state.

3. Provider opens the existing note started by the nurse.

4. Provider may:

   * Resume audio recording

   * Add assessment details

   * Perform exam documentation

   * Add plan, diagnoses, follow-up instructions

   ### **Step 4 — Provider Completes & Closes Note**

1. Provider finishes all medical documentation.

2. Provider ends any additional recording segments.

3. Provider performs:

   * Final review

   * Sign-off

4. System changes note status to:

   * **Completed / Closed**

5. No further edits allowed unless:

   * Provider re-opens (if permissions allow)

   * Or addenda feature is enabled

   ---

   ## **4\. Multi-User Access Requirements**

* Only one user edits the note at a time (lock mechanism recommended).

* Each user must authenticate with their personal login.

* Audit trails must show:

  * Who added what content

  * Recording start/stop times

  * All handoff events

  ---

  ## **5\. Recording Logic Requirements**

* Recording segments can start/stop multiple times.

* Recording must attach to the same visit note.

* System must prevent recording from auto-stopping when user switches roles.

* Avoid current behavior where the physical device is passed between staff.

  ---

  ## **6\. Technical Requirements**

  ### **Note State Machine**

* **Draft → In Progress → Provider Review → Completed**

* Only provider role can advance to **Completed**.

  ### **Permissions**

* Nurse:

  * Create new note

  * Add intake data

  * Start/stop recording

  * Cannot close note

* Provider:

  * Access any “In Progress” note

  * Continue recording

  * Edit all sections

  * Close note

  ---

  ## **7\. Handoff & Continuity Requirements**

* Handoff must be **digital**, not via passing the device.

* The system must maintain the continuous chain of:

  * Note context

  * Recording segments

  * Clinical documentation


# Tech Stack

**Frontend:**  
 Next.js (TypeScript, App Router) for the main interface; Tailwind CSS for styling; modular React components for patients, visits, notes, and recording; SWR or React Query for client-side caching.

**Backend/API:**  
 Next.js API Routes for all server logic (auth, patients, visits, notes, uploads); Node.js (TypeScript) runtime; BetterAuth for clinician authentication; Zod for request validation.

**Database:**  
 Supabase-managed Postgres with built-in Auth, Row-Level Security, and policies; Supabase client SDK replaces Prisma for all queries and mutations.

**Storage:**  
 Supabase Storage or S3-compatible storage for audio files; presigned URLs for secure audio upload and download.

**Workers/Processing:**  
 Node.js worker for transcription and note generation; Redis or Railway Queue for background jobs; HONO for lightweight routing; Whisper (Replicate or OpenAI) for transcription; LLM pipeline for structured note generation.

**Deployment/DevOps:**  
 Railway for deployment (web app, worker, queue); environment variables stored as Railway secrets; optional Docker for local development; optional Sentry for monitoring and error collection.

**Security:**  
 TLS for encrypted communication; encrypted storage for PHI; Supabase RLS policies for clinician-scoped access; RBAC-ready auth; audit logging for patient and note changes.

# User Stories

**Persona-Based User Stories**

**![][image1]**  
**![][image2]**

| Persona | User Role | User Story | Priority (for the current project) | Notes / Source |
| :---- | :---- | :---- | :---- | :---- |
| Medic / Nurse | Medic | As a medic, I want to retrieve a patient using a passport or QR code, so that I can start care quickly. | Low | Workflow A: C5 Ingestion |
| Medic / Nurse | Nurse | As a nurse, I want to document vitals offline, so that care continues without connectivity. | High | Offline Mode |
| Physician | Physician | As a physician, I want to see a patient's snapshot immediately, so that I understand the patient's state quickly. | High | Patient Snapshot UI |
| Patient | Patient | As a patient, I want to request telehealth from an app, so that I don’t need to travel. | Medium | Workflow H |
| Admin | Admin | As an admin, I want immutable audit logs, so that compliance is maintained. | High | Security & Compliance |

# Prototype MVP

**Low Fidelity Mockup**

**UI/UX Document Breakdown: [Telehealth \- Medical Record System](https://docs.google.com/document/u/0/d/1PAa0b8J5cFL0IH2CgjJMipm1aw1z7QstgaSP-HCsTZs/edit)**

A low-fidelity mockup is a **simple, early-stage design** that focuses on **structure, layout, and functionality** rather than fancy colors, icons or final visuals. It’s meant to show **what goes where** and how the user will move through the interface, without worrying about the pretty details yet. The mockups included in this document represent **key views** of the system: **mobile/phone version**.  
![][image3]![][image4]  
**Please note:** The icons, typography and visual styles vary across these design options,  this is intentional. It gives you a broader sense of direction and helps you decide what fits the brand personality, user needs and overall experience best.

Each variation explores a slightly different aesthetic,  whether it’s a cleaner medical look, a more modern tech-forward feel or something more friendly and human-centered.

# Digital Records MVP

# **Digital Medical Records MVP**

## **Executive and Developer Overview**

## **1\. Purpose**

This MVP creates a simple digital tool for doctors to record visits, generate structured medical notes from conversation, and store them under a patient profile.  
 Only doctors will use the system.

---

## **2\. MVP scope**

**Doctor actions**

1. Sign in using email only

2. Create a patient

3. Select patient

4. Start a visit

5. Record the conversation

6. System creates transcript and structured medical note

7. Doctor reviews and saves the visit

**Outputs**

* Audio

* Transcript

* Structured extraction of key medical information

* Saved under that patient profile by date

---

## **3\. User journey**

### **3.1 Sign in**

* Doctor enters only their email

* If email exists in the system, they are signed in

* No password for MVP

* Doctor lands on a simple dashboard with:

  * Recent patients (this will be empty at first)

  * Button to create new patient

Doctors cannot create a visit unless they select or create a patient.

---

## **4\. Patient management**

### **4.1 Creating a patient**

Doctor enters:

* Full name

* Sex (simple toggle M or F)

* Contact number

This creates the patient profile.

### **4.2 Patient profile layout**

Shows:

* Name

* Sex

* Contact

* List of visits by date

---

## **5\. Visit flow**

### **5.1 Start a visit**

From a patient profile, doctor taps “Start visit”.  
 System automatically creates a visit record with:

* Visit ID generated from date and time

* Patient name

* Doctor name

* Date

* Empty fields waiting for audio, transcript, and extracted data

Doctor is taken to the recording interface.

### **5.2 Recording**

Doctor taps “Record”.  
 A normal conversation takes place.  
 The doctor collects:

* Past medical history

* Current symptoms

* Physical exam findings (if spoken aloud)

* Diagnosis or working diagnosis

* Treatment plan

* Prescription if relevant

Doctor taps “Stop” when finished.

### **5.3 Processing**

After stopping the recording:

1. Audio is uploaded

2. Speech to text model creates full transcript

3. LLM processes the transcript and extracts:

   * Past medical history

   * Current symptoms

   * Physical exam findings

   * Diagnosis or working diagnosis

   * Treatment plan

   * Prescriptions

4. System generates:

   * Full transcript

   * Structured JSON

   * Short readable summary for review

---

## **6\. Review and save**

The visit screen updates to show:

* Summary

* Structured fields

* Transcript

* Option to replay audio (if desired later)

Doctor can:

* Edit any extracted field

* Edit diagnosis or treatment

* Add notes

* Approve and save the visit

Saved visit appears under the patient profile with:

* Date

* Summary preview

* Full record inside

---

## **7\. Data model**

### **Doctor**

* Name

* Email

* Contact number

### **Patient**

* Full name

* Sex (M or F)

* Contact number

* List of visits

### **Visit**

* Visit ID from date and time

* Patient name

* Doctor name

* Date and time

* Audio file

* Transcript

* Structured data (JSON)

* Summary text

# Syncs

## **Meeting Syncs**

This section serves as the centralized record for all recurring and ad-hoc syncs across the project. Each entry should include the meeting date, key discussion points, decisions made, assigned owners, and next steps.

Maintaining this log ensures that the entire team remains aligned, accountable, and fully informed on progress, priorities, and emerging issues.

### **How to Use This Page**

* After every sync, add a short summary of the discussion.

* Record the **date**, **attendees**, and **main outcomes**.

* Capture any **action items**, their **owners**, and expected **completion timelines**.

* Update notes promptly so future meetings can build on past decisions without context loss.

This page is intended to keep all team members synced, reduce communication gaps, and preserve institutional memory as the project moves quickly.

# Team Sync \- 9/12/25

**Meeting Summary – ICF Telehealth Build Out**

The team aligned on building a **secure, web-based telehealth and medical records application** to support health missions in Jamaica, starting in Christiana.

**Purpose & Vision**

* Provide **virtual access to doctors** for patients in remote and storm-affected areas.  
* Replace or augment paper charts with a **secure electronic medical record (EMR)**.  
* Make the system an **“AI assistant” for doctors**, so they can focus on patients.

**Core MVP Scope (for Friday mission)**

* **Doctor login** via a web app (phones first; tablets later).  
* Ability to **add patients** and create a basic **patient record**.  
* **Record doctor–patient conversations** (audio) during visits.  
* Use **AI transcription \+ LLM** to:  
  * Turn recordings into text.  
  * Auto-fill a structured **patient form** (history, meds, problems, etc.).  
* Very simple but **secure storage** of medical records, compliant with Jamaican regulations.

**Telehealth & Workflow Considerations**

* Long-term: secure **video consultations** integrated with the record system.  
* Doctors should **look at the patient, not the tablet**; system does the documentation.  
* Future capabilities:  
  * Review prior visits, labs, meds before/during a consultation.  
  * AI suggestions for diagnoses, labs, meds, and safety checks (e.g., allergies).

**Regulatory & Strategic Points**

* Must comply with **Jamaican data protection and Ministry of Health rules**.  
* Likely model: **international doctors consult; Jamaican doctors prescribe**.  
* Need to ensure economic flows (pharmacies, services) stay within Jamaica.  
* Connectivity constraints: some areas lack internet but have **cell service**; telecom partnerships may be needed.

**Immediate Next Steps**

* **Dennis**: Create WhatsApp group for coordination.  
* **Ilya**: Share full list of required **patient data fields**.  
* **Shevanise givans**: Design initial **UI mockups** and send to Ilya for review.  
* **Team**: Meet **tomorrow at 2pm** to review UI and refine workflow.  
* **Ilya**: Available after **1pm tomorrow**; arriving **Thursday** in Jamaica.  
* **Daniel**: Speak with a **strategic partner** about positioning with the Ministry of Health.  
* 

# Team Sync \- 10/12/25

	**ICF Telehealth Application Demo**

* **Shevanisegivans44 presented current UI mockup for telehealth platform**  
* **Home screen displays doctor dashboard with patient visit totals and main information**  
* **AI-powered patient intake system records voice input and auto-populates fields**  
  * **Real-time editing capability while AI processes information**  
  * **Search functionality to retrieve past patient records**  
  * **Shows allergies, complaints, and visit details**

### **Patient Record Management & Status Tracking**

* **Need to implement record status system: “In Review” → “Record Complete”**  
* **Human verification required due to expected AI transcription errors**  
  * **Accent, tonality, device quality, background noise will cause issues**  
* **Patient email verification suggested for address/contact accuracy**  
* **Medical record numbers assigned automatically (00001, 00002, etc.)**

### **Visit Notes Structure & Requirements**

* **Current visit interface allows AI dictation or manual typing**  
* **Document upload capability for patient-provided medication lists**  
* **Ed’s requirements for visit note review:**  
  * **Accuracy verification of AI-generated content**  
  * **Historical context \- what happened in previous visits**  
  * **Changes made by other doctors since last visit**  
  * **Assessment and plan from other providers**  
* **Need integrated medication management**  
  * **Chart updates when medications stopped/started during visit**  
  * **Real-time reflection of current vs. historical medications**

### **UI Design Feedback from Medical Record Systems**

* **Ed demonstrated current system limitations via screen share**  
* **Preferred improvements:**  
  * **Combine vitals (BMI, height, weight) into single organized section**  
  * **Integrated lab work with trend visualization and graphing**  
  * **Collapsible sidebar navigation for optional information**  
  * **Tabbed interface for different data categories**  
* **Athena EMR system referenced as better design example**  
  * **Team to potentially schedule demo call with Athena**

### **Next Steps**

* **Continue functionality development for Friday demo**  
* **Tomorrow meeting rescheduled \- Ed arriving in Kingston at 2pm**  
* **Team sync once Ed settles at AC hotel location**  
* **Consider Athena demo scheduling for future design inspiration**

# Goals

# ICF TELEHEALTH \+ EMR PLATFORM

# **ICF TELEHEALTH \+ EMR PLATFORM**

SYSTEM REQUIREMENTS DOCUMENT (Working Draft v1.0)

This document defines the functional, architectural, and clinical requirements for the Intellibus Care Foundation (ICF) Telehealth & EMR Platform.

The platform is designed as a **mobile-first clinical operating system** that unifies:

* Mobile acute care (“Treat & Release”)

* Nurse/medic field visits

* Telehealth physician oversight

* C5 traveler ingestion

* Inventory tracking for mobile units

* AI-driven documentation, coding, and analytics

* Public Health surveillance for Jamaica

* Offline-first reliability for low-connectivity environments

The system is not a traditional EMR. It is optimized for **rapid, distributed care delivery**, **AI-enabled documentation**, and **value reporting** (shadow billing) to quantify **hospital diversion impact** for partners such as the Government of Jamaica (GOJ) and Allianz.

---

# **1\. CORE CONCEPT MODEL (SYSTEM OVERVIEW)**

The platform connects 4 primary ecosystems:

### **1\. Inbound Travelers (C5 Integration)**

* Travelers complete “Enter Jamaica” form.

* System receives: Passport, Name, DOB, Traveler category, Payment metadata.

* A **Shadow Patient Profile** is pre-created before any care encounters.

### **2\. Mobile Medical Units**

* Field medics/nurses in SUVs, ambulances, or pop-up stations.

* Provide acute interventions: IV fluids, medications, wound care.

* Operate with onboard Starlink.

* Must function fully offline.

### **3\. Virtual Physicians**

* Provide oversight for Treat & Release.

* Approve field interventions.

* Document and sign visits.

* Must be able to review charts in real time.

### **4\. Public Health Command**

* Syndromic surveillance.

* Heat maps and disease clustering.

* De-identified analytics for Ministry of Health.

### **Mission-Critical Constraint**

**Platform must operate reliably in low-bandwidth environments with robust, append-only offline synchronization.**

**Product Vision: The "Clinical Flow" EMR**

**To:** Development Team (Dennis, Shevanise, Daniel) **From:** Ilya Rabkin **Date:** Dec 11, 2025 **Subject:** Refined UI/UX Requirements for Medical Record System

### **Core Philosophy: "State" over "Storage"**

We are not just building a database to store files. We are building a **Clinical Decision Tool**. When I open a chart, I need to immediately understand the **current state** of the patient without clicking five times. The design must support efficiency, flexibility, and trend analysis.

---

### **1\. The "Patient Snapshot" (The Dashboard)**

When I click on a patient (e.g., John Smith), the landing page must be a high-yield "Snapshot" that aggregates the most critical live data.

* **The "Must-Have" Widgets (visible immediately):**  
  * **Basic Demographics:** Name, Age, DOB.  
  * **Active Problem List:** The chronic conditions (e.g., "Diabetes," "Hypertension").  
  * **Current Medications:** The *live*, up-to-date list of what they are taking.  
  * **Recent/Pending Labs:** A quick view of results that just came in or are missing.  
  * **Action Items/To-Dos:** Reminders for me (e.g., "Needs flu shot," "Review MRI").  
  * **Last Visit Summary:** A concise text block showing the Assessment & Plan from the previous encounter.  
* **Deep Dive Navigation:**  
  * If I need to see more, I can use **Side Tabs** to dive deeper into specific histories (Social History, Family History, Full Lab Archive).

### **2\. The "Smart" Note & Medication Logic**

The Note and the Chart must be synchronized. I should not have to update the chart in two places.

* **Live Connection:** As I order a new medication or document "Stop Metformin" within my note, the system should automatically update the **Current Medications** list on the Snapshot.  
  * *Goal:* Seamless integration. No pop-ups if possible—just immediate execution of the order into the permanent record.  
* **Note Flexibility (Macros & Dot Phrases):**  
  * I need the ability to create "shortcuts." For example, if I type `.dia`, it should auto-expand into my standard diabetes exam template.  
  * Future State: Pre-built templates for specific visit types (Acute, Chronic, Wellness, Peds).  
* **"Copy Forward" Workflow:**  
  * For chronic care patients (who I see every 3 months for the same thing), I need a **"Clone Last Note"** button.  
  * *The AI Twist:* I clone the old note, and then I use the AI voice dictation to *edit* the deltas (changes) rather than starting from scratch.

### **3\. Review Mode & Navigation**

I need to be able to review the past while documenting the present.

* **Collapsible Sidebar:**  
  * When I am typing/dictating a note, I need a **Right-Side Sidebar** that displays the patient's history (Past Notes, Labs, Meds).  
  * This sidebar must be **collapsible**—I can pull it out to check a lab value from 6 months ago, then collapse it to reclaim screen space for my note.  
* **Historical Timeline:**  
  * I need an easy way to navigate to *any* past note.  
  * **Crucial:** This list must include **external/uploaded notes** (e.g., a PDF from a specialist referral). If a cardiologist sends me a letter, it should live in this timeline alongside my own notes.

### **4\. Data Visualization (Trends)**

* **Vitals Graphing:**  
  * Instead of a text list of blood pressure readings, display a simple **Line Graph**.  
  * Visualizing the trend (is it going up or down?) is clinically more valuable than the raw numbers.

# SYSTEM ENTITIES (DATA OBJECTS)

# **SYSTEM ENTITIES (DATA OBJECTS)**

## **2.1 Users**

Attributes:

* Name

* Role (Medic, Nurse, Physician, Paramedic, Admin, Inventory Manager, Lab, Pharmacy, Public Health)

* Device ID

* Credentials & permissions

* Audit trail

RBAC (Role-Based Access Control) enforced at every action.

---

## **2.2 Patient — “Shadow Profile”**

Pre-created from C5 traveler ingestion.

Primary Key: **Passport\_Number**

Attributes:

* Passport\_Number

* Name, DOB, Nationality

* Insurance\_Policy\_ID (if applicable)

* Arrival Date

* Travel information from C5

* Medical History (added by Medic)

* Allergies

* Problem List (AI-suggested \+ clinician-confirmed)

Profiles are populated in real time when traveler seeks care.

---

## **2.3 Visit (Encounter Object)**

Attributes:

* Visit\_Type (Telehealth, Mobile Acute Care, Triage, Nurse Visit, Doctor Visit)

* Location\_GPS

* Timestamp Start/End

* Assigned Personnel

* CPT\_Code\_List (Shadow billing—analytics only)

* ICD\_10\_List (Diagnosis list; based on Jamaica reporting requirements)

* Inventory\_Used

* Value\_Estimated (care value to quantify “hospital diversion”)

* AI-generated metadata (symptom clusters, acuity score)

---

## **2.4 Note (Clinical Documentation)**

Format: **SOAP**

* Subjective

* Objective (Vitals, Exam, Point-of-Care tests)

* Assessment

* Plan

Technical Requirements:

* Autosave

* Section-based soft locks

* Version history (Append-Only model)

* Co-signature logic (Medic → Physician approval)

* AI-generated draft note (requires human sign-off)

Signed notes are read-only unless addendum added.

---

## **2.5 Orders**

Types:

* Medication (Field-administered or prescribed)

* IV fluids

* Labs (future integration)

* Imaging referrals

* Follow-up referrals

Orders become part of the visit record with timestamps.

---

## **2.6 Telehealth Call Object**

Includes:

* Video connection metadata

* Recording link

* Transcript (AI-generated)

* Participants

* Call duration

* Call reason

---

## **2.7 Inventory Entities (Mobile Inventory System)**

Inventory objects must track:

* Item ID

* Lot Number (optional)

* Bag/Vehicle Location

* Par Levels

* Expiration dates

* Real-time usage (auto-decrement)

* Restock cycle (“Bag Check” workflow)

---

## **2.8 Documents**

* Lab results

* Specialist notes

* Uploaded photos

* Audio notes

* AI-processed structured data

All documents must be stored with provenance metadata.

# SYSTEM RULES (GLOBAL LOGIC)

# **SYSTEM RULES (GLOBAL LOGIC)**

## **3.1 Note Lifecycle**

* **Draft:** Editable

* **Signed:** Locked

* **Addendum:** Appended only, never overwrites

Medic Notes requiring Treat & Release must be **co-signed** by a Physician.

---

## **3.2 Audit Logging**

Immutable logging of:

* All user actions

* Login/logout

* Data access

* Edits/Append events

* Inventory usage

* Telehealth events

* AI suggestions and human decisions

---

## **3.3 Permissions**

* Medic: Intake, vitals, initial documentation, field treatments

* Physician: Full edit, reorder, finalize, sign

* Admin: User/device management (no clinical edits)

* Pharmacy: Dispense-level access only

* Lab: Results-level access only

* Public Health: De-identified aggregated views only

# CLINICAL WORKFLOWS

**CLINICAL WORKFLOWS**

### **4.1 Workflow A — C5 Traveler Ingestion**

1. Traveler completes **C5 Enter Jamaica**.

2. System receives authorized traveler data (passport, name, DOB, policy/payment metadata where applicable).

3. System generates **Shadow Patient Profile**.

4. Medic or nurse retrieves profile by passport number or QR code.

5. Medic/nurse confirms identity and updates history/allergies as needed.

---

### **4.2 Workflow B — Mobile Acute Care (“Treat & Release”)**

1. **Arrival at location**

   * Medic/nurse arrives at hotel/villa; GPS location captured.

2. **Intake**

   * Vitals, HPI, allergies, key PMH documented.

   * Visit type set to “Mobile Acute Care.”

3. **Telehealth Connection**

   * Medic initiates telehealth with physician.

   * Physician reviews chart \+ patient condition in real time.

4. **Intervention**

   * On-site treatments (IV fluids, analgesics, antibiotics, nebulizers, wound care, etc.) per protocol.

   * Orders entered in system; medications administered and documented.

5. **Inventory Logging**

   * Administered items selected in the chart.

   * System decrements vehicle/bag stock automatically.

6. **AI-Assisted Coding**

   * AI suggests E\&M level, CPT procedures, ICD-10 diagnoses.

   * Physician confirms/edits.

7. **Disposition**

   * Primary path: Treat & Release at scene.

   * Escalation path: Activate EMS/hospital referral if necessary.

8. **Hospital Diversion Calculation**

   * System computes Value\_Estimated for analytics and cost-avoidance reporting.

---

### **4.3 Workflow C — Telehealth-Only Encounter**

1. Patient or hotel contacts call center / app.

2. Telehealth visit is either:

   * **On-demand:** placed into virtual waiting room/queue, or

   * **Scheduled:** booked into specific time slot.

3. Physician joins visit, reviews chart.

4. AI transcribes interaction and drafts SOAP note.

5. Physician finalizes documentation, orders, and coding.

6. If meds are needed:

   * E-prescription sent to pharmacy, or

   * Mobile unit dispatched with stock if appropriate.

---

### **4.4 Workflow D — Nurse/Medic Visit Without Telehealth**

Used for low-acuity, protocol-driven issues.

1. Nurse/medic opens visit and documents vitals, HPI, exam.

2. If case qualifies under standing protocols (e.g., simple wound care, straightforward refills), nurse/medic treats per protocol.

3. Note is completed and either:

   * Signed by nurse/medic alone (if permitted), or

   * Routed to physician for retrospective review/co-sign based on policy.

---

### **4.5 Workflow E — Community Clinic / Health Fair (“Traditional Mission” Flow)**

This covers early-phase health fairs, chronic care clinics, and mission-style events where **patients come to the clinic site**.

1. **Registration / Intake**

   * Patient queue at registration desk.

   * Nurse/registrar:

     * Searches for existing patient or creates new profile.

     * Captures demographics, chief complaint, basic history.

2. **Triage**

   * Nurse records vitals and basic ROS.

   * Assigns triage category (low, moderate, high acuity).

   * Creates visit and starts note.

3. **Nurse-Only Resolution Path (Low Acuity)**

   * For minor concerns under protocol, nurse may complete counseling/education.

   * Nurse documents and signs note; no physician involvement required.

4. **Nurse → Physician Path (Moderate/High Acuity)**

   * Nurse marks visit as “Ready for Physician.”

   * Physician sees patient in person (if on site) or via telehealth.

   * Physician completes exam, assessment, plan, and signs.

5. **Post-Visit**

   * Orders (labs, meds, follow-up) are placed.

   * Patient receives discharge instructions and next steps.

This workflow should be usable in:

* Church/clinic-based chronic care days

* Event-based missions

* Fixed-site clinic days in Christiana and surrounding areas.

---

### **4.6 Workflow F — Physician-Only Traditional Visit**

Used when the physician is physically present and handles the entire encounter.

1. Physician opens or creates visit.

2. Physician documents HPI, ROS, vitals/exam, assessment, plan.

3. Orders entered and prescriptions placed.

4. Physician reviews AI suggestions (if enabled) and finalizes coding.

5. Physician signs note.

This is the default fallback when nursing support is limited.

---

### **4.7 Workflow G — Pharmacy Dispense (Walk-In Pick-Up or Courier Delivery)**

1. **Prescription Creation**

   * Physician completes visit and enters medication order(s).

   * Order is routed electronically to selected pharmacy.

2. **Pharmacy Intake**

   * Pharmacy system/portal receives prescription in queue.

   * Pharmacist or technician verifies:

     * Patient identity

     * Medication, dose, quantity, interactions (locally or via EMR view).

3. **Dispense Options**

   * **Walk-In Pick-Up:**

     * Patient arrives at pharmacy.

     * Pharmacist confirms identity and dispenses medication.

   * **Courier Delivery:**

     * Pharmacist prepares medication package.

     * Courier assignment created (internal or external).

     * Courier delivers to hotel/home; proof-of-delivery recorded.

4. **Documentation**

   * Pharmacy marks prescription as “Dispensed” with method (Pick-Up / Courier).

   * EMR updates medication history accordingly.

5. **Exception Handling**

   * If medication is out of stock, pharmacist may:

     * Mark as “Backordered” and notify provider, or

     * Suggest alternative for provider approval.

---

### **4.8 Workflow H — Patient-Initiated App/Web Visit**

Supports a more modern, patient-facing flow.

1. Patient logs into app or web portal.

2. Selects desired service:

   * On-demand telehealth,

   * Scheduled telehealth, or

   * Request for home/mobile visit.

3. **For Telehealth Requests:**

   * Patient completes pre-visit questionnaire (symptoms, duration, meds, allergies).

   * Appointment is:

     * Put into virtual waiting room (on-demand), or

     * Scheduled for a defined time slot.

4. **For Home Visit Requests:**

   * System collects location and preferred time window.

   * Dispatch assigns mobile unit; visit appears in medic’s schedule.

5. Visit then proceeds via:

   * Workflow C (Telehealth-Only), or

   * Workflow B (Mobile Acute Care), depending on triage and service type.

# TELEHEALTH MODULE

## **TELEHEALTH MODULE**

### **5.1 Core Telehealth Capabilities**

* WebRTC-based video.

* Audio-only fallback for low bandwidth.

* Multi-party calls (patient \+ medic/nurse \+ physician).

* Three-pane layout: **Video | Chart | Note**.

* Encrypted recording (optional, policy-driven).

* AI transcription pipeline to feed Note Writer.

---

### **5.2 Telehealth Queue & Waiting Room**

The system must support:

1. **On-Demand Visits (Virtual Waiting Room)**

   * Patient or medic initiates a telehealth request.

   * Case enters a virtual waiting room/queue with:

     * Patient identity

     * Reason for visit

     * Triage priority (e.g., acute vs routine).

   * Physicians see prioritized list and pull next case when ready.

2. **Scheduled Telehealth Appointments**

   * Patients or staff can book a time slot with a physician.

   * Appointment appears on both:

     * Patient’s view (if patient-facing app is enabled).

     * Physician’s telehealth schedule.

   * At appointment time:

     * Patient joins waiting room,

     * Physician launches visit from schedule/queue.

3. **Configuration Options**

   * Ability to toggle features by phase/site:

     * Early phase: staff-driven telehealth (medic initiates).

     * Later phase: patient self-scheduling and direct waiting room entry.

---

### **5.3 Integration with Clinical Workflows**

* Telehealth sessions must be launchable from:

  * Mobile unit workflow (Workflow B).

  * Health fair/clinic visits (Workflow E).

  * Patient-initiated app flow (Workflow H).

* Each telehealth session must attach to a specific **Visit** and drive:

  * AI transcription

  * Draft documentation

  * Coding suggestions

  * Orders and follow-up actions.

# PHARMACY & INVENTORY MODULE (“THE BAG SYSTEM”)

# **PHARMACY & INVENTORY MODULE (“THE BAG SYSTEM”)**

### **6.1 Inventory Locations**

* Vehicle-Level (Unit 1, Unit 2…)

* Bag-Level (Acute Bag, Trauma Bag, Med Bag)

Each bag has predefined **par levels**.

---

### **6.2 Usage Workflow**

1. Medic selects administered drug (e.g., Zofran 4mg).

2. System identifies medic's assigned vehicle.

3. Auto-decrement inventory count.

4. Alert if below threshold.

---

### **6.3 Restock Workflow**

1. Medic submits restock request OR

2. End-of-shift “Bag Check” catches missing items.

3. Depot scans items out to that vehicle/bag.

4. New stock levels sync to database.

# LAB MODULE

## **LAB MODULE** 

## The Lab Module must support **both early “paper-style” workflows** and **later fully integrated digital ordering and result reporting**, including **phlebotomist workflows**.

---

### **7.1 Lab Order Object**

Each lab order must include:

* Patient ID / Shadow Profile link

* Ordering provider

* Order date/time

* Tests ordered (mapped to internal lab test dictionary)

* Priority (Routine / Urgent / STAT)

* Specimen type (blood, urine, etc.)

* Status:

  * Ordered

  * Collected

  * In Transit

  * Received at Lab

  * Processing

  * Resulted

  * Verified

  * Acknowledged by Provider

---

### **7.2 Early Phase Workflow — “Paper \+ Digital Hybrid”**

1. **Order Creation**

   * Provider selects lab tests in EMR and creates a Lab Order.

   * System generates a **printable/PDF requisition** with patient info, tests, and barcode/QR (if available).

2. **Patient Path 1: Patient Goes to Lab**

   * Patient takes paper/PDF to partner lab.

   * Lab staff confirm identity and manually register tests in their system.

   * When results are ready, lab:

     * Uploads PDF or sends via secure email, or

     * Enters results via a portal into the EMR (Phase 1.5).

3. **Patient Path 2: Mobile/Field Phlebotomist**

   * Phlebotomist visits patient location with mobile device.

   * Scans lab order barcode or searches patient/order ID.

   * Confirms tests, draws specimens, labels with unique accession ID(s).

   * Marks the order as “Collected” and, when appropriate, “In Transit.”

4. **Result Entry**

   * Lab uploads result PDF or inputs structured data.

   * AI Document Intelligence can:

     * OCR and extract values, reference ranges, flags.

     * Propose structured mapping for provider verification.

---

### **7.3 Future Phase — Direct Lab Integration**

When labs are integrated digitally:

1. Lab orders are transmitted electronically (API) to lab systems.

2. Lab system:

   * Receives order, assigns accession ID.

   * Updates status fields (Received, Processing, Resulted) via API callbacks.

3. Results are returned:

   * As structured data, mapped to internal lab test dictionary.

   * With reference ranges and abnormal/critical flags.

4. EMR must:

   * Attach results to the correct Visit and Lab Order.

   * Generate provider alerts for critical values.

   * Show longitudinal lab trends on the Patient timeline.

---

### **7.4 Phlebotomist Workflow (Explicit)**

1. Phlebotomist logs in (role-based view).

2. Sees a **“Lab Draw Queue”** of pending orders assigned to:

   * Their region

   * Their mobile unit, or

   * Specific visit types.

3. For each draw:

   * Opens the order, confirms patient identity (name \+ passport or other ID).

   * Confirms tests to be drawn.

   * Prints/uses digital labels/barcodes for tubes.

   * Marks status as “Collected.”

   * If transporting to central lab, marks “In Transit.”

4. If phlebotomist performs bedside tests or POCT:

   * Results may be entered immediately and marked “Resulted \+ Verified” depending on workflow.

5. The system must ensure:

   * Every collected specimen is traceable from order → collection → lab → result.

   * Minimization of lost/mismatched results via:

     * Unique accession IDs

     * Status tracking

     * Visual status dashboard.

# ADMINISTRATIVE VIEWS

# **ADMINISTRATIVE VIEWS**

### **8.1 Fleet Dashboard**

* Real-time GPS of all active Mobile Units

* Starlink uptime

* Telehealth load

* Vehicle inventory status

### **8.2 User & Device Management**

* Create/assign roles

* Device authorization

* Remote logout/wipe

### **8.3 System Health**

* Sync errors

* Offline users

* Storage utilization

* Error logs

# ANALYTICS & VALUE REPORTING

# **ANALYTICS & VALUE REPORTING**

## **9.1 Hospital Diversion (Cost Avoidance Dashboard)**

For each visit:

* Compute “shadow claim value” using CPT \+ ICD combinations

* Compare to typical Jamaican hospital admission costs

* Display estimated total **cost avoided**

This is used for:

* Allianz Insurance reporting

* GOJ health system planning

* Demonstrating ROI of Treat & Release

---

## **9.2 Public Health Syndromic Surveillance**

Features:

* Heatmap of presenting symptoms

* Clusters (GI, respiratory, injury)

* Time-series trend analysis

* Location-based incident detection

Privacy:

* Fully de-identified

* Aggregated, cell-suppressed (\<10 cases)

# AI MODULE

# **AI MODULE**

## **10.1 AI Component 1 — Note Writer**

* Real-time transcription from video/audio

* Drafts HPI, ROS, Exam, and Plan

* Highlights low-confidence sections

* Provider edits \+ signs

---

## **10.2 AI Component 2 — Coding Assistant**

* Analyzes documentation

* Suggests **CPT** and **ICD-10** codes

* Provider confirms

* Stored for analytics (NOT claims submission)

---

## **10.3 AI Component 3 — Document Intelligence**

* OCR for scanned labs, specialist notes

* Extracts:

  * Lab values

  * Diagnoses

  * Medication changes

  * Follow-up recommendations

* Provider approval required

---

## **10.4 AI Component 4 — Population Analytics**

* Disease prevalence tracking

* Detection of unusual spikes

* Chronic disease dashboard (future)

# OFFLINE MODE & SYNC ENGINE

# **OFFLINE MODE & SYNC ENGINE**

Most critical technical requirement.

### **11.1 Offline Capabilities**

* Full charting

* Inventory usage

* Access to recently loaded patient profiles

* Orders saved in queue

Telehealth disabled offline (fallback to recording \+ later upload).

---

### **11.2 Sync Engine Logic (Append-Only Model)**

#### **Notes:**

* Never overwrite data.

* Append new entries with timestamps.

* Merge conflicts flagged for human review.

#### **Demographics:**

* Manual merge only.

* No automatic overwrites.

#### **Inventory:**

* Offline usage queued.

* Sync reconciles differences.

* Negative stock levels flagged.

# SECURITY & COMPLIANCE

# **SECURITY & COMPLIANCE**

* AES-256 data at rest

* TLS 1.3 data in transit

* MFA or biometric login

* Region-specific data sovereignty requirements

* Immutable audit logs

* PHI access governed by RBAC

# FUTURE EXPANSION

## **FUTURE EXPANSION** 

## This section now highlights explicit **AI clinical assistant** and **AI patient-facing triage assistant** as strategic future capabilities.

---

### **14.1 Patient Portal & Ecosystem Expansion**

* Traveler-facing and local-patient-facing portal for:

  * Viewing visit summaries and receipts.

  * Downloading lab results (once approved).

  * Secure messaging with the clinical team.

* Integration with:

  * Ministry of Health registries.

  * Private insurance partners.

  * Wearables / remote monitoring devices.

---

### **14.2 AI Clinical Copilot (Provider-Facing “Super Assistant”)**

A medically robust, validated AI assistant for clinicians that:

* Reviews real-time visit data (HPI, vitals, history, labs).

* Suggests:

  * Differential diagnoses

  * Labs and imaging to consider

  * Evidence-based treatment options

  * Red-flag questions to ask

  * Medication choices and dose ranges (aligned with local formularies).

* Flags potential:

  * Drug–drug interactions

  * Contraindications

  * Missed guideline-based care (e.g., A1C overdue in diabetic patient).

* Works as an **overlay** in the clinician UI, with:

  * Clear suggestion lists

  * Links to source/justification (guidelines, references)

  * Always requiring human acceptance before changes are applied.

This AI must be:

* Highly constrained to approved medical knowledge sources.

* Evaluated and monitored for safety, bias, and performance.

* Explicitly documented as an assistive tool, with clinician retaining final responsibility.

---

### **14.3 AI Patient Triage & Self-Service Assistant (Patient-Facing Bot)**

A future virtual assistant that interacts directly with patients (via app, web, or messaging) to handle **basic, protocol-driven scenarios** and triage:

Capabilities:

1. **Symptom Intake & Triage**

   * Collects structured symptom data (e.g., dysuria, frequency, urgency for UTI-like symptoms).

   * Uses approved triage algorithms to decide whether:

     * This can be managed as low-acuity with deferred review.

     * The patient should be routed to same-day telehealth.

     * The situation is emergent and needs immediate ER/EMS referral.

2. **Basic Protocol-Driven Care Pre-Work**

   * For narrow, clearly defined issues (e.g., uncomplicated UTI in non-pregnant adult), the bot:

     * Gathers all necessary criteria (red flags, allergies, pregnancy status, etc.).

     * Pre-populates a recommendation and draft prescription for a human clinician to review and approve.

   * Clinician must:

     * Review conversation transcript.

     * Approve, modify, or decline suggested plan.

3. **Scheduling & Routing**

   * If not emergent but requires physician interaction:

     * Offers times for telehealth or clinic visit.

     * Or starts on-demand telehealth and places patient into waiting room.

4. **Emergency Detection**

   * Clearly defined triggers (e.g., chest pain, shortness of breath, unilateral weakness, confusion) escalate to:

     * “Stop chat and call emergency services” messaging, and/or

     * Direct routing to live nurse/dispatcher when available.

5. **Guardrails**

   * Restricted to pre-approved use cases and triage flows.

   * Always logged with full transcript.

   * Always supervised: no final diagnoses or prescriptions without human approval.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnAAAAFdCAYAAACDyVDWAABYpklEQVR4Xu29za40yXmdq+sQhSb7R4YhGZoIkAELMAwIMjwQ7IElnolkg4B0PKJtHMP0SGyeAamJu+kZAZEEz9TyDdA3IF9Ak2MB1gUIvAKeXp97fVq99htZtfcXtXdV7ecFHlTG/09GRK6Mqsr8lV85sI8++uif/fqv//ovAQAAAOD5kAZrXXbSPk/4d50RAAAAADw7f9M6bbQhIQAAAAC8IK3XvmQdGQAAAACug9Ztb6wjAQAAAMB10eLtbzoCAAAAAFwdf5cCrgMBAAAA4AqxePv/OgAAAAAArpMPP/zwv7H7BgAAAHBjIOAAAAAAbgwEHAAAAMCNgYADAAAAuDEQcAAAAAA3BgIOAAAA4MZAwAEAAADcGAg4AAAAgBsDAQcAAABwYyDgAAAAAG4MBBwAAADAjYGAAwAAALgxEHAAAAAANwYCDgAAAODGQMABAAAA3BgIOAAAAIAbAwEHAAAAcGMg4AAAAABujKsTcB9+8MEv3/vVXwUAOJuvfuUrD9YSAIB75moEnBbgXpQBAB5Lry0AAPfIVQi4XoABAN6FD772tQfrDADAPfHiAq4XXgCAHbz/3nsP1hsAgHvhRQVcL7gAAFvht3EAcKe8mIDjN28A8Bx89NFHD9YfAIBb58UEXC+yAACXotcfAIBb50UEnH6b0gssAMCl6DUIAODWeREB14srAMAl4V+pAHBvIOAA4O752q/92oN1CADglkHAAcCroNchAIBbBgEHAK+CXocAAG4ZBBwAvAp6HQIAuGUQcADPxF9873sP/ODv+f6nnz7w20mvQwAAtwwCDuCZ+MlPfvKG9of/I97UN7/1G7/xIGwXvQ4BANwyNy3gfEFs/u2f/MmDuLeO2/Yv/+APHoSd4t9/85tv0q52OJSnwt/l4un6rdxP4S+++91lHqv8V/4vTdfr0y8ES/PtP//zMf4pzomf+Tf/9Hd/90v1ED0e/sPn40h02lP8qy/GV9ZRc9Ruj+kMvwS9DgEA3DJ3KeCELkgd/1bJdr2LgBMdJhzWF+zH0Pmrnk+pa9J5TmH/5o//ePTv+C+N6pTi55SAe2z/ndPuzL9xetXrBz/4wVt3jolzyphwuq//4R8+8PsHH3zw1k/hT8n/XHodAgC4Ze5CwJ3y10XCF6XeQchdBV0wM9xppt8uKU+XM+1sOZ+Pv/3tN3GUV8fJMqY8jMJ/6zd/883nYy7qJgVcl+PdtzdllIDz11pqf4eJ//tP//RNeF7wHbbarck8OyzJenWYcFiHt5/q8M9/7/feun/nt3/7jZ+FQ9ZT7ck6u67dZ8bt1jnusMT9lH4WcB3XTP2ndrh9fYPS7RY5Rt2fk4Dz+MhznGl1rLrYPdVN59Phmc+Urv2yLfI71Z9PpdchAIBb5u4FXH5Vk3TcDms/+x/lOe1WNFM9V+HJSsCdSidSwHXc9D9V/6//0R8dhosOX5U1hU9xW6hkuMRI5zO5c5fOXxW6rY6fHPkLicAOE5PIneokTgm4TpPlJB1u9//1+bnquGIScN75ElMbPPaaLjs56t8mx7T9ug476HUIAOCWuTsB9+/+7M/e+HnXpOP4At6/u8k43unwRUhpvvWf//ObC9mU5+S3cudXRrmz4x2P3tkwOwScd2Fcrt0rUbMqp/Pp8CO3258iKMvp+O2f4RIj3iWzuOx0Oj5HwPUu25s8v/jKT3X+3ne/+1ZMdhm5W5V5ZF4dtvoKdUrjcz/1t+t4lD7zmARcxk/OHWvKcxL/K/fK78h/B70OAQDcMnch4CZOxfFXmnansOp0+ZWOL9Z9IXTcdH/rW99667YozIvi9MPxxwq4c2gBJ+Tfxy1qJjqdcd52d5x2n+JUfIVNP/jvdDo+R8BN+Zv+ujfDms5nVcZjBJz/zLGi409u+/W4bfx1r8mxP+UpUsAmR+kmvyP/HfQ6BABwy9yFgNNF2UxxJNZ04Woyj04n+qtHXagspFpodT4dpwWYd46Ed3c6TdLpH0MKOLl17N9vpV+Lmu6voz7bKeBc3xZOicJdn0lAZDyJErt7d7XjJ/nVougduO6blTiaynjMV6g+V13W0Tlpt/1Wdcw/GKzyaLfImwK1KX+nd5Ru8jvy30GvQwAAt8xdCLj2P4ojIZQiqcPF9KNzuZ1uStN+Gd/lyq+/unW4L4SPFXCdz8Qk4Dqdjo9Ejdz62lPHFjb/JXYYO80pt/2mH6w7bu+KdpwUI/lHiixn5T5qq0SI8lt9LTilkSCffj8mXLf0e4yAsyjKvlJ5R+O43fabBJzj9uN3Oo92n+vX7pXfkf8Oeh0CALhl7l7A5b/jkqM8ph0d4Qt07p4l+VWd3OcIONUvxcdzCDina7fbt/qRvuhymw63+9QP4ZOjsIzTYmTKN/2SIwG3Suf+6q8ZzWrH0P2ZgvQxAm5Vnyncbv/7uek+6/TNJGJNlqMx3HOt003lTfXoMb6LXocAAG6ZuxdwIr/m6fiTn2jB0V/Pdp69+yK/IwGXZYspzVSfp1zcVgIu48g9tcH089Y63LtEHZbxu09XO2wKm77S6zgtRjL/jpv++jwl4Dpd93u3pcdH0+U8VsAJtdf+3fYpfo5Rp+10Sd+YdLjQ1/0dnunUrx3e7pXftFO5k16HAABumZsWcAC3gneqWiTD36P+6X8D76TXIQCAWwYBB/BMSKAc7YC9Zqbfne6m1yEAgFsGAQfwTJz6Wvi1M31Nv5NehwAAbhkEHAC8CnodAgC4ZRBwAHD3fPUrX3mwDgEA3DIIOAC4e97/6lcfrEMAALfMiwg43Q33AgsAcCl6DQIAuHVeRMCJXmABAC5Frz8AALcOAg4A7pr333vvwfoDAHDrvJiAE73QAgDsptcdAIB74EUFnO6Me7EFANhFrzkAAPfCiwo4gYgDgEvQaw0AwD3x4gJOfPTRRw8WXwCAp/DVX/u1B2sMAMC9cRUCznzw/vsPFmMAgHPgYb0A8Jq4KgEHAAAAAKdBwAEAAADcGAg4AAAAgBsDAQcAAABwYyDgAAAAAG4MBBwAAADAjYGAAwAAALgxEHAAAAAANwYCDgAAAODGQMABAAAA3BgIOAAAAIAbAwEHAAAAcGNclYD74Gtfe/CCagAAAIBr5oP333+gaS7NVQi4jz766EFnAAAAANwSH3344QONcyleXMC9/957DzoAAAAA4BaRrmmtcwleVMC9z1emAAAAcGd88NWvPtA8u3lRAdcNBgAAALgHWvPs5sUEXDcUAAAA4J5o7bMTBBwAAADABWjts5MXEXD8cQEAAADunUv+oeFFBFw3EAAAAOAeaQ20CwQcAAAAwIVoDbQLBBwAAADAhWgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbQLBBwAAADAhWgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbQLBBwAAADAhWgNtAsE3BP5p7/7u7/8l3/wB7/8nd/+7QdhO/j6H/7hL//NH//xA38AAAC4HVoD7eImBZyEzU9+8pMH/vKb/HfyW7/5m2/LSTKO3O8qvj799NMH+QIAAMBt0RpoFwi4RzKV0X46flcBBwAAALdPa6Bd3LWAs7v9p7B/+yd/8qUwufX5H775zTFdl93h5rd+4zdGf7FKI7/egXN9Ot5RHgAAAPCytAbaxd0KuI+//e0vxdHxD37wgwfxxH/51rcexBX6nVuXod+mOXwVT365A+e6/PPf+7037u9/Ic66PnaLFnA6Vrp0OzyP7f72n//5l+oEAAAAz09roF3crYD799/85ptjibMpXgsc+f2DDz54e/ytIZ1x3knv4KWAc5wuz35TeAo4Cb8O/4vvfvetn4Sfjnu3EAAAAF6W1kC7uFsBJ773hcgxR19nCu+kZdxzcPp07xRwk2DsNN7Va38AAAB4OVoD7eImBZx2yiRSvv5Hf/TWz7tUKV70daePM0yf+XVlo/CVgOsyRO6GOc5OASdhqeOskx5h4mP1x6qtAAAA8HK0BtrFTQo4YZHSONy/OxN/8b3vvfn0b8h6t6rT6ngl4FZpO71QXOVjwdn0jmCWM/0GbkJh/gpVn24rX6cCAAC8PK2BdnGzAk7od2wWMv2bNpFfPXZ4/hmhd+PktxJwQrtfTiv6kSH5rDjnkyJO5WX+9s88WsCJFI/dnlN9AQAAAM9Pa6Bd3LSAAwAAALhmWgPtAgEHAAAAcCFaA+0CAQcAAABwIVoD7QIBBwAAAHAhWgPtAgEHAAAAcCFaA+0CAQcAAABwIVoD7QIBBwAAAHAhWgPtAgEHAAAAcCFaA+0CAQcAAABwIVoD7QIBBwAAAHAhWgPtAgEHAAAAcCFaA+0CAQcAAABwIVoD7QIBBwAAAHAhWgPtAgEHAAAAcCFaA+0CAQcAAABwIVoD7QIBBwAAAHAhWgPtAgEHAAAAcCFaA+0CAQcAAABwIVoD7QIBBwAAAHAhWgPtAgEHAAAAcCFaA+0CAQcAAABwIVoD7QIBBwAAAHAhWgPtAgF3ZXz6X//rL/+f//gfH/jD01F/ql/b/1b5zre/fZXtucY63QvqW5339ge4NzTW/8Xv//4D/3NR+n/0D//hA/+XpDXQLu5SwKV12DUi+/q//tdvj//XX//1gzjnoDyeu81H5cn+x3//7w/8d5J9t0L9eVTPa6fr/rd/+7cP/J7CjjyS3fndEv/kH//ji7T/F7/4xZt8077/ySdvwyf7zscfP8jnXblU+86ly37qWqeL+yrdrnn1ruyox7umf0lkpzYxjs6j7J/8zu888H9JWgPt4m4FnAbAdIK1+OmCfnSCJTr+509/+sBfaOFQWt0NK57z+dEPf/iGjq98Jn/dIagerqdFiD777mOVRzMtaqpfChzXX8eqQ4apPd03Cnc817fL02eLKIep7h121J5s/59+4xtv/VWnVfk6Fy4j2+t89Nl1UPkplLufnH/eyR3VW/icruI4f+Uz7VapHas2Zh9P7ZFbadPffal+zPPq89n5mu6LdotpjnTZ+ux+Njn+u5+dXnWfxmSmn/p6dZ6cV5eTdek07tcOc/v8mfO4+8r4/GZbsm+7DOeZ8f/q8zbI7M5jYcGXfubUuZh2+N7WeRBwq75ZcbT2TuPJqBxZ9q39VuNA/sovbyBVrtydlzkSTtP643rIv+ezx9U05hKfE/eJxrzPYdfRZeV5yjVcdfPaMKVPVv3t893l2p1r8jSeG8dxPvrs606G+Tjz9DnOPm4Bl3WUKf20bh31ySVpDbSLuxVw/syT7glq64uG06RN4Z1Pun8cC0mb/b2IpOXgywnf1vVJPHHTrxfezEfl+Lgt4/cugPutLcttO+Wf4a6Xw90GmxflNvl5YudinO1cpVObZDm5HbZK07SdCv/b//2/34bp4pbmXZY2+fWFptNauMpURpr8LQza3/TiOImGtPTP454nWUZbL6qTHYXv8s/dLfVj2s9/9rMvpcvz0JZ1Fd0XvkC5r22ZZvKzv4VEh/e567xs9leb0nJMTuuUw3pNyH6b6PZnOW2dtk1+XuvScuexTX7d11mHrGOX3+uP07W/+mTyt3W+3Sfyy7Uv/bu9rkPP5VX6pM3+PRbympTryFT3nBtmNX6m61S6ZR7fXpdtbneP8wyTeX5lHLsv/a3QRGugXdyEgEvrsOZHf/mXb+N1GlkufH3HqcHiSdjx0895uiwPnLz7zXh254Q4CrOAy3heFHp3LpkmhvNp0eVjD2ZNyIw/1WHl7vIyLCfLlLbvTm0tpHy36AmdYRk3F2n7pYDzgtfl9fEkbjNN33V23+dx+rm9XQ+JJI/HSXBmPn2hkXlc5MJmy3h94cx8TS+Ok4DzseoyLZY2HecFrcPsXgm4ya1dAB/neOhzoIvKJHQ0T3O++SYv1w7n5f7KMrs+om+UEoe5n3KdcF+r7E5nm/x9wezwKU2PtYyTx67nqb5xPM/to7Znmd69ybS2jJdrcPqn2+cnb1Ycx8J7SttjO+l5JTy+JuGgfrV/jr3ux+5/I8s+8fyf6uFvfKY6yHr8dHrTecu8JmmeT2PU5va4T3xN6Twz72n89Dx13DzOeTulO7XO5Zrk9q3q+Ry0BtrF3Qm4jNcDJe8a+u7L9J2lB+CUv90ebNOgSlOZXlxSPMpy0Uzx1BPziG5v5q92eRI5TsbtO7e8m0mRZUt3l5dhLeCyPzuvU35pGTYJuEw/ibE2hfWOSi8iaT8dvn5om8Lb7XHQuz2yVbqsp895W9Yn82l35mu6DycBZ+vfY+Xx6lxPYZOAyz7ui2Db5J83X2k9JrtcLf7TV5Ey17vDjkRMC/JM333dcaYwWd9gpU3xJ/8+r46ruT+tJXb37out809Wa2+7VxfZ9uv6aR6lu9dx+x/191S2xmD7JW3ym8aCrG/6sk9yB2uqR+9EObznRZbXfvZfhfkmJW1K4z5py/a1iHY++uxzl2E+zrW31wbh87gaw73DfZTXc9AaaBc3IeA8GKY7s2ayPml50Ut/L7S5W/UuAm4SiZ6ILYpWAq53qI6YJobw4ibTwE6xpnAvAv3Vm4/zgteLSx43nVbW7e70K7/p626HPUXAdT6ZXy+KslPnofPN4/TLdsjyvLuv+qLReeU5mBbKTNf5tLvTiG7/zz/7bIyr3+/Ipl0uWYs0h8t6HPQcleX8yYXalnEzbcbvNcNtyznW5epzJbpyxyTDpou26YtMnrNpvJqug36eYcs1ahXftBh1Wq8L2fcyjb/e6c6yVuWcQ6+9eTy503/Kx+4cs51HHh/1d69tGb/Hp/Ptb2z0OY0FWQs4030y1UM27fb1XM347Wf/Kcxrjuds38xmmtxNW3E0fqY1K92yXFP6mzLR19r+6VL2tax30J+b1kC7uAkBdy49qYUtj3vCmBy0Pn6qgNNXfjItdl5Ac1tXpvguZxJwXiiVVy7C0wIhpvZnPTNM5gUh7159kXiMgFM9u5+yTIdN7elFzTb55W8qOsxlTAt0XnC8sKh855dCocWt8G9DTtXbi3mnzzgyL7oZx/7KdwpTHafFNfPt/snjI/fRues83X/+elKWYzfTrwRczi33bV8gbYrj8ZljMo9lOnY81dm/C8yvGpXGC3l/hbc6J7LuA4dlfe23+oOKrfOaxuuUTuMyf6OU4R3/qHyP726/1ytZp3lM3+TxVH6vvT5napvb5/W00+cc6LVuJeDyWOT5/7R+t9fzKst2Gpv9c3zZf1qfZdOaIes+sZjK9so0pnMnTv5HAi7TG5elMI+FvKnXcdcnj7vu3SdTnMeMH4elgJP1+Mx5Y0GZNzXZ116zpw2V56I10C7uSsDZ0q+31m19Z97hHtA9AWzpngScyIHbF6ijH4xawAnfvcs8KKcFQvSiltjSPYVrkPvT/kcCLuvXZU4Td2rPVI/2z68b0r9/X9XnQPSOQabJthlZ1835TmGZTrY6D7LpItz5O67Duh/7HGTZvSOQ8drdfZd8qb013rI+2X8ZR7YScCKFsqznR1vOibyIWfA6LMdX3rlnWzMvWV8cktW4a3eX3WFOI8vyp/Ha5JhR/D7HGbd320y2v9e01Zh0/rJp12Xqm3ZPeamOuROd4yn/5Zj0HOg51kLG1uu/8NjrC/o0rzosw7NPcxz2fBGO0/na+nrU60H+xMLp9NntXqVPsi9TLOf4zf61dT626Q8MHcdzbKpDzwFZ1msan1Mau2Xd1xn3JWgNtIu7EnCviZcekPB4ZLkwvWZ0kfOxbCXgOt1uZL3Yw9ORYDq6oMPrZBK1z0X/hOElaA20CwQcwDMhQ8Ctf5CdrPx3I0PAAVyWlxRwspded1sD7QIBBwAvAsIJAF4DrYF2gYADAAAAuBCtgXaBgAMAAAC4EK2BdoGAAwAAALgQrYF28SoFXP+NHh6if5Ndsp+U9yXzX6Ef075EuQAA8DppDbSLVyng8t8wtlX4LqZyrpmjZyLt4Nz+kE3PajsXWT6iop8fBQAAcElaA+3irgScLs59sc5j/+vN/vnEaR3nq6T0KeGQD900etik/PvZVXLnAypX5XR+Lluffmm7y+8HW8qtOC1qnK/CMo8MS3fWU69E6vasBJzTivwXofPo+EL1UbjSZp9keTpW+nz4qvtN6R1X5fo4/xqup5R3G5xeeU7pjcKVtv8V6Xjq6+5TAACAc2gNtIu7EnD5xP1+99l03GYBIvMTzW1O61f0TGGyFAEOa3N4xvMbECaz2PpP8fRqW+aR5id7T8/fkbme+YTxyX+qq5+i7a8i2xw3n1Rum16B1M8F6zg2+VmUpV+3oV9pZcv0rmOnzaezT+YwAACAc2gNtIu7EnDCF1mbLtinxFy6268v+DILFz/hOYXMJOA6zybDXJ7zyTDtFOmVNqv8LT7ytSWnBJzi5jvkHPdIwKV/P+Va1gIqw1qc9bHa2K9nSrf7J3f71Iapv+yeduV0bOHotBbt2R+u7/QqIQAAgFO0BtrFXQq4/OosLePkcbrtl1/PyXSRbyHY6R3v3HJWYX1sd+9U2b/TpPuUgPt/P/74jTtN/kcCrt8lOVmGZdxJwPVOXZc3CbiMs2qD068EnF8a3eXlTmyHpRsAAOAUrYF2cZcCzpbuxwgr2STgVmIod5w63VE5q7A+tluW7xnseJ2nPld1zh0r/+7MpuPHCriON4XJJgGXdLmyUwJO1l/nZthKwPWumvvKu5wZNrkBAABO0RpoF3cn4HwRtpCyZZx02yQSMk0Lsf6KTvFtU16rsOkRFlPcKUym3+Dp2F/3TWnabct6ZXt0nL8tk38LqcwrBZz7W8LMv0HMHSyZytWfGBwvw3TstmiHs8u1ud9WAm5qwznpbatz1uXk8Uu/Xw8AAK6f1kC7uDsBJ/JC6x/cr8KFdrVkKTxWAs5umYRH/pszwyQYZFNY+k3+fWy3v8KV+evhKU27M513ndweiy5Z1rmFVObb/zbNr0BboDpP2yTgsjzZqk913AJM+KtQWZ/vrNsqvS13N+2/cssQcAAAcIrWQLu4SwEH14msxR8AAMA90xpoFwg4uBjeDUvrOAAAAPdMa6BdIODg4vjBv+0PAABw77QG2gUCDgAAAOBCtAbaBQIOAAAA4EK0BtoFAg4AAADgQrQG2gUC7srQYzd4PMXrRmOgH8dyLkr3L37/9x/4Pzfv0oaXQo+YyTqnW32aYbfWtlvlWvr5WuoBt0lroF3cpYC7tX89yvy2ANlTH7UxPePs0hyVJ8u3KDyF1fPoboWn1N32lDxkz30DMNWv23CELN+WcYTsqfPjiHxWotxpcvfzBfP4mpB1/zylrt3el+Jd6yDLsbXKb3puZ+fTfo/B1v6PYUov87M14XppDbSLuxVwqwVIbzLQApcP5m0kOvSC9PYXWgyU1i9ddz5604Do+Mpn8te/MlUP19OLjD57B2WVRzMJOL+hIOO4zqpDhqk93TcKdzzXt8vTZ1+AHaa6d9ip9rhvFG8ScKvz43R9Aevyuz+cpy7izkf59xhRuPLu9DpfLjvbdap/8jznucj4qzx0rDp2P8jyHGmc9jltpv7Mfun+dLj7os+Pw52H2uljlTO9Gk31zPZlf/ZDtF2faWz3GG2m82S/7Geb3X6TSJbVx9P8yfyP6pUoveL7FXfJdK6M660HUmf9XO9ut5Ff1lv1dXvzPDZOt/LvdURu5Z3j3udsVUb7T+dYfspzNdbl9lhZtckCznl0PdyHXY/OR7j9+c97W6bPflitiVlO18H5SsD5bTeZrus2uVUHj6nuN7Eabx7TvTOZ7fJ6Cgi4R+GBLssBlk/7l+UEy7RpU3jnk+4fxyRqs3++tsnmySXLBaSt65NMk7zfhZr5qBwft2V8v+rK5n5ry3LbTvkfpZWtwo7SpX/HW6XRYpjmeBL+aV6kZJ3GY6Ct65B+P//ss7fuDGuTn8puy3x9cetx+pjxLuvz7rB8u0WHdb5TPWQe422dfvLvtDruPvEr55o2+U3PK1xZ5rPKU+aw7qtzdqTTcnel7ShdhrcdrVG+kWh7alnp/+kXc8h90HPqPw0CV7bK2+dY1nOw0//VsOZmORZwq/B0d71zrPWc6bVAx31Tmub3aoseO7KsU6e1yT/XdjHtME52FH5OmMxlp/9rpzXQLm5CwKV1WJMvKO80Ml/cZH2Hq8UrJ1DGTz/n6bK8yOb7STOe3SnSjsKmC5Qnc+/OJZOAcz4tunzsxVSLSsaf6rByd3kZlhesKW3f7U5x7J7e/2p3Htvtc5n+7Zb5ztOWYTle3Pe5GNoynsO6rETno+Odm4fi5V2xLNuQ+eRx3y0fjXebjntcyZyu25Fx7O8LlsufzmPuDkzl5XjUcV+gZB5rfdMy1clu7xL4Ar+Ka5GX4VNcj42sr1/RtuqrJC/u6gef59VFv9PLpjnltS7TdT9lWLe388uwdOfr6GQ5B2W9K+Xx1q8GzDhTOWqjz3f62919MOWXtMCZ8sxjj+UcNx63q7VW5j4/WnOm9F2H9LO/x5fdssyrbx4ybrunsD6XqzJl027ea6Y10C7uTsBlvL4Q5E7A6ncDfQfVFz1bur0ITRf2NJXpnYIUj7KVgJNI7Dqu6PZm/mqXBafjZNy8a5LlO0tzMbSlu8vLsBZw2Z+d15QmLySyFBx5UZOttuwdZ3L3cbtVfv4+Km1K0xe+PG5ked6P6pHpctG0TQLunPHeu2M+P7K8eZFlGZlHu+1n/xYfk3BIAZfpbT0eZV2/tqlOWU7Ge1cBt8p3smkn1PS5XV3oc8c2kbV4yXgey3b3euewbm/nt1qXVjtdspy70y6frPNLv7b2X7lX+SUt4KbxoM9pjZXpPPU47zi2o11VmftWljfssinfXPds0/GUVu+RtrvX2tW6L+t6ZZiP4e9pDbSLmxBwFj25AKyYrC8OuXikvy8MedfyLgJuumh6ge7JsRJwvRgfMS0uwne3Mv++xqZwT9z+WtDHKah6kcrjptPKut2dXpb9lgtpx0+3bHVRyTSTeJjys1t94/HX+U5p+hys0glfhKc+bXeme5OmLgKTgDNPGe+djyzLaMGS+drP/t2+6Rx0fh0+CbiO03VoZH3j5B2j6YKd7hY0fbyqv+xIsB3RNyg+ntzp3+tOxsvxacu1x2Hd3s4vd9rcPs+TKT9Z1uuc3Uina7/8arHLmdyn8hMt4HrM+rjHboZ5XNq/dxvT0v9o3eo5OMXJ9DYdu4+7LRn3qWttz6MM8zH8Pa2BdnETAu5c+uIpckDZVhe0HOj9tc+Un92TgNNXHzJNat/l9t204rucScB5QVBe+bXTtIiIqf1ZzwyTefLm1xf6zUaGyU4JONWz+ynLdNjUnt5qdxz9IDeFZ9ZTdXM85+38lLfDfF5s+dvDrGPXN92n8shj0efANvVPhmc/2NKtNqe48m9ruh9lXedzxrsuyLJzBZxM56O/Ds349u8x0+PXlmU73NYCzsf+itHW5yfJMdJxLingZF2vPE5cR5XncyJ/n8Np7Ce2DHMemU/G1YU+f9elMIsx1bt/XJ8C2n2peJl35yebhKWs+6bjdPwez3k8uTu/nEvGa7fa5j9w9M8UOv+p3quw1XGOyZ5LtnPmWcbpm2ZZr7MZprZ7rPkcZX94/va6kvPIZdq6rNdOa6Bd3JWAmwZP/7bCttrNs60WSVu6JwEnvOjLcoEXnjAdLvMFSuRXEp6EfQE0LR4SW7qncE1gf9r/SMBl/brMbP8Uf1pUOs5Rn6bAEHlhyfOWd+zdR33c7hYxshw7Nrs7/94taKaw9nMf2C9/sO+wScBlXo8d77LOJ8+Xx8GpC0vGdViP36mPbP7KbxJw2nmQuV4uR9b1MTlGcofkUgJO5FxfxUmyHdnnOfb797uJLd0+7vFp03nsPsi+6jJyjk7rg/JzepfTAk54/ByNTx/nOEn/U+5kWpNEzjFZrsHOs92yrnd+BZ552DKO+y37sndrz5ln2aZeUz1HOp3TpnWbj65fq3lk67JeO62BdnFXAu41wSQBuF10cZwEDcBOZPl1d4dxHXkeWgPtAgEHAABwhxwJNATc89EaaBcIOAAAAIAL0RpoFwg4AAAAgAvRGmgXCDgAAACAC9EaaBcIOAAAAIAL0RpoFwi4K0B/Ye/HlUycEwcAAACuh9ZAu0DAPTPTP38mv4mM089HAwAAgOujNdAu7lLA6SGXetBgP9RQDyOUf78z0w8p1BO4+2GGDtNDFztM6CGG8u+Hyk755RPEdey8+7jLdzscpjL9pG+nzTwybdcJAAAAno/WQLu4OwGXTzGX+SnR+WoXmdxOI+t0Gda2Kmt6hYlt8pOlv4/73XZ9nE/IlumBoP3E7X5yPAAAADw/rYF2cVcCzq9a6Xc2+ti/IWuxk/GcR77g22H5taXjeYctX87c4snWx1N41m3Kx8fTV6iyrPe0YwgAAADPR2ugXdyVgPvpFy/XbX+/OzL9ZP6KUZZ/EJD5K9GMZ7c+811waY7j42YKaz8fy9Sm9hcrAZdpMwwAAACen9ZAu7grAdc7a96Nyt0xI8vdqiMBl7+lcz5+AXG/fFj0y7tPvey3/WT5Iuj097F+59fhjtPlAwAAwMvQGmgXdyXghM0/8vcLo9tflmkeK+DOyTPD/ucXO2kWVxJoLtPmtPkbN/t12f5DhPL/tH7PJ/OuoYVm5gMAAADPQ2ugXdydgBO2/g2Y7Re/+MUD/6cIOJF/ZEh//0ZOln9uECo/0+TxVIdV2d6ls0gV/dUqAg4AAODlaA20i7sUcK+ZFnQAAADwcrQG2gUC7s5gtw0AAOB6aA20CwQcAAAAwIVoDbQLBBwAAADAhWgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbQLBNyVoceA9ONDXhNqez7S5YhT8RR+Ks41obrqrSHtf2lesp+yXB3nI3sSPbj6pep4SdSmfNPLhB5JdI9th8dzzjjQeDonHjwfrYF2cZcCLq3DrhFZvtarn193Ln64b/tfkqPyZP0MvFNMb6BYkfGmdLZO18gu9eiVc8rPuOeI98fkeQ62dHf4pS4IXe4kZtI67BJM5Ux+O5Cd6tue17LHzqt7RJZrpZ+92fFO0e+c3snuc3VOPTWezokHz0droF3crYBbTcrvf/LJm0m/utMXmnB+c0KjxVRptSOgeM7nRz/84Rs6vvKZ/PV6LdXD9fSFS5+9C7PKo+mFXqh+eVF0/XWsOmSY2tN9o3DHc327PH32hddhqnuHHbVHbe/66tN16zKc5uc/+9mDunS91A6VnQuq6ykB1/F1jrs/Guc3xVn1j467L4Us/TxG+gIv06f6sPvkKH+3X+n64dTOc6qzTHVwf+izyzSr+eW6dlqX6+PsJ9Hnx376PGeeeDyJnNM6Z90/WV6fM9ezx49ZnQvnmXnlGNdn9tV0znOeun7TvDKrceu88xzk+vCn3/jGl+KqjB57mX/m4zpOZRyhNKv4p9Zhmea9628B5zr0WBA+T7kGym8654nqcVQX5af6dpky+fc56bU388kyO79OozGsfNO/13wx9aXjTOt+M6VP/yzP/ehz2/P0NdIaaBc3I+D0xoNzB4LMn7motv14mOBtp8InU7x8E0P6r/LwBJC5zlpQ27o+iRe19k+/zGc6tmV92ryot3WZHXZOe9T29J8swzJNWqbV8ep8tPWr12zf+fjjL9Vzyq8vdm2TnyzjW1RobLat8pWdCtPcaetzPKWf/GT9NpMp3mqcyDJNHveFp6395J7a5vTT2EjL9aHzlq38ZeeEiZ6XMotA2al+yvRtWc4U7vblG2Ns8vebWtJPIrxtlb9M/vn6P9upXe0pzaqcfJ/0FC6/aU7KVmHq96M6iFW/HdVFdhTmtsjymiY7VWYfp3lO9g5c28pf1vNvirfyX62dsinf10RroF3chIBL67AmX2jfaWS+QMr6rk8TKy9MGT/9nKfL8sD1K7I6nt3TBXMK86Kb8bwAHYnYvlBk/rloOI7MFxItGhl/qsPK3eVlWO5WTGn7AjoJOJ+TPLcOW6Xr8nyRn9LK8mLTX8XkeV3FsWWcLsduX7B9vvLc5/jssZjH7tceF7LOv48drxfcqaxVeMdxPXwXn3HyHE/1yONpoZfl+bEduV1mjgvNAVmKp0yX6Sc/92uOh97pt03pV8ct4HSs8+kdj6nPpl3AKT/v4Nh0nBf4FHCZR7vzOMWUw9wP0/lfYaGiY93cub3pf5SXLMeWx6DX9UynsOlmXsd9DpMOk/UYzbw6zhSWa6vn+E8/b7vjdRrtMmb6PJ7GZJ7fo2uaTce+uW7RPZ0Ljb0pX8fLY7s739dGa6Bd3J2Ay3i98OWdzWpA5XtKZatdlXR7QuTEmUxlWkikeJStBJxES9dxRbc381e7LIAcJ+P2TkVe3FcLX+fRyFrAZX92XqKFmKy/7puOO92Uf5/bjJfj4eefffaleLbMe8pvitN+k3mBlvXimpZhnWeLgLRV2U8VcC2khfss/cypHZ087ouj/VvA9c5FjzOZjntc5HFfnKY4k1+K95VN6VWXSRD43PkibvO473ktWwm41RqX6ZPpXcmTqd69W2fTueh2Tfk2FtS26SZTrMaWbBJwdnedVuOw4zU9z6eb+vSTWdzYMszuPK8y5+H62PKrbVmnbXoHrnf0cq3oessyr8nP+GcraVOadr9GWgPt4iYEnEVPKv4Vk/VFwYNflv5e7HMheRcBN4lEL1otilYCLuOdYjWpJRZtuiikWFO4F4zcxcmLe14s+qKXx02nlXW7O/10wd0h4PK408ryXOXd8IopvylN+7W7w1Kk9Q7xKg9ZLsod3/4ZJnuqgOsLhOgLdu/SeHyf2gntuWr/FiM9JnqXQqbjHhd53GN5irPys3vanZ3INafnQK8xIuvW81q2EnBTeU4z9W2fN8edxp7XkfYXLYKmfI/I9toc1u70PxJwLZBkuc46rOveZcjymjAJuLzRluVNmazzS7d3v7psoV3Jjq9PX0fsn/Mt5+fRNU32VAHX+eY86DTtfo20BtrFTQi4c+mFTuTgsfXiZnIR8XEvrp1ONgk4TzwNdA/u/npB8V3OJOA8SZRXTpBeqMzU/qxnhsl8UcyF2b+9eoyAUz27n7JMh03t6R/OThfcvlhPx75gqKxcoBxndZzuN2k/v0tPP7Xd5vidR96hZxzHU192nTLfHBcp4GQeR7LMs8s4yr/razsScFOdHT4JuKls5eELjdqYOy6ZJo8nkSE7EnAeM9Ncm8aTj3ssZxxZjumOl25b93kzhcm6n/2Dd8fteW07mnO9xtm6jpPQch+uxp6s82kRlPlmvKkcpfVuTualc+5+OGqrw3pdnAScxmDuxGU8tan/NJDxPF4mASfTeWtBb1u53b4pjurjumbYFM8m/5yfOcbdxzneTgm4/GrVeWlu5a5o7sRN+bT7NdIaaBd3JeCmgdJ3jbbVbp5ttXDY0j0JOOGFSNYXpt5+ngScyK8tfFHqhcr0Qp/Y0j2Fa6L60/5HAm76DY3J9k/xW7yJ6YJ7joAT+VWBwzOOrcdEhrVQkOX5mNL0BTeZ+qDrmfnlgpp91TtanS7H6VH+Mi3KirMScB7H9luFZ95dRvZZ1qd3Dvq454n9+7z02Mk659erfV7yuMeyyR+8T+nancJ0NVacJtPZL89dXtBXX6Gu8uqwXuOmcTEJuPSX5djL/GX2e4qAEz02Oj/ZtBtobDrudbH7zWWpX3pcTEIq85Rpl002Cbi8iev1SrZy2y/dIvu/f27TaWV5rnt+2vqaJjsl4ESei/46V6Z88/zbOl7n+5poDbSLuxJwr4nXPiEA4DbQxT0F+L0he2r7WvjCfdIaaBcIOAAAgCfyLgJOdur3jHD7tAbaBQIOAAAA4EK0BtoFAg4AAADgQrQG2gUCDgAAAOBCtAbaBQIOAAAA4EK0BtoFAg6eFf2FPf+K/lzor/j9SJgVijc9zgIAAOCxtAbaBQLuSrjUX8lt7X9JZP2crgx7iX9drZ75NdVHdq7YAwAAOKI10C7uUsD5waopInpHRe58cKSewN0P4VQcP0He6XWseNMFfirXSCT4Zc2NHzipT5ejh5H6OB+26DKm8pV/luF8O2+3XXn5yeNyK23XXXFVXj+h3Hl1mMv8s29840EfO9wPWvXxUb9lWblz5/MwPeTT59LpxCTgXFe1O+PqOB+iqmOVk0Kv06R/9xUAALxeWgPt4u4EXFs+bd4CLZ8G73czpvnCLPOFP582nbYq12Xlk7xtp+osv3wyuP0mO8pjspV/mkXXZKvyZJN/izKZhdBkLfg6ntzdN/bvuDKfh0nAtaV/Pq38yDxWzjnPAADw+mgNtIu7EnAWZhYN+V66vIDny8ptziPdNouKfP+bLty5YyXzsQVG52f3tHuWcTKPfnVJv6ZFn/0KmUxn67Lsl3V12NGrVlLceffLlvFauGVYC7gM07mZ0vSrlNqtT/dDC1AdTwLOcY6+Qs08/CqdzN/1zXh2Tzt0AADwumgNtIu7EnApzExfVP1pYbKyDHN6C0SbRUq+hzHtVP6reooWVqsyLNTyXXyybl+X5Z0pf42YYf4R/2QpvpxmyuOpAi7d6d/uNoul7geZ/HcIuK6LzP042VOfzg4AAPdDa6Bd3JWA8w6J3dPOVL/I3NZ5nQqzIJBQ6jzPzaPjpbsF3NE787wzmDtD7yrg8mvmiQyb+vnSAm7a3cpz0vkdCbje9ZM9RcAh2AAAoGkNtIu7EnDCJpFgc5gFXvrl76k6TR4L7+5IIPRXnLbOw+JO8VtgTPW2cGgBl3H01a0t66XjLsNhytc/rpedEnBZntqUZTjMx5OAk1kI2t9hOwScrPvadZR4zB1EhR0JOFl+rZ1u21QXmfvR50TurIfjrQQtAADcN62BdnF3Ak7Yfv6zn41h/hdk+8t8QU6/jGchIOuLsk0X8PTPPz+snoGWP4KXexJwWYYsxZHNoiZFYn6t6LjnCLhOO/3+TrSAy7ZMffSuAk6k8O64Nn/tLP+VgMs06X6sgBN5nnOHUNb9AAAAr4PWQLu4SwEHAAAAcA20BtoFAg4AAADgQrQG2gUCDgAAAOBCtAbaBQIOAAAA4EK0BtoFAg4AAADgQrQG2gUCDgAAAOBCtAbaBQLuytDjK6bnxMGXUT9NL7Jv9KiVfCzKa0SPrrlEH1wiT7hNNBYYDyB0/brUWJieLXoLtAbaxV0KuLQOu0Zkfm6YLJ8t9hj6mW7PwY7ynpKH7Jw3H/Qz6lbI+pVal8DW/rvJcv7qi2cDdpzHMKWf/Hazo+6PQbbzmX3PWfdLI1utTbb2fw5eqtzHMvVRu8/lKelkO9a4U2WvnmG6A9nO+flctAbaxd0KuNWrp77/ySdvBtjRINAg15P1219IJCmtdn8Uz/noLQd+00GifCZ/3UWoHq6nBZw++0HDqzyaScD5rQQZx3VWHTJM7em+Ubjjub5dnj4zH6N0zrPvmpyfyso6Ox+l82KjtOqDrlf3mXaalGf3Vdetz6/bIT/n5TDl1Rct96HqlXHdpulhzSpTedk6PNvtPpbfNA49hqedWrcty+kx4LynuvotI+ec53PzdLypL4XHSPur3r4YTGV3PRvN0R4PPebT7Xb+2ef113GO2R4zR2hMuB98Dsyqj1yGwrqd01ib+lLh7qesa44p4/Wnd0pcdp8T940ejp71y3D7e7zp5qnPUafNdMJjO/ve58Jt7vym8eFxPJWnT/fpFN7rb7Naj6dzkvna3vTNF2uZx4fynMaXx3COl1Wbkx6vTuM1LuOu2jPlI1xn59v5ec6mX/fNak3K8z7VS9bXgR4T10hroF3cjIDTk/RPTSzjwSPLQdP242HQtp0Kn0zx8m0E6b/Kw4NZ5jr7ApDW9Uk8Sds//TKf6diW9WnrtxTYssx8K4HNkzPfZmHr+q3Meci8A7cyhfUOXNvkZ+HY5vEn8xsqfK4mW5Upc9hRnLSjeKfCehdrssf4Zz6n8nxsWC7gfpNGmvzz7SDpn0wm/54jeaPXlhfZyX9isqeE+W0uMo1z2WqseVxO8yrNF2KPh7RVPWST/6rdq/yz7r0m++Lb9p2PPx79ZUdr0GRdT5lvHlPEyrptSdvKv68tbas2y1ZpckykZTkSwG2rNNP1RekVdur6lWVl+aIFXFvOK73eMsvT8XTtyLycfhpnXZdroTXQLm5CwD3mBGlAOF6nkeXE6d9Q6eKRr8HK+OnnPF2WhUS+LzTj2d2iaBXWC7WOPcCPRGxfnDL/FD6OI7NY0eKf8ac6rNxdnui6yFIYuc8mgeXzMgmPKQ9bxrN7yt/HanP2i/MWeWHvPG1O67iud7Z9tZjZnf59UdJx1r/7NMOmvprCXFdfzPMVY6q/6zDl5+PJT6Y0OrbwyjDn6zr3DoTQ/Om78q6H0/jcd59kOpeh8+Q4HX86zynQ+hVsti5vFd7H7oesR7dxWkd6rE3lZV3dzx6TGU+WPz+Q5Xz3GphracdrbDp2e6Y1Z5oP+uzzMvXBVFbmke6jcbxyd982He5XNbZ/5plM/jKfi+4b1d3r/dG7qDu/DDta4zpuuqcwi61VHJPtmPq/haiOc+ymv93Zhr6x0rHOd7bt2mgNtIu7E3AZrxeFvENd/X6q7+77KwZbui3y8sI1mcrUhJSleJStBJwnzTl0ezN/tcsLsuNkXE86W4qjvmOWpbvL67i2bFfHm44n8XWOgMsFdcrDluJcNi1ubVN5K5vi9iKdeXR+HbayKU0unHnc8ZJz7roT+3UfOyxvlo7CbNMC3BeAVX49Tz0X0tLf8aaLbwq4TCvy/KXJrTktSxHqMIvItqmMpMNWprBJbHa6U3nIuv15/BgB57Cff/bZg3x0vjLeavdwKvdIzExfW8vyoj/dlPtzdV3IuLZcs2WO02Os07bfyr0awx0v6Tl8ao3LeZN9J1v1xZuwg3dLr+ZImsJapPtr4sly3fe57LZ2Pa6J1kC7uAkBZ9GTu2MrJuu7+pwY6e+Bl2q/LwydTrYScNME8ELeomgl4FYL5sRq4fCFRabBn2JN4b6I5VeEKY5y0vfEzePEln2Z7Tq6SPi4hYHsHAGX/dB5GF88st+znX2RSGw746Zfp/Fx932nz7DVXfCqfOfhXQWPmQyb4k/Hdud46rC+iHoM/rR+b9O7eav8+jdlsrz5cZoeDy02ZD02Ozzdicdd35xNx0nnmV8jd1i7kx4ffWy3rPs/43X783i1Htl03H3aNy1pPkct8jrvLPeonX1+O1zWbZf1buMp/DtTHfecmsassLXfyi1z/0x92Pk3p9Y4WfZr9oGt83SY+7mvrWIScB0n8+rrlmy6mXPY9BMGW/tfC62BdnETAu5ceiCIPLG2lYDLhcHHTxVwnuAazJ7gvfWr+C5nEnCeCMorF4lpkRJT+7OeGSazAMqLtX67kWGyUwJO9Zz6yYI7+yLrksIy0/m42yl7FwFn8aw8LBimc9K7Q4ovW5U3xXW4y5cwOvoTQ/p1nD6WdTlum+rY5fQF1dZ5yPS7ltwtyjQ6n3meO1zWeXY8u7OPVWff/ffC7fOkOC7bNpWVZaSAzDi2Kb1NZakfPJZUvudjCsPGprHdF3Zbl5vnrsPyeJWPx+U0NztNHnteynJeHQk4Wc/1zr/HW4sPr5Ppl3lMfXBKwGl+nTM+ZC3guj4rAWZ/5du//7K5zGmzIa8pud5nnHTL/McUW4blnJjqcbTGyT1dXzyW3NbV9Svbk+VnvjrOse3xlhsbjpv5ON++7rnsbo/WjlVdroXWQLu4KwFnS79pJ0E2TbAM98BaTZB0TwJOeALJ+k5FC07aJOCEF0NZbx1nfuKxAm4K1+Typ/3zotoTJeu3KtN9me2yuR+menU7ZXmhWQmqlYATeU5W59ZlpJCZ6p5phfumw7LM1U5D+tmmsAxv//xKQTtZDu8LasbLeZD17HLzB8+renmxbf/J7TmTdck+TrpeYtXXxrsJMu/gT/n5HDss6+P5lm3v381OuG598cmw9l+dk1NxTwmbVT45b1uUrwTclM/k3+OtBVzHn/x7vh21c1qDbL3Oy1rA2d+7uL2OJ1lW5rM6J43HRN7AZHi6cwz3OtaiMzlnjbM729P1Xl2/ZJ1f7hr3+c6+6Rs059G7atN1b4qb8ynrcG20BtrFXQm414Ss/QAA4HG0OGo3wLvSGmgXCDgAAHi1yPJrPYDdtAbaBQIOAAAA4EK0BtoFAg4AAADgQrQG2gUCDgAAAOBCtAbaBQIOAAAA4EK0BtoFAg5Oor+i99/RAQAA4DStgXbxagScbHr+zz0hu4TQsqW7/7WV4bvoct+Vqd47OXoOHwAAvE5aA+3iLgWcnuDsl3ULX1g//eSTBw/UVTw9eNAPB1R4x2m3/ZQuy+mwfr2PHjQo/34YaOefbh9nXs5HT9zPeDI9KLHzUx0z7qosP/W7w7JPXI6EUMa1cOl6ZV4KyzR+0r3dOgddjkzH00ManWcK86xrulf19vGp/m3Uz/ngS6XJd2FmGfLPMeZy5XY+3b4pDQAA3B6tgXZxdwKubeWXT4e2+RUnMuc3PTk/X0FjW5Uve5NPvXnB/k7j436IZFq7bZO//PJJ2rYWBDILEZuO82nq6d821dN2Kqz7Op+A3tb1zqf+2+TvcyNBlq+7aZvqJrfTtH/SZuHZNsW14J/sOx9/PIZNNwkAAHAbtAbaxV0JuBY/fjG3kE2vPslwu2XeEZFNrxjJr+Jk+WoUX3DzlS82Hed75hx2VK8sK4VVvwZI1q/F6fB0i1UdZX4NTfrb3V9FyryzOMV3vfx6GB0fCbgpny5Peel46jNbn6ep3umXder+zTQ+Vh95t63b47geSzrfDrdlvAzL8XSJr8UBAOB5aA20i7sScCItBVu7xWoXp4+7jC5HprxXF3zH76/JMszHkxjJuKudHsedBFzbVH7uSLqMfmlwxp+EkI/97kgdr0RN7lrZ/7ECrm0Kb7+jenda21F4vtuv25Pv80tzHnmuUtjm+/26vgAAcFu0BtrF3Qk444tn7qRN4ubI3S9NzrB+4fTq5cQZp38Tl2E+TvHTYXavwmXdxt49nLBpBy2/du3wdLewyPAUMi1IM24LnnwB+1TulMdEitEUzbKjetudfh2euK9Ub7m7Pf5NXKdzvin+pq/qU6x3egAAuA1aA+3irgScL3i6MPbF02aBY9Nx/u6p4/vrsUSmr2clDizyUsDJVAfbyr93uDqNw7rso682ZW6j66avdL3b2ALmKJ9T7haLPm4hY1u171SYyundS1uns6iSfwtw26redq/6N+OoHy22LcS8Ayu3/wBh63raNE4VV+ZzY2sBl8cAAHAbtAbaxV0JOOGv4WT926G+ANp0wc7fJ2U+nb/IHR7/aL6/rpXlLp3Ir8am3+PJJOpkmVfm4a/aZPrXaIfb7M6v8Va7cZPgyt1C21E5edz5ZfzuEwttx/dnp+s/MYjsz47/GHfna5v6V+T56j7N/u78etc2rfOxTWm6PgAAcL20BtrF3Qm4Xcim3SqAHSDGAABeB62BdoGAW8DFFS4JAg4A4HXQGmgXCDgAAACAC9EaaBcIOAAAAIAL0RpoFwg4AAAAgAvRGmgXCDgAAACAC9EaaBcIOHi16Llt/aiZW+TcdpwT55bQ41xeqk0qd3fZenTP7jzviXP7XHH0CKD2vyd6zk/PyoTroTXQLu5SwKV12D2S70d9Dvyw3PbfzaXP4fSWiOZU+KV4TLnntEN0nHafg6xfSXcKW/u/K9PzBnfSD4JOLtGmnsdTGe3ewVE735Wd+U79MSF77Bh9F2TTcyovSc/5l6iDrf13IsuH6fccOZdLjvFzaA20i7sVcCuRobcu6KGpR4NdT833C+kbDSal1QNolY9f4O6wHGzpzuN8SK7K6oe4Or78pzdBNNOgnuriOzS/h9RhU3sd7vq5v5SH3xzQZTid7n6dZ/az/B0/F1j3ZcZVPFvW3XXq+rpu8p/6cyqjF8EJl6+0fVfv8tQfPZ5W40xp5D9dYDQunKbr1edMZL90mOrVfeQ4Pm9uW6ad+inTyz79vG2ZJvuh0wjbUd6rc5plKG3uOsiv2606+PxnmI+nfhHTPPSirzw7ja3z6DFvVH7OoalueY7d1zId+zy7zFU7FHcaX91PWY7f0pJ1THzeOs/OS/XpHbJVfXMt6HyEy+x+6jTTmOp2qN6K4zemdHldN9NzLvPNcyiTf469ZpofWX7XreMp37zW9NrlOmS6nlNTe/K43d3/xm2xdXjjdW16leRRn6lsmdrtevhap/avzlvPZY21HONTmy5Na6Bd3IyA02LaF9AVHlSyPJFtPx4uOG2nwmX9CqSO62MPovRLy0U6rd9e0KwEnP0sZvMVUV1nm9NPpjzzXam2LHcy93O+OUE2xe/XWNm8OLXZP1+H1mFtbnsvghNtTuu3NKTlgp62ar9sVY5sqouP846y29HW6Seb/HthbZPf1O+ZZkon+87HH3+p7mmdfjXmcoyvynlKmOfhOedr1YZeW2x9nG3Iedy2Glsyl3Gqvj7O8dI2CbC2DD8VZ7KpTnnD3eZxaFvl7T6XWWxOtkovc1jG6bxWx2lOP42Nx5S/OqfTnPd6N5XZNwA+tii0TfWa3gaT1nVOVvWf5rTWkkzbJr98003aKo3avarDc9IaaBc3IeAe0/F+1VSmy3xyMuYdjdDJ7sHad51TnnafE5bq32FC5eYi7XKPXullJgGX+U/CUWUdtTfje7JZvORi22S6dnsidR9YmPc2d6Y9FZ7H6fZi5sXNfaHjXgQnZF78Mm2/ZkuWongaZxlHea7StzDJONOC2+3IY/XZtHiv3L6Ay3rHwP45J2xTHkdx7J7Cel7+/LPP3sZR3/iuO/vp6Dw7X/evBEGGqY8yntYQ+3cefYPRx1PZQm2a4mcZPY8zXvpZ0Oh9zB2/bzAyzMc9XrqdicaAz0f3W+a9Grsyn6+pvjneHCbzOXhzHMLMcfp8Z5gs188cj47j49WYyDirc+5ds/Q/qpfduc67ndOYEep7l5PXgj6HsqMysw1aDzzW0j/bM11/ch5O5UzIXIb6eDqXkzv983rhentN6zHVc9nn/miMPwetgXZxdwIu4/Vikkp89ZqsFDuyUxej6a55itth6Sfz5HGd2zJd0wt/5m9Bm4Ih467aK1u9D/WUgPtpbGtn3J5EU73TbVu5c0GRtdgW08Js97QI2jqumERXmsfUapxNlovuVMck2yLzmDlqR4utozJW9e40nedqnKRffkU0iZm0vKkQ7neb+yznd5/nqU+6Tj52Wpvrqv7oGxzZ6rgty8syZcrX5Vog9XywTXlM7iksL8r2777peZlMuzkdp/1kuY50mI97PPdFWTbNn07byDxGj+qfx5M7y8ydn44ryzVP1sI0LW/0uqwuv8e+4/Q5lOVakv2W4lBmt+LLctPj6PqTx+Jo3BjP9U4ry2ur1pAMz3iTgOs4Pj6ayxnvuWkNtIubEHC+m+yFfWKyHAAiB2n6++TnjsUlBZyxyNEi0BPzHKZBLXIwy52W4VN7Zb1T5nSnBFwuHlm3nkR5IRcrgXSOWzb9jiQXJ5E7E+f0dYanYLBlvBY9Pc5k/TuVqZzJnf4aJxm+aof73jucHafdpuvdaVrAeRfB7k4n00XZ7qy/7Jx5bXIM5fnoOdBjNI/T3Xf0stWibzs6PsKWF/BM123ocPut3DK3w+7csbX/6sY28808vOPXcynj5LiWWdR3/Mnd58rkzxQc18ddl2537oDn2Ms0eTy5RQoQtbHXVKfLtUeW62iWf1Reu+037W72nJcd7cDZ7b622+Y69hrcdcmwdh+RQtppPa5Ej/0s41wB95i5/Ny0BtrFTQi4c+mFSdjyeHWBypPs48cIOE92Tbi8i5zS2U9xfffRW/Jy2zJ+5tF1aGSeKJ6cXtSP2itbCTgvrKpff81mUz5e7Hpnaorfbe28VHefN+XnvF1f31Xq65oOs3UZvQhO2HIhT/887gtzjzNb1yPDeoFtMp79sh0+xyrDdT7a5VNfdT91vTuNbOr31ddANvWPfzPnvvKFWPVw+r7hsr/anDsvPd9tfa4c1nXSZ4pJ592LvtwOS2HgdC5PcXIXM8vL/Lu+dvc8drvV10fnsPM7Gl9TmPtA5fQPzWVqs3drMl3nPY3dPF65ZS2AZD0O87jTynL+5XnS7y1zJ+uoLunuctLdorDr7/nhc57j+5xzmX6aM13/XrtkztfjUXX0dahvupy2x2SG91jx+VCa/hOD2uvjKa8+l3l97PM3pXd/9hxxHH0ezeUc431Nfw5aA+3irgScLf16l8e2uuu3tQjocLt7QOUCfrQ7J/KuROVlmCd7f4UzDfKuQ9L+k1vW7ZWtBJxw/PTLeLZs1yTgMs10TmxenPIiYSFq3A+y1XnLhbcXwQmZ6931s6keipPnxtZpWthP+U2LqpkWym5H9lH2Q6fL/so4sq636QtJ55M7IZnnX8d46bGe9W3xZnJeTV+hiqxbj7U8bretF32fU1uON5vd2YbVjkuXqz7OvpjmcYvaDm/3SkDmWmMxNqXreePx5vidzn5H68GRe7Xjk9Z+U7zsR5kFS68XsozXeaXb9G5fx5OtBJzIG4peUzufdIsWPv7sOS/LXdBs9yTKe8e0y52uP51vzrFpXcr8bemf60avCaZ37qY5km5bz2WxmhvPQWugXdyVgLt3dNeTd1LXyEtNEIBktRsI+5E9dV1qoQ23SQtK+DKtgXaBgIOt2Nof4NK09W4SXAbZUwWcbPW7UIB7oTXQLhBwAHBXIAgA4JpoDbQLBBwAAADAhWgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbSLuxNwt/TDZf2F/pbqe+3oL/fqz6f+oBoAAGA3rYF2cXcCTtZ+10r/9Vq2eh4OHJPPS3pqH9raHwAA4Km0BtrF3Qs4Xdh1Qc9dGfn5n2p+wn+GrR4mmvlNO2cOywcndn469quN7PanTA8BTb/Ov/2E2qAn4fdbEeSv+rS/0NO9Fdb/2HOaaRdL+azEkeqltHpopR+eKLeOp77q+nbbVK90u15TXg6TZf8etX8q36bj7Jep3W6v6D4EAAAwrYF2cdcCzg/zTEt/x5dZLMhWF2Rd9Nuy3Lb0z3gWA7kD17ZK20/V9quJ0uSfT8y2ZRvTLIrySdU2+ecT7m0pQqc82/xE76leWUbnp+Mfx2tb0t90nurfVb9MdZ38LGDbVM/2n0QlAACAaA20i7sWcLIUGjLvnDie7O076uqdkhICxnkojj4tGvJCn6/48UXdlnWYBFyHOR+Hd9xMk69wyvRuu9+1mu8K9LEFif1z18vlua35WpJGZpGW9Rb5tPWM125Ziky3Rdavqsl6i+kVK91++8mynZlv5nHk7jAAAICJ1kC7uHsB12EprPozX4ab72Czn+OlpYDrumT8dJ8r4OwnsbJ65Yxs+rrTYWn9Uvn0m+LLph2nScjJnFe3y19vOl6/nzPDJOacPl/63NZtngRc2+Sf+dja3eawPlcAAABNa6BdvDoB568gbbn7I5OI6zwzfe8ePYeAs/XXlg5fCSpZulOsifzdl+P0zlbj3bipnucKuExr03F+VdvCsgVb0wLOlu6npEl3Ius+AAAAaFoD7eLuBZxMAsfmsB/95V9+yZ0iY4VMfzLIvPu3Ul2W89Wnv6o9EnCy/k2VresjnGf+Pq/T2PIrVNkk4GTdBtVHpvT+OrKFrsN13O3KvlX/yVTft19dx28ObZ23rNuYTGKs26tj119t9O/kuhy1980fGb5oh/JxG/L8r4QoAACAaQ20i7sWcCK/LjwVt91Nfq0q0SGbvoLLXbr2l60EXMZtv949SyxeZP2bNln/Bi7Duq4WWLL0z7ZPO0+ycwScyPr2H0byDybJqo0dnn42/+7N/hbvMv1r1v6qt8v3ec1291e/CDgAADhFa6Bd3J2Au0cQBgAAALdJa6BdIOCunGlnCQAAAG6D1kC7QMABAAAAXIjWQLtAwAEAAABciNZAu0DAAQAAAFyI1kC7QMABAAAAXIjWQLtAwF0ZelTFqYfWwuPQY0fUr9PjR+B10M9WhNcN6+wM6+RlaA20i7sUcGkddo3IpneAPpZ+B+lzcKq8tMm/46+QPfUibMtXc3Wcc/BbKNr/qcimt2g8FVn20VPre/TP537G361wzXWW9bt5n1rfc9PJjp4tee3IzhVgU1tlT11nT2Fr/0sjm95l/Rhk/WzO3TylXrdOa6Bd3K2AW1289PR9TdyjQaqLqp763/7izRP6P0+rB8AqnvP50Q9/+IaOr3wmf93lqB6upyeePvuVWas8mknAqX45qV1/HasOGab2dN8o3PFc3y5Pn30Bcv6rc2HrNJ0++8jixHUS2Rb3U9Y/+9ftsLv7RWVN/ewxM7XDaVXmamw5b7/GzX4y1VnHec5Vh+niojEn/6mvnZ/OocNdX/djPrTY9DnXp9zuox6LRwLO7ewLq/17TrmerkPn5zjZHvu7L3qsdlrXfwqbzslUrt1HOxOqW+dnVufT+crUnizDfaw+634T0xrlvLruieeIrEXNUT17DfJcyj7p/tKn6unzJr+us/173Oi8uR0d5nZ++vl8yzK9BuRNkeOqrdkv+uyx3W10vKzHdH6NynXfyjLMfTuNoelcilXbVW+Pt2mt8acs25x4TeibYlnmOa0d3XeZ/6o8t0V5d99Mdel8+tj9aP/VPLkWWgPt4mYEnN6o0BNuhQeILBekth8PF+u2U+GTKV4+wT/9V3l4IMpcZ79BIa3rk3jStn/6ZT7TsS3r0+aJ1tbl+i0Yjjudi07T4WlZbr4xwW9aSJvq78UjrePYjupxTl1PhbX5otM2tUPWF9o2+VnApfW7fNNUVr7xQtblrARcvvHEduQ/lS/rfNsmP9dR5v7SBUeW+azylNm/x/aUvnlMG7/z8cdfStu2Ot+yVZoUfWlZjuK0TW9msbmeq3XMa01e7B025dfmdnoep8lf57Stz43tqJ5t+Xq9c9bZyVr0rOKtwvK602b/1ZiazOcghWtb1nVaFzKd81vVwecm41jgyVrkTuawXm8clq+61Gsbfez8zsn7mmgNtIubEHCPOTkpGnKgOR9P4OlOKLEo6N0Em/OQabB1eRnP7rxI9+I5CTib4/XFtDkScJ5UmWf6G4ucVR0md5c3xf35Z589SGe3yjLu7wy3uxfwLEsLuD77tWGT4DjHrXz6FVxH/Zv+Mo8JWV/k8oKbi26P1xbAFl+rsSs7+gp19Zoyn3P32VO+QpX53Kl+vVujT/dnjvW+6Ez5pn+fg2xjtk/WNwzTcbq7v2XKP/0nbDrOc9Njvs9vpnefTH7dZuPzdqoP7Z9hMp/vbl/3Y4apDWrjOQLON9ydhyyF1JRH95Ut3b02ew3o/pL1bqMs17i+sbHblmHpnvzS3eLj1DViKjfHVPpP7mTl7zr17p3T2F+WfSxLoeZP26pMWeejT68HPX5z7cwy5N/9Kct1J8OuidZAu7g7AZfxeiLnHUVPaNN3hH23ZUu3B5DiOmwylelBm1vSspWA82A+h25v5q92+a7GcTKuFxbbdKdqtyzdXV6Xq+OuW+aTliKtJ3aGaSJ3WWnnCjjXq019ledzSpt+LchV92lBkaVI7TZOprB8R+1q7MqOBFze1YrVOX+qgGu/DEvLsZ676rJVWrtzDKcpLMeYPzvvaadGlum9e6d+8HpwdPPk+LaVcOnzkXWbBNzK3eetx1Dnb/8Mk+Ucz7DcvZRNbT9HwPm4BaKsy06T/1MEXK/dU3npl+tszptMn8eTe/I7Eml5U7gyhfUu2aqsdne92q/TyfocpoDrNNlnXt+8XvSud6ab3F5fu/wUsT0nM/wo72ujNdAubkLAedDniVsxWS+OedFOf0+83CF5FwHXi4bwoG9RtBJw0+K5okWSycGvyZIXAIV7scgLTy6weYGYFuMuL/Nsy3bKOl3m26LoSNxlXpl2EhzpnsJNX3BXcWVd19xt7bjZz9mO1Q5Zkl8Xd5jsSMDl+HRYno93FXDTzmDma3eW2Yv3lD79VxeJzr/jpLvDOp4sL2JH8ZMUh3L3+Vz1q6zXqI5nt/NY7eJ2uvTPMFmLKIflLodsWnfdx9POSh9Pa0aW3XmLFnBTHl12h0/lpd9qnbX18eSe/PK8d71bHGfYhK8XqzTtTlb+SddPlmO/52fujtnS3f3ssN5F1KfXoD6PeV5s6e46dVld/jXQGmgXNyHgzmW1cNvPthJwOZh9/FQBpx9UyjQYPaH7oqD4LmcScF7ElFcuCquL6NT+rGeGyTzZclHR7zMyTHZKwKmep/qp/abwKa5//Cs7R8DZTgk4hWd+MuXZF11bCtKpri1SUsDZbeu8VQ+PIZvj90V2NXY7P7mPBNzROXeY+j53isXUn1l2t9N+WsCnsX60GGe+k1+XlWHasew0Heco/eTO/uu8ZdO5sfX5nNIr/6PdD32muPK86LmQY9t4LChu/4nBIkFur1sOs2DMdazrvepHH09rRo/rzuMcASfrOdzHXYb++GC/o3W21+rOy27hOaE2TX9isHUb8+ce0xon05jKfrd13lmfDJvGgvtSc7v7WdZt73oLrxG+GfXOeNch85nWUJvHXYb1TUKH2+/IfS20BtrFXQm46QT3HbttuqvM8J5QHZ7uScCJHLB9h51fiWW4LO8G80eenliri+hjBdwUrgnvT/vnBaIX0qxf59dtfuzdZ//AdSXgMj/1uep4JOB8ntI/v37pnSRbj6UMXwm4zntKm/HzjjvHQcaVdT4dR8dHAk74XPY5z7Cuw9SfnSbDc1fKi/y7Crj073k8fW095T3VVXQf5a5Zh3X+tvxdabZ/9S+5jJN90/l3WZOAm8b2FCbL85116DUv0+X5yrp03+RxrxmyaaxlnBYWnUfvTGVdpnlqy3Xt1Dqb6VZuk2t9//bxaE6n6O+bpWndOOVOJsFk8vrT7U33dG4y7pG7w2R9XoX92r/zXJ3XI/e10BpoF3cl4F4T1zpQAe6VI/EKALCiNdAuEHAAAAAAF6I10C4QcAAAAAAXojXQLhBwAAAAABeiNdAuEHAAAAAAF6I10C4QcAAAAAAXojXQLhBwC/S3+HzAIAAAAMBjaQ20CwTcr87Pd5L1M3sei639AQAA4HXQGmgXdyfg9GBEIfHVD5LVAxX1MM188KXi+EnTTmv/fE+jUNp8Sbfj6dNvDEh/m4774bCZZz+U1v794M9sTz4stMsGAACA66A10C7uTsC19RP5047iyyyK/MqTtFV5ssm/n2C+qs+UdvLvV9HYWrQCAADAy9EaaBd3KeB83F+NSjTp07tjq3jOxwJO1q9K8mtPprB8Wbks8814GaZXm3iXzvX0i8vz9TpZVr8cu1/hAgAAAC9La6Bd3LWAa3e+Wy79zxFwbRmmdzxmuqOX7075N13PFHD5te7KOj8AAAB4GVoD7eKuBZx3sOyfYXl8joBbiS1ZvvxZdq6A6xdxT2lkKeCmFw13HgAAAHAdtAbaxV0KOJlElC39+1j4K1X9meDTTz55G8eiTZ8y/anAu2MWUrKVgHNchfefGLRrJ1Pejtd1s/9KwGV8/xFD1vkAAADAy9AaaBd3KeC8M9U7XDb9fq3FjUXa9CcG4V06WYoo2UrAZZktvDrP6atRhx8JuIyf9bV1XAAAAHg+WgPt4i4FXPsBAAAAvAStgXaBgAMAAAC4EK2BdnF3Ag4AAADgWmgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbQLBBwAAADAhWgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbQLBBwAAADAhWgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbQLBBwAAADAhWgNtAsEHAAAAMCFaA20CwQcAAAAwIVoDbSLFxFw77/33oMGAgAAANwTX/tc77QG2sWLCDjRjQQAAAC4J1r77OTFBNxXv/KVBw0FAAAAuAekc1r77OTFBJzoxgIAAADcA615dvOiAk50gwEAAABumdY6l+DFBZzohgMAAADcIq1xLsVVCDjBb+IAAADgVrn0b96aqxFw5sMPPnjQKQAAAADXyCUfFXLE1Qk4AAAAADgGAQcAAABwYyDgAAAAAG4MBBwAAADAjYGAAwAAALgxEHAAAAAANwYCDgAAAODGQMABAAAA3BgIOAAAAIAbAwEHAAAAcGMg4AAAAABuDAQcAAAAwI2BgAMAAAC4MRBwAAAAADcGAg4AAADgxkDAAQAAANwYCDgAAACAGwMBBwAAAHBjIOAAAAAAboxf+fDDD/9bewIAAADA1fKTX5ENAQAAAABwhbwRb18IuL/rQAAAAAC4Ov7mrYD7QsR1BAAAAAC4Ir4k3mwdCQAAAACug9ZtX7KODAAAAAAvS+u10T6P+DedEAAAAACenb9rnXbSPvroo382ZAQAAAAAF0QarHVZ2v8Pjhta5CYbiAYAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyIB6IgPqiQyoJzKgnsiAeiID6okMqCcyoJ7IgHoiA+qJDKgnMqCeyOD/ABX/sLvAFXQLAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,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>