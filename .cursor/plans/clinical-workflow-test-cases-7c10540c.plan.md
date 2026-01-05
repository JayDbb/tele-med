<!-- 7c10540c-9075-42f8-9a09-cc3d61c244a2 533fbda5-aeb6-4f86-8247-77c4043b4388 -->
# Clinical Workflow Test Cases

## Overview

This document provides realistic clinical workflows for testing the telemedicine platform. Each workflow includes step-by-step instructions that can be reenacted in the application to test functionality and UI flow.

## System Understanding

Based on codebase analysis:

- **Nurse Role**: Can register new patients, collect intake data, start visits, document vitals/initial assessment, assign patients to doctors
- **Doctor Role**: Can view assigned patients, complete visits, use audio dictation/transcription, finalize notes, manage visit queue
- **Key Features**: Audio recording/transcription, SOAP note forms, patient profiles, visit history, scheduling, patient assignment
- **Visit Statuses**: draft, waiting, completed
- **Visit Sections**: Subjective (Chief Complaint, HPI), Objective (Vitals, Exam Findings), Assessment & Plan, plus Vaccines, Family History, Risk Flags, Surgical History, Past Medical History, Orders

---

## NURSE WORKFLOWS

### Workflow 1: New Patient Registration & Initial Intake

**Purpose**: Test complete patient registration and initial visit documentation

**Steps**:

1. Log in as Nurse
2. Navigate to Nurse Portal → Create New Patient
3. Fill in Patient Registration:

- Full Name: "Sarah Johnson"
- DOB: 1985-03-15
- Gender: Female
- Phone: (555) 123-4567
- Email: sarah.johnson@email.com
- Allergies: "Penicillin, Shellfish"
- Address: "123 Main St, City, State 12345"

4. Upload profile photo (optional)
5. Upload documents (insurance card, previous records) if available
6. Start Visit Note:

- Chief Complaint: "Annual physical examination"
- HPI: "Patient presents for routine annual physical. No acute concerns. Last physical was 1 year ago."

7. Document Vitals:

- BP: 120/80
- HR: 72
- Temp: 98.6°F
- Weight: 145 lbs

8. Physical Exam Findings: "General appearance: Well-appearing female in no acute distress. HEENT: Normal. Lungs: Clear bilaterally. Heart: Regular rate and rhythm."
9. Save Patient & Visit
10. Assign patient to a doctor (optional at this stage)

**Expected Results**:

- Patient profile created with MRN
- Visit note saved in draft status
- Patient appears in nurse's patient list
- Can assign to doctor

---

### Workflow 2: Acute Care Visit - Nurse Intake

**Purpose**: Test nurse intake for urgent/acute visit

**Steps**:

1. Log in as Nurse
2. Select existing patient OR create new patient if walk-in
3. Start New Visit
4. Document Chief Complaint: "Chest pain, started 2 hours ago"
5. HPI: "45-year-old male presents with sudden onset chest pain. Pain is substernal, pressure-like, 7/10 severity. Started while at rest. Associated with mild shortness of breath. No radiation. Denies nausea, diaphoresis."
6. Document Vitals:

- BP: 150/95
- HR: 98
- Temp: 99.1°F
- Weight: 180 lbs

7. Physical Exam: "Patient appears anxious but alert. Skin: Slightly diaphoretic. Lungs: Clear to auscultation. Heart: Tachycardic, regular rhythm. No murmurs."
8. Risk Flags Section:

- Tobacco Use: Current
- Tobacco Amount: "1 pack per day"
- Alcohol Use: Social
- Housing Status: Stable
- Occupation: "Construction Worker"

9. Past Medical History:

- Condition: "Hypertension"
- Status: Active
- Diagnosed Date: 2020
- Impact: High
- ICD-10: I10
- Source: Clinician

10. Save Visit (status: draft)
11. Assign to available doctor immediately

**Expected Results**:

- Visit created with urgent information
- Patient appears in doctor's assigned patients queue
- All clinical data properly saved

---

### Workflow 3: Vaccination Visit Documentation

**Purpose**: Test vaccine administration documentation

**Steps**:

1. Log in as Nurse
2. Select patient (existing or new)
3. Start New Visit
4. Chief Complaint: "Influenza vaccination"
5. Document Vitals (routine)
6. Expand Vaccines Section:

- Vaccine: "Influenza (Flu)"
- Date: Today's date
- Dose: Booster
- Site: Left Deltoid
- Route: Intramuscular (IM)
- Lot Number: "FL2024-12345"
- Manufacturer: "Pfizer"

7. Physical Exam: "Left deltoid area: No redness, swelling, or induration. Injection site clean."
8. Save Visit

**Expected Results**:

- Vaccine information properly documented
- Visit note includes vaccine details
- Can be viewed in patient's vaccine history

---

## DOCTOR WORKFLOWS

### Workflow 4: Review & Complete Nurse-Initiated Visit

**Purpose**: Test doctor completing a visit started by nurse

**Steps**:

