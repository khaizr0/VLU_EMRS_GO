package write

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/dto"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/shared"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Create(c echo.Context) error {
	claims, patientID, err := shared.ClaimsAndID(c, "patientId")
	if err != nil {
		return err
	}
	var request dto.Request
	if err := c.Bind(&request); err != nil {
		return err
	}
	id, err := h.service.Create(c.Request().Context(), claims, patientID, request)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, id)
}

func (h *Handler) Update(c echo.Context) error {
	claims, id, err := shared.ClaimsAndID(c, "id")
	if err != nil {
		return err
	}
	var request dto.Request
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.Update(c.Request().Context(), claims, id, request); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}
