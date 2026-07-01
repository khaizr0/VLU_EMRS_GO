package xray

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
	ResultDescription  string `json:"resultDescription"`
	DoctorAdvice       string `json:"doctorAdvice"`
	CompletedAt        string `json:"completedAt"`
	DepartmentOfHealth string `json:"departmentOfHealth"`
	HospitalName       string `json:"hospitalName"`
	FormNumber         string `json:"formNumber"`
	RoomNumber         string `json:"roomNumber"`
}
