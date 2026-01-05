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
