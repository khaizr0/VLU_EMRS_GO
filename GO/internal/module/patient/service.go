package patient

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

type Service struct {
	store *PatientStore
}

// NewService wires patient business logic to the patient store.
func NewService(store *PatientStore) *Service {
	return &Service{store: store}
}

// List checks read permission and returns paged patients.
func (s *Service) List(ctx context.Context, claims auth.Claims, filters PatientFilters) (PagedResult, error) {
	if err := s.requireRead(ctx, claims); err != nil {
		return PagedResult{}, err
	}

	patients, totalCount, err := s.store.ListPatients(ctx, filters)
	if err != nil {
		return PagedResult{}, err
	}
	return newPagedResult(patients, totalCount, filters.PageSize, filters.PageNumber), nil
}

// Get checks read permission and returns one patient.
func (s *Service) Get(ctx context.Context, claims auth.Claims, id int) (domain.Patient, error) {
	if err := s.requireRead(ctx, claims); err != nil {
		return domain.Patient{}, err
	}
	return s.store.FindPatientByID(ctx, id)
}

// Create checks write permission, validates input, and inserts one patient.
func (s *Service) Create(ctx context.Context, claims auth.Claims, request PatientRequest) (int, error) {
	currentUser, err := s.requireWrite(ctx, claims)
	if err != nil {
		return 0, err
	}

	patient, err := patientFromRequest(request)
	if err != nil {
		return 0, err
	}
	patient.CreatedBy = currentUser.ID
	if err := s.validateReferences(ctx, patient, 0); err != nil {
		return 0, err
	}
	return s.store.InsertPatient(ctx, patient)
}

// Update checks write permission, validates input, and replaces editable patient fields.
func (s *Service) Update(ctx context.Context, claims auth.Claims, id int, request PatientRequest) error {
	if _, err := s.requireWrite(ctx, claims); err != nil {
		return err
	}
	if _, err := s.store.FindPatientByID(ctx, id); err != nil {
		return err
	}

	patient, err := patientFromRequest(request)
	if err != nil {
		return err
	}
	patient.ID = id
	if err := s.validateReferences(ctx, patient, id); err != nil {
		return err
	}
	return s.store.UpdatePatient(ctx, patient)
}

// Delete checks write permission, verifies existence, and removes one patient.
func (s *Service) Delete(ctx context.Context, claims auth.Claims, id int) error {
	if _, err := s.requireWrite(ctx, claims); err != nil {
		return err
	}
	if _, err := s.store.FindPatientByID(ctx, id); err != nil {
		return err
	}
	return s.store.DeletePatient(ctx, id)
}

// validateReferences checks foreign keys and unique health insurance constraints.
func (s *Service) validateReferences(ctx context.Context, patient domain.Patient, patientID int) error {
	ethnicityExists, err := s.store.EthnicityExists(ctx, patient.EthnicityID)
	if err != nil {
		return err
	}
	if !ethnicityExists {
		return domain.ErrInvalidEthnicity
	}

	exists, err := s.store.HealthInsuranceExists(ctx, patient.HealthInsuranceNumber, patientID)
	if err != nil {
		return err
	}
	if exists {
		return domain.ErrDuplicateHealthInsuranceNumber
	}
	return nil
}
