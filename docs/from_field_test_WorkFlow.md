Clinical Note Recording & Handoff Workflow – Scope
1. Roles Involved

Nurse / Intake Staff

Provider (MD, DO, NP, PA)

(Optional) Support Staff / Additional Clinical Roles

Each user logs in with their own unique credentials.

2. Workflow Overview

A single patient visit generates one continuous note that multiple authorized users can contribute to sequentially. The note must remain open until the provider completes and closes it.

3. Detailed Workflow
Step 1 — Nurse Initiates Visit Note

Nurse logs into the application with their credentials.

Nurse selects the patient and opens a New Visit Note for that date.

System creates a note session with:

Visit ID

Patient ID

Note status: In Progress

Active user: Nurse

Nurse begins audio recording (if applicable).

Nurse completes:

Vitals

Patient demographics (if needed)

Reason for visit / Chief complaint

Any required triage forms

Step 2 — Nurse Stops Recording but Note Stays Open

Nurse stops the audio recording once intake is complete.

Note remains in In Progress state.

Nurse cannot close or finalize the note.

System logs:

Nurse as the initial contributor

Timestamp of intake completion

Step 3 — Provider Takes Over Note

Provider logs into the application with their own credentials.

Provider navigates to:

“Open Visits”

Selects the patient’s visit in In Progress state.

Provider opens the existing note started by the nurse.

Provider may:

Resume audio recording

Add assessment details

Perform exam documentation

Add plan, diagnoses, follow-up instructions

Step 4 — Provider Completes & Closes Note

Provider finishes all medical documentation.

Provider ends any additional recording segments.

Provider performs:

Final review

Sign-off

System changes note status to:

Completed / Closed

No further edits allowed unless:

Provider re-opens (if permissions allow)

Or addenda feature is enabled

4. Multi-User Access Requirements

Only one user edits the note at a time (lock mechanism recommended).

Each user must authenticate with their personal login.

Audit trails must show:

Who added what content

Recording start/stop times

All handoff events

5. Recording Logic Requirements

Recording segments can start/stop multiple times.

Recording must attach to the same visit note.

System must prevent recording from auto-stopping when user switches roles.

Avoid current behavior where the physical device is passed between staff.

6. Technical Requirements
Note State Machine

Draft → In Progress → Provider Review → Completed

Only provider role can advance to Completed.

Permissions

Nurse:

Create new note

Add intake data

Start/stop recording

Cannot close note

Provider:

Access any “In Progress” note

Continue recording

Edit all sections

Close note

7. Handoff & Continuity Requirements

Handoff must be digital, not via passing the device.

The system must maintain the continuous chain of:

Note context

Recording segments

Clinical documentation