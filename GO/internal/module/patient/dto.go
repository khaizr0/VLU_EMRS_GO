package patient

import (
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type PagedResult struct {
	Items           []domain.Patient `json:"items"`
	TotalPages      int              `json:"totalPages"`
	TotalItemsCount int              `json:"totalItemsCount"`
	ItemsFrom       int              `json:"itemsFrom"`
	ItemsTo         int              `json:"itemsTo"`
}

type PatientRequest struct {
	Name                  string `json:"name"`
	DateOfBirth           string `json:"dateOfBirth"`
	Gender                int    `json:"gender"`
	EthnicityID           int    `json:"ethnicityId"`
	HealthInsuranceNumber string `json:"healthInsuranceNumber"`
}

type PatientFilters struct {
	SearchPhrase string
	PageNumber   int
	PageSize     int
	FromDay      *time.Time
	ToDay        *time.Time
}
