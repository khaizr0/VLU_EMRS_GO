package write

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/base"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/dto"
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

func (s *Service) Create(ctx context.Context, claims auth.Claims, patientID int, request dto.Request) (int, error) {
	currentUser, err := s.authorizeWrite(ctx, claims)
	if err != nil {
		return 0, err
	}
	if err := s.requirePatient(ctx, patientID); err != nil {
		return 0, err
	}
	record, err := recordFromRequest(patientID, request)
	if err != nil {
		return 0, err
	}
	record.CreatedBy = currentUser.ID

	var id int
	err = s.baseStore.RunInTx(ctx, func(tx pgx.Tx) error {
		createdID, err := s.baseStore.InsertRecord(ctx, tx, record)
		if err != nil {
			return err
		}
		id = createdID
		return s.detailStore.Replace(ctx, tx, id, record)
	})
	return id, err
}

func (s *Service) Update(ctx context.Context, claims auth.Claims, id int, request dto.Request) error {
	if _, err := s.authorizeWrite(ctx, claims); err != nil {
		return err
	}
	existing, err := s.baseStore.FindRecordByID(ctx, id)
	if err != nil {
		return err
	}
	record, err := recordFromRequest(existing.PatientID, request)
	if err != nil {
		return err
	}
	return s.baseStore.RunInTx(ctx, func(tx pgx.Tx) error {
		if err := s.baseStore.UpdateRecord(ctx, tx, id, record); err != nil {
			return err
		}
		return s.detailStore.Replace(ctx, tx, id, record)
	})
}

func (s *Service) authorizeWrite(ctx context.Context, claims auth.Claims) (domain.User, error) {
	currentUser, err := shared.CurrentUser(ctx, s.baseStore, claims)
	if err != nil {
		return domain.User{}, err
	}
	if !shared.CanWriteRecords(currentUser) {
		return domain.User{}, domain.ErrForbidden
	}
	return currentUser, nil
}

func (s *Service) requirePatient(ctx context.Context, id int) error {
	exists, err := s.baseStore.PatientExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return domain.ErrPatientNotFound
	}
	return nil
}
