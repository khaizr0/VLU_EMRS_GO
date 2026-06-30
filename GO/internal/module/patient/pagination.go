package patient

import (
	"math"
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

// listFilters maps transport filters into store filters with safe paging defaults.
func listFilters(request ListRequest) (PatientFilters, error) {
	filters := PatientFilters{
		SearchPhrase: strings.TrimSpace(request.SearchPhrase),
		PageNumber:   pageNumber(request.PageNumber),
		PageSize:     pageSize(request.PageSize),
	}

	fromDay, err := optionalDateOnly(request.FromDay)
	if err != nil {
		return PatientFilters{}, err
	}
	toDay, err := optionalDateOnly(request.ToDay)
	if err != nil {
		return PatientFilters{}, err
	}
	filters.FromDay = fromDay
	filters.ToDay = toDay
	return filters, nil
}

// pageNumber normalizes invalid page numbers to the first page.
func pageNumber(value int) int {
	if value <= 0 {
		return 1
	}
	return value
}

// pageSize normalizes invalid or too-large page sizes.
func pageSize(value int) int {
	if value <= 0 {
		return 30
	}
	if value > 100 {
		return 100
	}
	return value
}

// optionalDateOnly parses date-only query filters for SQL date ranges.
func optionalDateOnly(value string) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	date, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, domain.ErrInvalidDateOfBirth
	}
	return &date, nil
}

// newPagedResult wraps store rows and count metadata for the API response.
func newPagedResult(items []domain.Patient, totalCount int, pageSize int, pageNumber int) PagedResult {
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
