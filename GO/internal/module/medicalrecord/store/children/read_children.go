package children

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/query"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/scanner"
)

// ListTransfers loads department transfer child rows for a medical record.
func ListTransfers(ctx context.Context, db *pgxpool.Pool, recordID int) ([]domain.DepartmentTransfer, error) {
	rows, err := db.Query(ctx, query.TransferListSQL, recordID)
	if err != nil {
		return nil, fmt.Errorf("query department transfers: %w", err)
	}
	defer rows.Close()

	transfers := []domain.DepartmentTransfer{}
	for rows.Next() {
		var transfer domain.DepartmentTransfer
		if err := rows.Scan(&transfer.ID, &transfer.MedicalRecordID, &transfer.Name, &transfer.AdmissionTime, &transfer.TransferType, &transfer.TreatmentDays); err != nil {
			return nil, fmt.Errorf("query department transfer: %w", err)
		}
		transfers = append(transfers, transfer)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query department transfers: %w", err)
	}
	return transfers, nil
}

// GetDetail loads the detail row and its nested risk factors.
func GetDetail(ctx context.Context, db *pgxpool.Pool, recordID int) (*domain.MedicalRecordDetail, error) {
	detail, err := scanner.Detail(db.QueryRow(ctx, query.DetailByRecordIDSQL, recordID))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	detail.RiskFactors, err = ListRiskFactors(ctx, db, recordID)
	if err != nil {
		return nil, err
	}
	return &detail, nil
}

// ListRiskFactors loads risk factor child rows for a detail row.
func ListRiskFactors(ctx context.Context, db *pgxpool.Pool, detailID int) ([]domain.MedicalRiskFactor, error) {
	rows, err := db.Query(ctx, query.RiskFactorListSQL, detailID)
	if err != nil {
		return nil, fmt.Errorf("query risk factors: %w", err)
	}
	defer rows.Close()

	factors := []domain.MedicalRiskFactor{}
	for rows.Next() {
		var factor domain.MedicalRiskFactor
		if err := rows.Scan(&factor.ID, &factor.MedicalRecordDetailID, &factor.Signed, &factor.IsPossible, &factor.DurationMonth); err != nil {
			return nil, fmt.Errorf("query risk factor: %w", err)
		}
		factors = append(factors, factor)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query risk factors: %w", err)
	}
	return factors, nil
}
