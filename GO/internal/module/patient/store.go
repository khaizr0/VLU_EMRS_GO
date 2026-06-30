package patient

import (
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Store owns PostgreSQL access for the patient module.
type Store struct {
	db *pgxpool.Pool
}

// PatientFilters carries list constraints from the service into SQL builders.
type PatientFilters struct {
	SearchPhrase string
	PageNumber   int
	PageSize     int
	FromDay      *time.Time
	ToDay        *time.Time
}

// NewStore wires PostgreSQL access for patient data.
func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

// patientQuery selects patient rows with ethnicity data attached.
const patientQuery = `
	SELECT
		"p"."Id", "p"."EthnicityId", "p"."CreatedBy", "p"."Name",
		"p"."DateOfBirth", "p"."Gender", "p"."HealthInsuranceNumber", "p"."CreatedAt",
		"e"."Id", "e"."Name"
	FROM "Patients" AS "p"
	JOIN "Ethnicities" AS "e" ON "e"."Id" = "p"."EthnicityId"`
