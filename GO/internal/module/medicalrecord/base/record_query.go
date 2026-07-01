package base

import (
	"fmt"
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Filters struct {
	SearchPhrase string
	PageNumber   int
	PageSize     int
	RecordType   *int
	FromDay      *time.Time
	ToDay        *time.Time
}

var insertOnlyColumns = []string{"PatientId", "CreatedBy", "StorageCode", "CreatedAt"}

var mutableRecordColumns = []string{
	"RecordType", "FormCode", "MedicalCode", "BedCode", "JobTitle", "JobTitleCode", "AddressJob", "Address",
	"ProvinceCode", "DistrictCode", "ProvinceName", "DistrictName", "WardName", "HealthInsuranceExpiryDate",
	"RelativeInfo", "RelativePhone", "PaymentCategory", "AdmissionTime", "AdmissionType", "ReferralSource",
	"AdmissionCount", "HospitalTransferType", "HospitalTransferDestination", "DischargeTime", "DischargeType",
	"TotalTreatmentDays", "ReferralDiagnosis", "ReferralCode", "AdmissionDiagnosis", "AdmissionCode",
	"DepartmentDiagnosis", "DepartmentCode", "HasProcedure", "HasSurgery", "DischargeMainDiagnosis",
	"DischargeMainCode", "DischargeSubDiagnosis", "DischargeSubCode", "HasAccident", "HasComplication",
	"TreatmentResult", "PathologyResult", "DeathCause", "DeathTimeGroup", "DeathReason", "DeathMainReason",
	"DeathMainCode", "HasAutopsy", "DiagnosisAutopsy", "DiagnosisCode",
}

const recordColumns = `
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

const patientColumns = `
	"p"."Id", "p"."EthnicityId", "p"."CreatedBy", "p"."Name", "p"."DateOfBirth",
	"p"."Gender", "p"."HealthInsuranceNumber", "p"."CreatedAt", "e"."Id", "e"."Name"`

const recordsFrom = ` FROM "MedicalRecords" AS "m"
	JOIN "Patients" AS "p" ON "p"."Id" = "m"."PatientId"
	JOIN "Ethnicities" AS "e" ON "e"."Id" = "p"."EthnicityId"`

const recordByIDSQL = `SELECT ` + recordColumns + `, ` + patientColumns + recordsFrom + ` WHERE "m"."Id" = $1`

func insertRecordSQL() string {
	insertColumns := append([]string{}, insertOnlyColumns...)
	insertColumns = append(insertColumns, mutableRecordColumns...)
	columns := make([]string, len(insertColumns))
	placeholders := make([]string, len(insertColumns))
	for index, column := range insertColumns {
		columns[index] = quote(column)
		placeholders[index] = fmt.Sprintf("$%d", index+1)
	}
	return `INSERT INTO "MedicalRecords" (` + strings.Join(columns, ", ") + `) VALUES (` + strings.Join(placeholders, ", ") + `) RETURNING "Id"`
}

func updateRecordSQL() string {
	sets := make([]string, len(mutableRecordColumns))
	for index, column := range mutableRecordColumns {
		sets[index] = fmt.Sprintf(`%s = $%d`, quote(column), index+1)
	}
	return `UPDATE "MedicalRecords" SET ` + strings.Join(sets, ", ") + ` WHERE "Id" = $` + fmt.Sprint(len(mutableRecordColumns)+1)
}

func listRecordsSQL(where string, argCount int) string {
	return `SELECT "m"."Id", "m"."PatientId", "m"."DischargeTime", "m"."RecordType", "m"."StorageCode", "m"."AdmissionTime", ` +
		patientColumns + recordsFrom + where +
		` ORDER BY "m"."CreatedAt" DESC LIMIT $` + fmt.Sprint(argCount+1) + ` OFFSET $` + fmt.Sprint(argCount+2)
}

func recordWhere(filters Filters) (string, []any) {
	var conditions []string
	var args []any
	if filters.SearchPhrase != "" {
		args = append(args, "%"+filters.SearchPhrase+"%")
		conditions = append(conditions, searchCondition(len(args)))
	}
	if filters.RecordType != nil {
		args = append(args, *filters.RecordType)
		conditions = append(conditions, fmt.Sprintf(`"m"."RecordType" = $%d`, len(args)))
	}
	if filters.FromDay != nil {
		args = append(args, *filters.FromDay)
		conditions = append(conditions, fmt.Sprintf(`"m"."CreatedAt" >= $%d`, len(args)))
	}
	if filters.ToDay != nil {
		args = append(args, filters.ToDay.Add(24*time.Hour-time.Nanosecond))
		conditions = append(conditions, fmt.Sprintf(`"m"."CreatedAt" <= $%d`, len(args)))
	}
	if len(conditions) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(conditions, " AND "), args
}

func recordValues(record domain.MedicalRecord) []any {
	values := []any{record.PatientID, record.CreatedBy, record.StorageCode, record.CreatedAt}
	return append(values, updateRecordValues(record)...)
}

func updateRecordValues(record domain.MedicalRecord) []any {
	return []any{
		record.RecordType, record.FormCode, record.MedicalCode, record.BedCode, record.JobTitle, record.JobTitleCode,
		record.AddressJob, record.Address, record.ProvinceCode, record.DistrictCode, record.ProvinceName,
		record.DistrictName, record.WardName, record.HealthInsuranceExpiryDate, record.RelativeInfo, record.RelativePhone,
		record.PaymentCategory, record.AdmissionTime, record.AdmissionType, record.ReferralSource, record.AdmissionCount,
		record.HospitalTransferType, record.HospitalTransferDestination, record.DischargeTime, record.DischargeType,
		record.TotalTreatmentDays, record.ReferralDiagnosis, record.ReferralCode, record.AdmissionDiagnosis, record.AdmissionCode,
		record.DepartmentDiagnosis, record.DepartmentCode, record.HasProcedure, record.HasSurgery, record.DischargeMainDiagnosis,
		record.DischargeMainCode, record.DischargeSubDiagnosis, record.DischargeSubCode, record.HasAccident, record.HasComplication,
		record.TreatmentResult, record.PathologyResult, record.DeathCause, record.DeathTimeGroup, record.DeathReason,
		record.DeathMainReason, record.DeathMainCode, record.HasAutopsy, record.DiagnosisAutopsy, record.DiagnosisCode,
	}
}

func searchCondition(argIndex int) string {
	return fmt.Sprintf(`("m"."StorageCode" ILIKE $%d OR "m"."MedicalCode" ILIKE $%d OR "p"."Name" ILIKE $%d)`, argIndex, argIndex, argIndex)
}

func quote(column string) string {
	return `"` + column + `"`
}
