package mapper

import (
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
)

// applyPatientSnapshot copies patient snapshot fields into the record domain model.
func applyPatientSnapshot(record *domain.MedicalRecord, request dto.GeneralRecordRequest, dates recordDates) {
	record.JobTitle = cleanString(request.JobTitle)
	record.JobTitleCode = cleanString(request.JobTitleCode)
	record.AddressJob = cleanString(request.AddressJob)
	record.Address = cleanString(request.Address)
	record.ProvinceCode = cleanFlexibleInt(request.ProvinceCode)
	record.DistrictCode = cleanFlexibleInt(request.DistrictCode)
	record.ProvinceName = cleanString(request.ProvinceName)
	record.DistrictName = cleanString(request.DistrictName)
	record.WardName = cleanString(request.WardName)
	record.HealthInsuranceExpiryDate = dates.healthInsuranceExpiryDate
	record.RelativeInfo = cleanString(request.RelativeInfo)
	record.RelativePhone = cleanString(request.RelativePhone)
	record.PaymentCategory = cleanInt(request.PaymentCategory)
}

// applyAdmissionAndDischarge copies admission and discharge fields into the record.
func applyAdmissionAndDischarge(record *domain.MedicalRecord, request dto.GeneralRecordRequest, dates recordDates) {
	record.AdmissionTime = dates.admissionTime
	record.AdmissionType = cleanInt(request.AdmissionType)
	record.ReferralSource = cleanInt(request.ReferralSource)
	record.AdmissionCount = cleanString(request.AdmissionCount)
	record.HospitalTransferType = cleanInt(request.HospitalTransferType)
	record.HospitalTransferDestination = cleanString(request.HospitalTransferDestination)
	record.DischargeTime = dates.dischargeTime
	record.DischargeType = cleanInt(request.DischargeType)
	record.TotalTreatmentDays = cleanString(request.TotalTreatmentDays)
}

// applyDiagnosis copies diagnosis and procedure fields into the record.
func applyDiagnosis(record *domain.MedicalRecord, request dto.GeneralRecordRequest) {
	record.ReferralDiagnosis = cleanString(request.ReferralDiagnosis)
	record.ReferralCode = cleanString(request.ReferralCode)
	record.AdmissionDiagnosis = cleanString(request.AdmissionDiagnosis)
	record.AdmissionCode = cleanString(request.AdmissionCode)
	record.DepartmentDiagnosis = cleanString(request.DepartmentDiagnosis)
	record.DepartmentCode = cleanString(request.DepartmentCode)
	record.HasProcedure = request.HasProcedure
	record.HasSurgery = request.HasSurgery
	record.DischargeMainDiagnosis = cleanString(request.DischargeMainDiagnosis)
	record.DischargeMainCode = cleanString(request.DischargeMainCode)
	record.DischargeSubDiagnosis = cleanString(request.DischargeSubDiagnosis)
	record.DischargeSubCode = cleanString(request.DischargeSubCode)
	record.HasAccident = request.HasAccident
	record.HasComplication = request.HasComplication
}

// applyOutcome copies result and death-related fields into the record.
func applyOutcome(record *domain.MedicalRecord, request dto.GeneralRecordRequest) {
	record.TreatmentResult = cleanInt(request.TreatmentResult)
	record.PathologyResult = cleanInt(request.PathologyResult)
	record.DeathCause = cleanInt(request.DeathCause)
	record.DeathTimeGroup = cleanInt(request.DeathTimeGroup)
	record.DeathReason = cleanString(request.DeathReason)
	record.DeathMainReason = cleanString(request.DeathMainReason)
	record.DeathMainCode = cleanInt(request.DeathMainCode)
	record.HasAutopsy = request.HasAutopsy
	record.DiagnosisAutopsy = cleanString(request.DiagnosisAutopsy)
	record.DiagnosisCode = cleanInt(request.DiagnosisCode)
}
