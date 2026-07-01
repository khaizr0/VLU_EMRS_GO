# Extending medical records

This module is split by shared record data and concrete record flows:

- `base`: database access for the common `MedicalRecords` row.
- `shared`: request params, list response, request cleaning, and authorization helpers.
- `internalandsurgeryrecord`: the current internal medicine and surgery record flow.

When adding a new record type such as oncology, keep it as a sibling of `internalandsurgeryrecord` instead of adding specialty-only fields into the current detail model.

Recommended steps:

1. Add a new record folder, for example `oncologyrecord`.
2. Add its `dto`, `read`, `write`, `delete`, and detail store files as needed.
3. Reuse `base.Store` for common medical record rows.
4. Add a specialty table, for example `OncologyRecordDetails`, linked by `Id = MedicalRecords.Id`.
5. Register the new route from `medicalrecord/routes.go` only when the frontend is ready.

Keep `RecordType` as a classifier and filter value. Avoid spreading `if recordType == ...` across handlers, mappers, and stores.
