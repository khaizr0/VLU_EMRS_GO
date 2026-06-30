package query

// RecordColumns lists all MedicalRecords columns scanned into domain.MedicalRecord.
const RecordColumns = `
	"m"."Id", "m"."PatientId", "m"."CreatedBy", "m"."RecordType", "m"."FormCode",
	"m"."StorageCode", "m"."MedicalCode", "m"."BedCode", "m"."JobTitle", "m"."JobTitleCode",
	"m"."AddressJob", "m"."Address", "m"."ProvinceCode", "m"."DistrictCode", "m"."ProvinceName",
	"m"."DistrictName", "m"."WardName", "m"."HealthInsuranceExpiryDate", "m"."RelativeInfo", "m"."RelativePhone",
	"m"."PaymentCategory", "m"."AdmissionTime", "m"."AdmissionType", "m"."ReferralSource", "m"."AdmissionCount",
	"m"."HospitalTransferType", "m"."HospitalTransferDestination", "m"."DischargeTime", "m"."DischargeType", "m"."TotalTreatmentDays",
	"m"."ReferralDiagnosis", "m"."ReferralCode", "m"."AdmissionDiagnosis", "m"."AdmissionCode", "m"."DepartmentDiagnosis",
	"m"."DepartmentCode", "m"."HasProcedure", "m"."HasSurgery", "m"."DischargeMainDiagnosis", "m"."DischargeMainCode",
	"m"."DischargeSubDiagnosis", "m"."DischargeSubCode", "m"."HasAccident", "m"."HasComplication", "m"."TreatmentResult",
	"m"."PathologyResult", "m"."DeathCause", "m"."DeathTimeGroup", "m"."DeathReason", "m"."DeathMainReason",
	"m"."DeathMainCode", "m"."HasAutopsy", "m"."DiagnosisAutopsy", "m"."DiagnosisCode", "m"."CreatedAt"`

// PatientColumns lists the joined patient and ethnicity columns for record reads.
const PatientColumns = `
	"p"."Id", "p"."EthnicityId", "p"."CreatedBy", "p"."Name", "p"."DateOfBirth",
	"p"."Gender", "p"."HealthInsuranceNumber", "p"."CreatedAt", "e"."Id", "e"."Name"`

// RecordsFrom joins medical records to patient and ethnicity data.
const RecordsFrom = ` FROM "MedicalRecords" AS "m"
	JOIN "Patients" AS "p" ON "p"."Id" = "m"."PatientId"
	JOIN "Ethnicities" AS "e" ON "e"."Id" = "p"."EthnicityId"`

// RecordByIDSQL loads one record with its patient snapshot.
const RecordByIDSQL = `SELECT ` + RecordColumns + `, ` + PatientColumns + RecordsFrom + ` WHERE "m"."Id" = $1`

// DetailByRecordIDSQL loads the detail row linked by medical record ID.
const DetailByRecordIDSQL = `
	SELECT "Id", "IllnessDay", "AdmissionReason", "PathologicalProcess", "PersonalHistory", "FamilyHistory",
		"ExamGeneral", "ExamCardio", "ExamRespiratory", "ExamGastro", "ExamRenalUrology", "ExamNeurological", "ExamMusculoskeletal",
		"ExamENT", "ExamMaxillofacial", "ExamOphthalmology", "ExamEndocrineOthers", "RequiredClinicalTests", "MedicalSummary",
		"DiagnosisMain", "DiagnosisSub", "DiagnosisDifferential", "Prognosis", "TreatmentPlan",
		"PulseRate", "Temperature", "BloodPressure", "RespiratoryRate", "BodyWeight"
	FROM "MedicalRecordDetails"
	WHERE "Id" = $1`

// InsertDetailSQL inserts the one-to-one detail row for a medical record.
const InsertDetailSQL = `
	INSERT INTO "MedicalRecordDetails" (
		"Id", "IllnessDay", "AdmissionReason", "PathologicalProcess", "PersonalHistory", "FamilyHistory",
		"ExamGeneral", "ExamCardio", "ExamRespiratory", "ExamGastro", "ExamRenalUrology", "ExamNeurological", "ExamMusculoskeletal",
		"ExamENT", "ExamMaxillofacial", "ExamOphthalmology", "ExamEndocrineOthers", "RequiredClinicalTests", "MedicalSummary",
		"DiagnosisMain", "DiagnosisSub", "DiagnosisDifferential", "Prognosis", "TreatmentPlan",
		"PulseRate", "Temperature", "BloodPressure", "RespiratoryRate", "BodyWeight"
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)`

// TransferListSQL loads all department transfers for a medical record.
const TransferListSQL = `
	SELECT "Id", "MedicalRecordId", "Name", "AdmissionTime", "TransferType", "TreatmentDays"
	FROM "DepartmentTransfers"
	WHERE "MedicalRecordId" = $1
	ORDER BY "Id"`

// RiskFactorListSQL loads all risk factors for a medical record detail.
const RiskFactorListSQL = `
	SELECT "Id", "MedicalRecordDetailId", "Signed", "IsPossible", "DurationMonth"
	FROM "MedicalRecordRiskFactors"
	WHERE "MedicalRecordDetailId" = $1
	ORDER BY "Id"`

// InsertTransferSQL inserts one department transfer child row.
const InsertTransferSQL = `
	INSERT INTO "DepartmentTransfers" ("MedicalRecordId", "Name", "AdmissionTime", "TransferType", "TreatmentDays")
	VALUES ($1, $2, $3, $4, $5)`

// InsertRiskFactorSQL inserts one risk factor child row.
const InsertRiskFactorSQL = `
	INSERT INTO "MedicalRecordRiskFactors" ("MedicalRecordDetailId", "Signed", "IsPossible", "DurationMonth")
	VALUES ($1, $2, $3, $4)`
