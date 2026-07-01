package recorddetail

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

const detailByRecordIDSQL = `
	SELECT "Id", "IllnessDay", "AdmissionReason", "PathologicalProcess", "PersonalHistory", "FamilyHistory",
		"ExamGeneral", "ExamCardio", "ExamRespiratory", "ExamGastro", "ExamRenalUrology", "ExamNeurological", "ExamMusculoskeletal",
		"ExamENT", "ExamMaxillofacial", "ExamOphthalmology", "ExamEndocrineOthers", "RequiredClinicalTests", "MedicalSummary",
		"DiagnosisMain", "DiagnosisSub", "DiagnosisDifferential", "Prognosis", "TreatmentPlan",
		"PulseRate", "Temperature", "BloodPressure", "RespiratoryRate", "BodyWeight"
	FROM "MedicalRecordDetails" WHERE "Id" = $1`

const insertDetailSQL = `
	INSERT INTO "MedicalRecordDetails" (
		"Id", "IllnessDay", "AdmissionReason", "PathologicalProcess", "PersonalHistory", "FamilyHistory",
		"ExamGeneral", "ExamCardio", "ExamRespiratory", "ExamGastro", "ExamRenalUrology", "ExamNeurological", "ExamMusculoskeletal",
		"ExamENT", "ExamMaxillofacial", "ExamOphthalmology", "ExamEndocrineOthers", "RequiredClinicalTests", "MedicalSummary",
		"DiagnosisMain", "DiagnosisSub", "DiagnosisDifferential", "Prognosis", "TreatmentPlan",
		"PulseRate", "Temperature", "BloodPressure", "RespiratoryRate", "BodyWeight"
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)`

const deleteTransfersSQL = `DELETE FROM "DepartmentTransfers" WHERE "MedicalRecordId" = $1`
const deleteDetailSQL = `DELETE FROM "MedicalRecordDetails" WHERE "Id" = $1`
const transferListSQL = `SELECT "Id", "MedicalRecordId", "Name", "AdmissionTime", "TransferType", "TreatmentDays" FROM "DepartmentTransfers" WHERE "MedicalRecordId" = $1 ORDER BY "Id"`
const riskFactorListSQL = `SELECT "Id", "MedicalRecordDetailId", "Signed", "IsPossible", "DurationMonth" FROM "MedicalRecordRiskFactors" WHERE "MedicalRecordDetailId" = $1 ORDER BY "Id"`
const insertTransferSQL = `INSERT INTO "DepartmentTransfers" ("MedicalRecordId", "Name", "AdmissionTime", "TransferType", "TreatmentDays") VALUES ($1, $2, $3, $4, $5)`
const insertRiskFactorSQL = `INSERT INTO "MedicalRecordRiskFactors" ("MedicalRecordDetailId", "Signed", "IsPossible", "DurationMonth") VALUES ($1, $2, $3, $4)`

func detailValues(recordID int, detail domain.MedicalRecordDetail) []any {
	return []any{
		recordID, detail.IllnessDay, detail.AdmissionReason, detail.PathologicalProcess, detail.PersonalHistory,
		detail.FamilyHistory, detail.ExamGeneral, detail.ExamCardio, detail.ExamRespiratory, detail.ExamGastro,
		detail.ExamRenalUrology, detail.ExamNeurological, detail.ExamMusculoskeletal, detail.ExamENT,
		detail.ExamMaxillofacial, detail.ExamOphthalmology, detail.ExamEndocrineOthers, detail.RequiredClinicalTests,
		detail.MedicalSummary, detail.DiagnosisMain, detail.DiagnosisSub, detail.DiagnosisDifferential,
		detail.Prognosis, detail.TreatmentPlan, detail.PulseRate, detail.Temperature, detail.BloodPressure,
		detail.RespiratoryRate, detail.BodyWeight,
	}
}
