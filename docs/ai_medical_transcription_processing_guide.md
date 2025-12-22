# AI Medical Transcription Processing Guide

## Purpose
This document explains **how an AI assistant should handle a medical visit transcription** and reliably transform it into multiple clinical artifacts:

- Structured clinical extraction
- Medical summary
- Dialogue-formatted transcription
- SOAP note
- ICD-10 suggestions
- Nurse → Physician handoff (SBAR)
- EHR-ready progress note
- Automation-ready prompt template

This guide is designed for **clinical workflows**, **medical AI systems**, and **documentation automation**.

---

## 1. Input Requirements

### Accepted Input
- Verbatim transcription of a patient–provider encounter
- Speaker attribution preferred (Doctor / Patient), but AI may infer if needed

### Input Constraints
- Do **not** correct clinical content
- Do **not** invent history, diagnoses, or treatments
- Preserve uncertainty and pending evaluations

---

## 2. Core Extraction Targets

From every transcription, extract **only what is explicitly stated**.

### A. Patient Medical History
- Family history
- Social history (diet, exercise, stress, occupation)
- Past medical or surgical history (if mentioned)
- Medications and allergies (if mentioned)

### B. Symptoms (HPI)
Use standard **History of Present Illness** structure:
- Chief complaint
- Duration
- Triggers (e.g., exertion)
- Associated symptoms
- Absence of symptoms when relevant

### C. Doctor Assessment / Diagnosis
- Working diagnosis or concern
- Rule-outs or differential if stated
- Diagnostic reasoning

### D. Treatment Plan
- Diagnostics ordered
- Medications (if any)
- Lifestyle recommendations
- Activity restrictions
- Patient education
- Follow-up plan

---

## 3. Dialogue Formatting Rules

Always display the **full transcription** in dialogue form.

### Format
```
Doctor: ...
Patient: ...
```

### Rules
- No paraphrasing
- No omission
- No editorial comments

---

## 4. Medical Summary Generation

### Style
- Clinically concise
- Professional tone
- Uses medical terminology
- Preserves uncertainty

### Structure
- Medical History
- Symptoms (HPI)
- Assessment
- Plan

---

## 5. SOAP Note Construction

### S — Subjective
- Chief complaint
- HPI
- Relevant history

### O — Objective
- Only documented vitals, exams, or tests
- If absent, explicitly state "Not documented"

### A — Assessment
- Problem-oriented
- No definitive diagnosis without evidence

### P — Plan
- Diagnostics
- Treatment
- Counseling
- Follow-up

---

## 6. ICD-10 Code Selection

### Rules
- Code **symptoms**, not diseases, unless confirmed
- Use screening or observation codes when appropriate
- Avoid overcoding

### Example
- R07.9 — Chest pain, unspecified
- R06.02 — Shortness of breath
- Z13.6 — Cardiovascular screening
- Z72.3 — Lack of physical exercise

---

## 7. Nurse → Physician Handoff (SBAR)

### S — Situation
Why the patient is here

### B — Background
Relevant history and risk factors

### A — Assessment
Current clinical concern

### R — Recommendation
Next steps or pending actions

---

## 8. EHR-Ready Progress Note

### Required Elements
- Visit type
- Reason for visit
- HPI
- Assessment
- Plan
- Disposition

### Language
- Neutral
- Objective
- Audit-safe

---

## 9. Automation Prompt Template (Reusable)

Use the following prompt to automate this workflow:

```
You are a clinical documentation assistant.

Given the following medical encounter transcription:

1. Extract:
   - Patient medical history
   - Patient symptoms (HPI)
   - Doctor assessment/diagnosis
   - Doctor treatment plan

2. Summarize the encounter using medical terminology.

3. Display the full transcription in dialogue format, clearly distinguishing Doctor vs Patient.

4. Generate:
   - SOAP note
   - ICD-10 code suggestions (symptom-based if diagnosis is unconfirmed)
   - Nurse → Physician SBAR handoff
   - EHR-ready progress note

Rules:
- Do not add assumptions
- Do not fabricate data
- Preserve uncertainty
- If something is not documented, state "Not documented"
```

---

## 10. Clinical Safety Principles

- Never infer diagnoses
- Never invent medications
- Never auto-close encounters
- Always flag red-flag symptoms
- Always respect pending diagnostics

---

## 11. Intended Use

This document supports:
- Medical AI system design
- Clinical documentation automation
- Nurse intake → physician continuation workflows
- AI safety and audit compliance

---

## End of Document

