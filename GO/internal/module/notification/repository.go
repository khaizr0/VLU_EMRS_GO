package notification

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

type Repository struct {
	db *pgxpool.Pool
}

// NewRepository wires PostgreSQL access for user notifications.
func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

// GetUserByIdentityKey resolves Microsoft identity into a local user.
func (r *Repository) GetUserByIdentityKey(ctx context.Context, identityKey string) (domain.User, error) {
	return database.FindUserByIdentity(ctx, r.db, identityKey)
}

// ListByUser returns notifications owned by one user, newest first.
func (r *Repository) ListByUser(ctx context.Context, userID int) ([]domain.UserNotification, error) {
	rows, err := r.db.Query(ctx, listByUserSQL, userID)
	if err != nil {
		return nil, fmt.Errorf("query notifications: %w", err)
	}
	defer rows.Close()

	items := []domain.UserNotification{}
	for rows.Next() {
		item, err := scanUserNotification(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("query notifications: %w", err)
	}
	return items, nil
}

// MarkRead marks one notification as read for its owner or any user when admin.
func (r *Repository) MarkRead(ctx context.Context, id int, user domain.User) error {
	query := markOwnedReadSQL
	args := []any{time.Now(), id, user.ID}
	if user.RoleName == domain.RoleAdmin {
		query = markAnyReadSQL
		args = []any{time.Now(), id}
	}
	tag, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("mark notification read: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrNotificationNotFound
	}
	return nil
}
