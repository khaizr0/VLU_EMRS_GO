package usecase

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/mapper"
)

// List authorizes read access, maps filters, then asks the store for paged records.
func (s *Service) List(ctx context.Context, claims auth.Claims, request dto.ListRequest) (dto.PagedResult, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return dto.PagedResult{}, err
	}
	if !canReadRecords(currentUser) {
		return dto.PagedResult{}, domain.ErrForbidden
	}

	filters, err := mapper.FiltersFromRequest(request)
	if err != nil {
		return dto.PagedResult{}, err
	}
	records, totalCount, err := s.repository.List(ctx, filters)
	if err != nil {
		return dto.PagedResult{}, err
	}
	return mapper.NewPagedResult(records, totalCount, filters.PageSize, filters.PageNumber), nil
}

// Get authorizes read access, then asks the store for a full medical record.
func (s *Service) Get(ctx context.Context, claims auth.Claims, id int) (domain.MedicalRecord, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	if !canReadRecords(currentUser) {
		return domain.MedicalRecord{}, domain.ErrForbidden
	}
	return s.repository.GetByID(ctx, id)
}
