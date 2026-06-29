package account

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

type ChangeActiveRequest struct {
	Active bool `json:"active"`
}

type ChangeRoleRequest struct {
	Role string `json:"role"`
}

type UpdateSettingRequest struct {
	IsReceivedEmail bool `json:"isReceivedEmail"`
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	users := group.Group("/identities/users", authentication)

	users.GET("", handler.ListUsers)
	users.GET("/:id", handler.GetUser)
	users.PUT("/:id/active", handler.ChangeActive)
	users.PUT("/:id/roles", handler.ChangeRole)
	users.PUT("/:id/settings", handler.UpdateSetting)
}

func (h *Handler) ListUsers(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	users, err := h.service.ListUsers(c.Request().Context(), claims)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, users)
}

func (h *Handler) GetUser(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	id, err := userID(c)
	if err != nil {
		return err
	}

	user, err := h.service.GetUser(c.Request().Context(), claims, id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, user)
}

func (h *Handler) ChangeActive(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	id, err := userID(c)
	if err != nil {
		return err
	}

	var request ChangeActiveRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.ChangeActive(c.Request().Context(), claims, id, request.Active); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) ChangeRole(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	id, err := userID(c)
	if err != nil {
		return err
	}

	var request ChangeRoleRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.ChangeRole(c.Request().Context(), claims, id, request.Role); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) UpdateSetting(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	id, err := userID(c)
	if err != nil {
		return err
	}

	var request UpdateSettingRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.UpdateSetting(c.Request().Context(), claims, id, request.IsReceivedEmail); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func userID(c echo.Context) (int, error) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "User id không hợp lệ")
	}
	return id, nil
}
