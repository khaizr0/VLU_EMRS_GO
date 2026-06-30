package mapper

import (
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
)

// generalDetailFromRequest maps general detail input into a domain detail child record.
func generalDetailFromRequest(request *dto.GeneralDetailInput) *domain.MedicalRecordDetail {
	if request == nil {
		return nil
	}
	detail := &domain.MedicalRecordDetail{
		IllnessDay:          cleanInt(request.IllnessDay),
		AdmissionReason:     cleanString(request.AdmissionReason),
		PathologicalProcess: cleanString(request.PathologicalProcess),
		PersonalHistory:     cleanString(request.PersonalHistory),
		FamilyHistory:       cleanString(request.FamilyHistory),
		RiskFactors:         riskFactorsFromRequest(request.RiskFactors),
	}
	applyDetailExam(detail, request)
	applyDetailDiagnosis(detail, request)
	applyDetailVitals(detail, request)
	return detail
}

// applyDetailExam copies examination fields into the detail domain model.
func applyDetailExam(detail *domain.MedicalRecordDetail, request *dto.GeneralDetailInput) {
	detail.ExamGeneral = cleanString(request.ExamGeneral)
	detail.ExamCardio = cleanString(request.ExamCardio)
	detail.ExamRespiratory = cleanString(request.ExamRespiratory)
	detail.ExamGastro = cleanString(request.ExamGastro)
	detail.ExamRenalUrology = cleanString(request.ExamRenalUrology)
	detail.ExamNeurological = cleanString(request.ExamNeurological)
	detail.ExamMusculoskeletal = cleanString(request.ExamMusculoskeletal)
	detail.ExamENT = cleanString(request.ExamENT)
	detail.ExamMaxillofacial = cleanString(request.ExamMaxillofacial)
	detail.ExamOphthalmology = cleanString(request.ExamOphthalmology)
	detail.ExamEndocrineOthers = cleanString(request.ExamEndocrineOthers)
	detail.RequiredClinicalTests = cleanString(request.RequiredClinicalTests)
	detail.MedicalSummary = cleanString(request.MedicalSummary)
}

// applyDetailDiagnosis copies diagnosis plan fields into the detail domain model.
func applyDetailDiagnosis(detail *domain.MedicalRecordDetail, request *dto.GeneralDetailInput) {
	detail.DiagnosisMain = cleanString(request.DiagnosisMain)
	detail.DiagnosisSub = cleanString(request.DiagnosisSub)
	detail.DiagnosisDifferential = cleanString(request.DiagnosisDifferential)
	detail.Prognosis = cleanString(request.Prognosis)
	detail.TreatmentPlan = cleanString(request.TreatmentPlan)
}

// applyDetailVitals copies vital sign fields into the detail domain model.
func applyDetailVitals(detail *domain.MedicalRecordDetail, request *dto.GeneralDetailInput) {
	detail.PulseRate = cleanString(request.PulseRate)
	detail.Temperature = cleanString(request.Temperature)
	detail.BloodPressure = cleanString(request.BloodPressure)
	detail.RespiratoryRate = cleanString(request.RespiratoryRate)
	detail.BodyWeight = cleanString(request.BodyWeight)
}

// riskFactorsFromRequest maps nested risk factor DTOs into domain children.
func riskFactorsFromRequest(requests []dto.RiskFactorInput) []domain.MedicalRiskFactor {
	factors := make([]domain.MedicalRiskFactor, 0, len(requests))
	for _, request := range requests {
		factors = append(factors, domain.MedicalRiskFactor{
			Signed:        cleanInt(request.Signed),
			IsPossible:    request.IsPossible,
			DurationMonth: cleanInt(request.DurationMonth),
		})
	}
	return factors
}
