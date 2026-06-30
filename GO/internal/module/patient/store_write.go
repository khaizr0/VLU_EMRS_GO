package patient

import (
	"context"
	"fmt"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

// Create inserts one patient and returns the generated ID.
func (s *Store) Create(ctx context.Context, patient domain.Patient) (int, error) {
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

// Update replaces editable patient fields for one existing patient.
func (s *Store) Update(ctx context.Context, patient domain.Patient) error {
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

// Delete removes one patient by ID.
func (s *Store) Delete(ctx context.Context, id int) error {
	_, err := s.db.Exec(ctx, `DELETE FROM "Patients" WHERE "Id" = $1`, id)
	if err != nil {
		return fmt.Errorf("delete patient: %w", err)
	}
	return nil
}

// GetUserByIdentityKey lets the service resolve Microsoft claims into a local user.
func (s *Store) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, s.db, identityKey)
}

// EthnicityExists checks whether the requested ethnicity foreign key exists.
func (s *Store) EthnicityExists(ctx context.Context, id int) (bool, error) {
	var exists bool
	if err := s.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM "Ethnicities" WHERE "Id" = $1)`, id).Scan(&exists); err != nil {
		return false, fmt.Errorf("check ethnicity: %w", err)
	}
	return exists, nil
}

// HealthInsuranceExists checks unique health insurance numbers except the current patient.
func (s *Store) HealthInsuranceExists(ctx context.Context, healthInsuranceNumber string, exceptPatientID int) (bool, error) {
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
