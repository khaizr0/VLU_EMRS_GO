package notification

import (
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

const notificationSelect = `
	SELECT
		"un"."Id", "un"."UserId", "un"."NotificationId", "un"."IsRead", "un"."ReadAt",
		"n"."Id", "n"."AppTitle", "n"."AppContent", "n"."Type", "n"."ResourceId", "n"."ResourceUrl", "n"."CreatedAt"
	FROM "UserNotifications" AS "un"
	JOIN "Notification" AS "n" ON "n"."Id" = "un"."NotificationId"`

const listByUserSQL = notificationSelect + `
	WHERE "un"."UserId" = $1
	ORDER BY "n"."CreatedAt" DESC, "un"."Id" DESC`

const markOwnedReadSQL = `
	UPDATE "UserNotifications"
	SET "IsRead" = TRUE, "ReadAt" = COALESCE("ReadAt", $1)
	WHERE "Id" = $2 AND "UserId" = $3`

const markAnyReadSQL = `
	UPDATE "UserNotifications"
	SET "IsRead" = TRUE, "ReadAt" = COALESCE("ReadAt", $1)
	WHERE "Id" = $2`

// scanUserNotification maps one joined notification row into frontend DTO shape.
func scanUserNotification(row pgx.Row) (domain.UserNotification, error) {
	var item domain.UserNotification
	var rawType string
	err := row.Scan(
		&item.ID, &item.UserID, &item.NotificationID, &item.IsRead, &item.ReadAt,
		&item.Notification.ID, &item.Notification.AppTitle, &item.Notification.AppContent,
		&rawType, &item.Notification.ResourceID, &item.Notification.ResourceURL, &item.Notification.CreatedAt,
	)
	if err != nil {
		return domain.UserNotification{}, fmt.Errorf("query notification: %w", err)
	}
	item.Notification.Type = notificationTypeNumber(rawType)
	return item, nil
}
