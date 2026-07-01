package patient

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

// requireRead verifies the current user can view patient data.
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

// requireWrite verifies the current user can modify patient data and returns that user for CreatedBy fields.
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

// currentUser resolves Microsoft claims into one active local user.
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

// canReadPatients allows every medical role to read patients.
func canReadPatients(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher || current.RoleName == domain.RoleStudent
}

// canWritePatients limits patient mutations to admin and teacher roles.
func canWritePatients(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher
}
