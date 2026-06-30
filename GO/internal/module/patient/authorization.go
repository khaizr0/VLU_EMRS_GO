package patient

import "github.com/khaizr0/VLU_EMRS_GO/internal/domain"

// canReadPatients allows all medical roles to view patient data.
func canReadPatients(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher || current.RoleName == domain.RoleStudent
}

// canWritePatients limits patient changes to admin and teacher roles.
func canWritePatients(current domain.User) bool {
	return current.RoleName == domain.RoleAdmin || current.RoleName == domain.RoleTeacher
}
