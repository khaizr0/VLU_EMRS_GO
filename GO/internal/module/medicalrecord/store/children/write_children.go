package children

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/store/query"
)

// Replace deletes and recreates all child rows for a medical record.
func Replace(ctx context.Context, tx pgx.Tx, recordID int, record domain.MedicalRecord) error {
	if err := replaceTransfers(ctx, tx, recordID, record.DepartmentTransfers); err != nil {
		return err
	}
	if err := replaceDetail(ctx, tx, recordID, record.Detail); err != nil {
		return err
	}
	if record.Detail == nil {
		return nil
	}
	return replaceRiskFactors(ctx, tx, recordID, record.Detail.RiskFactors)
}

// replaceTransfers refreshes department transfer rows inside the current transaction.
func replaceTransfers(ctx context.Context, tx pgx.Tx, recordID int, transfers []domain.DepartmentTransfer) error {
	if _, err := tx.Exec(ctx, `DELETE FROM "DepartmentTransfers" WHERE "MedicalRecordId" = $1`, recordID); err != nil {
		return fmt.Errorf("delete department transfers: %w", err)
	}
	for _, transfer := range transfers {
		if _, err := tx.Exec(ctx, query.InsertTransferSQL, recordID, transfer.Name, transfer.AdmissionTime, transfer.TransferType, transfer.TreatmentDays); err != nil {
			return fmt.Errorf("create department transfer: %w", err)
		}
	}
	return nil
}

// replaceDetail refreshes the one-to-one detail row inside the current transaction.
func replaceDetail(ctx context.Context, tx pgx.Tx, recordID int, detail *domain.MedicalRecordDetail) error {
	if _, err := tx.Exec(ctx, `DELETE FROM "MedicalRecordDetails" WHERE "Id" = $1`, recordID); err != nil {
		return fmt.Errorf("delete medical record detail: %w", err)
	}
	if detail == nil {
		return nil
	}
	_, err := tx.Exec(ctx, query.InsertDetailSQL, query.DetailValues(recordID, *detail)...)
	if err != nil {
		return fmt.Errorf("create medical record detail: %w", err)
	}
	return nil
}

// replaceRiskFactors refreshes nested risk factor rows inside the current transaction.
func replaceRiskFactors(ctx context.Context, tx pgx.Tx, detailID int, factors []domain.MedicalRiskFactor) error {
	if _, err := tx.Exec(ctx, `DELETE FROM "MedicalRecordRiskFactors" WHERE "MedicalRecordDetailId" = $1`, detailID); err != nil {
		return fmt.Errorf("delete risk factors: %w", err)
	}
	for _, factor := range factors {
		if _, err := tx.Exec(ctx, query.InsertRiskFactorSQL, detailID, factor.Signed, factor.IsPossible, factor.DurationMonth); err != nil {
			return fmt.Errorf("create risk factor: %w", err)
		}
	}
	return nil
}
