Building out an MVP product for the TeleHealth project
objective:  have ready by tomorrow
            revise flowchart to understand functionality required
            review documentation for full project scope

Tech Stack:
Frontend / Backend:  NextJS (framework), REACT(library), TypeScript, Tailwind CSS
RAILWAY (for deployment)
HONO (for transcription service)
AI Model: On Replicate web platform / Whisper AI or any suitable model
Authentication: BetterAuth

Focus On:
Building out process for doctor using session hub, being able to record, create a patient profile, review/revise transcripts, upload recordings and files, edit / manage patient profiles

Overview:
A secure, web-based telehealth and electronic medical records (EMR) application designed for doctors serving patients in Jamaica’s underserved and storm-affected communities.

What it is:
A browser-based app (phone/tablet/computer) where clinicians can:
Log in securely
View and update patient profiles
Conduct telehealth consultations (video and/or audio)
Record and store clinical encounters as structured medical records

What it’s used for:
Enabling remote consultations when patients can’t easily access in‑person care
Capturing complete visit history:
Demographics and contact details
Past medical history, current complaints, medications, surgeries
Visit notes generated from recorded conversations using AI transcription
Providing a single, secure record that can be reused by multiple doctors over time
Supporting missions work (e.g., Christiana Friday missions) with consistent data capture
Impact / Why it matters
Expands access to qualified doctors (including international volunteers) for patients in remote or disaster-affected areas
Reduces reliance on paper charts and fragmented records, improving continuity of care
Frees doctors to focus on the patient instead of typing, by using AI to structure notes
Lays the foundation for future integration with:
Jamaican Ministry of Health systems
Local pharmacies and labs
Decision support (e.g., suggested diagnoses, labs, and medication safety checks)


---------------------

user interactions - doctor portal:

doctor logs in --> select session hub icon (navigation bar) --> session page opens --> tap 'start recording'icon --> system begins recording locally --> doctor makes real-time edits? --> if yes to real-time edits - correct AI misinterpretations --> if no to real-time edits or after corrections - decide if recording continues - if yes resume recording --> if finished recording --> hold stop recording icon --> system auto generates transcription --> audio file saved locally -- transcription available as AI generated form (analyzed, categorized and tabulated transcription) --> doctor reviews transcription and form --> tap save securely --> system encrypts session data --> store data in patient medical records --> doctor logs out

dashboard to session hub flow:

doctor dashboard --> manage session --> session hub --> begin session --> start recording --> recording in progress --> active recording --> end session --> stop recording --> view transcription view - access audio storage - review ai generated form

------------------------------------

MVP REQUIREMENTS – TELEHEALTH CLINICAL DOCUMENTATION APP
 (v1.0 Requirements Document)

1. Purpose & Scope
This MVP is a telehealth documentation tool that allows clinicians to:
Log into a secure web application.


Create and maintain a Patient Master Profile (Document 1).


Record or upload an audio conversation from a telehealth visit.


Automatically transcribe the audio.


Automatically populate a Visit Note (Document 2) from the transcript.


Review, edit, and approve the draft note.


Save the final note to a secure database, linked to the patient profile.


This document captures functional and non-functional requirements, including all data fields that must be supported in the MVP.

2. Users & Roles
2.1 Roles
Clinician (Doctor / Provider)


Can authenticate, manage their patient list, create/edit patient profiles, start visits, record/upload audio, review and finalize notes.


System Administrator


Manages user accounts and high-level configuration (no clinical editing for MVP, unless specified later).


For MVP, we can treat all clinical users with the same permissions.

3. Core User Flows
3.1 Login & Access
Clinician navigates to the app.


Enters credentials (e.g., email + password).


On success, lands on a Dashboard showing:


Recent patients


Recent visits


Draft notes pending review.


3.2 Create / Edit Patient Profile (Document 1)
From dashboard, clinician clicks “New Patient” or selects an existing patient to edit.


Clinician fills in required Patient Intake fields.


System validates required fields and saves a Patient Master Profile record.


