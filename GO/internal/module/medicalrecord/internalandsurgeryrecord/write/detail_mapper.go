package write

import (
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/dto"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
)

func detailFromRequest(request *dto.DetailRequest) *domain.MedicalRecordDetail {
	if request == nil {
		return nil
	}
	detail := &domain.MedicalRecordDetail{
		IllnessDay:          shared.CleanInt(request.IllnessDay),
		AdmissionReason:     shared.CleanString(request.AdmissionReason),
		PathologicalProcess: shared.CleanString(request.PathologicalProcess),
		PersonalHistory:     shared.CleanString(request.PersonalHistory),
		FamilyHistory:       shared.CleanString(request.FamilyHistory),
		RiskFactors:         riskFactorsFromRequest(request.RiskFactors),
	}
	applyDetailExam(detail, request)
	applyDetailDiagnosis(detail, request)
	applyDetailVitals(detail, request)
	return detail
}

func applyDetailExam(detail *domain.MedicalRecordDetail, request *dto.DetailRequest) {
	detail.ExamGeneral = shared.CleanString(request.ExamGeneral)
	detail.ExamCardio = shared.CleanString(request.ExamCardio)
	detail.ExamRespiratory = shared.CleanString(request.ExamRespiratory)
	detail.ExamGastro = shared.CleanString(request.ExamGastro)
	detail.ExamRenalUrology = shared.CleanString(request.ExamRenalUrology)
	detail.ExamNeurological = shared.CleanString(request.ExamNeurological)
	detail.ExamMusculoskeletal = shared.CleanString(request.ExamMusculoskeletal)
	detail.ExamENT = shared.CleanString(request.ExamENT)
	detail.ExamMaxillofacial = shared.CleanString(request.ExamMaxillofacial)
	detail.ExamOphthalmology = shared.CleanString(request.ExamOphthalmology)
	detail.ExamEndocrineOthers = shared.CleanString(request.ExamEndocrineOthers)
	detail.RequiredClinicalTests = shared.CleanString(request.RequiredClinicalTests)
	detail.MedicalSummary = shared.CleanString(request.MedicalSummary)
}

func applyDetailDiagnosis(detail *domain.MedicalRecordDetail, request *dto.DetailRequest) {
	detail.DiagnosisMain = shared.CleanString(request.DiagnosisMain)
	detail.DiagnosisSub = shared.CleanString(request.DiagnosisSub)
	detail.DiagnosisDifferential = shared.CleanString(request.DiagnosisDifferential)
	detail.Prognosis = shared.CleanString(request.Prognosis)
	detail.TreatmentPlan = shared.CleanString(request.TreatmentPlan)
}

func applyDetailVitals(detail *domain.MedicalRecordDetail, request *dto.DetailRequest) {
	detail.PulseRate = shared.CleanString(request.PulseRate)
	detail.Temperature = shared.CleanString(request.Temperature)
	detail.BloodPressure = shared.CleanString(request.BloodPressure)
	detail.RespiratoryRate = shared.CleanString(request.RespiratoryRate)
	detail.BodyWeight = shared.CleanString(request.BodyWeight)
}

func riskFactorsFromRequest(requests []dto.RiskFactorRequest) []domain.MedicalRiskFactor {
	factors := make([]domain.MedicalRiskFactor, 0, len(requests))
	for _, request := range requests {
		factors = append(factors, domain.MedicalRiskFactor{
			Signed: shared.CleanInt(request.Signed), IsPossible: request.IsPossible, DurationMonth: shared.CleanInt(request.DurationMonth),
		})
	}
	return factors
}
