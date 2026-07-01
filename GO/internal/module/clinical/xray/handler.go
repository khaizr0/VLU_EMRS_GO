package xray

import (
	"net/http"
	"strconv"

	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/shared"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

// NewHandler wires x-ray service into HTTP handlers.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Create handles POST /medical-records/:recordId/clinicals/x-rays.
func (h *Handler) Create(c echo.Context) error {
	claims, recordID, _, err := requestIDs(c, false)
	if err != nil {
		return err
	}
	var request CreateRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	id, err := h.service.Create(c.Request().Context(), claims, recordID, request)
	if err != nil {
		return err
	}
	return c.String(http.StatusCreated, strconv.Itoa(id))
}

// ChangeStatus handles PUT /medical-records/:recordId/clinicals/x-rays/:id.
func (h *Handler) ChangeStatus(c echo.Context) error {
	claims, recordID, id, err := requestIDs(c, true)
	if err != nil {
		return err
	}
	var request StatusRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.ChangeStatus(c.Request().Context(), claims, recordID, id, request); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

// Complete handles PUT /medical-records/:recordId/clinicals/x-rays/:id/complete.
func (h *Handler) Complete(c echo.Context) error {
	claims, recordID, id, err := requestIDs(c, true)
	if err != nil {
		return err
	}
	var request CompleteRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.Complete(c.Request().Context(), claims, recordID, id, request); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

// Delete handles DELETE /medical-records/:recordId/clinicals/x-rays/:id.
func (h *Handler) Delete(c echo.Context) error {
	claims, recordID, id, err := requestIDs(c, true)
	if err != nil {
		return err
	}
	if err := h.service.Delete(c.Request().Context(), claims, recordID, id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func requestIDs(c echo.Context, includeID bool) (auth.Claims, int, int, error) {
	claims, err := shared.ClaimsFromContext(c)
	if err != nil {
		return auth.Claims{}, 0, 0, err
	}
	recordID, err := shared.ParamID(c, "recordId")
	if err != nil {
		return auth.Claims{}, 0, 0, err
	}
	if !includeID {
		return claims, recordID, 0, nil
	}
	id, err := shared.ParamID(c, "id")
	return claims, recordID, id, err
}
