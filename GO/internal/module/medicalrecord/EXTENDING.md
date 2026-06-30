# Extending medical records

This module is prepared around two layers:

- `base`: fields and database rows shared by every medical record type.
- `general`: the current medical record form that already exists in the old backend.

When adding a new specialty such as oncology, do not add specialty-only fields into the general detail model. Add a parallel specialty flow instead.

Recommended steps:

1. Add a new request type in `dto`, for example `OncologyRecordRequest`.
2. Add a new mapper in `mapper`, for example `OncologyRecordFromRequest`.
3. Add usecase methods in `usecase`, for example `CreateOncology` and `UpdateOncology`.
4. Add a specialty table, for example `OncologyRecordDetails`, linked by `Id = MedicalRecords.Id`.
5. Add store read/write helpers for the specialty detail without changing the general detail flow.
6. Add specialty routes only when the frontend is ready, for example `/medical-records/:patientId/oncology`.

Keep `RecordType` as a classifier and filter value. Avoid spreading `if recordType == ...` across handlers, mappers, and stores.
