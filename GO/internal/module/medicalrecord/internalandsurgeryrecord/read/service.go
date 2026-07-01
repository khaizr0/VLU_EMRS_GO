package read

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/base"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
)

type RecordViewStore interface {
	Attach(ctx context.Context, record domain.MedicalRecord) (domain.MedicalRecord, error)
}

type Service struct {
	baseStore *base.Store
	viewStore RecordViewStore
}

func NewService(baseStore *base.Store, viewStore RecordViewStore) *Service {
	return &Service{baseStore: baseStore, viewStore: viewStore}
}

func (s *Service) List(ctx context.Context, claims auth.Claims, request shared.ListRequest) (shared.PagedResult, error) {
	currentUser, err := shared.CurrentUser(ctx, s.baseStore, claims)
	if err != nil {
		return shared.PagedResult{}, err
	}
	if !shared.CanReadRecords(currentUser) {
		return shared.PagedResult{}, domain.ErrForbidden
	}
	filters, err := shared.FiltersFromRequest(request)
	if err != nil {
		return shared.PagedResult{}, err
	}
	records, totalCount, err := s.baseStore.ListRecords(ctx, filters)
	if err != nil {
		return shared.PagedResult{}, err
	}
	return shared.NewPagedResult(records, totalCount, filters.PageSize, filters.PageNumber), nil
}

func (s *Service) Get(ctx context.Context, claims auth.Claims, id int) (domain.MedicalRecord, error) {
	currentUser, err := shared.CurrentUser(ctx, s.baseStore, claims)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	if !shared.CanReadRecords(currentUser) {
		return domain.MedicalRecord{}, domain.ErrForbidden
	}
	record, err := s.baseStore.FindRecordByID(ctx, id)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	return s.viewStore.Attach(ctx, record)
}
