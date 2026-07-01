package shared

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

type UserStore interface {
	GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error)
}

func CurrentUser(ctx context.Context, store UserStore, claims auth.Claims) (domain.User, error) {
	user, err := store.GetUserByIdentityKey(ctx, claims.IdentityKey())
	if err != nil {
		return domain.User{}, err
	}
	if !user.Active {
		return domain.User{}, domain.ErrInactiveUser
	}
	return user, nil
}

func CanReadRecords(user domain.User) bool {
	return user.RoleName == domain.RoleAdmin || user.RoleName == domain.RoleTeacher || user.RoleName == domain.RoleStudent
}

func CanWriteRecords(user domain.User) bool {
	return user.RoleName == domain.RoleAdmin || user.RoleName == domain.RoleTeacher
}
