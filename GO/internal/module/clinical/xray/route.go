package xray

import "github.com/labstack/echo/v4"

// RegisterRoutes mounts x-ray CRUD endpoints under /clinicals.
func RegisterRoutes(group *echo.Group, handler *Handler) {
	xrays := group.Group("/x-rays")

	xrays.POST("", handler.Create)
	xrays.PUT("/:id", handler.ChangeStatus)
	xrays.PUT("/:id/complete", handler.Complete)
	xrays.DELETE("/:id", handler.Delete)
}
