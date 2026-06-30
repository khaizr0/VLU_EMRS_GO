package mapper

import (
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
)

// dateLayouts accepts the frontend date formats used by medical record forms.
var dateLayouts = []string{time.RFC3339, "2006-01-02T15:04:05", "2006-01-02"}

// cleanString trims optional text and converts blanks into nil database values.
func cleanString(value *string) *string {
	if value == nil {
		return nil
	}
	cleaned := strings.TrimSpace(*value)
	if cleaned == "" {
		return nil
	}
	return &cleaned
}

// cleanInt converts optional zero values into nil database values.
func cleanInt(value *int) *int {
	if value == nil || *value == 0 {
		return nil
	}
	return value
}

// cleanFlexibleInt converts string-or-number JSON input into optional int fields.
func cleanFlexibleInt(value *dto.FlexibleInt) *int {
	if value == nil || *value == 0 {
		return nil
	}
	cleaned := int(*value)
	return &cleaned
}

// parseOptionalTime normalizes optional date strings before domain mapping.
func parseOptionalTime(value *string) (*time.Time, error) {
	value = cleanString(value)
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

// validRecordType guards the mapper before the store receives record data.
func validRecordType(recordType *int) bool {
	return recordType != nil && (*recordType == 1 || *recordType == 2)
}
