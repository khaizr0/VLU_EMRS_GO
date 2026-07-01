package xray

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/shared"
)

type Service struct {
	store       *Store
	sharedStore *shared.Store
}

// NewService wires x-ray rules to database stores.
func NewService(store *Store, sharedStore *shared.Store) *Service {
	return &Service{store: store, sharedStore: sharedStore}
}

// Create adds a new x-ray request to a medical record.
func (s *Service) Create(ctx context.Context, claims auth.Claims, recordID int, request CreateRequest) (int, error) {
	user, err := s.requireWrite(ctx, claims, recordID)
	if err != nil {
		return 0, err
	}
	description, err := shared.RequiredText(request.RequestDescription)
	if err != nil {
		return 0, err
	}
	requestedAt, err := shared.Date(request.RequestedAt)
	if err != nil {
		return 0, err
	}
	return s.store.Insert(ctx, domain.XRay{
		MedicalRecordID:    recordID,
		RequestedByID:      user.ID,
		Status:             0,
		RequestDescription: description,
		RequestedAt:        requestedAt,
		DepartmentOfHealth: shared.CleanText(request.DepartmentOfHealth),
		HospitalName:       shared.CleanText(request.HospitalName),
		FormNumber:         shared.CleanText(request.FormNumber),
		RoomNumber:         shared.CleanText(request.RoomNumber),
	})
}

// ChangeStatus advances the x-ray workflow and records who changed it.
func (s *Service) ChangeStatus(ctx context.Context, claims auth.Claims, recordID int, id int, request StatusRequest) error {
	user, err := s.requireWrite(ctx, claims, recordID)
	if err != nil {
		return err
	}
	if request.Status == nil || *request.Status < 0 || *request.Status > 3 {
		return domain.ErrInvalidClinicalRequest
	}
	departmentName, err := shared.RequiredText(request.DepartmentName)
	if err != nil {
		return err
	}
	return s.store.UpdateStatus(ctx, recordID, id, *request.Status, departmentName, user.ID)
}

// Complete saves final x-ray result fields.
func (s *Service) Complete(ctx context.Context, claims auth.Claims, recordID int, id int, request CompleteRequest) error {
	user, err := s.requireWrite(ctx, claims, recordID)
	if err != nil {
		return err
	}
	completedAt, err := shared.Date(request.CompletedAt)
	if err != nil {
		return err
	}
	return s.store.Complete(ctx, recordID, id, user.ID, domain.XRay{
		CompletedAt:        completedAt,
		DepartmentOfHealth: shared.CleanText(request.DepartmentOfHealth),
		HospitalName:       shared.CleanText(request.HospitalName),
		FormNumber:         shared.CleanText(request.FormNumber),
		RoomNumber:         shared.CleanText(request.RoomNumber),
		ResultDescription:  shared.CleanText(request.ResultDescription),
		DoctorAdvice:       shared.CleanText(request.DoctorAdvice),
	})
}

// Delete removes one x-ray form after write authorization.
func (s *Service) Delete(ctx context.Context, claims auth.Claims, recordID int, id int) error {
	if _, err := s.requireWrite(ctx, claims, recordID); err != nil {
		return err
	}
	return s.store.Delete(ctx, recordID, id)
}

func (s *Service) requireWrite(ctx context.Context, claims auth.Claims, recordID int) (domain.User, error) {
	user, err := shared.RequireWrite(ctx, s.sharedStore, claims)
	if err != nil {
		return domain.User{}, err
	}
	exists, err := s.sharedStore.MedicalRecordExists(ctx, recordID)
	if err != nil {
		return domain.User{}, err
	}
	if !exists {
		return domain.User{}, domain.ErrMedicalRecordNotFound
	}
	return user, nil
}
