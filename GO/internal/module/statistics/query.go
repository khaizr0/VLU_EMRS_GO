package statistics

import (
	"fmt"
	"strings"
	"time"
)

const recordStatsSQL = `
	SELECT
		COUNT(*)::int,
		COUNT(*) FILTER (WHERE "HasSurgery")::int,
		COUNT(*) FILTER (WHERE "HasProcedure")::int,
		COUNT(*) FILTER (WHERE "AdmissionType" = 1)::int,
		COUNT(*) FILTER (WHERE "TreatmentResult" = 5)::int,
		COUNT(*) FILTER (WHERE "DeathTimeGroup" = 1)::int,
		COUNT(*) FILTER (WHERE "DeathTimeGroup" = 2)::int,
		COUNT(*) FILTER (WHERE "HasAutopsy")::int
	FROM "MedicalRecords"`

const recordTrendSQL = `
	SELECT date_trunc('month', "CreatedAt")::date AS month, COUNT(*)::int
	FROM "MedicalRecords"`

const userTrendSQL = `
	SELECT date_trunc('month', "CreateAt")::date AS month, COUNT(*)::int
	FROM "Users"
	WHERE "CreateAt" >= $1 AND "CreateAt" < $2
	GROUP BY month`

// recordWhere converts dashboard filters into SQL constraints and args.
func recordWhere(filters Filters) (string, []any) {
	var conditions []string
	var args []any
	if filters.FromDay != nil {
		args = append(args, *filters.FromDay)
		conditions = append(conditions, fmt.Sprintf(`"CreatedAt" >= $%d`, len(args)))
	}
	if filters.ToDay != nil {
		args = append(args, filters.ToDay.Add(24*time.Hour-time.Nanosecond))
		conditions = append(conditions, fmt.Sprintf(`"CreatedAt" <= $%d`, len(args)))
	}
	if filters.RecordType != nil {
		args = append(args, *filters.RecordType)
		conditions = append(conditions, fmt.Sprintf(`"RecordType" = $%d`, len(args)))
	}
	if len(conditions) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(conditions, " AND "), args
}

// distributionSQL counts records by one nullable integer column.
func distributionSQL(column string, where string) string {
	return `SELECT ` + column + `, COUNT(*)::int FROM "MedicalRecords"` + where + ` GROUP BY ` + column
}

// trendSQL adds filter-aware bounds to the medical record trend query.
func trendSQL(where string, argCount int) string {
	conditions := []string{fmt.Sprintf(`"CreatedAt" >= $%d`, argCount+1), fmt.Sprintf(`"CreatedAt" < $%d`, argCount+2)}
	if where == "" {
		return recordTrendSQL + " WHERE " + strings.Join(conditions, " AND ") + ` GROUP BY month`
	}
	return recordTrendSQL + where + " AND " + strings.Join(conditions, " AND ") + ` GROUP BY month`
}
