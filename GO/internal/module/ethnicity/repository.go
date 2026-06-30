package ethnicity

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListEthnicities(ctx context.Context) ([]domain.Ethnicity, error) {
	rows, err := r.db.Query(ctx, `SELECT "Id", "Name" FROM "Ethnicities" ORDER BY "Id"`)
	if err != nil {
		return nil, fmt.Errorf("query ethnicities: %w", err)
	}
	defer rows.Close()

	var ethnicities []domain.Ethnicity
	for rows.Next() {
		var ethnicity domain.Ethnicity
		if err := rows.Scan(&ethnicity.ID, &ethnicity.Name); err != nil {
			return nil, fmt.Errorf("scan ethnicity: %w", err)
		}
		ethnicities = append(ethnicities, ethnicity)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query ethnicities: %w", err)
	}
	return ethnicities, nil
}
