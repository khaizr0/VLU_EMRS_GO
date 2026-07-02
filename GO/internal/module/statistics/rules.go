package statistics

import (
	"math"
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

const (
	admissionEmergency = 1
	treatmentRecovered = 1
	treatmentImproved  = 2
	treatmentNoChange  = 3
	treatmentWorse     = 4
	treatmentDeath     = 5
	deathBefore24h     = 1
	deathAfter24h      = 2
)

var treatmentLabels = map[int]string{
	treatmentRecovered: "Recovered",
	treatmentImproved:  "Improved",
	treatmentNoChange:  "NoChange",
	treatmentWorse:     "Worse",
	treatmentDeath:     "Death",
}

var admissionLabels = map[int]string{
	1: "Emergency",
	2: "Outpatient",
	3: "Inpatient",
}

// filtersFromQuery normalizes optional dashboard filters.
func filtersFromQuery(fromDay string, toDay string, recordType int) (Filters, error) {
	from, err := parseDate(fromDay)
	if err != nil {
		return Filters{}, err
	}
	to, err := parseDate(toDay)
	if err != nil {
		return Filters{}, err
	}
	filters := Filters{FromDay: from, ToDay: to}
	if recordType > 0 {
		filters.RecordType = &recordType
	}
	return filters, nil
}

// parseDate accepts empty or yyyy-mm-dd dashboard date filters.
func parseDate(value string) (*time.Time, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil, nil
	}
	parsed, err := time.Parse("2006-01-02", trimmed)
	if err != nil {
		return nil, domain.ErrInvalidMedicalRecordDate
	}
	return &parsed, nil
}

// percent returns one-decimal percentage like the legacy backend.
func percent(part int, total int) float64 {
	if total == 0 {
		return 0
	}
	return round1(float64(part) / float64(total) * 100)
}

// growth calculates absolute month-over-month growth and direction.
func growth(thisMonth int, lastMonth int) (float64, bool) {
	if lastMonth == 0 {
		if thisMonth > 0 {
			return 100, true
		}
		return 0, true
	}
	value := round1(float64(thisMonth-lastMonth) / float64(lastMonth) * 100)
	return math.Abs(value), value >= 0
}

func round1(value float64) float64 {
	return math.Round(value*10) / 10
}

// monthStart returns the first day of a month for trend calculations.
func monthStart(now time.Time) time.Time {
	return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
}

// monthLabel formats chart labels as MM/yyyy.
func monthLabel(value time.Time) string {
	return value.Format("01/2006")
}
