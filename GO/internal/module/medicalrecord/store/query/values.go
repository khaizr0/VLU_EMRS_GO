package query

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

// RecordValues maps a domain record into INSERT arguments.
func RecordValues(record domain.MedicalRecord) []any {
	values := []any{record.PatientID, record.CreatedBy, record.StorageCode, record.CreatedAt}
	return append(values, mutableRecordValues(record)...)
}

// UpdateRecordValues maps a domain record into UPDATE arguments.
func UpdateRecordValues(record domain.MedicalRecord) []any {
	return mutableRecordValues(record)
}

// mutableRecordValues maps editable record fields in the same order as mutableRecordColumns.
func mutableRecordValues(record domain.MedicalRecord) []any {
	return []any{
		record.RecordType, record.FormCode, record.MedicalCode, record.BedCode,
		record.JobTitle, record.JobTitleCode, record.AddressJob, record.Address,
		record.ProvinceCode, record.DistrictCode, record.ProvinceName,
		record.DistrictName, record.WardName,
		record.HealthInsuranceExpiryDate, record.RelativeInfo,
		record.RelativePhone, record.PaymentCategory,
		record.AdmissionTime, record.AdmissionType,
		record.ReferralSource, record.AdmissionCount,
		record.HospitalTransferType, record.HospitalTransferDestination,
		record.DischargeTime, record.DischargeType, record.TotalTreatmentDays,
		record.ReferralDiagnosis, record.ReferralCode,
		record.AdmissionDiagnosis, record.AdmissionCode,
		record.DepartmentDiagnosis, record.DepartmentCode,
		record.HasProcedure, record.HasSurgery,
		record.DischargeMainDiagnosis, record.DischargeMainCode,
		record.DischargeSubDiagnosis, record.DischargeSubCode,
		record.HasAccident, record.HasComplication,
		record.TreatmentResult, record.PathologyResult,
		record.DeathCause, record.DeathTimeGroup,
		record.DeathReason, record.DeathMainReason,
		record.DeathMainCode, record.HasAutopsy,
		record.DiagnosisAutopsy, record.DiagnosisCode,
	}
}

// DetailValues maps detail data into InsertDetailSQL arguments.
func DetailValues(recordID int, detail domain.MedicalRecordDetail) []any {
	return []any{
		recordID, detail.IllnessDay, detail.AdmissionReason,
		detail.PathologicalProcess, detail.PersonalHistory, detail.FamilyHistory,
		detail.ExamGeneral, detail.ExamCardio, detail.ExamRespiratory,
		detail.ExamGastro, detail.ExamRenalUrology, detail.ExamNeurological,
		detail.ExamMusculoskeletal, detail.ExamENT, detail.ExamMaxillofacial,
		detail.ExamOphthalmology, detail.ExamEndocrineOthers,
		detail.RequiredClinicalTests, detail.MedicalSummary,
		detail.DiagnosisMain, detail.DiagnosisSub,
		detail.DiagnosisDifferential, detail.Prognosis, detail.TreatmentPlan,
		detail.PulseRate, detail.Temperature, detail.BloodPressure,
		detail.RespiratoryRate, detail.BodyWeight,
	}
}
