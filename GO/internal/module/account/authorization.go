package account

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

func canReadUsers(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher
}

func canReadUser(current domain.User, target domain.User) bool {
	return canReadUsers(current) || current.ID == target.ID
}

func canUpdateUserSetting(current domain.User, target domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.ID == target.ID
}

func canManageUser(current domain.User, target domain.User) bool {
	return current.RoleName == domain.RoleAdmin && target.RoleName != domain.RoleAdmin
}

func validAssignableRole(role string) bool {
	return role == domain.RoleTeacher || role == domain.RoleStudent
}