3.3 Start a New Visit
Clinician selects a patient.


Clicks “Start New Visit”.


Fills minimal Visit Metadata (visit date/time, visit type, location, clinician name).


Chooses to:


Record Audio inside the app, or


Upload Audio File (e.g., from another system).


3.4 Transcription & Draft Note Creation
After recording/upload is complete, clinician clicks “Transcribe”.


System:


Sends audio for transcription.


Receives full transcript.


Uses rules/AI to map transcript into structured fields of the Visit Note (Document 2):


Chief complaint


HPI


Relevant ROS findings


Assessment (diagnoses)


Plan (medications, tests, referrals)


System creates a Draft Visit Note linked to the patient, with status = “Pending Review”.


3.5 Review & Edit Draft Note
Clinician opens the draft note, seeing:


Structured form fields pre-filled.


Full transcript.


Clinician can:


Edit any field (including adding vitals, exam findings, etc.).


Add missing information directly into fields.


When satisfied, clinician clicks “Finalize & Sign”.


System:


Captures electronic signature metadata (user ID, timestamp).


Updates note status to “Finalized”.


Locks the note from further edits (or restricts edits to addenda).


3.6 View Patient History
Clinician opens a Patient Profile.


Can view:


Basic Patient Intake data.


List of all past visits.


Can click a visit to open the finalized visit note.



4. Functional Requirements
4.1 Authentication & User Management
Login


FR-1: Support secure login for clinicians (username/email + password).


FR-2: Passwords must be stored securely (hashed).


Session Management


FR-3: Implement session timeout / auto-logout after inactivity.


Account Management


FR-4: System admin can create, deactivate, or reset clinician accounts.



4.2 Patient Master Profile (Document 1)
The system must support creation and update of a Patient Master Profile with the following fields.
4.2.1 Patient Identity
Full Legal Name (required)


Date of Birth (required)


Sex at Birth (required)


Gender Identity (optional)


National ID / Passport / Local Equivalent (optional)


Address (required)


Phone Number(s) (at least one required)


Email Address (optional but recommended)


Emergency Contact Name (optional for MVP, but field present)


Emergency Contact Phone


Relationship to Emergency Contact


4.2.2 Demographic Information
Race / Ethnicity (optional)


Primary Language (required)


Interpreter Needed? (Yes/No)


Employment Status (optional)


Occupation (optional)


4.2.3 Preferred Pharmacy Information
Pharmacy Name


Pharmacy Address


Pharmacy Phone Number


Pharmacy Electronic ID (if applicable)


(Section can be optional depending on context, but model must support these fields.)
4.2.4 Insurance Information (If Applicable)
Insurance Provider


Policy Number


Group Number


Subscriber Name


Subscriber Date of Birth


(For Jamaica/non-insurance systems, UI may hide this, but the data model must support these fields.)
4.2.5 Allergies
Medication Allergies: list entries with:


Medication Name


Reaction Description


Food Allergies: list entries with:


Food Item


Reaction Description


Environmental Allergies: list entries with:


Allergen


Reaction Description


“No Known Allergies” (boolean flag – when true, indicates no allergies recorded)


4.2.6 Current Medications
Each medication entry must store:
Name


Dose (e.g., “10 mg”)


How Often Taken (frequency)


Reason for Medication


Prescribing Clinician (if known)


4.2.7 Past Medical History
Structured flags or entries for:


Diabetes


High blood pressure (Hypertension)


Asthma


Heart disease


Epilepsy


Kidney disease


Free-text field for additional conditions / details.


4.2.8 Past Surgical History
For each surgery:
Type of Surgery


Year


Complications (if any; free text)


4.2.9 Social History
Tobacco Use: (never / former / current)


Alcohol Use: (none / occasional / weekly / daily)


Drug Use: (none / type / frequency – free text + structured options)


Living Situation: (alone / with family / with caregiver / other text)


Access to Transportation (yes/no/free text)


Access to Clean Water and Electricity (yes/no/free text)


Occupational Hazards (free-text description; optional list of hazards)


