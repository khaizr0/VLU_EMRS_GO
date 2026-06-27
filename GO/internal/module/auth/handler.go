package auth

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	authGroup := group.Group("/auth", authentication)
	authGroup.POST("/sync", handler.Sync)
	authGroup.GET("/me", handler.Me)
}

func (h *Handler) Sync(c echo.Context) error {
	c.Response().Header().Set(echo.HeaderCacheControl, "no-store")

	claims, ok := ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	user, created, err := h.service.Sync(c.Request().Context(), claims)
	if err != nil {
		return err
	}

	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	return c.JSON(status, user)
}

func (h *Handler) Me(c echo.Context) error {
	c.Response().Header().Set(echo.HeaderCacheControl, "no-store")

	claims, ok := ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	user, err := h.service.Me(c.Request().Context(), claims)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, user)
}
