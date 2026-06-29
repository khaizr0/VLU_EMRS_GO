package department

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
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

const departmentQuery = `
	SELECT "Id", "Name", "HeadUserId", "CreatedAt"
	FROM "Departments"`

func (r *Repository) ListDepartments(ctx context.Context) ([]domain.Department, error) {
	rows, err := r.db.Query(ctx, departmentQuery+` ORDER BY "Id"`)
	if err != nil {
		return nil, fmt.Errorf("query departments: %w", err)
	}
	defer rows.Close()

	var departments []domain.Department
	for rows.Next() {
		department, err := scanDepartment(rows)
		if err != nil {
			return nil, err
		}
		department, err = r.withUsers(ctx, department)
		if err != nil {
			return nil, err
		}
		departments = append(departments, department)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query departments: %w", err)
	}
	return departments, nil
}

func (r *Repository) GetByID(ctx context.Context, id int) (domain.Department, error) {
	department, err := scanDepartment(r.db.QueryRow(ctx, departmentQuery+` WHERE "Id" = $1`, id))
	if err != nil {
		return domain.Department{}, err
	}
	return r.withUsers(ctx, department)
}

func (r *Repository) GetUserByID(ctx context.Context, id int) (domain.User, error) {
	return database.FindUserByID(ctx, r.db, id)
}

func (r *Repository) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, r.db, identityKey)
}

func (r *Repository) DepartmentByHeadUser(ctx context.Context, userID int, exceptDepartmentID int) (domain.Department, error) {
	return scanDepartment(r.db.QueryRow(ctx,
		departmentQuery+` WHERE "HeadUserId" = $1 AND "Id" <> $2`,
		userID,
		exceptDepartmentID,
	))
}

func (r *Repository) Create(ctx context.Context, name string) (int, error) {
	var id int
	err := r.db.QueryRow(ctx, `
		INSERT INTO "Departments" ("Name", "CreatedAt")
		VALUES ($1, $2)
		RETURNING "Id"
	`, name, time.Now()).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("create department: %w", err)
	}
	return id, nil
}

func (r *Repository) UpdateName(ctx context.Context, id int, name string) error {
	return r.exec(ctx, "update department", `UPDATE "Departments" SET "Name" = $1 WHERE "Id" = $2`, name, id)
}

func (r *Repository) Delete(ctx context.Context, id int) error {
	return r.exec(ctx, "delete department", `DELETE FROM "Departments" WHERE "Id" = $1`, id)
}

func (r *Repository) AssignUser(ctx context.Context, departmentID int, userID int) error {
	return r.exec(ctx, "assign user to department", `UPDATE "Users" SET "DepartmentId" = $1 WHERE "Id" = $2`, departmentID, userID)
}

func (r *Repository) AssignHead(ctx context.Context, departmentID int, userID int) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin assign head: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `UPDATE "Users" SET "DepartmentId" = $1 WHERE "Id" = $2`, departmentID, userID); err != nil {
		return fmt.Errorf("assign head user department: %w", err)
	}
	if _, err := tx.Exec(ctx, `UPDATE "Departments" SET "HeadUserId" = $1 WHERE "Id" = $2`, userID, departmentID); err != nil {
		return fmt.Errorf("assign department head: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit assign head: %w", err)
	}
	return nil
}

func (r *Repository) UnassignUser(ctx context.Context, departmentID int, userID int) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin unassign user: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `UPDATE "Departments" SET "HeadUserId" = NULL WHERE "Id" = $1 AND "HeadUserId" = $2`, departmentID, userID); err != nil {
		return fmt.Errorf("clear department head: %w", err)
	}
	if _, err := tx.Exec(ctx, `UPDATE "Users" SET "DepartmentId" = NULL WHERE "Id" = $1`, userID); err != nil {
		return fmt.Errorf("unassign user from department: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit unassign user: %w", err)
	}
	return nil
}

func (r *Repository) UnassignHead(ctx context.Context, departmentID int) error {
	return r.exec(ctx, "unassign department head", `UPDATE "Departments" SET "HeadUserId" = NULL WHERE "Id" = $1`, departmentID)
}

func (r *Repository) exec(ctx context.Context, action string, query string, args ...any) error {
	_, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("%s: %w", action, err)
	}
	return nil
}

func (r *Repository) withUsers(ctx context.Context, department domain.Department) (domain.Department, error) {
	users, err := database.ListUsersByDepartment(ctx, r.db, department.ID)
	if err != nil {
		return domain.Department{}, err
	}
	department.Users = users

	if department.HeadUserID != nil {
		headUser, err := database.FindUserByID(ctx, r.db, *department.HeadUserID)
		if err != nil {
			return domain.Department{}, err
		}
		department.HeadUser = &headUser
	}
	return department, nil
}

func scanDepartment(row pgx.Row) (domain.Department, error) {
	var department domain.Department
	err := row.Scan(
		&department.ID,
		&department.Name,
		&department.HeadUserID,
		&department.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Department{}, domain.ErrDepartmentNotFound
	}
	if err != nil {
		return domain.Department{}, fmt.Errorf("query department: %w", err)
	}
	return department, nil
}
