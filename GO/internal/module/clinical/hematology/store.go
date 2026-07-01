package hematology

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

// NewStore wires PostgreSQL access for hematology forms.
func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

// Insert creates a hematology request and returns its generated ID.
func (s *Store) Insert(ctx context.Context, item domain.Hematology) (int, error) {
	var id int
	err := s.db.QueryRow(ctx, `
		INSERT INTO "Hematologies" (
			"MedicalRecordId", "RequestedById", "DepartmentOfHealth", "HospitalName", "FormNumber",
			"RoomNumber", "RequestedAt", "Status", "RequestDescription"
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING "Id"
	`, item.MedicalRecordID, item.RequestedByID, item.DepartmentOfHealth, item.HospitalName, item.FormNumber,
		item.RoomNumber, item.RequestedAt, item.Status, item.RequestDescription).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("create hematology: %w", err)
	}
	return id, nil
}

// ListByRecordID returns hematology forms and their status logs for one medical record.
func (s *Store) ListByRecordID(ctx context.Context, recordID int) ([]domain.Hematology, error) {
	rows, err := s.db.Query(ctx, hematologySelect+` WHERE "h"."MedicalRecordId" = $1 ORDER BY "h"."Id"`, recordID)
	if err != nil {
		return nil, fmt.Errorf("query hematologies: %w", err)
	}
	defer rows.Close()

	items := []domain.Hematology{}
	for rows.Next() {
		item, err := scanHematology(rows)
		if err != nil {
			return nil, err
		}
		item.HematologyStatusLogs, err = s.listLogs(ctx, item.ID)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query hematologies: %w", err)
	}
	return items, nil
}

// UpdateStatus changes workflow status and appends one status log atomically.
func (s *Store) UpdateStatus(ctx context.Context, recordID int, id int, status int, departmentName string, userID int) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin hematology status update: %w", err)
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `UPDATE "Hematologies" SET "Status" = $1 WHERE "Id" = $2 AND "MedicalRecordId" = $3`, status, id, recordID)
	if err != nil {
		return fmt.Errorf("update hematology status: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrHematologyNotFound
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO "HematologyStatusLogs" ("HematologyId", "UpdatedById", "Status", "DepartmentName", "CreatedAt")
		VALUES ($1, $2, $3, $4, $5)
	`, id, userID, status, departmentName, time.Now())
	if err != nil {
		return fmt.Errorf("create hematology status log: %w", err)
	}
	return tx.Commit(ctx)
}

// Complete stores final hematology result fields and performer information.
func (s *Store) Complete(ctx context.Context, recordID int, id int, performerID int, item domain.Hematology) error {
	tag, err := s.db.Exec(ctx, completeSQL, completeArgs(recordID, id, performerID, item)...)
	if err != nil {
		return fmt.Errorf("complete hematology: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrHematologyNotFound
	}
	return nil
}

// Delete removes one hematology form from its parent medical record.
func (s *Store) Delete(ctx context.Context, recordID int, id int) error {
	tag, err := s.db.Exec(ctx, `DELETE FROM "Hematologies" WHERE "Id" = $1 AND "MedicalRecordId" = $2`, id, recordID)
	if err != nil {
		return fmt.Errorf("delete hematology: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrHematologyNotFound
	}
	return nil
}

func (s *Store) listLogs(ctx context.Context, id int) ([]domain.HematologyStatusLog, error) {
	rows, err := s.db.Query(ctx, hematologyLogSelect+` WHERE "l"."HematologyId" = $1 ORDER BY "l"."CreatedAt", "l"."Id"`, id)
	if err != nil {
		return nil, fmt.Errorf("query hematology status logs: %w", err)
	}
	defer rows.Close()

	logs := []domain.HematologyStatusLog{}
	for rows.Next() {
		log, err := scanHematologyLog(rows)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}
