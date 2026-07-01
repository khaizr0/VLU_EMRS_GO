package hematology

import "github.com/labstack/echo/v4"

// RegisterRoutes mounts hematology CRUD endpoints under /clinicals.
func RegisterRoutes(group *echo.Group, handler *Handler) {
	hematologies := group.Group("/hematologies")

	hematologies.POST("", handler.Create)
	hematologies.PUT("/:id", handler.ChangeStatus)
	hematologies.PUT("/:id/complete", handler.Complete)
	hematologies.DELETE("/:id", handler.Delete)
}