4.2.10 Family Medical History
Heart Disease (free text / yes-no + details)


Diabetes


Cancer (type – free text)


Stroke


Genetic Conditions


Free-text field for additional family history information.


4.2.11 Immunization History
          Integrates with MOH reporting system if available and follows rules of reporting
Flu shot (date)


Pneumonia vaccine (date)


Tetanus (date)


List of all vaccinations available on government immunization schedule website (ex: CDC)


4.2.12 Consent & Communication Preferences
Consent to Telehealth (Yes/No)


Consent to Electronic Messaging (Yes/No)


Preferred Communication Method (phone / SMS / WhatsApp / email)


Consent for Data Sharing Within ICF Mission Framework (Yes/No)



4.3 Visit Note (Document 2)
Each Visit Note is linked to a specific patient and a specific clinician.
4.3.1 Visit Metadata
Visit ID (system-generated)


Patient ID (FK to Patient Profile)


Visit Date


Visit Start Time


Visit End Time (optional for MVP – can be derived)


Visit Type (enum):


Telehealth (video)


Telehealth (audio only)


In-person


Home visit


Clinician Name & Credentials (or Clinician ID referencing user account)


Location (clinic, home, community site, etc.)


Interpreter Used? (Yes/No)


4.3.2 Chief Complaint
Chief Complaint (single sentence free text)


4.3.3 History of Present Illness (HPI)
HPI Narrative (free text – main descriptive field)


Additional structured fields (optional but supported):


Symptom Onset (when symptoms started)


Symptom Location


Severity (mild / moderate / severe)


Symptom Course (improving / worsening / unchanged)


Factors that improve or worsen symptoms


Associated symptoms (free text or list)


Impact on daily activities (free text)


4.3.4 Review of Systems (ROS)
For each body system, store:
System Name


Symptom(s) Present? (Yes/No)


If Yes, a list / free text.


Core systems (minimum):
General: fever, chills, weight loss


Respiratory: cough, shortness of breath


Cardiac: chest pain, palpitations


GI: nausea, vomiting, diarrhea


Neurologic: headache, dizziness


Psychiatric: anxiety, depression


MVP may treat ROS as a structured checklist with multi-select and notes.
4.3.5 Vitals
If collected (in-person or patient-reported), store:
Blood Pressure


Heart Rate


Respiratory Rate


Temperature


Oxygen Saturation


Weight


Height


All vitals are optional per visit but must be supported.
4.3.6 Physical Exam
For MVP, store:
General Appearance (free text; with “normal/abnormal” quick toggle)


Eyes (free text + normal/abnormal)


Respiratory (free text + normal/abnormal)


Skin (free text + normal/abnormal)


Neurologic (free text + normal/abnormal)


Additional Exams (free text fields; optional sections for heart, abdomen, etc.)


Clinician must be able to specify normal vs abnormal for each section and add details.
4.3.7 Assessment (Diagnosis / Problem List)
For each diagnosis:
Diagnosis Name (free text, eventually mappable to a code)


Optional: ICD-10 or local code (free text for MVP)


There can be multiple diagnoses per visit.
4.3.8 Plan
For each diagnosis or overall visit:
Medications Prescribed:


Name


Dose


Frequency


Duration


Tests Ordered:


Type (labs, imaging, etc.)


Name / description


Referrals:


Specialty / destination


Reason / notes


Home Care Instructions (free text)


Follow-up Timeframe (e.g., “2 weeks”, date, or free text)


4.3.9 Orders (Structured)
Orders should be stored as structured objects, linked to the visit:
Order ID


Visit ID


Order Type:


Medication Order


Laboratory Order


Imaging Order


Procedure


Vaccination


Order Details (name, dose, parameters as needed)


Status (pending / completed / canceled)


Result Attachments:


File references (PDF, image, etc.)


Structured results (where applicable; free-text for MVP)


4.3.10 Clinician Signature & Finalization
Clinician ID


Electronic Signature Timestamp


Visit Note Status:


Draft / Pending Review / Finalized


