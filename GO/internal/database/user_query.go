package database

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

const UserQuery = `
		SELECT
			"u"."Id", "u"."IdentityId", "u"."Email", "u"."Name", "u"."PictureUrl",
			"u"."Active", "r"."Name", "u"."DepartmentId", "d"."Name",
			"u"."CreateAt", "u"."UpdateAt", "u"."IsReceivedEmail"
		FROM "Users" AS "u"
		JOIN "Roles" AS "r" ON "r"."Id" = "u"."RoleId"
		LEFT JOIN "Departments" AS "d" ON "d"."Id" = "u"."DepartmentId"`

func FindUserByID(ctx context.Context, db *pgxpool.Pool, id int) (domain.User, error) {
	return ScanUser(db.QueryRow(ctx, UserQuery+` WHERE "u"."Id" = $1`, id))
}

func ListUsersByDepartment(ctx context.Context, db *pgxpool.Pool, departmentID int) ([]domain.User, error) {
	rows, err := db.Query(ctx, UserQuery+` WHERE "u"."DepartmentId" = $1 ORDER BY "u"."Id"`, departmentID)
	if err != nil {
		return nil, fmt.Errorf("query department users: %w", err)
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		user, err := ScanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query department users: %w", err)
	}
	return users, nil
}

func FindUserByIdentity(ctx context.Context, db *pgxpool.Pool, identityKey string) (domain.User, error) {
	return ScanUser(db.QueryRow(ctx, UserQuery+` WHERE "u"."IdentityId" = $1`, identityKey))
}

func ScanUser(row pgx.Row) (domain.User, error) {
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
