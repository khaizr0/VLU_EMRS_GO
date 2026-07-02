package statistics

import (
	"context"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

type Service struct {
	store *Store
	now   func() time.Time
}

// NewService wires dashboard business rules to the statistics store.
func NewService(store *Store) *Service {
	return &Service{store: store, now: time.Now}
}

// Dashboard returns the full dashboard payload used by the frontend.
func (s *Service) Dashboard(ctx context.Context, claims auth.Claims, filters Filters) (Dashboard, error) {
	if err := s.requireRead(ctx, claims); err != nil {
		return Dashboard{}, err
	}
	now := s.now()
	startOfThisMonth := monthStart(now)
	startOfLastMonth := startOfThisMonth.AddDate(0, -1, 0)
	trendStart := startOfThisMonth.AddDate(0, -5, 0)
	trendEnd := startOfThisMonth.AddDate(0, 1, 0)

	recordStats, err := s.store.RecordStats(ctx, filters)
	if err != nil {
		return Dashboard{}, err
	}
	usersThisMonth, usersLastMonth, err := s.store.UserGrowth(ctx, startOfThisMonth, startOfLastMonth)
	if err != nil {
		return Dashboard{}, err
	}
	recordTrend, err := s.store.RecordTrend(ctx, filters, trendStart, trendEnd)
	if err != nil {
		return Dashboard{}, err
	}
	userTrend, err := s.store.UserTrend(ctx, trendStart, trendEnd)
	if err != nil {
		return Dashboard{}, err
	}

	growthPercentage, isIncrease := growth(usersThisMonth, usersLastMonth)
	return Dashboard{
		Summary:                   summaryFrom(recordStats),
		UserGrowth:                UserGrowth{NewUsersThisMonth: usersThisMonth, NewUsersLastMonth: usersLastMonth, GrowthPercentage: growthPercentage, IsIncrease: isIncrease},
		Trends:                    trendsFrom(trendStart, recordTrend, userTrend),
		OutcomeDistribution:       outcomeDistribution(recordStats),
		AdmissionTypeDistribution: admissionDistribution(recordStats),
		MortalityStats:            mortalityFrom(recordStats),
	}, nil
}

func (s *Service) requireRead(ctx context.Context, claims auth.Claims) error {
	user, err := s.store.GetUserByIdentityKey(ctx, claims.IdentityKey())
	if err != nil {
		return err
	}
	if !user.Active {
		return domain.ErrInactiveUser
	}
	if user.RoleName != domain.RoleAdmin && user.RoleName != domain.RoleTeacher && user.RoleName != domain.RoleStudent {
		return domain.ErrForbidden
	}
	return nil
}

func summaryFrom(stats recordStats) Summary {
	return Summary{
		TotalRecords:  stats.TotalRecords,
		SurgicalRate:  percent(stats.SurgeryCount, stats.TotalRecords),
		ProcedureRate: percent(stats.ProcedureCount, stats.TotalRecords),
		EmergencyRate: percent(stats.EmergencyCount, stats.TotalRecords),
	}
}

func trendsFrom(start time.Time, recordCounts map[string]int, userCounts map[string]int) TrendStats {
	trends := TrendStats{MedicalRecords: []DataPoint{}, UserOnboarding: []DataPoint{}}
	for i := 0; i < 6; i++ {
		label := monthLabel(start.AddDate(0, i, 0))
		trends.MedicalRecords = append(trends.MedicalRecords, DataPoint{Label: label, Value: recordCounts[label]})
		trends.UserOnboarding = append(trends.UserOnboarding, DataPoint{Label: label, Value: userCounts[label]})
	}
	return trends
}

func outcomeDistribution(stats recordStats) []DataPoint {
	points := []DataPoint{}
	for _, key := range []int{treatmentRecovered, treatmentImproved, treatmentNoChange, treatmentWorse, treatmentDeath} {
		percentage := percent(stats.OutcomeCounts[key], stats.TotalRecords)
		points = append(points, DataPoint{Label: treatmentLabels[key], Value: stats.OutcomeCounts[key], Percentage: &percentage})
	}
	return points
}

func admissionDistribution(stats recordStats) []DataPoint {
	points := []DataPoint{}
	for _, key := range []int{1, 2, 3} {
		points = append(points, DataPoint{Label: admissionLabels[key], Value: stats.AdmissionTypeCounts[key]})
	}
	return points
}

func mortalityFrom(stats recordStats) MortalityStats {
	return MortalityStats{Before24h: stats.Before24h, After24h: stats.After24h, AutopsyRate: percent(stats.AutopsyCount, stats.DeathCount)}
}
