package department

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) ListDepartments(ctx context.Context, claims auth.Claims) ([]domain.Department, error) {
	currentUser, err := s.currentUser(ctx, claims)
	if err != nil {
		return nil, err
	}
	if !canReadDepartments(currentUser) {
		return nil, domain.ErrForbidden
	}
	return s.repository.ListDepartments(ctx)
}

func (s *Service) Create(ctx context.Context, claims auth.Claims, name string) (int, error) {
	if err := s.requireAdmin(ctx, claims); err != nil {
		return 0, err
	}

	name, err := cleanDepartmentName(name)
	if err != nil {
		return 0, err
	}
	return s.repository.Create(ctx, name)
}

func (s *Service) Update(ctx context.Context, claims auth.Claims, id int, name string) error {
	department, err := s.adminDepartment(ctx, claims, id)
	if err != nil {
		return err
	}

	name, err = cleanDepartmentName(name)
	if err != nil {
		return err
	}
	return s.repository.UpdateName(ctx, department.ID, name)
}

func (s *Service) Delete(ctx context.Context, claims auth.Claims, id int) error {
	department, err := s.adminDepartment(ctx, claims, id)
	if err != nil {
		return err
	}
	return s.repository.Delete(ctx, department.ID)
}

func (s *Service) AssignUser(ctx context.Context, claims auth.Claims, departmentID int, userID int) error {
	currentUser, department, targetUser, err := s.currentDepartmentAndUser(ctx, claims, departmentID, userID)
	if err != nil {
		return err
	}
	if !canAssignDepartmentUser(currentUser, department) {
		return domain.ErrForbidden
	}
	if userBelongsToOtherDepartment(targetUser, department.ID) {
		return domain.ErrUserAlreadyInOtherDepartment
	}
	return s.repository.AssignUser(ctx, department.ID, targetUser.ID)
}

func (s *Service) UnassignUser(ctx context.Context, claims auth.Claims, departmentID int, userID int) error {
	currentUser, department, targetUser, err := s.currentDepartmentAndUser(ctx, claims, departmentID, userID)
	if err != nil {
		return err
	}
	if !canUnassignDepartmentUser(currentUser, department) {
		return domain.ErrForbidden
	}
	if userNotInDepartment(targetUser, department.ID) {
		return domain.ErrUserNotInDepartment
	}
	if isHeadUser(targetUser, department) && currentUser.RoleName != roleAdmin {
		return domain.ErrForbidden
	}
	return s.repository.UnassignUser(ctx, department.ID, targetUser.ID)
}

func (s *Service) AssignHead(ctx context.Context, claims auth.Claims, departmentID int, userID int) error {
	department, err := s.adminDepartment(ctx, claims, departmentID)
	if err != nil {
		return err
	}

	targetUser, err := s.repository.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}
	if userBelongsToOtherDepartment(targetUser, department.ID) {
		return domain.ErrUserAlreadyInOtherDepartment
	}
	if _, err := s.repository.DepartmentByHeadUser(ctx, targetUser.ID, department.ID); err == nil {
		return domain.ErrUserAlreadyHeadOfOtherDepartment
	} else if err != domain.ErrDepartmentNotFound {
		return err
	}
	return s.repository.AssignHead(ctx, department.ID, targetUser.ID)
}

func (s *Service) UnassignHead(ctx context.Context, claims auth.Claims, departmentID int, userID int) error {
	department, err := s.adminDepartment(ctx, claims, departmentID)
	if err != nil {
		return err
	}
	if department.HeadUserID == nil {
		return domain.ErrDepartmentHasNoHead
	}
	if *department.HeadUserID != userID {
		return domain.ErrUserIsNotDepartmentHead
	}
	return s.repository.UnassignHead(ctx, department.ID)
}
