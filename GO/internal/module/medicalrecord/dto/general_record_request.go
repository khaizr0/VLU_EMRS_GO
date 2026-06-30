package dto

import (
	"strconv"
	"strings"
)

// FlexibleInt allows legacy frontend numeric fields to arrive as strings.
type FlexibleInt int

// UnmarshalJSON accepts numeric codes sent either as JSON numbers or strings.
func (value *FlexibleInt) UnmarshalJSON(data []byte) error {
	text := strings.Trim(string(data), " \t\n\r\"")
	if text == "" || text == "null" {
		*value = 0
		return nil
	}
	parsed, err := strconv.Atoi(text)
	if err != nil {
		return err
	}
	*value = FlexibleInt(parsed)
	return nil
}

// GeneralRecordRequest carries the current general medical record form input.
type GeneralRecordRequest struct {
	RecordType                  *int                      `json:"recordType"`
	FormCode                    *string                   `json:"formCode"`
	MedicalCode                 *string                   `json:"medicalCode"`
	BedCode                     *string                   `json:"bedCode"`
	JobTitle                    *string                   `json:"jobTitle"`
	JobTitleCode                *string                   `json:"jobTitleCode"`
	AddressJob                  *string                   `json:"addressJob"`
	Address                     *string                   `json:"address"`
	ProvinceCode                *FlexibleInt              `json:"provinceCode"`
	DistrictCode                *FlexibleInt              `json:"districtCode"`
	ProvinceName                *string                   `json:"provinceName"`
	DistrictName                *string                   `json:"districtName"`
	WardName                    *string                   `json:"wardName"`
	HealthInsuranceExpiryDate   *string                   `json:"healthInsuranceExpiryDate"`
	RelativeInfo                *string                   `json:"relativeInfo"`
	RelativePhone               *string                   `json:"relativePhone"`
	PaymentCategory             *int                      `json:"paymentCategory"`
	AdmissionTime               *string                   `json:"admissionTime"`
	AdmissionType               *int                      `json:"admissionType"`
	ReferralSource              *int                      `json:"referralSource"`
	AdmissionCount              *string                   `json:"admissionCount"`
	HospitalTransferType        *int                      `json:"hospitalTransferType"`
	HospitalTransferDestination *string                   `json:"hospitalTransferDestination"`
	DischargeTime               *string                   `json:"dischargeTime"`
	DischargeType               *int                      `json:"dischargeType"`
	TotalTreatmentDays          *string                   `json:"totalTreatmentDays"`
	ReferralDiagnosis           *string                   `json:"referralDiagnosis"`
	ReferralCode                *string                   `json:"referralCode"`
	AdmissionDiagnosis          *string                   `json:"admissionDiagnosis"`
	AdmissionCode               *string                   `json:"admissionCode"`
	DepartmentDiagnosis         *string                   `json:"departmentDiagnosis"`
	DepartmentCode              *string                   `json:"departmentCode"`
	HasProcedure                bool                      `json:"hasProcedure"`
	HasSurgery                  bool                      `json:"hasSurgery"`
	DischargeMainDiagnosis      *string                   `json:"dischargeMainDiagnosis"`
	DischargeMainCode           *string                   `json:"dischargeMainCode"`
	DischargeSubDiagnosis       *string                   `json:"dischargeSubDiagnosis"`
	DischargeSubCode            *string                   `json:"dischargeSubCode"`
	HasAccident                 bool                      `json:"hasAccident"`
	HasComplication             bool                      `json:"hasComplication"`
	TreatmentResult             *int                      `json:"treatmentResult"`
	PathologyResult             *int                      `json:"pathologyResult"`
	DeathCause                  *int                      `json:"deathCause"`
	DeathTimeGroup              *int                      `json:"deathTimeGroup"`
	DeathReason                 *string                   `json:"deathReason"`
	DeathMainReason             *string                   `json:"deathMainReason"`
	DeathMainCode               *int                      `json:"deathMainCode"`
	HasAutopsy                  bool                      `json:"hasAutopsy"`
	DiagnosisAutopsy            *string                   `json:"diagnosisAutopsy"`
	DiagnosisCode               *int                      `json:"diagnosisCode"`
	DepartmentTransfers         []DepartmentTransferInput `json:"departmentTransfers"`
	Detail                      *GeneralDetailInput       `json:"detail"`
}

// RecordRequest keeps the current API stable while general-specific code evolves.
type RecordRequest = GeneralRecordRequest

// DepartmentTransferInput carries nested transfer input for record mapping.
type DepartmentTransferInput struct {
	Name          *string `json:"name"`
	AdmissionTime *string `json:"admissionTime"`
	TransferType  *int    `json:"transferType"`
	TreatmentDays *string `json:"treatmentDays"`
}
