package patient

import (
	"math"
	"regexp"
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

var (
	patientNamePattern           = regexp.MustCompile(`^[\p{L}\s]+$`)
	healthInsuranceNumberPattern = regexp.MustCompile(`^[A-Z]{2}\d{13}$`)
	dateLayouts                  = []string{time.RFC3339, "2006-01-02T15:04:05", "2006-01-02"}
)

// newPatientFilters normalizes raw query parameters before they reach SQL builders.
func newPatientFilters(searchPhrase string, pageNumberValue int, pageSizeValue int, fromDayValue string, toDayValue string) (PatientFilters, error) {
	filters := PatientFilters{
		SearchPhrase: strings.TrimSpace(searchPhrase),
		PageNumber:   pageNumber(pageNumberValue),
		PageSize:     pageSize(pageSizeValue),
	}

	fromDay, err := optionalDateOnly(fromDayValue)
	if err != nil {
		return PatientFilters{}, err
	}
	toDay, err := optionalDateOnly(toDayValue)
	if err != nil {
		return PatientFilters{}, err
	}
	filters.FromDay = fromDay
	filters.ToDay = toDay
	return filters, nil
}

// patientFromRequest validates create/update input and maps it into a domain patient.
func patientFromRequest(request PatientRequest) (domain.Patient, error) {
	name, err := cleanPatientName(request.Name)
	if err != nil {
		return domain.Patient{}, err
	}
	dateOfBirth, err := parseDateOfBirth(request.DateOfBirth)
	if err != nil {
		return domain.Patient{}, err
	}
	if err := validateGender(request.Gender); err != nil {
		return domain.Patient{}, err
	}
	healthInsuranceNumber, err := cleanHealthInsuranceNumber(request.HealthInsuranceNumber)
	if err != nil {
		return domain.Patient{}, err
	}
	return domain.Patient{
		EthnicityID:           request.EthnicityID,
		Name:                  name,
		DateOfBirth:           dateOfBirth,
		Gender:                request.Gender,
		HealthInsuranceNumber: healthInsuranceNumber,
	}, nil
}

// newPagedResult wraps list rows with pagination metadata for the API response.
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

// pageNumber defaults invalid page numbers to the first page.
func pageNumber(value int) int {
	if value <= 0 {
		return 1
	}
	return value
}

// pageSize defaults invalid page sizes and caps large requests.
func pageSize(value int) int {
	if value <= 0 {
		return 30
	}
	if value > 100 {
		return 100
	}
	return value
}

// optionalDateOnly parses optional YYYY-MM-DD list filters.
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

// cleanPatientName trims and validates the patient's display name.
func cleanPatientName(name string) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" || len([]rune(name)) > 100 || !patientNamePattern.MatchString(name) {
		return "", domain.ErrInvalidPatientName
	}
	return name, nil
}

// cleanHealthInsuranceNumber normalizes and validates Vietnamese health insurance numbers.
func cleanHealthInsuranceNumber(value string) (string, error) {
	value = strings.ToUpper(strings.TrimSpace(value))
	if !healthInsuranceNumberPattern.MatchString(value) {
		return "", domain.ErrInvalidHealthInsuranceNumber
	}
	return value, nil
}

// parseDateOfBirth accepts supported frontend date formats before age validation.
func parseDateOfBirth(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	for _, layout := range dateLayouts {
		date, err := time.Parse(layout, value)
		if err == nil {
			return validateDateOfBirth(date)
		}
	}
	return time.Time{}, domain.ErrInvalidDateOfBirth
}

// validateDateOfBirth rejects future dates and unrealistic ages.
func validateDateOfBirth(date time.Time) (time.Time, error) {
	now := time.Now()
	if !date.Before(now) || date.Before(now.AddDate(-150, 0, 0)) {
		return time.Time{}, domain.ErrInvalidDateOfBirth
	}
	return date, nil
}

// validateGender keeps gender within the legacy enum range.
func validateGender(gender int) error {
	if gender < 1 || gender > 3 {
		return domain.ErrInvalidGender
	}
	return nil
}