1. Log in as Doctor
2. Navigate to Dashboard → My Patients
3. View assigned patient (from Workflow 2 - Acute Care)
4. Review nurse's documentation:

- Read Chief Complaint and HPI
- Review vitals
- Review physical exam findings

5. Open Visit Note
6. Use Audio Dictation:

- Click "Start Recording"
- Dictate: "Patient is a 45-year-old male with acute onset chest pain. EKG shows normal sinus rhythm, no acute ST changes. Troponin ordered. Assessment: Chest pain, rule out cardiac etiology. Plan: Order EKG, troponin, chest X-ray. If negative, likely musculoskeletal. Prescribe ibuprofen 600mg TID for 3 days. Follow up in 24 hours or return if symptoms worsen."
- Stop Recording

7. Wait for transcription and auto-population
8. Review auto-filled Assessment & Plan sections
9. Edit if needed:

- Assessment: "Chest pain, likely musculoskeletal vs cardiac. EKG normal. Awaiting troponin results."
- Plan: "1. EKG - normal, no acute changes. 2. Troponin ordered. 3. Chest X-ray ordered. 4. Ibuprofen 600mg TID x 3 days. 5. Return to ED if chest pain worsens or new symptoms. 6. Follow up in 24 hours with results."

10. Expand Orders Section:

- Order Type: Lab
- Priority: Urgent
- Details: "Troponin, CK-MB, BNP"
- Status: Pending
- Date Ordered: Today

11. Add additional notes if needed
12. Save Visit
13. Finalize/Sign Note (if available)

**Expected Results**:

- Audio transcribed and parsed correctly
- SOAP note sections auto-populated
- Visit status changes to completed
- Orders properly documented

---

### Workflow 5: Complete New Patient Visit with Full Documentation

**Purpose**: Test doctor handling entire visit from start to finish

**Steps**:

1. Log in as Doctor
2. Navigate to Patients → Select patient (from Workflow 1 - New Patient)
3. Start New Visit
4. Use Audio Dictation for entire visit:

- Start Recording
- Dictate comprehensive visit: "This is a 39-year-old female presenting for annual physical examination. Chief complaint: Routine health maintenance. History of present illness: Patient is generally healthy, exercises regularly, follows a balanced diet. No acute concerns. Review of systems: Constitutional: No fever, chills, weight loss. Cardiovascular: No chest pain, palpitations. Respiratory: No shortness of breath, cough. Gastrointestinal: No abdominal pain, normal bowel movements. Past medical history: None significant. Family history: Mother with Type 2 diabetes, father with hypertension. Social history: Non-smoker, social alcohol use, 2-3 drinks per week. Physical examination: Vital signs as documented. General: Well-appearing female in no acute distress. HEENT: Normocephalic, atraumatic. Eyes: PERRLA, EOMI. Throat: No erythema or exudate. Neck: No lymphadenopathy, no thyromegaly. Cardiovascular: Regular rate and rhythm, no murmurs. Lungs: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, non-distended. Extremities: No edema. Assessment: Healthy 39-year-old female, routine physical examination. Plan: 1. Routine labs: CBC, CMP, lipid panel, TSH. 2. Mammogram recommended per age-appropriate screening. 3. Continue healthy lifestyle. 4. Return in 1 year for annual physical."
- Stop Recording

5. Review transcription and auto-populated fields
6. Expand and fill Family History:

- Relationship: Mother
- Status: Living
- Conditions: "Type 2 Diabetes"

7. Expand Risk Flags:

- Tobacco Use: Never
- Alcohol Use: Social
- Alcohol Frequency: "2-3 drinks per week"
- Housing Status: Stable
- Occupation: "Marketing Manager"

8. Expand Orders:

- Order Type: Lab
- Priority: Routine
- Details: "CBC, CMP, Lipid Panel, TSH"
- Status: Pending

9. Review all sections
10. Save and Finalize Visit

**Expected Results**:

- Complete visit documented
- All sections properly filled
- Visit finalized and saved to patient record

---

### Workflow 6: Follow-Up Visit with Medication Management

**Purpose**: Test follow-up visit with prescription documentation

**Steps**:

1. Log in as Doctor
2. Select existing patient with previous visits
3. Review patient history (previous visits, medications, allergies)
4. Start New Visit
5. Chief Complaint: "Follow-up for hypertension management"
6. HPI: "Patient returns for 3-month follow-up of hypertension. Currently on lisinopril 10mg daily. Reports good medication compliance. BP today improved from last visit."
7. Document Current Vitals:

- BP: 128/82 (improved from 150/95)
- HR: 68
- Temp: 98.4°F
- Weight: 178 lbs (down 2 lbs)

8. Physical Exam: "General: Well-appearing. Cardiovascular: Regular rate and rhythm. No murmurs. Lungs: Clear."
9. Use Audio Dictation:

- "Assessment: Hypertension, well-controlled on current medication. Plan: Continue lisinopril 10mg daily. Increase to 20mg if BP not at goal in 3 months. Recheck BP in 3 months. Continue low-sodium diet and regular exercise."

10. Review auto-populated Assessment & Plan
11. Expand Past Medical History:

