package hematology

import (
	"context"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/shared"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/notification/publish"
)

type Service struct {
	store       *Store
	publisher   *publish.Service
	sharedStore *shared.Store
}

// NewService wires hematology rules to database stores.
func NewService(store *Store, sharedStore *shared.Store, publisher *publish.Service) *Service {
	return &Service{store: store, sharedStore: sharedStore, publisher: publisher}
}

// Create adds a new hematology request to a medical record.
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
	recipients, err := s.publisher.ResolveInitialRecipients(ctx, request.ListDepartmentID, request.AdditionalUserIDs)
	if err != nil {
		return 0, err
	}
	id, err := s.store.Insert(ctx, domain.Hematology{
		MedicalRecordID:    recordID,
		RequestedByID:      user.ID,
		Status:             0,
		RequestDescription: &description,
		RequestedAt:        requestedAt,
		DepartmentOfHealth: shared.CleanText(request.DepartmentOfHealth),
		HospitalName:       shared.CleanText(request.HospitalName),
		FormNumber:         shared.CleanText(request.FormNumber),
		RoomNumber:         shared.CleanText(request.RoomNumber),
	})
	if err != nil {
		return 0, err
	}
	if err := s.publisher.HematologyInitial(ctx, id, recipients); err != nil {
		return 0, err
	}
	return id, nil
}

// ChangeStatus advances the hematology workflow and records who changed it.
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
	if err := s.store.UpdateStatus(ctx, recordID, id, *request.Status, departmentName, user.ID); err != nil {
		return err
	}
	return s.publisher.HematologyStatusChanged(ctx, id, *request.Status)
}

// Complete saves final hematology result fields.
func (s *Service) Complete(ctx context.Context, claims auth.Claims, recordID int, id int, request CompleteRequest) error {
	user, err := s.requireWrite(ctx, claims, recordID)
	if err != nil {
		return err
	}
	completedAt, err := shared.Date(request.CompletedAt)
	if err != nil {
		return err
	}
	item := request.toDomain(completedAt)
	return s.store.Complete(ctx, recordID, id, user.ID, item)
}

// Delete removes one hematology form after write authorization.
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

// toDomain maps complete-result input into the hematology domain model.
func (r CompleteRequest) toDomain(completedAt *time.Time) domain.Hematology {
	return domain.Hematology{
		CompletedAt:           completedAt,
		DepartmentOfHealth:    shared.CleanText(r.DepartmentOfHealth),
		HospitalName:          shared.CleanText(r.HospitalName),
		FormNumber:            shared.CleanText(r.FormNumber),
		RoomNumber:            shared.CleanText(r.RoomNumber),
		RequestDescription:    shared.CleanText(r.RequestDescription),
		RedBloodCellCount:     r.RedBloodCellCount,
		WhiteBloodCellCount:   r.WhiteBloodCellCount,
		Hemoglobin:            r.Hemoglobin,
		Hematocrit:            r.Hematocrit,
		Mcv:                   r.Mcv,
		Mch:                   r.Mch,
		Mchc:                  r.Mchc,
		ReticulocyteCount:     r.ReticulocyteCount,
		PlateletCount:         r.PlateletCount,
		Neutrophil:            r.Neutrophil,
		Eosinophil:            r.Eosinophil,
		Basophil:              r.Basophil,
		Monocyte:              r.Monocyte,
		Lymphocyte:            r.Lymphocyte,
		NucleatedRedBloodCell: shared.CleanText(r.NucleatedRedBloodCell),
		AbnormalCells:         shared.CleanText(r.AbnormalCells),
		MalariaParasite:       shared.CleanText(r.MalariaParasite),
		Esr1h:                 r.Esr1h,
		Esr2h:                 r.Esr2h,
		BleedingTime:          r.BleedingTime,
		ClottingTime:          r.ClottingTime,
		BloodTypeAbo:          r.BloodTypeAbo,
		BloodTypeRh:           r.BloodTypeRh,
	}
}
