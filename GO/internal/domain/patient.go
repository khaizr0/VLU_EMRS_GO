package domain

import "time"

type Patient struct {
	ID                    int       `json:"id"`
	EthnicityID           int       `json:"ethnicityId"`
	CreatedBy             int       `json:"createdBy"`
	Name                  string    `json:"name"`
	DateOfBirth           time.Time `json:"dateOfBirth"`
	Gender                int       `json:"gender"`
	HealthInsuranceNumber string    `json:"healthInsuranceNumber"`
	CreatedAt             time.Time `json:"createdAt"`
	Ethnicity             Ethnicity `json:"ethnicity"`
}
