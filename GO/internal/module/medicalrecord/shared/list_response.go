package shared

import (
	"math"
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/base"
)

type ListRequest struct {
	SearchPhrase string
	PageNumber   int
	PageSize     int
	RecordType   int
	FromDay      string
	ToDay        string
}

type PagedResult struct {
	Items           []domain.MedicalRecordItem `json:"items"`
	TotalPages      int                        `json:"totalPages"`
	TotalItemsCount int                        `json:"totalItemsCount"`
	ItemsFrom       int                        `json:"itemsFrom"`
	ItemsTo         int                        `json:"itemsTo"`
}

func FiltersFromRequest(request ListRequest) (base.Filters, error) {
	filters := base.Filters{
		SearchPhrase: strings.TrimSpace(request.SearchPhrase),
		PageNumber:   request.PageNumber,
		PageSize:     request.PageSize,
	}
	if filters.PageNumber <= 0 {
		filters.PageNumber = 1
	}
	if filters.PageSize <= 0 {
		filters.PageSize = 30
	}
	if filters.PageSize > 100 {
		filters.PageSize = 100
	}
	if request.RecordType > 0 {
		filters.RecordType = &request.RecordType
	}

	fromDay, err := optionalDateOnly(request.FromDay)
	if err != nil {
		return base.Filters{}, err
	}
	toDay, err := optionalDateOnly(request.ToDay)
	if err != nil {
		return base.Filters{}, err
	}
	filters.FromDay = fromDay
	filters.ToDay = toDay
	return filters, nil
}

func NewPagedResult(items []domain.MedicalRecordItem, totalCount int, pageSize int, pageNumber int) PagedResult {
	itemsFrom := 0
	itemsTo := 0
	if totalCount > 0 && len(items) > 0 {
		itemsFrom = pageSize*(pageNumber-1) + 1
		itemsTo = itemsFrom + len(items) - 1
	}
	return PagedResult{
		Items:           items,
		TotalPages:      int(math.Ceil(float64(totalCount) / float64(pageSize))),
		TotalItemsCount: totalCount,
		ItemsFrom:       itemsFrom,
		ItemsTo:         itemsTo,
	}
}

func optionalDateOnly(value string) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	date, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, domain.ErrInvalidMedicalRecordDate
	}
	return &date, nil
}
