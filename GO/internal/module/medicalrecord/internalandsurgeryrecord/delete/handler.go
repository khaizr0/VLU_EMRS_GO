package delete

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Delete(c echo.Context) error {
	claims, id, err := shared.ClaimsAndID(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.Delete(c.Request().Context(), claims, id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}
