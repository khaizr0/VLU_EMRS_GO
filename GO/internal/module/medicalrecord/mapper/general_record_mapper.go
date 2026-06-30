package mapper

import (
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
)

// GeneralRecordFromRequest maps the general form input into a domain record.
func GeneralRecordFromRequest(patientID int, request dto.GeneralRecordRequest) (domain.MedicalRecord, error) {
	if !validRecordType(request.RecordType) {
		return domain.MedicalRecord{}, domain.ErrInvalidMedicalRecord
	}

	dates, err := datesFromRequest(request)
	if err != nil {
		return domain.MedicalRecord{}, err
	}
	transfers, err := transfersFromRequest(request.DepartmentTransfers)
	if err != nil {
		return domain.MedicalRecord{}, err
	}

	record := domain.MedicalRecord{
		PatientID:           patientID,
		RecordType:          request.RecordType,
		FormCode:            cleanString(request.FormCode),
		MedicalCode:         cleanString(request.MedicalCode),
		BedCode:             cleanString(request.BedCode),
		DepartmentTransfers: transfers,
		Detail:              generalDetailFromRequest(request.Detail),
	}
	applyPatientSnapshot(&record, request, dates)
	applyAdmissionAndDischarge(&record, request, dates)
	applyDiagnosis(&record, request)
	applyOutcome(&record, request)
	return record, nil
}

// RecordFromRequest keeps older usecase code compatible with the general mapper.
func RecordFromRequest(patientID int, request dto.RecordRequest) (domain.MedicalRecord, error) {
	return GeneralRecordFromRequest(patientID, request)
}
