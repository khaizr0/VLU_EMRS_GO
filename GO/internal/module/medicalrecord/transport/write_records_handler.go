package transport

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/dto"
	"github.com/labstack/echo/v4"
)

// Create handles POST /medical-records/:patientId and sends a DTO to the usecase.
func (h *Handler) Create(c echo.Context) error {
	claims, patientID, err := claimsAndID(c, "patientId")
	if err != nil {
		return err
	}

	var request dto.RecordRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	id, err := h.service.Create(c.Request().Context(), claims, patientID, request)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, id)
}

// Update handles PUT /medical-records/:id and sends replacement data to the usecase.
func (h *Handler) Update(c echo.Context) error {
	claims, id, err := claimsAndID(c, "id")
	if err != nil {
		return err
	}

	var request dto.RecordRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.Update(c.Request().Context(), claims, id, request); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

// Delete handles DELETE /medical-records/:id and delegates authorization to the usecase.
func (h *Handler) Delete(c echo.Context) error {
	claims, id, err := claimsAndID(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.Delete(c.Request().Context(), claims, id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}
