package notification

import (
	"net/http"
	"strconv"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

// NewHandler wires the notification service into HTTP handlers.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// List handles GET /notifications for the current user.
func (h *Handler) List(c echo.Context) error {
	claims, err := claimsFromContext(c)
	if err != nil {
		return err
	}
	items, err := h.service.List(c.Request().Context(), claims)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, items)
}

// MarkRead handles PUT /notifications/:id/read.
func (h *Handler) MarkRead(c echo.Context) error {
	claims, id, err := claimsAndID(c)
	if err != nil {
		return err
	}
	if err := h.service.MarkRead(c.Request().Context(), claims, id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func claimsAndID(c echo.Context) (auth.Claims, int, error) {
	claims, err := claimsFromContext(c)
	if err != nil {
		return auth.Claims{}, 0, err
	}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		return auth.Claims{}, 0, echo.NewHTTPError(http.StatusBadRequest, "Id không hợp lệ")
	}
	return claims, id, nil
}

func claimsFromContext(c echo.Context) (auth.Claims, error) {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return auth.Claims{}, domain.ErrInvalidMicrosoftToken
	}
	return claims, nil
}