Once status is “Finalized”, editing is restricted (e.g., only allow Addendum field).



4.4 Audio, Transcription, and Automation
4.4.1 Audio Capture & Upload
FR-5: Clinician must be able to record audio within the app for a visit.


FR-6: Clinician must be able to upload an audio file for the visit (supported formats defined later).


FR-7: Audio files are stored securely and tied to:


Patient ID


Visit ID


4.4.2 Transcription
FR-8: Clinician can trigger a “Transcribe” action for the recorded/uploaded audio.


FR-9: The system must:


Store the full raw transcript.


Associate the transcript with the Visit.


4.4.3 Automated Draft Note Creation
FR-10: After transcription, the system generates a Draft Visit Note by:


Filling Chief Complaint (if identifiable).


Filling HPI narrative.


Extracting key ROS items if possible.


Suggesting Assessments (diagnoses) when clearly mentioned.


Suggesting Plan items (meds, tests, referrals) when mentioned.


FR-11: The system flags uncertain or low-confidence fields for clinician attention (e.g., highlight or label “Review needed”).


FR-12: Clinician must be able to override or delete any auto-filled data.



4.5 Dashboards & Navigation
FR-13: Provide a Clinician Dashboard showing:


Recent patients.


Draft visit notes (Pending Review).


Recently finalized visits.


FR-14: Provide search/filter:


By patient name.


By date range.


By note status (draft vs finalized).



4.6 Audit Trail
FR-15: For each Visit Note, track:


Created by, created at.


Last edited by, edited at.


Finalized by, finalized at.


FR-16: For each Patient Profile, track:


Created by, created at.


Last updated by, updated at.



5. Non-Functional Requirements
5.1 Security & Privacy
NFR-1: All data in transit must be encrypted (e.g., via HTTPS/TLS).


NFR-2: All sensitive patient data must be stored encrypted at rest.


NFR-3: Implement role-based access control (RBAC) at minimum:


Clinicians can access only patient records they are authorized to see (MVP assumption: single clinic, all clinicians share access, but architecture should allow future restriction).


NFR-4: Audio and transcripts are treated as protected health information (PHI) and safeguarded accordingly.


NFR-5: System must comply with applicable health data protection laws in operating regions (e.g., HIPAA-like standards, local Data Protection Acts).


5.2 Reliability & Performance
NFR-6: The system should handle concurrent use by multiple clinicians.


NFR-7: Transcription completion time should be reasonable for a typical visit audio (e.g., not instantaneous, but the UX must clearly show progress/loading).


NFR-8: Automatic data saving / draft saving must prevent data loss if the browser closes or the network drops mid-edit.


5.3 Scalability & Extensibility
NFR-9: System must be architected so it can later:


Support multiple clinics or organizations.


Integrate with external e-prescribing or lab systems.


NFR-10: Data model must be extensible (e.g., adding new fields or sections without breaking existing records).


5.4 Logging & Monitoring
NFR-11: System must log:


Authentication events.


Key actions (create/update/finalize notes, profile edits).


NFR-12: Provide basic monitoring for uptime and errors (even if simple logs in MVP).



6. Data Model Relationship Summary
Patient Profile (Document 1)


“Master” record created once and updated occasionally.


Contains identity, demographics, allergies, medical histories, consents, etc.


Visit Note (Document 2)


Created per encounter.


Linked to Patient Profile by Patient ID.


Contains visit metadata, HPI, ROS, exam, assessment, plan, orders, and clinician signature.


Audio & Transcript


Each audio file links to exactly one Visit.


Each transcript links to exactly one Visit.


The transcript is the source text used to populate the Draft Visit Note.

----------------------------

Purpose & Vision:
Provide virtual access to doctors for patients in remote and storm-affected areas.
Replace or augment paper charts with a secure electronic medical record (EMR).
Make the system an “AI assistant” for doctors, so they can focus on patients.

