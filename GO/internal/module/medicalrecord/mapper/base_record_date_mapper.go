package mapper

import (
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
)

// recordDates groups parsed date values shared by multiple record sections.
type recordDates struct {
	healthInsuranceExpiryDate *time.Time
	admissionTime             *time.Time
	dischargeTime             *time.Time
}

// datesFromRequest parses record-level dates before field mapping begins.
func datesFromRequest(request dto.GeneralRecordRequest) (recordDates, error) {
	healthInsuranceExpiryDate, err := parseOptionalTime(request.HealthInsuranceExpiryDate)
	if err != nil {
		return recordDates{}, err
	}
	admissionTime, err := parseOptionalTime(request.AdmissionTime)
	if err != nil {
		return recordDates{}, err
	}
	dischargeTime, err := parseOptionalTime(request.DischargeTime)
	if err != nil {
		return recordDates{}, err
	}
	return recordDates{healthInsuranceExpiryDate, admissionTime, dischargeTime}, nil
}

// transfersFromRequest maps transfer DTOs into domain children for the store.
func transfersFromRequest(requests []dto.DepartmentTransferInput) ([]domain.DepartmentTransfer, error) {
	transfers := make([]domain.DepartmentTransfer, 0, len(requests))
	for _, request := range requests {
		admissionTime, err := parseOptionalTime(request.AdmissionTime)
		if err != nil {
			return nil, err
		}
		transfers = append(transfers, domain.DepartmentTransfer{
			Name:          cleanString(request.Name),
			AdmissionTime: admissionTime,
			TransferType:  cleanInt(request.TransferType),
			TreatmentDays: cleanString(request.TreatmentDays),
		})
	}
	return transfers, nil
}
