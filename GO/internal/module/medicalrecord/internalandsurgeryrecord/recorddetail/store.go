package recorddetail

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Store struct {
	db *pgxpool.Pool
}

func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

func (s *Store) Attach(ctx context.Context, record domain.MedicalRecord) (domain.MedicalRecord, error) {
	var err error
	record.DepartmentTransfers, err = s.listTransfers(ctx, record.ID)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	record.Detail, err = s.getDetail(ctx, record.ID)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	return record, nil
}

func (s *Store) Replace(ctx context.Context, tx pgx.Tx, recordID int, record domain.MedicalRecord) error {
	if _, err := tx.Exec(ctx, deleteTransfersSQL, recordID); err != nil {
		return fmt.Errorf("delete department transfers: %w", err)
	}
	if _, err := tx.Exec(ctx, deleteDetailSQL, recordID); err != nil {
		return fmt.Errorf("delete medical record detail: %w", err)
	}
	for _, transfer := range record.DepartmentTransfers {
		_, err := tx.Exec(ctx, insertTransferSQL, recordID, transfer.Name, transfer.AdmissionTime, transfer.TransferType, transfer.TreatmentDays)
		if err != nil {
			return fmt.Errorf("create department transfer: %w", err)
		}
	}
	if record.Detail != nil {
		return s.createDetail(ctx, tx, recordID, record.Detail)
	}
	return nil
}

func (s *Store) createDetail(ctx context.Context, tx pgx.Tx, recordID int, detail *domain.MedicalRecordDetail) error {
	if _, err := tx.Exec(ctx, insertDetailSQL, detailValues(recordID, *detail)...); err != nil {
		return fmt.Errorf("create medical record detail: %w", err)
	}
	for _, factor := range detail.RiskFactors {
		_, err := tx.Exec(ctx, insertRiskFactorSQL, recordID, factor.Signed, factor.IsPossible, factor.DurationMonth)
		if err != nil {
			return fmt.Errorf("create risk factor: %w", err)
		}
	}
	return nil
}

func (s *Store) listTransfers(ctx context.Context, recordID int) ([]domain.DepartmentTransfer, error) {
	rows, err := s.db.Query(ctx, transferListSQL, recordID)
	if err != nil {
		return nil, fmt.Errorf("query department transfers: %w", err)
	}
	defer rows.Close()

	transfers := []domain.DepartmentTransfer{}
	for rows.Next() {
		var transfer domain.DepartmentTransfer
		if err := scanTransfer(rows, &transfer); err != nil {
			return nil, err
		}
		transfers = append(transfers, transfer)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query department transfers: %w", err)
	}
	return transfers, nil
}

func (s *Store) getDetail(ctx context.Context, recordID int) (*domain.MedicalRecordDetail, error) {
	detail, err := scanDetail(s.db.QueryRow(ctx, detailByRecordIDSQL, recordID))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	detail.RiskFactors, err = s.listRiskFactors(ctx, detail.ID)
	if err != nil {
		return nil, err
	}
	return &detail, nil
}

func (s *Store) listRiskFactors(ctx context.Context, detailID int) ([]domain.MedicalRiskFactor, error) {
	rows, err := s.db.Query(ctx, riskFactorListSQL, detailID)
	if err != nil {
		return nil, fmt.Errorf("query risk factors: %w", err)
	}
	defer rows.Close()

	factors := []domain.MedicalRiskFactor{}
	for rows.Next() {
		var factor domain.MedicalRiskFactor
		if err := scanRiskFactor(rows, &factor); err != nil {
			return nil, err
		}
		factors = append(factors, factor)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query risk factors: %w", err)
	}
	return factors, nil
}
