package recorddetail

import (
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

func scanDetail(row pgx.Row) (domain.MedicalRecordDetail, error) {
	var detail domain.MedicalRecordDetail
	err := row.Scan(
		&detail.ID, &detail.IllnessDay, &detail.AdmissionReason, &detail.PathologicalProcess, &detail.PersonalHistory,
		&detail.FamilyHistory, &detail.ExamGeneral, &detail.ExamCardio, &detail.ExamRespiratory, &detail.ExamGastro,
		&detail.ExamRenalUrology, &detail.ExamNeurological, &detail.ExamMusculoskeletal, &detail.ExamENT,
		&detail.ExamMaxillofacial, &detail.ExamOphthalmology, &detail.ExamEndocrineOthers, &detail.RequiredClinicalTests,
		&detail.MedicalSummary, &detail.DiagnosisMain, &detail.DiagnosisSub, &detail.DiagnosisDifferential,
		&detail.Prognosis, &detail.TreatmentPlan, &detail.PulseRate, &detail.Temperature, &detail.BloodPressure,
		&detail.RespiratoryRate, &detail.BodyWeight,
	)
	return detail, err
}

func scanTransfer(row pgx.Row, transfer *domain.DepartmentTransfer) error {
	err := row.Scan(&transfer.ID, &transfer.MedicalRecordID, &transfer.Name, &transfer.AdmissionTime, &transfer.TransferType, &transfer.TreatmentDays)
	if err != nil {
		return fmt.Errorf("query department transfer: %w", err)
	}
	return nil
}

func scanRiskFactor(row pgx.Row, factor *domain.MedicalRiskFactor) error {
	err := row.Scan(&factor.ID, &factor.MedicalRecordDetailID, &factor.Signed, &factor.IsPossible, &factor.DurationMonth)
	if err != nil {
		return fmt.Errorf("query risk factor: %w", err)
	}
	return nil
}
