package store

import (
	"context"
	"fmt"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/children"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/query"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/storagecode"
)

// Create inserts a medical record and all child rows in one transaction.
func (r *Repository) Create(ctx context.Context, record domain.MedicalRecord) (int, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin create medical record: %w", err)
	}
	defer tx.Rollback(ctx)

	storageCode, err := storagecode.Generate(ctx, tx)
	if err != nil {
		return 0, err
	}
	record.StorageCode = &storageCode
	record.CreatedAt = time.Now()

	var id int
	if err := tx.QueryRow(ctx, query.InsertRecordSQL(), query.RecordValues(record)...).Scan(&id); err != nil {
		return 0, fmt.Errorf("create medical record: %w", err)
	}
	if err := children.Replace(ctx, tx, id, record); err != nil {
		return 0, err
	}
	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit create medical record: %w", err)
	}
	return id, nil
}

// Update replaces editable record fields and child rows in one transaction.
func (r *Repository) Update(ctx context.Context, id int, record domain.MedicalRecord) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin update medical record: %w", err)
	}
	defer tx.Rollback(ctx)

	args := append(query.UpdateRecordValues(record), id)
	if _, err := tx.Exec(ctx, query.UpdateRecordSQL(), args...); err != nil {
		return fmt.Errorf("update medical record: %w", err)
	}
	if err := children.Replace(ctx, tx, id, record); err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit update medical record: %w", err)
	}
	return nil
}

// Delete removes one medical record and cascaded child rows through database constraints.
func (r *Repository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, `DELETE FROM "MedicalRecords" WHERE "Id" = $1`, id)
	if err != nil {
		return fmt.Errorf("delete medical record: %w", err)
	}
	return nil
}
