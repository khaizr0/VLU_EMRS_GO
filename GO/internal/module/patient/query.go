package patient

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

const patientQuery = `
	SELECT
		"p"."Id", "p"."EthnicityId", "p"."CreatedBy", "p"."Name",
		"p"."DateOfBirth", "p"."Gender", "p"."HealthInsuranceNumber", "p"."CreatedAt",
		"e"."Id", "e"."Name"
	FROM "Patients" AS "p"
	JOIN "Ethnicities" AS "e" ON "e"."Id" = "p"."EthnicityId"`

// patientListQuery adds ordering and paging placeholders to the base patient query.
func patientListQuery(where string, filterCount int) string {
	return patientQuery + where +
		` ORDER BY "p"."Id" DESC LIMIT $` + fmt.Sprint(filterCount+1) +
		` OFFSET $` + fmt.Sprint(filterCount+2)
}

// patientWhere converts normalized filters into a SQL WHERE clause and ordered arguments.
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

// searchCondition builds the shared search expression for name and health insurance number.
func searchCondition(argIndex int) string {
	return fmt.Sprintf(`("p"."Name" ILIKE $%d OR "p"."HealthInsuranceNumber" ILIKE $%d)`, argIndex, argIndex)
}

// scanPatient maps one database row into the patient domain model.
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
