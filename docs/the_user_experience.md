Digital Medical Records MVP 
Executive and Developer Overview 
1. Purpose 
This MVP creates a simple digital tool for doctors to record visits, generate structured 
medical notes from conversation, and store them under a patient profile. 
Only doctors will use the system. 
2. MVP scope 
Doctor actions 
1. Sign in using email only 
2. Create a patient 
3. Select patient 
4. Start a visit 
5. Record the conversation 
6. System creates transcript and structured medical note 
7. Doctor reviews and saves the visit 
Outputs 
● Audio 
● Transcript 
● Structured extraction of key medical information 
● Saved under that patient profile by date 
3. User journey 
3.1 Sign in 
● Doctor enters only their email 
● If email exists in the system, they are signed in 
● No password for MVP 
● Doctor lands on a simple dashboard with: 
○ Recent patients (this will be empty at first) 
○ Button to create new patient 
Doctors cannot create a visit unless they select or create a patient. 
4. Patient management 
4.1 Creating a patient 
Doctor enters: 
● Full name 
● Sex (simple toggle M or F) 
● Contact number 
This creates the patient profile. 
4.2 Patient profile layout 
Shows: 
● Name 
● Sex 
● Contact 
● List of visits by date 
5. Visit flow 
5.1 Start a visit 
From a patient profile, doctor taps “Start visit”. 
System automatically creates a visit record with: 
● Visit ID generated from date and time 
● Patient name 
● Doctor name 
● Date 
● Empty fields waiting for audio, transcript, and extracted data 
Doctor is taken to the recording interface. 
5.2 Recording 
Doctor taps “Record”. 
A normal conversation takes place. 
The doctor collects: 
● Past medical history 
● Current symptoms 
● Physical exam findings (if spoken aloud) 
● Diagnosis or working diagnosis 
● Treatment plan 
● Prescription if relevant 
Doctor taps “Stop” when finished. 
5.3 Processing 
After stopping the recording: 
1. Audio is uploaded 
2. Speech to text model creates full transcript 
3. LLM processes the transcript and extracts: 
○ Past medical history 
○ Current symptoms 
○ Physical exam findings 
○ Diagnosis or working diagnosis 
○ Treatment plan 
○ Prescriptions 
4. System generates: 
○ Full transcript 
○ Structured JSON 
○ Short readable summary for review 
6. Review and save 
The visit screen updates to show: 
● Summary 
● Structured fields 
● Transcript 
● Option to replay audio (if desired later) 
Doctor can: 
● Edit any extracted field 
● Edit diagnosis or treatment 
● Add notes 
● Approve and save the visit 
Saved visit appears under the patient profile with: 
● Date 
● Summary preview 
● Full record inside 
7. Data model 
Doctor 
● Name 
● Email 
● Contact number 
Patient 
● Full name 
● Sex (M or F) 
● Contact number 
● List of visits 
Visit 
● Visit ID from date and time 
● Patient name 
● Doctor name 
● Date and time 
● Audio file 
● Transcript 
● Structured data (JSON) 
● Summary text 