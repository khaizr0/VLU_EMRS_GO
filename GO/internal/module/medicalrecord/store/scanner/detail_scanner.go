package scanner

import (
	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

// Detail scans the one-to-one detail row for a medical record.
func Detail(row pgx.Row) (domain.MedicalRecordDetail, error) {
	var detail domain.MedicalRecordDetail
	err := row.Scan(
		&detail.ID, &detail.IllnessDay, &detail.AdmissionReason,
		&detail.PathologicalProcess, &detail.PersonalHistory, &detail.FamilyHistory,
		&detail.ExamGeneral, &detail.ExamCardio, &detail.ExamRespiratory,
		&detail.ExamGastro, &detail.ExamRenalUrology, &detail.ExamNeurological,
		&detail.ExamMusculoskeletal, &detail.ExamENT, &detail.ExamMaxillofacial,
		&detail.ExamOphthalmology, &detail.ExamEndocrineOthers,
		&detail.RequiredClinicalTests, &detail.MedicalSummary,
		&detail.DiagnosisMain, &detail.DiagnosisSub,
		&detail.DiagnosisDifferential, &detail.Prognosis, &detail.TreatmentPlan,
		&detail.PulseRate, &detail.Temperature, &detail.BloodPressure,
		&detail.RespiratoryRate, &detail.BodyWeight,
	)
	return detail, err
}
