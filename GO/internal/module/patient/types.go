package patient

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

// PagedResult is the patient list response returned by the transport layer.
type PagedResult struct {
	Items           []domain.Patient `json:"items"`
	TotalPages      int              `json:"totalPages"`
	TotalItemsCount int              `json:"totalItemsCount"`
	ItemsFrom       int              `json:"itemsFrom"`
	ItemsTo         int              `json:"itemsTo"`
}

// PatientRequest carries create/update input from transport into the service.
type PatientRequest struct {
	Name                  string `json:"name"`
	DateOfBirth           string `json:"dateOfBirth"`
	Gender                int    `json:"gender"`
	EthnicityID           int    `json:"ethnicityId"`
	HealthInsuranceNumber string `json:"healthInsuranceNumber"`
}

// ListRequest carries list query parameters from transport into the service.
type ListRequest struct {
	SearchPhrase string
	PageNumber   int
	PageSize     int
	FromDay      string
	ToDay        string
}
