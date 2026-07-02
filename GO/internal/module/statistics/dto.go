package statistics

import "time"

type Dashboard struct {
	Summary                   Summary        `json:"summary"`
	UserGrowth                UserGrowth     `json:"userGrowth"`
	Trends                    TrendStats     `json:"trends"`
	OutcomeDistribution       []DataPoint    `json:"outcomeDistribution"`
	AdmissionTypeDistribution []DataPoint    `json:"admissionTypeDistribution"`
	MortalityStats            MortalityStats `json:"mortalityStats"`
}

type Summary struct {
	TotalRecords  int     `json:"totalRecords"`
	SurgicalRate  float64 `json:"surgicalRate"`
	ProcedureRate float64 `json:"procedureRate"`
	EmergencyRate float64 `json:"emergencyRate"`
}

type UserGrowth struct {
	NewUsersThisMonth int     `json:"newUsersThisMonth"`
	NewUsersLastMonth int     `json:"newUsersLastMonth"`
	GrowthPercentage  float64 `json:"growthPercentage"`
	IsIncrease        bool    `json:"isIncrease"`
}

type TrendStats struct {
	MedicalRecords []DataPoint `json:"medicalRecords"`
	UserOnboarding []DataPoint `json:"userOnboarding"`
}

type DataPoint struct {
	Label      string   `json:"label"`
	Value      int      `json:"value"`
	Percentage *float64 `json:"percentage,omitempty"`
}

type MortalityStats struct {
	Before24h   int     `json:"before24h"`
	After24h    int     `json:"after24h"`
	AutopsyRate float64 `json:"autopsyRate"`
}

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
