package department

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

func (s *Service) adminDepartment(ctx context.Context, claims auth.Claims, departmentID int) (domain.Department, error) {
	if err := s.requireAdmin(ctx, claims); err != nil {
		return domain.Department{}, err
	}
	return s.repository.GetByID(ctx, departmentID)
}

func (s *Service) requireAdmin(ctx context.Context, claims auth.Claims) error {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return err
	}
	if !canManageDepartments(currentUser) {
		return domain.ErrForbidden
	}
	return nil
}

func (s *Service) currentDepartmentAndUser(ctx context.Context, claims auth.Claims, departmentID int, userID int) (domain.User, domain.Department, domain.User, error) {
	currentUser, department, err := s.currentAndDepartment(ctx, claims, departmentID)
	if err != nil {
		return domain.User{}, domain.Department{}, domain.User{}, err
	}
	targetUser, err := s.repository.GetUserByID(ctx, userID)
	if err != nil {
		return domain.User{}, domain.Department{}, domain.User{}, err
	}
	return currentUser, department, targetUser, nil
}

func (s *Service) currentAndDepartment(ctx context.Context, claims auth.Claims, departmentID int) (domain.User, domain.Department, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return domain.User{}, domain.Department{}, err
	}
	department, err := s.repository.GetByID(ctx, departmentID)
	if err != nil {
		return domain.User{}, domain.Department{}, err
	}
	return currentUser, department, nil
}

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
