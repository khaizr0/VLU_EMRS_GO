package department

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

func canReadDepartments(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher || current.RoleName == domain.RoleStudent
}

func canManageDepartments(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin
}

func canAssignDepartmentUser(current domain.User, department domain.Department) bool {
	return current.RoleName == domain.RoleAdmin || isDepartmentHead(current, department)
}

func canUnassignDepartmentUser(current domain.User, department domain.Department) bool {
	return current.RoleName == domain.RoleAdmin || isDepartmentHead(current, department)
}

func isDepartmentHead(current domain.User, department domain.Department) bool {
	return current.RoleName == domain.RoleTeacher && department.HeadUserID != nil && *department.HeadUserID == current.ID
}

func userBelongsToOtherDepartment(user domain.User, departmentID int) bool {
	return user.DepartmentID != nil && *user.DepartmentID != departmentID
}

func userNotInDepartment(user domain.User, departmentID int) bool {
	return user.DepartmentID == nil || *user.DepartmentID != departmentID
}

func isHeadUser(user domain.User, department domain.Department) bool {
	return department.HeadUserID != nil && *department.HeadUserID == user.ID
}
