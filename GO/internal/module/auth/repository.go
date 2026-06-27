package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) SyncUser(
	ctx context.Context,
	microsoftUser MicrosoftUser,
) (domain.User, bool, error) {
	user, err := r.GetByIdentityKey(ctx, microsoftUser.IdentityID)
	if err == nil {
		return r.updateUser(ctx, user, microsoftUser)
	}
	if !errors.Is(err, domain.ErrUserNotFound) {
		return domain.User{}, false, err
	}

	return r.createUser(ctx, microsoftUser)
}

func (r *Repository) GetByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return findUserByIdentity(ctx, r.db, identityKey)
}

func (r *Repository) updateUser(
	ctx context.Context,
	user domain.User,
	microsoftUser MicrosoftUser,
) (domain.User, bool, error) {
	if !user.Active {
		return domain.User{}, false, domain.ErrInactiveUser
	}
	_, err := r.db.Exec(ctx, `
		UPDATE "Users"
		SET "Email" = $1, "Name" = $2, "EmailVerify" = TRUE, "UpdateAt" = $3
		WHERE "Id" = $4
	`, microsoftUser.Email, microsoftUser.Name, time.Now(), user.ID)
	if err != nil {
		return domain.User{}, false, fmt.Errorf("update Microsoft user profile: %w", err)
	}

	updated, err := r.GetByIdentityKey(ctx, microsoftUser.IdentityID)
	return updated, false, err
}

func (r *Repository) createUser(
	ctx context.Context,
	microsoftUser MicrosoftUser,
) (domain.User, bool, error) {
	roleID, err := r.roleIDByName(ctx, microsoftUser.RoleName)
	if err != nil {
		return domain.User{}, false, err
	}

	now := time.Now()
	_, err = r.db.Exec(ctx, `
		INSERT INTO "Users" (
			"RoleId", "IdentityId", "Email", "EmailVerify", "Name", "PictureUrl",
			"CreateAt", "UpdateAt", "Active", "IsReceivedEmail"
		)
		VALUES ($1, $2, $3, TRUE, $4, '', $5, $5, TRUE, TRUE)
	`, roleID, microsoftUser.IdentityID, microsoftUser.Email, microsoftUser.Name, now)
	if err != nil {
		return domain.User{}, false, fmt.Errorf("create Microsoft user: %w", err)
	}

	created, err := r.GetByIdentityKey(ctx, microsoftUser.IdentityID)
	return created, true, err
}

func (r *Repository) roleIDByName(ctx context.Context, roleName string) (int, error) {
	var roleID int
	if err := r.db.QueryRow(ctx, `SELECT "Id" FROM "Roles" WHERE "Name" = $1`, roleName).Scan(&roleID); err != nil {
		return 0, fmt.Errorf("find role %q: %w", roleName, err)
	}
	return roleID, nil
}
