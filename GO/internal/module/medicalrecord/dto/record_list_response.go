package dto

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

// PagedResult is the list response returned by the transport layer.
type PagedResult struct {
	Items           []domain.MedicalRecordItem `json:"items"`
	TotalPages      int                        `json:"totalPages"`
	TotalItemsCount int                        `json:"totalItemsCount"`
	ItemsFrom       int                        `json:"itemsFrom"`
	ItemsTo         int                        `json:"itemsTo"`
}

// ListRequest carries query parameters from transport into the usecase.
type ListRequest struct {
	SearchPhrase string
	PageNumber   int
	PageSize     int
	RecordType   int
	FromDay      string
	ToDay        string
}
