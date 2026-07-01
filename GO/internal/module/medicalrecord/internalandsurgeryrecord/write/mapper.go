package write

import (
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/dto"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
)

type recordDates struct {
	healthInsuranceExpiryDate *time.Time
	admissionTime             *time.Time
	dischargeTime             *time.Time
}

func recordFromRequest(patientID int, request dto.Request) (domain.MedicalRecord, error) {
	if !shared.ValidInternalOrSurgeryType(request.RecordType) {
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
		FormCode:            shared.CleanString(request.FormCode),
		MedicalCode:         shared.CleanString(request.MedicalCode),
		BedCode:             shared.CleanString(request.BedCode),
		DepartmentTransfers: transfers,
		Detail:              detailFromRequest(request.Detail),
	}
	applyPatientSnapshot(&record, request, dates)
	applyAdmissionAndDischarge(&record, request, dates)
	applyDiagnosis(&record, request)
	applyOutcome(&record, request)
	return record, nil
}

func datesFromRequest(request dto.Request) (recordDates, error) {
	healthInsuranceExpiryDate, err := shared.ParseOptionalTime(request.HealthInsuranceExpiryDate)
	if err != nil {
		return recordDates{}, err
	}
	admissionTime, err := shared.ParseOptionalTime(request.AdmissionTime)
	if err != nil {
		return recordDates{}, err
	}
	dischargeTime, err := shared.ParseOptionalTime(request.DischargeTime)
	if err != nil {
		return recordDates{}, err
	}
	return recordDates{healthInsuranceExpiryDate, admissionTime, dischargeTime}, nil
}

func transfersFromRequest(requests []dto.DepartmentTransferRequest) ([]domain.DepartmentTransfer, error) {
	transfers := make([]domain.DepartmentTransfer, 0, len(requests))
	for _, request := range requests {
		admissionTime, err := shared.ParseOptionalTime(request.AdmissionTime)
		if err != nil {
			return nil, err
		}
		transfers = append(transfers, domain.DepartmentTransfer{
			Name: shared.CleanString(request.Name), AdmissionTime: admissionTime,
			TransferType: shared.CleanInt(request.TransferType), TreatmentDays: shared.CleanString(request.TreatmentDays),
		})
	}
	return transfers, nil
}

func applyPatientSnapshot(record *domain.MedicalRecord, request dto.Request, dates recordDates) {
	record.JobTitle = shared.CleanString(request.JobTitle)
	record.JobTitleCode = shared.CleanString(request.JobTitleCode)
	record.AddressJob = shared.CleanString(request.AddressJob)
	record.Address = shared.CleanString(request.Address)
	record.ProvinceCode = shared.CleanInt(request.ProvinceCode)
	record.DistrictCode = shared.CleanInt(request.DistrictCode)
	record.ProvinceName = shared.CleanString(request.ProvinceName)
	record.DistrictName = shared.CleanString(request.DistrictName)
	record.WardName = shared.CleanString(request.WardName)
	record.HealthInsuranceExpiryDate = dates.healthInsuranceExpiryDate
	record.RelativeInfo = shared.CleanString(request.RelativeInfo)
	record.RelativePhone = shared.CleanString(request.RelativePhone)
	record.PaymentCategory = shared.CleanInt(request.PaymentCategory)
}

func applyAdmissionAndDischarge(record *domain.MedicalRecord, request dto.Request, dates recordDates) {
	record.AdmissionTime = dates.admissionTime
	record.AdmissionType = shared.CleanInt(request.AdmissionType)
	record.ReferralSource = shared.CleanInt(request.ReferralSource)
	record.AdmissionCount = shared.CleanString(request.AdmissionCount)
	record.HospitalTransferType = shared.CleanInt(request.HospitalTransferType)
	record.HospitalTransferDestination = shared.CleanString(request.HospitalTransferDestination)
	record.DischargeTime = dates.dischargeTime
	record.DischargeType = shared.CleanInt(request.DischargeType)
	record.TotalTreatmentDays = shared.CleanString(request.TotalTreatmentDays)
}

func applyDiagnosis(record *domain.MedicalRecord, request dto.Request) {
	record.ReferralDiagnosis = shared.CleanString(request.ReferralDiagnosis)
	record.ReferralCode = shared.CleanString(request.ReferralCode)
	record.AdmissionDiagnosis = shared.CleanString(request.AdmissionDiagnosis)
	record.AdmissionCode = shared.CleanString(request.AdmissionCode)
	record.DepartmentDiagnosis = shared.CleanString(request.DepartmentDiagnosis)
	record.DepartmentCode = shared.CleanString(request.DepartmentCode)
	record.HasProcedure = request.HasProcedure
	record.HasSurgery = request.HasSurgery
	record.DischargeMainDiagnosis = shared.CleanString(request.DischargeMainDiagnosis)
	record.DischargeMainCode = shared.CleanString(request.DischargeMainCode)
	record.DischargeSubDiagnosis = shared.CleanString(request.DischargeSubDiagnosis)
	record.DischargeSubCode = shared.CleanString(request.DischargeSubCode)
	record.HasAccident = request.HasAccident
	record.HasComplication = request.HasComplication
}

func applyOutcome(record *domain.MedicalRecord, request dto.Request) {
	record.TreatmentResult = shared.CleanInt(request.TreatmentResult)
	record.PathologyResult = shared.CleanInt(request.PathologyResult)
	record.DeathCause = shared.CleanInt(request.DeathCause)
	record.DeathTimeGroup = shared.CleanInt(request.DeathTimeGroup)
	record.DeathReason = shared.CleanString(request.DeathReason)
	record.DeathMainReason = shared.CleanString(request.DeathMainReason)
	record.DeathMainCode = shared.CleanInt(request.DeathMainCode)
	record.HasAutopsy = request.HasAutopsy
	record.DiagnosisAutopsy = shared.CleanString(request.DiagnosisAutopsy)
	record.DiagnosisCode = shared.CleanInt(request.DiagnosisCode)
}
