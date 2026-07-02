package domain

import "time"

type Notification struct {
	ID          int       `json:"id"`
	AppTitle    string    `json:"appTitle"`
	AppContent  string    `json:"appContent"`
	Type        int       `json:"type"`
	ResourceID  int       `json:"resourceId"`
	ResourceURL string    `json:"resourceUrl"`
	CreatedAt   time.Time `json:"createdAt"`
}

type UserNotification struct {
	ID             int          `json:"id"`
	UserID         int          `json:"userId"`
	NotificationID int          `json:"notificationId"`
	IsRead         bool         `json:"isRead"`
	ReadAt         *time.Time   `json:"readAt"`
	Notification   Notification `json:"notification"`
}
