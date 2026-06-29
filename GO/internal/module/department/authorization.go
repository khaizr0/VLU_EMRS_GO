package department

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

const (
	roleAdmin   = "Admin"
	roleTeacher = "Teacher"
	roleStudent = "Student"
)

func canReadDepartments(current domain.User) bool {
	return current.RoleName == roleAdmin || current.RoleName == roleTeacher || current.RoleName == roleStudent
}

func canManageDepartments(current domain.User) bool {
	return current.RoleName == roleAdmin
}

func canAssignDepartmentUser(current domain.User, department domain.Department) bool {
	return current.RoleName == roleAdmin || isDepartmentHead(current, department)
}

func canUnassignDepartmentUser(current domain.User, department domain.Department) bool {
	return current.RoleName == roleAdmin || isDepartmentHead(current, department)
}

func isDepartmentHead(current domain.User, department domain.Department) bool {
	return current.RoleName == roleTeacher && department.HeadUserID != nil && *department.HeadUserID == current.ID
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
