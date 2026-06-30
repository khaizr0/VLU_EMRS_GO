package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/children"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/query"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/scanner"
)

// Repository is the store facade used by medical record usecases.
type Repository struct {
	db *pgxpool.Pool
}

// Filters exposes query filters without leaking the query package to usecases.
type Filters = query.Filters

// NewRepository wires PostgreSQL access for medical records.
func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

// GetByID loads one medical record with patient snapshot and child rows.
func (r *Repository) GetByID(ctx context.Context, id int) (domain.MedicalRecord, error) {
	record, err := scanner.Record(r.db.QueryRow(ctx, query.RecordByIDSQL, id))
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	return r.withChildren(ctx, record)
}

// withChildren attaches detail and transfer children after the root record is loaded.
func (r *Repository) withChildren(ctx context.Context, record domain.MedicalRecord) (domain.MedicalRecord, error) {
	var err error
	record.DepartmentTransfers, err = children.ListTransfers(ctx, r.db, record.ID)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	record.Detail, err = children.GetDetail(ctx, r.db, record.ID)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	record.XRays = []any{}
	record.Hematologies = []any{}
	return record, nil
}
