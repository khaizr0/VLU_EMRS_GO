package store

import (
	"context"
	"fmt"

	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

// GetUserByIdentityKey lets the usecase resolve Microsoft claims into a local user.
func (r *Repository) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, r.db, identityKey)
}

// PatientExists lets the create usecase verify the target patient before insert.
func (r *Repository) PatientExists(ctx context.Context, id int) (bool, error) {
	var exists bool
	if err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM "Patients" WHERE "Id" = $1)`, id).Scan(&exists); err != nil {
		return false, fmt.Errorf("check patient: %w", err)
	}
	return exists, nil
}
