package account

import (
	"context"
	"strings"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) ListUsers(ctx context.Context, claims auth.Claims) ([]domain.User, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return nil, err
	}
	if !canReadUsers(currentUser) {
		return nil, domain.ErrForbidden
	}

	users, err := s.repository.ListUsers(ctx)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (s *Service) GetUser(ctx context.Context, claims auth.Claims, id int) (domain.User, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return domain.User{}, err
	}

	user, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return domain.User{}, err
	}
	if !canReadUser(currentUser, user) {
		return domain.User{}, domain.ErrForbidden
	}
	return user, nil
}

func (s *Service) ChangeActive(ctx context.Context, claims auth.Claims, id int, active bool) error {
	currentUser, targetUser, err := s.currentAndTargetUser(ctx, claims, id)
	if err != nil {
		return err
	}
	if !canManageUser(currentUser, targetUser) {
		if targetUser.RoleName == domain.RoleAdmin {
			return domain.ErrCannotModifyAdmin
		}
		return domain.ErrForbidden
	}
	return s.repository.UpdateActive(ctx, id, active)
}

func (s *Service) ChangeRole(ctx context.Context, claims auth.Claims, id int, role string) error {
	role = strings.TrimSpace(role)
	if !validAssignableRole(role) {
		return domain.ErrInvalidUserRole
	}

	currentUser, targetUser, err := s.currentAndTargetUser(ctx, claims, id)
	if err != nil {
		return err
	}
	if !canManageUser(currentUser, targetUser) {
		if targetUser.RoleName == domain.RoleAdmin {
			return domain.ErrCannotModifyAdmin
		}
		return domain.ErrForbidden
	}
	return s.repository.UpdateRole(ctx, id, role)
}

func (s *Service) UpdateSetting(ctx context.Context, claims auth.Claims, id int, isReceivedEmail bool) error {
	currentUser, targetUser, err := s.currentAndTargetUser(ctx, claims, id)
	if err != nil {
		return err
	}
	if !canUpdateUserSetting(currentUser, targetUser) {
		return domain.ErrForbidden
	}
	return s.repository.UpdateSetting(ctx, id, isReceivedEmail)
}

func (s *Service) currentAndTargetUser(ctx context.Context, claims auth.Claims, id int) (domain.User, domain.User, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return domain.User{}, domain.User{}, err
	}

	targetUser, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return domain.User{}, domain.User{}, err
	}
	return currentUser, targetUser, nil
}

func (s *Service) currentUser(ctx context.Context, claims auth.Claims) (domain.User, error) {
	user, err := s.repository.GetByIdentityKey(ctx, claims.IdentityKey())
	if err != nil {
		return domain.User{}, err
	}
	if !user.Active {
		return domain.User{}, domain.ErrInactiveUser
	}
	return user, nil
}
