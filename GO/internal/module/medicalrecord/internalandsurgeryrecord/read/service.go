package read

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/base"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/recorddetail"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
)

type Service struct {
	baseStore   *base.Store
	detailStore *recorddetail.Store
}

func NewService(baseStore *base.Store, detailStore *recorddetail.Store) *Service {
	return &Service{baseStore: baseStore, detailStore: detailStore}
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
	return s.detailStore.Attach(ctx, record)
}
