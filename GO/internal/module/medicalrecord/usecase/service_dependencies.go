package usecase

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store"
)

// Service coordinates authorization, mapping, and store calls for records.
type Service struct {
	repository *store.Repository
}

// NewService receives the store facade used by all medical record usecases.
func NewService(repository *store.Repository) *Service {
	return &Service{repository: repository}
}

// currentUser resolves claims into an active local user before authorization.
func (s *Service) currentUser(ctx context.Context, claims auth.Claims) (domain.User, error) {
	user, err := s.repository.GetUserByIdentityKey(ctx, claims.IdentityKey())
	if err != nil {
		return domain.User{}, err
	}
	if !user.Active {
		return domain.User{}, domain.ErrInactiveUser
	}
	return user, nil
}

// requirePatient ensures create flow targets an existing patient record.
func (s *Service) requirePatient(ctx context.Context, id int) error {
	exists, err := s.repository.PatientExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return domain.ErrPatientNotFound
	}
	return nil
}
