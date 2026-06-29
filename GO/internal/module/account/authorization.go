package account

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

const (
	roleAdmin   = "Admin"
	roleTeacher = "Teacher"
	roleStudent = "Student"
)

func canReadUsers(current domain.User) bool {
	return current.RoleName == roleAdmin || current.RoleName == roleTeacher
}

func canReadUser(current domain.User, target domain.User) bool {
	return canReadUsers(current) || current.ID == target.ID
}

func canUpdateUserSetting(current domain.User, target domain.User) bool {
	return current.RoleName == roleAdmin || current.ID == target.ID
}

func canManageUser(current domain.User, target domain.User) bool {
	return current.RoleName == roleAdmin && target.RoleName != roleAdmin
}

func validAssignableRole(role string) bool {
	return role == roleTeacher || role == roleStudent
}
