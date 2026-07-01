package recordcomposer

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/hematology"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/xray"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/recorddetail"
)

type Store struct {
	detailStore     *recorddetail.Store
	xrayStore       *xray.Store
	hematologyStore *hematology.Store
}

// NewStore wires the full medical record detail response composer.
func NewStore(db *pgxpool.Pool, detailStore *recorddetail.Store) *Store {
	return &Store{
		detailStore:     detailStore,
		xrayStore:       xray.NewStore(db),
		hematologyStore: hematology.NewStore(db),
	}
}

// Attach adds internal/surgery detail plus clinical forms to one record response.
func (s *Store) Attach(ctx context.Context, record domain.MedicalRecord) (domain.MedicalRecord, error) {
	var err error
	record, err = s.detailStore.Attach(ctx, record)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	record.XRays, err = s.xrayStore.ListByRecordID(ctx, record.ID)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	record.Hematologies, err = s.hematologyStore.ListByRecordID(ctx, record.ID)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	return record, nil
}
