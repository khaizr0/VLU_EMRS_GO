package shared

import (
	"context"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
)

type UserStore interface {
	GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error)
}

// CurrentUser loads the active local user behind verified Microsoft claims.
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

// RequireWrite allows only Admin and Teacher to mutate clinical forms.
func RequireWrite(ctx context.Context, store UserStore, claims auth.Claims) (domain.User, error) {
	user, err := CurrentUser(ctx, store, claims)
	if err != nil {
		return domain.User{}, err
	}
	if user.RoleName != domain.RoleAdmin && user.RoleName != domain.RoleTeacher {
		return domain.User{}, domain.ErrForbidden
	}
	return user, nil
}
