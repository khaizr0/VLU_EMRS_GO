package patient

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

// List returns paged patient rows and the total matching count.
func (s *Store) List(ctx context.Context, filters PatientFilters) ([]domain.Patient, int, error) {
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

// GetByID loads one patient by ID or returns ErrPatientNotFound.
func (s *Store) GetByID(ctx context.Context, id int) (domain.Patient, error) {
	return scanPatient(s.db.QueryRow(ctx, patientQuery+` WHERE "p"."Id" = $1`, id))
}

// patientListQuery builds the paged patient list query after filters are prepared.
func patientListQuery(where string, filterCount int) string {
	return patientQuery + where +
		` ORDER BY "p"."Id" DESC LIMIT $` + fmt.Sprint(filterCount+1) +
		` OFFSET $` + fmt.Sprint(filterCount+2)
}

// patientWhere converts filters into a WHERE clause and ordered SQL args.
func patientWhere(filters PatientFilters) (string, []any) {
	var conditions []string
	var args []any

	if filters.SearchPhrase != "" {
		args = append(args, "%"+filters.SearchPhrase+"%")
		conditions = append(conditions, searchCondition(len(args)))
	}
	if filters.FromDay != nil {
		args = append(args, *filters.FromDay)
		conditions = append(conditions, fmt.Sprintf(`"p"."CreatedAt" >= $%d`, len(args)))
	}
	if filters.ToDay != nil {
		args = append(args, filters.ToDay.Add(24*time.Hour-time.Nanosecond))
		conditions = append(conditions, fmt.Sprintf(`"p"."CreatedAt" <= $%d`, len(args)))
	}
	if len(conditions) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(conditions, " AND "), args
}

// searchCondition matches patient name or health insurance number.
func searchCondition(argIndex int) string {
	return fmt.Sprintf(`("p"."Name" ILIKE $%d OR "p"."HealthInsuranceNumber" ILIKE $%d)`, argIndex, argIndex)
}

// scanPatient scans one database row into the patient domain model.
func scanPatient(row pgx.Row) (domain.Patient, error) {
	var patient domain.Patient
	err := row.Scan(
		&patient.ID,
		&patient.EthnicityID,
		&patient.CreatedBy,
		&patient.Name,
		&patient.DateOfBirth,
		&patient.Gender,
		&patient.HealthInsuranceNumber,
		&patient.CreatedAt,
		&patient.Ethnicity.ID,
		&patient.Ethnicity.Name,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Patient{}, domain.ErrPatientNotFound
	}
	if err != nil {
		return domain.Patient{}, fmt.Errorf("query patient: %w", err)
	}
	return patient, nil
}
