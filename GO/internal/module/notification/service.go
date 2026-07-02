package notification

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

type Service struct {
	repository *Repository
}

// NewService wires notification business rules to the repository.
func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

// List returns notifications for the current active user.
func (s *Service) List(ctx context.Context, claims auth.Claims) ([]domain.UserNotification, error) {
	user, err := s.currentUser(ctx, claims)
	if err != nil {
		return nil, err
	}
	return s.repository.ListByUser(ctx, user.ID)
}

// MarkRead marks one user notification as read.
func (s *Service) MarkRead(ctx context.Context, claims auth.Claims, id int) error {
	user, err := s.currentUser(ctx, claims)
	if err != nil {
		return err
	}
	return s.repository.MarkRead(ctx, id, user)
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
