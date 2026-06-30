package store

import (
	"context"
	"fmt"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/query"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/scanner"
)

// List returns paged medical record items and the total matching count.
func (r *Repository) List(ctx context.Context, filters Filters) ([]domain.MedicalRecordItem, int, error) {
	where, args := query.RecordWhere(filters)

	var totalCount int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*)`+query.RecordsFrom+where, args...).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("count medical records: %w", err)
	}

	limitArgs := append(args, filters.PageSize, filters.PageSize*(filters.PageNumber-1))
	rows, err := r.db.Query(ctx, query.ListRecordsSQL(where, len(args)), limitArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("query medical records: %w", err)
	}
	defer rows.Close()

	records := []domain.MedicalRecordItem{}
	for rows.Next() {
		record, err := scanner.RecordItem(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("query medical records: %w", err)
	}
	return records, totalCount, nil
}
