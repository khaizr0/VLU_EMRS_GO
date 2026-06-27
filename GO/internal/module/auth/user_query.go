package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

const userQuery = `
		SELECT
			"u"."Id", "u"."IdentityId", "u"."Email", "u"."Name", "u"."PictureUrl",
			"u"."Active", "r"."Name", "u"."DepartmentId", "d"."Name",
			"u"."CreateAt", "u"."UpdateAt", "u"."IsReceivedEmail"
		FROM "Users" AS "u"
		JOIN "Roles" AS "r" ON "r"."Id" = "u"."RoleId"
		LEFT JOIN "Departments" AS "d" ON "d"."Id" = "u"."DepartmentId"`

func findUserByIdentity(ctx context.Context, db *pgxpool.Pool, identityKey string) (domain.User, error) {
	return scanUser(db.QueryRow(
		ctx,
		userQuery+` WHERE "u"."IdentityId" = $1`,
		identityKey,
	))
}

func scanUser(row pgx.Row) (domain.User, error) {
	var user domain.User
	err := row.Scan(
		&user.ID,
		&user.IdentityID,
		&user.Email,
		&user.Name,
		&user.PictureURL,
		&user.Active,
		&user.RoleName,
		&user.DepartmentID,
		&user.DepartmentName,
		&user.CreateAt,
		&user.UpdateAt,
		&user.IsReceivedEmail,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, domain.ErrUserNotFound
	}
	if err != nil {
		return domain.User{}, fmt.Errorf("query user: %w", err)
	}
	return user, nil
}
