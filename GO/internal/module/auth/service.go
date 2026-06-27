package auth

import (
	"context"
	"strings"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Service struct {
	repository *Repository
	domainRole map[string]string
}

type MicrosoftUser struct {
	IdentityID string
	Email      string
	Name       string
	RoleName   string
}

func NewService(repository *Repository, domainRole map[string]string) *Service {
	return &Service{
		repository: repository,
		domainRole: domainRole,
	}
}

func (s *Service) Sync(ctx context.Context, claims Claims) (domain.User, bool, error) {
	microsoftUser, err := s.microsoftUserFromClaims(claims)
	if err != nil {
		return domain.User{}, false, err
	}

	return s.repository.SyncUser(ctx, microsoftUser)
}

func (s *Service) Me(ctx context.Context, claims Claims) (domain.User, error) {
	microsoftUser, err := s.microsoftUserFromClaims(claims)
	if err != nil {
		return domain.User{}, err
	}

	user, err := s.repository.GetByIdentityKey(ctx, microsoftUser.IdentityID)
	if err != nil {
		return domain.User{}, err
	}
	if !user.Active {
		return domain.User{}, domain.ErrInactiveUser
	}
	return user, nil
}

func (s *Service) microsoftUserFromClaims(claims Claims) (MicrosoftUser, error) {
	email, err := claims.LoginEmail()
	if err != nil {
		return MicrosoftUser{}, err
	}

	at := strings.LastIndex(email, "@")
	if at < 0 || at == len(email)-1 {
		return MicrosoftUser{}, domain.ErrEmailDomainNotAllowed
	}

	emailDomain := strings.ToLower(email[at+1:])
	role, ok := s.domainRole[emailDomain]
	if !ok {
		return MicrosoftUser{}, domain.ErrEmailDomainNotAllowed
	}

	name := strings.TrimSpace(claims.Name)
	if name == "" {
		name = email
	}

	return MicrosoftUser{
		IdentityID: claims.IdentityKey(),
		Email:      email,
		Name:       name,
		RoleName:   role,
	}, nil
}
