package transport

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/usecase"
	"github.com/labstack/echo/v4"
)

// Handler receives HTTP requests and delegates medical record work to the usecase.
type Handler struct {
	service *usecase.Service
}

// NewHandler receives the usecase service and exposes HTTP handlers.
func NewHandler(service *usecase.Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes mounts authenticated medical record endpoints under /api.
func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	records := group.Group("/medical-records", authentication)

	records.GET("", handler.List)
	records.GET("/:id", handler.Get)
	records.POST("/:patientId/import-pdf", handler.ImportPDF)
	records.POST("/:patientId", handler.Create)
	records.PUT("/:id", handler.Update)
	records.DELETE("/:id", handler.Delete)
}

// ImportPDF returns a placeholder until the old PDF import flow is ported.
func (h *Handler) ImportPDF(c echo.Context) error {
	return echo.NewHTTPError(http.StatusNotImplemented, "Import PDF chưa được port sang Go backend")
}
