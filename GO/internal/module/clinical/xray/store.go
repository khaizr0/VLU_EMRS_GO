package xray

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Store struct {
	db *pgxpool.Pool
}

// NewStore wires PostgreSQL access for x-ray forms.
func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

// Insert creates an x-ray request and returns its generated ID.
func (s *Store) Insert(ctx context.Context, item domain.XRay) (int, error) {
	var id int
	err := s.db.QueryRow(ctx, `
		INSERT INTO "XRays" (
			"MedicalRecordId", "RequestedById", "DepartmentOfHealth", "HospitalName", "FormNumber",
			"RoomNumber", "Status", "RequestDescription", "RequestedAt"
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING "Id"
	`, item.MedicalRecordID, item.RequestedByID, item.DepartmentOfHealth, item.HospitalName, item.FormNumber,
		item.RoomNumber, item.Status, item.RequestDescription, item.RequestedAt).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("create x-ray: %w", err)
	}
	return id, nil
}

// ListByRecordID returns x-ray forms and their status logs for one medical record.
func (s *Store) ListByRecordID(ctx context.Context, recordID int) ([]domain.XRay, error) {
	rows, err := s.db.Query(ctx, xraySelect+` WHERE "x"."MedicalRecordId" = $1 ORDER BY "x"."Id"`, recordID)
	if err != nil {
		return nil, fmt.Errorf("query x-rays: %w", err)
	}
	defer rows.Close()

	items := []domain.XRay{}
	for rows.Next() {
		item, err := scanXRay(rows)
		if err != nil {
			return nil, err
		}
		item.XRayStatusLogs, err = s.listLogs(ctx, item.ID)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query x-rays: %w", err)
	}
	return items, nil
}

// UpdateStatus changes workflow status and appends one status log atomically.
func (s *Store) UpdateStatus(ctx context.Context, recordID int, id int, status int, departmentName string, userID int) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin x-ray status update: %w", err)
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `UPDATE "XRays" SET "Status" = $1 WHERE "Id" = $2 AND "MedicalRecordId" = $3`, status, id, recordID)
	if err != nil {
		return fmt.Errorf("update x-ray status: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrXRayNotFound
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO "XRayStatusLogs" ("XRayId", "UpdatedById", "Status", "DepartmentName", "CreatedAt")
		VALUES ($1, $2, $3, $4, $5)
	`, id, userID, status, departmentName, time.Now())
	if err != nil {
		return fmt.Errorf("create x-ray status log: %w", err)
	}
	return tx.Commit(ctx)
}

// Complete stores final x-ray result fields and performer information.
func (s *Store) Complete(ctx context.Context, recordID int, id int, performerID int, item domain.XRay) error {
	tag, err := s.db.Exec(ctx, `
		UPDATE "XRays"
		SET "PerformedById" = $1, "DepartmentOfHealth" = $2, "HospitalName" = $3, "FormNumber" = $4,
			"RoomNumber" = $5, "ResultDescription" = $6, "DoctorAdvice" = $7, "CompletedAt" = $8
		WHERE "Id" = $9 AND "MedicalRecordId" = $10
	`, performerID, item.DepartmentOfHealth, item.HospitalName, item.FormNumber, item.RoomNumber,
		item.ResultDescription, item.DoctorAdvice, item.CompletedAt, id, recordID)
	if err != nil {
		return fmt.Errorf("complete x-ray: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrXRayNotFound
	}
	return nil
}

// Delete removes one x-ray form from its parent medical record.
func (s *Store) Delete(ctx context.Context, recordID int, id int) error {
	tag, err := s.db.Exec(ctx, `DELETE FROM "XRays" WHERE "Id" = $1 AND "MedicalRecordId" = $2`, id, recordID)
	if err != nil {
		return fmt.Errorf("delete x-ray: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrXRayNotFound
	}
	return nil
}

func (s *Store) listLogs(ctx context.Context, id int) ([]domain.XRayStatusLog, error) {
	rows, err := s.db.Query(ctx, xrayLogSelect+` WHERE "l"."XRayId" = $1 ORDER BY "l"."CreatedAt", "l"."Id"`, id)
	if err != nil {
		return nil, fmt.Errorf("query x-ray status logs: %w", err)
	}
	defer rows.Close()

	logs := []domain.XRayStatusLog{}
	for rows.Next() {
		log, err := scanXRayLog(rows)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}
