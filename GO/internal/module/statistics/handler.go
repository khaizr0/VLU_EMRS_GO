package statistics

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

// NewHandler wires the statistics service into HTTP handlers.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Dashboard handles GET /statistics/dashboard with optional filters.
func (h *Handler) Dashboard(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}
	filters, err := dashboardFilters(c)
	if err != nil {
		return err
	}
	result, err := h.service.Dashboard(c.Request().Context(), claims, filters)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, result)
}

func dashboardFilters(c echo.Context) (Filters, error) {
	recordType, err := shared.OptionalIntQuery(c, "recordType", 0)
	if err != nil {
		return Filters{}, err
	}
	return filtersFromQuery(c.QueryParam("fromDay"), c.QueryParam("toDay"), recordType)
}
