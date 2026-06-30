package query

import (
	"fmt"
	"strings"
	"time"
)

// Filters carries list constraints from the usecase into SQL builders.
type Filters struct {
	SearchPhrase string
	PageNumber   int
	PageSize     int
	RecordType   *int
	FromDay      *time.Time
	ToDay        *time.Time
}

// RecordWhere converts filters into a WHERE clause and ordered SQL args.
func RecordWhere(filters Filters) (string, []any) {
	var conditions []string
	var args []any

	if filters.SearchPhrase != "" {
		args = append(args, "%"+filters.SearchPhrase+"%")
		conditions = append(conditions, searchCondition(len(args)))
	}
	if filters.RecordType != nil {
		args = append(args, *filters.RecordType)
		conditions = append(conditions, fmt.Sprintf(`"m"."RecordType" = $%d`, len(args)))
	}
	if filters.FromDay != nil {
		args = append(args, *filters.FromDay)
		conditions = append(conditions, fmt.Sprintf(`"m"."CreatedAt" >= $%d`, len(args)))
	}
	if filters.ToDay != nil {
		args = append(args, filters.ToDay.Add(24*time.Hour-time.Nanosecond))
		conditions = append(conditions, fmt.Sprintf(`"m"."CreatedAt" <= $%d`, len(args)))
	}
	if len(conditions) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(conditions, " AND "), args
}

// searchCondition matches storage code, medical code, or patient name.
func searchCondition(argIndex int) string {
	return fmt.Sprintf(
		`("m"."StorageCode" ILIKE $%d OR "m"."MedicalCode" ILIKE $%d OR "p"."Name" ILIKE $%d)`,
		argIndex, argIndex, argIndex,
	)
}
