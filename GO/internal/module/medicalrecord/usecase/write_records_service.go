package usecase

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/mapper"
)

// Create keeps the current generic endpoint wired to the general record flow.
func (s *Service) Create(ctx context.Context, claims auth.Claims, patientID int, request dto.RecordRequest) (int, error) {
	return s.CreateGeneral(ctx, claims, patientID, request)
}

// CreateGeneral authorizes write access, maps the general DTO, then inserts through the store.
func (s *Service) CreateGeneral(ctx context.Context, claims auth.Claims, patientID int, request dto.GeneralRecordRequest) (int, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return 0, err
	}
	if !canWriteRecords(currentUser) {
		return 0, domain.ErrForbidden
	}
	if err := s.requirePatient(ctx, patientID); err != nil {
		return 0, err
	}

	record, err := mapper.GeneralRecordFromRequest(patientID, request)
	if err != nil {
		return 0, err
	}
	record.CreatedBy = currentUser.ID
	return s.repository.Create(ctx, record)
}

// Update keeps the current generic endpoint wired to the general record flow.
func (s *Service) Update(ctx context.Context, claims auth.Claims, id int, request dto.RecordRequest) error {
	return s.UpdateGeneral(ctx, claims, id, request)
}

// UpdateGeneral authorizes write access, preserves patient ownership, then updates through the store.
func (s *Service) UpdateGeneral(ctx context.Context, claims auth.Claims, id int, request dto.GeneralRecordRequest) error {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return err
	}
	if !canWriteRecords(currentUser) {
		return domain.ErrForbidden
	}

	existing, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return err
	}
	record, err := mapper.GeneralRecordFromRequest(existing.PatientID, request)
	if err != nil {
		return err
	}
	return s.repository.Update(ctx, id, record)
}

// Delete authorizes write access, verifies existence, then removes through the store.
func (s *Service) Delete(ctx context.Context, claims auth.Claims, id int) error {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return err
	}
	if !canWriteRecords(currentUser) {
		return domain.ErrForbidden
	}
	if _, err := s.repository.GetByID(ctx, id); err != nil {
		return err
	}
	return s.repository.Delete(ctx, id)
}