- Condition: "Hypertension"
- Status: Active
- Impact: Medium (now well-controlled)

12. Document medication in Plan section: "Continue Lisinopril 10mg PO daily"
13. Save and Finalize Visit

**Expected Results**:

- Follow-up visit properly documented
- Medication management tracked
- Patient history accessible for review

---

## COLLABORATIVE WORKFLOWS

### Workflow 7: Nurse Intake → Doctor Completion (Full Handoff)

**Purpose**: Test complete collaborative workflow

**Steps - Nurse Side**:

1. Nurse logs in
2. Creates new patient: "Michael Chen", DOB: 1978-06-20, Male
3. Starts visit with Chief Complaint: "Lower back pain, 3 days duration"
4. Documents HPI: "Patient reports lower back pain started 3 days ago after lifting heavy box. Pain is localized to lower lumbar region, 6/10 severity. No radiation to legs. No numbness or tingling."
5. Documents Vitals: BP 130/85, HR 75, Temp 98.7°F, Weight 195 lbs
6. Physical Exam: "General: Patient ambulates with slight discomfort. Musculoskeletal: Tenderness to palpation over L4-L5 region. No neurological deficits. Straight leg raise negative bilaterally."
7. Risk Flags: Occupation: "Warehouse Worker"
8. Saves visit (status: draft)
9. Assigns patient to available doctor

**Steps - Doctor Side**:

1. Doctor logs in (different session/browser)
2. Views assigned patient in Dashboard
3. Opens visit note (sees nurse's documentation)
4. Reviews nurse's intake notes
5. Uses Audio Dictation:

- "Reviewing nurse's documentation. Patient has acute lower back pain, likely musculoskeletal strain from lifting. No red flag symptoms. Assessment: Acute lower back pain, likely musculoskeletal strain. Plan: 1. Ibuprofen 600mg TID with food x 5 days. 2. Ice for first 48 hours, then heat. 3. Avoid heavy lifting for 1 week. 4. Physical therapy referral if not improved in 1 week. 5. Return if symptoms worsen or neurological symptoms develop."

6. Reviews auto-populated sections
7. Expands Orders:

- Order Type: Medication
- Priority: Routine
- Details: "Ibuprofen 600mg TID x 5 days"
- Status: Pending

8. Adds Surgical History (if relevant): None
9. Finalizes and signs visit note

**Expected Results**:

- Seamless handoff between nurse and doctor
- Both contributions visible in final note
- Visit properly completed

---

### Workflow 8: Urgent Visit with Queue Management

**Purpose**: Test doctor queue management and urgent visit processing

**Steps - Nurse Side**:

1. Nurse logs in
2. Creates/selects patient
3. Starts urgent visit
4. Documents: "Fever and cough, 2 days. Temp 101.5°F"
5. Assigns to doctor (doctor may be busy/unavailable)
6. Visit status: "waiting"

**Steps - Doctor Side**:

1. Doctor logs in
2. Views dashboard with waiting patients in queue
3. Toggles availability to "Available" (if was busy)
4. Processes next patient in queue (changes status from "waiting" to "draft")
5. Completes visit documentation
6. Finalizes visit
7. Processes next patient if queue has more

**Expected Results**:

- Queue management works correctly
- Visit status transitions properly
- Doctor can process multiple patients

---

## TESTING CHECKLIST

### Nurse Functionality

- [ ] Patient registration with all required fields
- [ ] Document upload (photos, documents)
- [ ] Visit note creation
- [ ] Vitals documentation
- [ ] SOAP note sections (Subjective, Objective)
- [ ] Additional sections (Vaccines, Family History, Risk Flags, etc.)
- [ ] Patient assignment to doctor
- [ ] Draft saving and auto-save
- [ ] Patient list filtering (All, My Patients, Waitlist, Completed)

### Doctor Functionality

- [ ] View assigned patients
- [ ] Audio recording and transcription
- [ ] Auto-population from transcription
- [ ] Manual note editing
- [ ] Assessment & Plan documentation
- [ ] Orders creation
- [ ] Visit finalization
- [ ] Queue management (waiting → draft → completed)
- [ ] Availability toggle
- [ ] Review of nurse's documentation

### System Features

- [ ] Role-based access (nurse vs doctor permissions)
- [ ] Patient sharing/assignment
- [ ] Visit status workflow
- [ ] Data persistence (draft saving)
- [ ] Search functionality
- [ ] Patient history viewing
- [ ] Visit history viewing

---

## Notes for Testing

1. **Audio Dictation**: Speak clearly and include medical terminology. The system should parse common medical terms, vitals, medications, and diagnoses.

2. **Data Entry**: Test both manual entry and auto-population from transcription to ensure flexibility.

3. **Error Handling**: Test with incomplete data, invalid entries, and edge cases.

4. **UI Flow**: Pay attention to navigation, form validation, and user feedback during testing.

5. **Collaboration**: Test with two different user accounts simultaneously to verify handoff workflows.

6. **Performance**: Note any delays in transcription, auto-save, or data loading.