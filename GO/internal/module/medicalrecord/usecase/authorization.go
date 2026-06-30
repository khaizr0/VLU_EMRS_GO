package usecase

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

// canReadRecords allows all medical roles to view medical records.
func canReadRecords(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher || current.RoleName == domain.RoleStudent
}

// canWriteRecords limits medical record changes to admin and teacher roles.
func canWriteRecords(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher
}
