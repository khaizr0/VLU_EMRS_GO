package notification

import "github.com/labstack/echo/v4"

// RegisterRoutes mounts authenticated notification endpoints under /api.
func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	notifications := group.Group("/notifications", authentication)

	notifications.GET("", handler.List)
	notifications.GET("/stream", handler.Stream)
	notifications.PUT("/:id/read", handler.MarkRead)
}
