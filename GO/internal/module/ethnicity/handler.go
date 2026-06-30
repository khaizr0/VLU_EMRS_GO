package ethnicity

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	group.GET("/ethinicities", handler.ListEthnicities, authentication)
}

func (h *Handler) ListEthnicities(c echo.Context) error {
	if _, ok := auth.ClaimsFromContext(c); !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	ethnicities, err := h.service.ListEthnicities(c.Request().Context())
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, ethnicities)
}
