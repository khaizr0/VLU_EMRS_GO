package patient

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

// Service coordinates authorization, validation, and store calls for patients.
type Service struct {
	store *Store
}

// NewService receives the patient store used by all patient usecases.
func NewService(store *Store) *Service {
	return &Service{store: store}
}

// List authorizes read access, maps filters, then asks the store for paged patients.
func (s *Service) List(ctx context.Context, claims auth.Claims, request ListRequest) (PagedResult, error) {
	if err := s.requireRead(ctx, claims); err != nil {
		return PagedResult{}, err
	}

	filters, err := listFilters(request)
	if err != nil {
		return PagedResult{}, err
	}
	patients, totalCount, err := s.store.List(ctx, filters)
	if err != nil {
		return PagedResult{}, err
	}
	return newPagedResult(patients, totalCount, filters.PageSize, filters.PageNumber), nil
}

// Get authorizes read access, then asks the store for one patient.
func (s *Service) Get(ctx context.Context, claims auth.Claims, id int) (domain.Patient, error) {
	if err := s.requireRead(ctx, claims); err != nil {
		return domain.Patient{}, err
	}
	return s.store.GetByID(ctx, id)
}

// Create authorizes write access, validates input, then inserts through the store.
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
	return s.store.Create(ctx, patient)
}

// Update authorizes write access, validates input, then updates through the store.
func (s *Service) Update(ctx context.Context, claims auth.Claims, id int, request PatientRequest) error {
	if _, err := s.requireWrite(ctx, claims); err != nil {
		return err
	}
	if _, err := s.store.GetByID(ctx, id); err != nil {
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
	return s.store.Update(ctx, patient)
}

// Delete authorizes write access, verifies existence, then removes through the store.
func (s *Service) Delete(ctx context.Context, claims auth.Claims, id int) error {
	if _, err := s.requireWrite(ctx, claims); err != nil {
		return err
	}
	if _, err := s.store.GetByID(ctx, id); err != nil {
		return err
	}
	return s.store.Delete(ctx, id)
}

// requireRead resolves the local user and checks read permission.
func (s *Service) requireRead(ctx context.Context, claims auth.Claims) error {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return err
	}
	if !canReadPatients(currentUser) {
		return domain.ErrForbidden
	}
	return nil
}

// requireWrite resolves the local user and checks write permission.
func (s *Service) requireWrite(ctx context.Context, claims auth.Claims) (domain.User, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return domain.User{}, err
	}
	if !canWritePatients(currentUser) {
		return domain.User{}, domain.ErrForbidden
	}
	return currentUser, nil
}

// validateReferences verifies ethnicity and unique health insurance references.
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

// currentUser resolves Microsoft claims into an active local user.
func (s *Service) currentUser(ctx context.Context, claims auth.Claims) (domain.User, error) {
	user, err := s.store.GetUserByIdentityKey(ctx, claims.IdentityKey())
	if err != nil {
		return domain.User{}, err
	}
	if !user.Active {
		return domain.User{}, domain.ErrInactiveUser
	}
	return user, nil
}
