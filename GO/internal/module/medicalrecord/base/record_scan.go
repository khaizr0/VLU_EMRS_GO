package base

import (
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

func scanRecordItem(row pgx.Row) (domain.MedicalRecordItem, error) {
	var item domain.MedicalRecordItem
	err := row.Scan(
		&item.ID, &item.PatientID, &item.DischargeTime, &item.RecordType, &item.StorageCode, &item.AdmissionTime,
		&item.Patient.ID, &item.Patient.EthnicityID, &item.Patient.CreatedBy, &item.Patient.Name, &item.Patient.DateOfBirth,
		&item.Patient.Gender, &item.Patient.HealthInsuranceNumber, &item.Patient.CreatedAt, &item.Patient.Ethnicity.ID, &item.Patient.Ethnicity.Name,
	)
	if err != nil {
		return domain.MedicalRecordItem{}, fmt.Errorf("query medical record item: %w", err)
	}
	return item, nil
}

func scanRecord(row pgx.Row) (domain.MedicalRecord, error) {
	var record domain.MedicalRecord
	err := row.Scan(
		&record.ID, &record.PatientID, &record.CreatedBy, &record.RecordType, &record.FormCode,
		&record.StorageCode, &record.MedicalCode, &record.BedCode, &record.JobTitle, &record.JobTitleCode,
		&record.AddressJob, &record.Address, &record.ProvinceCode, &record.DistrictCode, &record.ProvinceName,
		&record.DistrictName, &record.WardName, &record.HealthInsuranceExpiryDate, &record.RelativeInfo, &record.RelativePhone,
		&record.PaymentCategory, &record.AdmissionTime, &record.AdmissionType, &record.ReferralSource, &record.AdmissionCount,
		&record.HospitalTransferType, &record.HospitalTransferDestination, &record.DischargeTime, &record.DischargeType, &record.TotalTreatmentDays,
		&record.ReferralDiagnosis, &record.ReferralCode, &record.AdmissionDiagnosis, &record.AdmissionCode, &record.DepartmentDiagnosis,
		&record.DepartmentCode, &record.HasProcedure, &record.HasSurgery, &record.DischargeMainDiagnosis, &record.DischargeMainCode,
		&record.DischargeSubDiagnosis, &record.DischargeSubCode, &record.HasAccident, &record.HasComplication, &record.TreatmentResult,
		&record.PathologyResult, &record.DeathCause, &record.DeathTimeGroup, &record.DeathReason, &record.DeathMainReason,
		&record.DeathMainCode, &record.HasAutopsy, &record.DiagnosisAutopsy, &record.DiagnosisCode, &record.CreatedAt,
		&record.Patient.ID, &record.Patient.EthnicityID, &record.Patient.CreatedBy, &record.Patient.Name, &record.Patient.DateOfBirth,
		&record.Patient.Gender, &record.Patient.HealthInsuranceNumber, &record.Patient.CreatedAt, &record.Patient.Ethnicity.ID, &record.Patient.Ethnicity.Name,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.MedicalRecord{}, domain.ErrMedicalRecordNotFound
	}
	if err != nil {
		return domain.MedicalRecord{}, fmt.Errorf("query medical record: %w", err)
	}
	return record, nil
}