Core MVP Scope (for Friday mission):
Doctor login via a web app (phones first; tablets later).
Ability to add patients and create a basic patient record.
Record doctor–patient conversations (audio) during visits.
Use AI transcription + LLM to:
Turn recordings into text.
Auto-fill a structured patient form (history, meds, problems, etc.).
Very simple but secure storage of medical records, compliant with Jamaican regulations.
Telehealth & Workflow Considerations

Long-term: secure video consultations integrated with the record system.
Doctors should look at the patient, not the tablet; system does the documentation.

Future capabilities:
Review prior visits, labs, meds before/during a consultation.
AI suggestions for diagnoses, labs, meds, and safety checks (e.g., allergies).

-----------------------------------------------------------------------------------------

AI-powered patient intake system records voice input and auto-populates fields
Real-time editing capability while AI processes information
Search functionality to retrieve past patient records
Shows allergies, complaints, and visit details
Patient Record Management & Status Tracking
Need to implement record status system: “In Review” → “Record Complete”
Human verification required due to expected AI transcription errors
Accent, tonality, device quality, background noise will cause issues
Patient email verification suggested for address/contact accuracy
Medical record numbers assigned automatically (00001, 00002, etc.)

Visit Notes Structure & Requirements:
Current visit interface allows AI dictation or manual typing
Document upload capability for patient-provided medication lists

Requirements for visit note review:
Accuracy verification of AI-generated content
Historical context - what happened in previous visits
Changes made by other doctors since last visit
Assessment and plan from other providers
Need integrated medication management
Chart updates when medications stopped/started during visit
Real-time reflection of current vs. historical medications
UI Design Feedback from Medical Record Systems

Current system limitations and Preferred improvements:
Combine vitals (BMI, height, weight) into single organized section
Integrated lab work with trend visualization and graphing
Collapsible sidebar navigation for optional information
Tabbed interface for different data categories

Style Guide / Mini Design System
 Color Palette
Color Name
Hex Code
Usage
Primary
#004e98
Main brand color, buttons, links
Primary Focus
#3a6ea5
Hover / focus states
Background Light
#ebebeb
Page backgrounds
Text Primary
#050609
Main text color
Text Secondary
#6b7280
Secondary text, captions
Border Light
#c0c0c0
Input borders, dividers


Typography
Element
Font Family
Size
Weight
Use Case
Heading 1
SF Pro
32px
Bold
Page titles, main headings
Heading 2
SF Pro
24px
Bold
Section headings
Heading 3
SF Pro
18px
Medium
Subsection headings
Body / Paragraph
SF Pro
16px
Regular
Paragraph text, instructions
Caption / Small
SF Pro
14px
Regular
Labels, hints, secondary info


Buttons
Type
Color / Style
Hover / Focus
Disabled
Primary
Background: #004e98, Text: #FFFFFF
Background: #3a6ea5
Background: #c0c0c0, Text: #FFFFFF
Secondary
Background: #ebebeb, Text: #004e98
Background: #d9d9d9
Background: #f0f0f0, Text: #6b7280



Spacing Rules
Type
Pixels
Usage
Small
8px
Between elements inside a card or row
Medium
16px
Standard spacing between sections
Large
32px
Page sections / vertical separation
Extra
64px
Major layout gaps or hero sections


Components
Component
Notes / Usage
Card
Rounded corners 0.75rem, background #FFFFFF, shadow for elevation
Navbar
Background #004e98, text #FFFFFF, horizontal menu, optional icons
Modal / Dialog
Centered, overlay #00000050, rounded 0.75rem, padding 24px, include close button
Input Fields
Rounded 0.5rem, border #c0c0c0, background #FFFFFF, padding 12px, focus: border #3a6ea5

---------------------------------------------------------------------------------------------------------------

The system aims to reduce workload on medical staff, improve patient access to personal health information and maintain full compliance with the Jamaica Data Protection Act.
Who the Users Are
Primary Users
Doctors: Need a fast, simple interface for managing patient records, recording consultations and reviewing medical history.
Patients: Need secure, view-only access to their medical records, prescriptions and past consultations.
Secondary Users
Administrators:
Responsible for managing users, performing audits, and maintaining system security.
