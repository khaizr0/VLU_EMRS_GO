package query

import (
	"fmt"
	"strings"
)

// insertOnlyColumns lists columns only written when a record is created.
var insertOnlyColumns = []string{"PatientId", "CreatedBy", "StorageCode", "CreatedAt"}

// mutableRecordColumns lists columns shared by create and update flows.
var mutableRecordColumns = []string{
	"RecordType", "FormCode", "MedicalCode", "BedCode",
	"JobTitle", "JobTitleCode", "AddressJob", "Address",
	"ProvinceCode", "DistrictCode", "ProvinceName", "DistrictName", "WardName",
	"HealthInsuranceExpiryDate", "RelativeInfo", "RelativePhone", "PaymentCategory",
	"AdmissionTime", "AdmissionType", "ReferralSource", "AdmissionCount",
	"HospitalTransferType", "HospitalTransferDestination",
	"DischargeTime", "DischargeType", "TotalTreatmentDays",
	"ReferralDiagnosis", "ReferralCode", "AdmissionDiagnosis", "AdmissionCode",
	"DepartmentDiagnosis", "DepartmentCode", "HasProcedure", "HasSurgery",
	"DischargeMainDiagnosis", "DischargeMainCode",
	"DischargeSubDiagnosis", "DischargeSubCode",
	"HasAccident", "HasComplication",
	"TreatmentResult", "PathologyResult", "DeathCause", "DeathTimeGroup",
	"DeathReason", "DeathMainReason", "DeathMainCode", "HasAutopsy",
	"DiagnosisAutopsy", "DiagnosisCode",
}

// InsertRecordSQL builds the INSERT statement used by store.Create.
func InsertRecordSQL() string {
	insertColumns := append([]string{}, insertOnlyColumns...)
	insertColumns = append(insertColumns, mutableRecordColumns...)

	columns := make([]string, len(insertColumns))
	placeholders := make([]string, len(insertColumns))
	for index, column := range insertColumns {
		columns[index] = quote(column)
		placeholders[index] = fmt.Sprintf("$%d", index+1)
	}
	return `INSERT INTO "MedicalRecords" (` +
		strings.Join(columns, ", ") +
		`) VALUES (` +
		strings.Join(placeholders, ", ") +
		`) RETURNING "Id"`
}

// UpdateRecordSQL builds the UPDATE statement used by store.Update.
func UpdateRecordSQL() string {
	sets := make([]string, len(mutableRecordColumns))
	for index, column := range mutableRecordColumns {
		sets[index] = fmt.Sprintf(`%s = $%d`, quote(column), index+1)
	}
	return `UPDATE "MedicalRecords" SET ` +
		strings.Join(sets, ", ") +
		` WHERE "Id" = $` +
		fmt.Sprint(len(mutableRecordColumns)+1)
}

// ListRecordsSQL builds the paged list query after filters are prepared.
func ListRecordsSQL(where string, argCount int) string {
	return `SELECT "m"."Id", "m"."PatientId", "m"."DischargeTime", "m"."RecordType", "m"."StorageCode", "m"."AdmissionTime", ` +
		PatientColumns + RecordsFrom + where +
		` ORDER BY "m"."CreatedAt" DESC LIMIT $` + fmt.Sprint(argCount+1) +
		` OFFSET $` + fmt.Sprint(argCount+2)
}

// quote wraps a PascalCase database column with PostgreSQL quotes.
func quote(column string) string {
	return `"` + column + `"`
}
