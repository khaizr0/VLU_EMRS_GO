package domain

import "time"

type MedicalRecordItem struct {
	ID            int        `json:"id"`
	PatientID     int        `json:"patientId"`
	DischargeTime *time.Time `json:"dischargeTime"`
	RecordType    *int       `json:"recordType"`
	StorageCode   *string    `json:"storageCode"`
	AdmissionTime *time.Time `json:"admissionTime"`
	Patient       Patient    `json:"patient"`
}

type MedicalRecord struct {
	ID                          int                  `json:"id"`
	PatientID                   int                  `json:"patientId"`
	CreatedBy                   int                  `json:"createdBy"`
	RecordType                  *int                 `json:"recordType"`
	FormCode                    *string              `json:"formCode"`
	StorageCode                 *string              `json:"storageCode"`
	MedicalCode                 *string              `json:"medicalCode"`
	BedCode                     *string              `json:"bedCode"`
	JobTitle                    *string              `json:"jobTitle"`
	JobTitleCode                *string              `json:"jobTitleCode"`
	AddressJob                  *string              `json:"addressJob"`
	Address                     *string              `json:"address"`
	ProvinceCode                *int                 `json:"provinceCode"`
	DistrictCode                *int                 `json:"districtCode"`
	ProvinceName                *string              `json:"provinceName"`
	DistrictName                *string              `json:"districtName"`
	WardName                    *string              `json:"wardName"`
	HealthInsuranceExpiryDate   *time.Time           `json:"healthInsuranceExpiryDate"`
	RelativeInfo                *string              `json:"relativeInfo"`
	RelativePhone               *string              `json:"relativePhone"`
	PaymentCategory             *int                 `json:"paymentCategory"`
	AdmissionTime               *time.Time           `json:"admissionTime"`
	AdmissionType               *int                 `json:"admissionType"`
	ReferralSource              *int                 `json:"referralSource"`
	AdmissionCount              *string              `json:"admissionCount"`
	HospitalTransferType        *int                 `json:"hospitalTransferType"`
	HospitalTransferDestination *string              `json:"hospitalTransferDestination"`
	DischargeTime               *time.Time           `json:"dischargeTime"`
	DischargeType               *int                 `json:"dischargeType"`
	TotalTreatmentDays          *string              `json:"totalTreatmentDays"`
	ReferralDiagnosis           *string              `json:"referralDiagnosis"`
	ReferralCode                *string              `json:"referralCode"`
	AdmissionDiagnosis          *string              `json:"admissionDiagnosis"`
	AdmissionCode               *string              `json:"admissionCode"`
	DepartmentDiagnosis         *string              `json:"departmentDiagnosis"`
	DepartmentCode              *string              `json:"departmentCode"`
	HasProcedure                bool                 `json:"hasProcedure"`
	HasSurgery                  bool                 `json:"hasSurgery"`
	DischargeMainDiagnosis      *string              `json:"dischargeMainDiagnosis"`
	DischargeMainCode           *string              `json:"dischargeMainCode"`
	DischargeSubDiagnosis       *string              `json:"dischargeSubDiagnosis"`
	DischargeSubCode            *string              `json:"dischargeSubCode"`
	HasAccident                 bool                 `json:"hasAccident"`
	HasComplication             bool                 `json:"hasComplication"`
	TreatmentResult             *int                 `json:"treatmentResult"`
	PathologyResult             *int                 `json:"pathologyResult"`
	DeathCause                  *int                 `json:"deathCause"`
	DeathTimeGroup              *int                 `json:"deathTimeGroup"`
	DeathReason                 *string              `json:"deathReason"`
	DeathMainReason             *string              `json:"deathMainReason"`
	DeathMainCode               *int                 `json:"deathMainCode"`
	HasAutopsy                  bool                 `json:"hasAutopsy"`
	DiagnosisAutopsy            *string              `json:"diagnosisAutopsy"`
	DiagnosisCode               *int                 `json:"diagnosisCode"`
	CreatedAt                   time.Time            `json:"createdAt"`
	DepartmentTransfers         []DepartmentTransfer `json:"departmentTransfers"`
	Patient                     Patient              `json:"patient"`
	XRays                       []any                `json:"xRays"`
	Hematologies                []any                `json:"hematologies"`
	Detail                      *MedicalRecordDetail `json:"detail"`
}

type DepartmentTransfer struct {
	ID              int        `json:"id"`
	MedicalRecordID int        `json:"medicalRecordId"`
	Name            *string    `json:"name"`
	AdmissionTime   *time.Time `json:"admissionTime"`
	TransferType    *int       `json:"transferType"`
	TreatmentDays   *string    `json:"treatmentDays"`
}

type MedicalRecordDetail struct {
	ID                    int                 `json:"id"`
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
	RiskFactors           []MedicalRiskFactor `json:"riskFactors"`
}

type MedicalRiskFactor struct {
	ID                    int   `json:"id"`
	MedicalRecordDetailID int   `json:"medicalRecordDetailId"`
	Signed                *int  `json:"signed"`
	IsPossible            *bool `json:"isPossible"`
	DurationMonth         *int  `json:"durationMonth"`
}
