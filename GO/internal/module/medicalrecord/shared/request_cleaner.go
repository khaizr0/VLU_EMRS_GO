package shared

import (
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

var dateLayouts = []string{time.RFC3339, "2006-01-02T15:04:05", "2006-01-02"}

func CleanString(value *string) *string {
	if value == nil {
		return nil
	}
	cleaned := strings.TrimSpace(*value)
	if cleaned == "" {
		return nil
	}
	return &cleaned
}

func CleanInt(value *int) *int {
	if value == nil || *value == 0 {
		return nil
	}
	return value
}

func ParseOptionalTime(value *string) (*time.Time, error) {
	value = CleanString(value)
	if value == nil {
		return nil, nil
	}
	for _, layout := range dateLayouts {
		parsed, err := time.Parse(layout, *value)
		if err == nil {
			return &parsed, nil
		}
	}
	return nil, domain.ErrInvalidMedicalRecordDate
}

func ValidInternalOrSurgeryType(recordType *int) bool {
	return recordType != nil && (*recordType == 1 || *recordType == 2)
}
