package department

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

type departmentRequest struct {
	Name string `json:"name"`
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	departments := group.Group("/departments", authentication)

	departments.GET("", handler.ListDepartments)
	departments.POST("", handler.Create)
	departments.PUT("/:id", handler.Update)
	departments.DELETE("/:id", handler.Delete)
	departments.PUT("/:departmentId/users/:userId", handler.AssignUser)
	departments.DELETE("/:departmentId/users/:userId", handler.UnassignUser)
	departments.PUT("/:departmentId/users/:userId/head", handler.AssignHead)
	departments.DELETE("/:departmentId/users/:userId/head", handler.UnassignHead)
}

func (h *Handler) ListDepartments(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}
	departments, err := h.service.ListDepartments(c.Request().Context(), claims)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, departments)
}

func (h *Handler) Create(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	var request departmentRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	id, err := h.service.Create(c.Request().Context(), claims, request.Name)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, id)
}

func (h *Handler) Update(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	id, err := idParam(c, "id")
	if err != nil {
		return err
	}
	var request departmentRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.Update(c.Request().Context(), claims, id, request.Name); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) Delete(c echo.Context) error {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return domain.ErrInvalidMicrosoftToken
	}

	id, err := idParam(c, "id")
	if err != nil {
		return err
	}
	if err := h.service.Delete(c.Request().Context(), claims, id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) AssignUser(c echo.Context) error {
	claims, departmentID, userID, err := departmentUserParams(c)
	if err != nil {
		return err
	}
	if err := h.service.AssignUser(c.Request().Context(), claims, departmentID, userID); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) UnassignUser(c echo.Context) error {
	claims, departmentID, userID, err := departmentUserParams(c)
	if err != nil {
		return err
	}
	if err := h.service.UnassignUser(c.Request().Context(), claims, departmentID, userID); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) AssignHead(c echo.Context) error {
	claims, departmentID, userID, err := departmentUserParams(c)
	if err != nil {
		return err
	}
	if err := h.service.AssignHead(c.Request().Context(), claims, departmentID, userID); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) UnassignHead(c echo.Context) error {
	claims, departmentID, userID, err := departmentUserParams(c)
	if err != nil {
		return err
	}
	if err := h.service.UnassignHead(c.Request().Context(), claims, departmentID, userID); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

func departmentUserParams(c echo.Context) (auth.Claims, int, int, error) {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return auth.Claims{}, 0, 0, domain.ErrInvalidMicrosoftToken
	}

	departmentID, err := idParam(c, "departmentId")
	if err != nil {
		return auth.Claims{}, 0, 0, err
	}
	userID, err := idParam(c, "userId")
	if err != nil {
		return auth.Claims{}, 0, 0, err
	}
	return claims, departmentID, userID, nil
}

func idParam(c echo.Context, name string) (int, error) {
	id, err := strconv.Atoi(c.Param(name))
	if err != nil || id <= 0 {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "Id không hợp lệ")
	}
	return id, nil
}
