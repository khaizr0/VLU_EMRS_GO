package patient

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type PatientStore struct {
	db *pgxpool.Pool
}

// NewPatientStore wires PostgreSQL access for patient data.
func NewPatientStore(db *pgxpool.Pool) *PatientStore {
	return &PatientStore{db: db}
}

// ListPatients returns matching patients and their total count.
func (s *PatientStore) ListPatients(ctx context.Context, filters PatientFilters) ([]domain.Patient, int, error) {
	where, args := patientWhere(filters)

	var totalCount int
	if err := s.db.QueryRow(ctx, `SELECT COUNT(*) FROM "Patients" AS "p"`+where, args...).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("count patients: %w", err)
	}

	listArgs := append(args, filters.PageSize, filters.PageSize*(filters.PageNumber-1))
	rows, err := s.db.Query(ctx, patientListQuery(where, len(args)), listArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("query patients: %w", err)
	}
	defer rows.Close()

	patients := []domain.Patient{}
	for rows.Next() {
		patient, err := scanPatient(rows)
		if err != nil {
			return nil, 0, err
		}
		patients = append(patients, patient)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("query patients: %w", err)
	}
	return patients, totalCount, nil
}

// FindPatientByID loads one patient by ID.
func (s *PatientStore) FindPatientByID(ctx context.Context, id int) (domain.Patient, error) {
	return scanPatient(s.db.QueryRow(ctx, patientQuery+` WHERE "p"."Id" = $1`, id))
}

// InsertPatient creates one patient row and returns the generated ID.
func (s *PatientStore) InsertPatient(ctx context.Context, patient domain.Patient) (int, error) {
	var id int
	err := s.db.QueryRow(ctx, `
		INSERT INTO "Patients" (
			"EthnicityId", "CreatedBy", "Name", "DateOfBirth", "Gender", "HealthInsuranceNumber", "CreatedAt"
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING "Id"
	`, patient.EthnicityID, patient.CreatedBy, patient.Name, patient.DateOfBirth, patient.Gender, patient.HealthInsuranceNumber, time.Now()).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("create patient: %w", err)
	}
	return id, nil
}

// UpdatePatient replaces editable fields for one patient row.
func (s *PatientStore) UpdatePatient(ctx context.Context, patient domain.Patient) error {
	_, err := s.db.Exec(ctx, `
		UPDATE "Patients"
		SET "EthnicityId" = $1, "Name" = $2, "DateOfBirth" = $3, "Gender" = $4, "HealthInsuranceNumber" = $5
		WHERE "Id" = $6
	`, patient.EthnicityID, patient.Name, patient.DateOfBirth, patient.Gender, patient.HealthInsuranceNumber, patient.ID)
	if err != nil {
		return fmt.Errorf("update patient: %w", err)
	}
	return nil
}

// DeletePatient removes one patient row by ID.
func (s *PatientStore) DeletePatient(ctx context.Context, id int) error {
	_, err := s.db.Exec(ctx, `DELETE FROM "Patients" WHERE "Id" = $1`, id)
	if err != nil {
		return fmt.Errorf("delete patient: %w", err)
	}
	return nil
}

// GetUserByIdentityKey resolves Microsoft identity into a local user.
func (s *PatientStore) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, s.db, identityKey)
}

// EthnicityExists checks whether the requested ethnicity foreign key exists.
func (s *PatientStore) EthnicityExists(ctx context.Context, id int) (bool, error) {
	var exists bool
	if err := s.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM "Ethnicities" WHERE "Id" = $1)`, id).Scan(&exists); err != nil {
		return false, fmt.Errorf("check ethnicity: %w", err)
	}
	return exists, nil
}

// HealthInsuranceExists checks whether another patient already uses the insurance number.
func (s *PatientStore) HealthInsuranceExists(ctx context.Context, healthInsuranceNumber string, exceptPatientID int) (bool, error) {
	var exists bool
	if err := s.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM "Patients"
			WHERE "HealthInsuranceNumber" = $1 AND "Id" <> $2
		)
	`, healthInsuranceNumber, exceptPatientID).Scan(&exists); err != nil {
		return false, fmt.Errorf("check health insurance number: %w", err)
	}
	return exists, nil
}
