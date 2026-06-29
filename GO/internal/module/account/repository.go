package account

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListUsers(ctx context.Context) ([]domain.User, error) {
	rows, err := r.db.Query(ctx, database.UserQuery+` ORDER BY "u"."Id"`)
	if err != nil {
		return nil, fmt.Errorf("query users: %w", err)
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		user, err := database.ScanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query users: %w", err)
	}
	return users, nil
}

func (r *Repository) GetByID(ctx context.Context, id int) (domain.User, error) {
	return database.ScanUser(r.db.QueryRow(ctx, database.UserQuery+` WHERE "u"."Id" = $1`, id))
}

func (r *Repository) GetByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, r.db, identityKey)
}

func (r *Repository) UpdateActive(ctx context.Context, id int, active bool) error {
	_, err := r.db.Exec(ctx, `UPDATE "Users" SET "Active" = $1 WHERE "Id" = $2`, active, id)
	if err != nil {
		return fmt.Errorf("update user active status: %w", err)
	}
	return nil
}

func (r *Repository) UpdateRole(ctx context.Context, id int, roleName string) error {
	roleID, err := r.roleIDByName(ctx, roleName)
	if err != nil {
		return err
	}

	_, err = r.db.Exec(ctx, `UPDATE "Users" SET "RoleId" = $1 WHERE "Id" = $2`, roleID, id)
	if err != nil {
		return fmt.Errorf("update user role: %w", err)
	}
	return nil
}

func (r *Repository) UpdateSetting(ctx context.Context, id int, isReceivedEmail bool) error {
	_, err := r.db.Exec(ctx, `UPDATE "Users" SET "IsReceivedEmail" = $1 WHERE "Id" = $2`, isReceivedEmail, id)
	if err != nil {
		return fmt.Errorf("update user setting: %w", err)
	}
	return nil
}

func (r *Repository) roleIDByName(ctx context.Context, roleName string) (int, error) {
	var roleID int
	if err := r.db.QueryRow(ctx, `SELECT "Id" FROM "Roles" WHERE "Name" = $1`, roleName).Scan(&roleID); err != nil {
		return 0, fmt.Errorf("find role %q: %w", roleName, err)
	}
	return roleID, nil
}
