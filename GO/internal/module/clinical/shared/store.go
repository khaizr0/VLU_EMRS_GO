package shared

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Store struct {
	db *pgxpool.Pool
}

// NewStore wires shared clinical database checks.
func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

// GetUserByIdentityKey resolves Microsoft identity into a local user.
func (s *Store) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, s.db, identityKey)
}

// MedicalRecordExists verifies the parent medical record before adding clinical forms.
func (s *Store) MedicalRecordExists(ctx context.Context, recordID int) (bool, error) {
	var exists bool
	err := s.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM "MedicalRecords" WHERE "Id" = $1)`, recordID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check medical record: %w", err)
	}
	return exists, nil
}
