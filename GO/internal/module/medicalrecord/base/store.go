package base

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Store struct {
	db *pgxpool.Pool
}

func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

func (s *Store) RunInTx(ctx context.Context, work func(pgx.Tx) error) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin medical record transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	if err := work(tx); err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit medical record transaction: %w", err)
	}
	return nil
}

func (s *Store) ListRecords(ctx context.Context, filters Filters) ([]domain.MedicalRecordItem, int, error) {
	where, args := recordWhere(filters)

	var totalCount int
	if err := s.db.QueryRow(ctx, `SELECT COUNT(*)`+recordsFrom+where, args...).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("count medical records: %w", err)
	}

	limitArgs := append(args, filters.PageSize, filters.PageSize*(filters.PageNumber-1))
	rows, err := s.db.Query(ctx, listRecordsSQL(where, len(args)), limitArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("query medical records: %w", err)
	}
	defer rows.Close()

	records := []domain.MedicalRecordItem{}
	for rows.Next() {
		record, err := scanRecordItem(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("query medical records: %w", err)
	}
	return records, totalCount, nil
}

func (s *Store) FindRecordByID(ctx context.Context, id int) (domain.MedicalRecord, error) {
	return scanRecord(s.db.QueryRow(ctx, recordByIDSQL, id))
}

func (s *Store) InsertRecord(ctx context.Context, tx pgx.Tx, record domain.MedicalRecord) (int, error) {
	storageCode, err := generateStorageCode(ctx, tx)
	if err != nil {
		return 0, err
	}
	record.StorageCode = &storageCode
	record.CreatedAt = time.Now()

	var id int
	if err := tx.QueryRow(ctx, insertRecordSQL(), recordValues(record)...).Scan(&id); err != nil {
		return 0, fmt.Errorf("create medical record: %w", err)
	}
	return id, nil
}

func (s *Store) UpdateRecord(ctx context.Context, tx pgx.Tx, id int, record domain.MedicalRecord) error {
	args := append(updateRecordValues(record), id)
	if _, err := tx.Exec(ctx, updateRecordSQL(), args...); err != nil {
		return fmt.Errorf("update medical record: %w", err)
	}
	return nil
}

func (s *Store) DeleteRecord(ctx context.Context, id int) error {
	_, err := s.db.Exec(ctx, `DELETE FROM "MedicalRecords" WHERE "Id" = $1`, id)
	if err != nil {
		return fmt.Errorf("delete medical record: %w", err)
	}
	return nil
}

func (s *Store) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, s.db, identityKey)
}

func (s *Store) PatientExists(ctx context.Context, id int) (bool, error) {
	var exists bool
	if err := s.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM "Patients" WHERE "Id" = $1)`, id).Scan(&exists); err != nil {
		return false, fmt.Errorf("check patient: %w", err)
	}
	return exists, nil
}

func generateStorageCode(ctx context.Context, tx pgx.Tx) (string, error) {
	yearPrefix := fmt.Sprintf("%02d", time.Now().Year()%100)
	var last *string
	err := tx.QueryRow(ctx, `SELECT "StorageCode" FROM "MedicalRecords" WHERE "StorageCode" LIKE $1 ORDER BY "StorageCode" DESC LIMIT 1`, yearPrefix+".%").Scan(&last)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return "", fmt.Errorf("find last storage code: %w", err)
	}
	sequence := 1
	if last != nil {
		parts := strings.Split(*last, ".")
		if len(parts) == 2 {
			_, _ = fmt.Sscanf(parts[1], "%d", &sequence)
			sequence++
		}
	}
	return fmt.Sprintf("%s.%06d", yearPrefix, sequence), nil
}
