TITLES:
# [API] Roles and Permissions

Add the necessary roles and permissions for the doctor and nurse profiles



------

# [API] Create visit-to-patient linking





------

# [Feature] Implement GPS location capture and timestamp tracking • Build assigned personnel





------

# [API] Build visit registration and status workflow (Registered → In Progress → Completed)





------

# [API] Design visit entity with types (Telehealth, Mobile Acute Care, Triage, Nurse Visit, Doctor Visit)





------

# [Feature] Visit Management

Build visit registration and status workflow (Registered → In Progress → Completed)


DESCRIPTIONS:
# [API] Roles and Permissions

Add the necessary roles and permissions for the doctor and nurse profiles

## Metadata
- URL: [https://linear.app/intellibus/issue/DIG-187/api-roles-and-permissions](https://linear.app/intellibus/issue/DIG-187/api-roles-and-permissions)
- Identifier: DIG-187
- Status: Backlog
- Priority: No priority
- Assignee: Nicholas McKay
- Project: [[Delivery] Intellibus Care Telemedicine](https://linear.app/intellibus/project/delivery-intellibus-care-telemedicine-77bbbc554d0d). 
- Project milestone: Use video call in the medical missions (target: 2026-01-15T05:00:00.000Z)
- Created: 2025-12-30T22:05:19.300Z
- Updated: 2025-12-31T14:54:06.279Z

------

# [API] Create visit-to-patient linking


## Metadata
- URL: [https://linear.app/intellibus/issue/DIG-186/api-create-visit-to-patient-linking](https://linear.app/intellibus/issue/DIG-186/api-create-visit-to-patient-linking)
- Identifier: DIG-186
- Status: Backlog
- Priority: No priority
- Assignee: Nicholas McKay
- Project: [[Delivery] Intellibus Care Telemedicine](https://linear.app/intellibus/project/delivery-intellibus-care-telemedicine-77bbbc554d0d). 
- Created: 2025-12-30T22:03:52.089Z
- Updated: 2025-12-31T14:53:24.911Z

------

# [Feature] Implement GPS location capture and timestamp tracking • Build assigned personnel


## Metadata
- URL: [https://linear.app/intellibus/issue/DIG-185/feature-implement-gps-location-capture-and-timestamp-tracking-build](https://linear.app/intellibus/issue/DIG-185/feature-implement-gps-location-capture-and-timestamp-tracking-build)
- Identifier: DIG-185
- Status: Backlog
- Priority: No priority
- Assignee: Nicholas McKay
- Project: [[Delivery] Intellibus Care Telemedicine](https://linear.app/intellibus/project/delivery-intellibus-care-telemedicine-77bbbc554d0d). 
- Created: 2025-12-30T22:00:04.619Z
- Updated: 2025-12-31T14:53:36.304Z

------

# [API] Build visit registration and status workflow (Registered → In Progress → Completed)


## Metadata
- URL: [https://linear.app/intellibus/issue/DIG-184/api-build-visit-registration-and-status-workflow-registered-→-in](https://linear.app/intellibus/issue/DIG-184/api-build-visit-registration-and-status-workflow-registered-→-in)
- Identifier: DIG-184
- Status: Backlog
- Priority: No priority
- Assignee: Nicholas McKay
- Project: [[Delivery] Intellibus Care Telemedicine](https://linear.app/intellibus/project/delivery-intellibus-care-telemedicine-77bbbc554d0d). 
- Created: 2025-12-30T21:59:27.321Z
- Updated: 2025-12-31T14:53:39.791Z

------

# [API] Design visit entity with types (Telehealth, Mobile Acute Care, Triage, Nurse Visit, Doctor Visit)


## Metadata
- URL: [https://linear.app/intellibus/issue/DIG-183/api-design-visit-entity-with-types-telehealth-mobile-acute-care-triage](https://linear.app/intellibus/issue/DIG-183/api-design-visit-entity-with-types-telehealth-mobile-acute-care-triage)
- Identifier: DIG-183
- Status: Backlog
- Priority: No priority
- Assignee: Nicholas McKay
- Project: [[Delivery] Intellibus Care Telemedicine](https://linear.app/intellibus/project/delivery-intellibus-care-telemedicine-77bbbc554d0d). 
- Created: 2025-12-30T21:59:24.594Z
- Updated: 2025-12-31T14:53:45.514Z

------

# [Feature] Visit Management

Build visit registration and status workflow (Registered → In Progress → Completed)

## Metadata
- URL: [https://linear.app/intellibus/issue/DIG-182/feature-visit-management](https://linear.app/intellibus/issue/DIG-182/feature-visit-management)
- Identifier: DIG-182
- Status: Backlog
- Priority: No priority
- Assignee: Nicholas McKay
- Project: [[Delivery] Intellibus Care Telemedicine](https://linear.app/intellibus/project/delivery-intellibus-care-telemedicine-77bbbc554d0d). 
- Created: 2025-12-30T21:57:21.106Z
- Updated: 2025-12-31T14:53:11.072Z

## Sub-issues

- [DIG-183 [API] Design visit entity with types (Telehealth, Mobile Acute Care, Triage, Nurse Visit, Doctor Visit)](https://linear.app/intellibus/issue/DIG-183/api-design-visit-entity-with-types-telehealth-mobile-acute-care-triage)
- [DIG-184 [API] Build visit registration and status workflow (Registered → In Progress → Completed)](https://linear.app/intellibus/issue/DIG-184/api-build-visit-registration-and-status-workflow-registered-→-in)
- [DIG-185 [Feature] Implement GPS location capture and timestamp tracking • Build assigned personnel](https://linear.app/intellibus/issue/DIG-185/feature-implement-gps-location-capture-and-timestamp-tracking-build)
- [DIG-186 [API] Create visit-to-patient linking](https://linear.app/intellibus/issue/DIG-186/api-create-visit-to-patient-linking)

------

# [Maintenance] Recording cache cleanup

Add a scheduled background job to remove stale or prunable recording cache objects from storage. Implement a script `scripts/cleanup-cache.js` that:
- deletes objects for `recording_cache` rows that are either marked `deleted` older than a retention period, or `cached`/`uploaded` and older than the retention period;
- updates `recording_cache.status` to `pruned` on success, or `prune_failed` with metadata on failure;
- supports a `--dry-run` flag and is configurable via env vars `CACHE_CLEANUP_RETENTION_DAYS` and `CACHE_CLEANUP_BATCH_SIZE`.

Run locally with: `npm run cleanup:cache -- --dry-run` and then without `--dry-run` to actually prune objects.

------

# [API] Patient MRN (Medical Record Number)

Generate a persistent, system-assigned MRN for every patient using a DB sequence (`patient_mrn_seq`). Details:
- MRN column `patients.mrn` (bigint) with unique constraint and default `nextval('patient_mrn_seq')`.
- Backfill existing patients that lack an MRN.
- Helper RPC `get_next_patient_mrn()` to reserve a number if needed by external systems.

Testing:
- `scripts/test-patient-mrn.js` verifies MRN assignment and uniqueness using the service role key.

Notes:
- UI will display MRN in patient lists and patient detail pages.
