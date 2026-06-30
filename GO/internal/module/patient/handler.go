package patient

import (
	"net/http"
	"strconv"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

// Handler receives HTTP requests and delegates patient work to the service.
type Handler struct {
	service *Service
}

// NewHandler wires the patient service into HTTP handlers.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes mounts authenticated patient endpoints under /api.
func RegisterRoutes(group *echo.Group, handler *Handler, authentication echo.MiddlewareFunc) {
	patients := group.Group("/patients", authentication)

	patients.GET("", handler.List)
	patients.GET("/:id", handler.Get)
	patients.POST("", handler.Create)
	patients.PUT("/:id", handler.Update)
	patients.DELETE("/:id", handler.Delete)
}

// List handles GET /patients and forwards query filters to the service.
func (h *Handler) List(c echo.Context) error {
	claims, err := claimsFromContext(c)
	if err != nil {
		return err
	}
	request, err := listRequest(c)
	if err != nil {
		return err
	}
	result, err := h.service.List(c.Request().Context(), claims, request)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, result)
}

// Get handles GET /patients/:id and returns one patient from the service.
func (h *Handler) Get(c echo.Context) error {
	claims, id, err := claimsAndID(c)
	if err != nil {
		return err
	}
	patient, err := h.service.Get(c.Request().Context(), claims, id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, patient)
}

// Create handles POST /patients and sends validated input to the service.
func (h *Handler) Create(c echo.Context) error {
	claims, err := claimsFromContext(c)
	if err != nil {
		return err
	}
	var request PatientRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	id, err := h.service.Create(c.Request().Context(), claims, request)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, id)
}

// Update handles PUT /patients/:id and sends replacement input to the service.
func (h *Handler) Update(c echo.Context) error {
	claims, id, err := claimsAndID(c)
	if err != nil {
		return err
	}
	var request PatientRequest
	if err := c.Bind(&request); err != nil {
		return err
	}
	if err := h.service.Update(c.Request().Context(), claims, id, request); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

// Delete handles DELETE /patients/:id and delegates checks to the service.
func (h *Handler) Delete(c echo.Context) error {
	claims, id, err := claimsAndID(c)
	if err != nil {
		return err
	}
	if err := h.service.Delete(c.Request().Context(), claims, id); err != nil {
		return err
	}
	return c.NoContent(http.StatusNoContent)
}

// listRequest converts Echo query params into a list request DTO.
func listRequest(c echo.Context) (ListRequest, error) {
	pageNumber, err := optionalIntQuery(c, "pageNumber", 1)
	if err != nil {
		return ListRequest{}, err
	}
	pageSize, err := optionalIntQuery(c, "pageSize", 30)
	if err != nil {
		return ListRequest{}, err
	}
	return ListRequest{
		SearchPhrase: c.QueryParam("searchPhrase"),
		PageNumber:   pageNumber,
		PageSize:     pageSize,
		FromDay:      c.QueryParam("fromDay"),
		ToDay:        c.QueryParam("toDay"),
	}, nil
}

// claimsAndID extracts Microsoft claims and a positive patient ID.
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

// claimsFromContext reads verified Microsoft claims from middleware context.
func claimsFromContext(c echo.Context) (auth.Claims, error) {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return auth.Claims{}, domain.ErrInvalidMicrosoftToken
	}
	return claims, nil
}

// optionalIntQuery parses an optional integer query param with a fallback.
func optionalIntQuery(c echo.Context, name string, fallback int) (int, error) {
	value := c.QueryParam(name)
	if value == "" {
		return fallback, nil
	}
	result, err := strconv.Atoi(value)
	if err != nil {
		return 0, echo.NewHTTPError(http.StatusBadRequest, name+" không hợp lệ")
	}
	return result, nil
}
