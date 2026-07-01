package hematology

type CreateRequest struct {
	ListDepartmentID   []int  `json:"listDepartmentId"`
	AdditionalUserIDs  []int  `json:"additionalUserIds"`
	RequestDescription string `json:"requestDescription"`
	RequestedAt        string `json:"requestedAt"`
	DepartmentOfHealth string `json:"departmentOfHealth"`
	HospitalName       string `json:"hospitalName"`
	FormNumber         string `json:"formNumber"`
	RoomNumber         string `json:"roomNumber"`
}

type StatusRequest struct {
	Status         *int   `json:"status"`
	DepartmentName string `json:"departmentName"`
}

type CompleteRequest struct {
	CompletedAt           string   `json:"completedAt"`
	DepartmentOfHealth    string   `json:"departmentOfHealth"`
	HospitalName          string   `json:"hospitalName"`
	FormNumber            string   `json:"formNumber"`
	RoomNumber            string   `json:"roomNumber"`
	RequestDescription    string   `json:"requestDescription"`
	RedBloodCellCount     *float64 `json:"redBloodCellCount"`
	WhiteBloodCellCount   *float64 `json:"whiteBloodCellCount"`
	Hemoglobin            *float64 `json:"hemoglobin"`
	Hematocrit            *float64 `json:"hematocrit"`
	Mcv                   *float64 `json:"mcv"`
	Mch                   *float64 `json:"mch"`
	Mchc                  *float64 `json:"mchc"`
	ReticulocyteCount     *float64 `json:"reticulocyteCount"`
	PlateletCount         *float64 `json:"plateletCount"`
	Neutrophil            *float64 `json:"neutrophil"`
	Eosinophil            *float64 `json:"eosinophil"`
	Basophil              *float64 `json:"basophil"`
	Monocyte              *float64 `json:"monocyte"`
	Lymphocyte            *float64 `json:"lymphocyte"`
	NucleatedRedBloodCell string   `json:"nucleatedRedBloodCell"`
	AbnormalCells         string   `json:"abnormalCells"`
	MalariaParasite       string   `json:"malariaParasite"`
	Esr1h                 *float64 `json:"esr1h"`
	Esr2h                 *float64 `json:"esr2h"`
	BleedingTime          *int     `json:"bleedingTime"`
	ClottingTime          *int     `json:"clottingTime"`
	BloodTypeAbo          *int     `json:"bloodTypeAbo"`
	BloodTypeRh           *int     `json:"bloodTypeRh"`
}
