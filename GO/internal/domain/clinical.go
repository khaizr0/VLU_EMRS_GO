package domain

import "time"

type XRay struct {
	ID                 int             `json:"id"`
	MedicalRecordID    int             `json:"medicalRecordId"`
	RequestedByID      int             `json:"requestedById"`
	PerformedByID      *int            `json:"performedById"`
	DepartmentOfHealth *string         `json:"departmentOfHealth"`
	HospitalName       *string         `json:"hospitalName"`
	FormNumber         *string         `json:"formNumber"`
	RoomNumber         *string         `json:"roomNumber"`
	Status             int             `json:"status"`
	RequestDescription string          `json:"requestDescription"`
	ResultDescription  *string         `json:"resultDescription"`
	DoctorAdvice       *string         `json:"doctorAdvice"`
	RequestedAt        *time.Time      `json:"requestedAt"`
	CompletedAt        *time.Time      `json:"completedAt"`
	RequestedByName    *string         `json:"requestedByName"`
	PerformedByName    *string         `json:"performedByName"`
	DepartmentName     *string         `json:"departmentName"`
	XRayStatusLogs     []XRayStatusLog `json:"xRayStatusLogs"`
}

type XRayStatusLog struct {
	ID             int       `json:"id"`
	XRayID         int       `json:"xRayId"`
	UpdatedByID    int       `json:"updatedById"`
	UpdatedByName  *string   `json:"updatedByName"`
	Status         int       `json:"status"`
	DepartmentName string    `json:"departmentName"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Hematology struct {
	ID                    int                   `json:"id"`
	MedicalRecordID       int                   `json:"medicalRecordId"`
	RequestedByID         int                   `json:"requestedById"`
	PerformedByID         *int                  `json:"performedById"`
	DepartmentOfHealth    *string               `json:"departmentOfHealth"`
	HospitalName          *string               `json:"hospitalName"`
	FormNumber            *string               `json:"formNumber"`
	RoomNumber            *string               `json:"roomNumber"`
	Status                int                   `json:"status"`
	RequestDescription    *string               `json:"requestDescription"`
	RequestedAt           *time.Time            `json:"requestedAt"`
	CompletedAt           *time.Time            `json:"completedAt"`
	RequestedByName       *string               `json:"requestedByName"`
	PerformedByName       *string               `json:"performedByName"`
	DepartmentName        *string               `json:"departmentName"`
	RedBloodCellCount     *float64              `json:"redBloodCellCount"`
	WhiteBloodCellCount   *float64              `json:"whiteBloodCellCount"`
	Hemoglobin            *float64              `json:"hemoglobin"`
	Hematocrit            *float64              `json:"hematocrit"`
	Mcv                   *float64              `json:"mcv"`
	Mch                   *float64              `json:"mch"`
	Mchc                  *float64              `json:"mchc"`
	ReticulocyteCount     *float64              `json:"reticulocyteCount"`
	PlateletCount         *float64              `json:"plateletCount"`
	Neutrophil            *float64              `json:"neutrophil"`
	Eosinophil            *float64              `json:"eosinophil"`
	Basophil              *float64              `json:"basophil"`
	Monocyte              *float64              `json:"monocyte"`
	Lymphocyte            *float64              `json:"lymphocyte"`
	NucleatedRedBloodCell *string               `json:"nucleatedRedBloodCell"`
	AbnormalCells         *string               `json:"abnormalCells"`
	MalariaParasite       *string               `json:"malariaParasite"`
	Esr1h                 *float64              `json:"esr1h"`
	Esr2h                 *float64              `json:"esr2h"`
	BleedingTime          *int                  `json:"bleedingTime"`
	ClottingTime          *int                  `json:"clottingTime"`
	BloodTypeAbo          *int                  `json:"bloodTypeAbo"`
	BloodTypeRh           *int                  `json:"bloodTypeRh"`
	HematologyStatusLogs  []HematologyStatusLog `json:"hematologyStatusLogs"`
}

type HematologyStatusLog struct {
	ID             int       `json:"id"`
	HematologyID   int       `json:"hematologyId"`
	UpdatedByID    int       `json:"updatedById"`
	UpdatedByName  *string   `json:"updatedByName"`
	Status         int       `json:"status"`
	DepartmentName string    `json:"departmentName"`
	CreatedAt      time.Time `json:"createdAt"`
}
