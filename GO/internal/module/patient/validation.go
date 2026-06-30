package patient

import (
	"regexp"
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

// validation patterns and date layouts normalize patient input before persistence.
var (
	patientNamePattern           = regexp.MustCompile(`^[\p{L}\s]+$`)
	healthInsuranceNumberPattern = regexp.MustCompile(`^[A-Z]{2}\d{13}$`)
	dateLayouts                  = []string{time.RFC3339, "2006-01-02T15:04:05", "2006-01-02"}
)

// cleanPatientName trims and validates patient names before domain mapping.
func cleanPatientName(name string) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" || len([]rune(name)) > 100 || !patientNamePattern.MatchString(name) {
		return "", domain.ErrInvalidPatientName
	}
	return name, nil
}

// cleanHealthInsuranceNumber normalizes and validates insurance numbers.
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

// validateGender keeps gender values within the legacy database enum range.
func validateGender(gender int) error {
	if gender < 1 || gender > 3 {
		return domain.ErrInvalidGender
	}
	return nil
}

// patientFromRequest maps validated transport input into a domain patient.
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
