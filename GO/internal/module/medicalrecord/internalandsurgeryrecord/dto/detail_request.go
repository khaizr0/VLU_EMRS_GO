package dto

type DetailRequest struct {
	IllnessDay            *int                `json:"illnessDay"`
	AdmissionReason       *string             `json:"admissionReason"`
	PathologicalProcess   *string             `json:"pathologicalProcess"`
	PersonalHistory       *string             `json:"personalHistory"`
	FamilyHistory         *string             `json:"familyHistory"`
	ExamGeneral           *string             `json:"examGeneral"`
	ExamCardio            *string             `json:"examCardio"`
	ExamRespiratory       *string             `json:"examRespiratory"`
	ExamGastro            *string             `json:"examGastro"`
	ExamRenalUrology      *string             `json:"examRenalUrology"`
	ExamNeurological      *string             `json:"examNeurological"`
	ExamMusculoskeletal   *string             `json:"examMusculoskeletal"`
	ExamENT               *string             `json:"examENT"`
	ExamMaxillofacial     *string             `json:"examMaxillofacial"`
	ExamOphthalmology     *string             `json:"examOphthalmology"`
	ExamEndocrineOthers   *string             `json:"examEndocrineOthers"`
	RequiredClinicalTests *string             `json:"requiredClinicalTests"`
	MedicalSummary        *string             `json:"medicalSummary"`
	DiagnosisMain         *string             `json:"diagnosisMain"`
	DiagnosisSub          *string             `json:"diagnosisSub"`
	DiagnosisDifferential *string             `json:"diagnosisDifferential"`
	Prognosis             *string             `json:"prognosis"`
	TreatmentPlan         *string             `json:"treatmentPlan"`
	PulseRate             *string             `json:"pulseRate"`
	Temperature           *string             `json:"temperature"`
	BloodPressure         *string             `json:"bloodPressure"`
	RespiratoryRate       *string             `json:"respiratoryRate"`
	BodyWeight            *string             `json:"bodyWeight"`
	RiskFactors           []RiskFactorRequest `json:"riskFactors"`
}

type RiskFactorRequest struct {
	Signed        *int  `json:"signed"`
	IsPossible    *bool `json:"isPossible"`
	DurationMonth *int  `json:"durationMonth"`
}
