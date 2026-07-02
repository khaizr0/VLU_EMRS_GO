package statistics

import "time"

type Filters struct {
	FromDay    *time.Time
	ToDay      *time.Time
	RecordType *int
}

type recordStats struct {
	TotalRecords        int
	SurgeryCount        int
	ProcedureCount      int
	EmergencyCount      int
	DeathCount          int
	Before24h           int
	After24h            int
	AutopsyCount        int
	OutcomeCounts       map[int]int
	AdmissionTypeCounts map[int]int
}
