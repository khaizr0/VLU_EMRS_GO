package domain

import "time"

type User struct {
	ID              int       `json:"id"`
	IdentityID      string    `json:"identityId"`
	Email           string    `json:"email"`
	Name            string    `json:"name"`
	PictureURL      string    `json:"pictureUrl"`
	Active          bool      `json:"active"`
	RoleName        string    `json:"roleName"`
	DepartmentID    *int      `json:"departmentId,omitempty"`
	DepartmentName  *string   `json:"departmentName,omitempty"`
	CreateAt        time.Time `json:"createAt"`
	UpdateAt        time.Time `json:"updateAt"`
	IsReceivedEmail bool      `json:"isReceivedEmail"`
}
