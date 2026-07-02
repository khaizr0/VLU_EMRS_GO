package statistics

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Store struct {
	db *pgxpool.Pool
}

// NewStore wires PostgreSQL access for dashboard statistics.
func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

// GetUserByIdentityKey resolves Microsoft identity into a local user.
func (s *Store) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, s.db, identityKey)
}

// RecordStats returns filtered aggregate counts for medical records.
func (s *Store) RecordStats(ctx context.Context, filters Filters) (recordStats, error) {
	where, args := recordWhere(filters)
	stats := recordStats{OutcomeCounts: map[int]int{}, AdmissionTypeCounts: map[int]int{}}
	err := s.db.QueryRow(ctx, recordStatsSQL+where, args...).Scan(
		&stats.TotalRecords, &stats.SurgeryCount, &stats.ProcedureCount, &stats.EmergencyCount,
		&stats.DeathCount, &stats.Before24h, &stats.After24h, &stats.AutopsyCount,
	)
	if err != nil {
		return recordStats{}, fmt.Errorf("query dashboard record stats: %w", err)
	}
	stats.OutcomeCounts, err = s.distribution(ctx, `"TreatmentResult"`, where, args)
	if err != nil {
		return recordStats{}, err
	}
	stats.AdmissionTypeCounts, err = s.distribution(ctx, `"AdmissionType"`, where, args)
	if err != nil {
		return recordStats{}, err
	}
	return stats, nil
}

// UserGrowth returns new user counts for this month and last month.
func (s *Store) UserGrowth(ctx context.Context, startOfThisMonth time.Time, startOfLastMonth time.Time) (int, int, error) {
	var thisMonth, lastMonth int
	err := s.db.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE "CreateAt" >= $1)::int,
			COUNT(*) FILTER (WHERE "CreateAt" >= $2 AND "CreateAt" < $1)::int
		FROM "Users"
	`, startOfThisMonth, startOfLastMonth).Scan(&thisMonth, &lastMonth)
	if err != nil {
		return 0, 0, fmt.Errorf("query dashboard user growth: %w", err)
	}
	return thisMonth, lastMonth, nil
}

// RecordTrend returns monthly medical record counts for the chart window.
func (s *Store) RecordTrend(ctx context.Context, filters Filters, start time.Time, end time.Time) (map[string]int, error) {
	where, args := recordWhere(filters)
	args = append(args, start, end)
	return s.monthlyCounts(ctx, trendSQL(where, len(args)-2), args)
}

// UserTrend returns monthly new-user counts for the chart window.
func (s *Store) UserTrend(ctx context.Context, start time.Time, end time.Time) (map[string]int, error) {
	return s.monthlyCounts(ctx, userTrendSQL, []any{start, end})
}

func (s *Store) distribution(ctx context.Context, column string, where string, args []any) (map[int]int, error) {
	rows, err := s.db.Query(ctx, distributionSQL(column, where), args...)
	if err != nil {
		return nil, fmt.Errorf("query dashboard distribution: %w", err)
	}
	defer rows.Close()

	counts := map[int]int{}
	for rows.Next() {
		var key *int
		var count int
		if err := rows.Scan(&key, &count); err != nil {
			return nil, fmt.Errorf("scan dashboard distribution: %w", err)
		}
		if key != nil {
			counts[*key] = count
		}
	}
	return counts, rows.Err()
}

func (s *Store) monthlyCounts(ctx context.Context, sql string, args []any) (map[string]int, error) {
	rows, err := s.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("query dashboard monthly counts: %w", err)
	}
	defer rows.Close()

	counts := map[string]int{}
	for rows.Next() {
		var month time.Time
		var count int
		if err := rows.Scan(&month, &count); err != nil {
			return nil, fmt.Errorf("scan dashboard monthly counts: %w", err)
		}
		counts[monthLabel(month)] = count
	}
	return counts, rows.Err()
}
