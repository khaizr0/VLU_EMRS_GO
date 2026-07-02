package statistics

import "github.com/labstack/echo/v4"

// RegisterRoutes mounts authenticated statistics endpoints under /api.
func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	statistics := group.Group("/statistics", authentication)

	statistics.GET("/dashboard", handler.Dashboard)
}
