package transport

import (
	"net/http"
	"strconv"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

// claimsAndID extracts Microsoft claims and a positive route ID for handlers.
func claimsAndID(c echo.Context, param string) (auth.Claims, int, error) {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return auth.Claims{}, 0, domain.ErrInvalidMicrosoftToken
	}
	id, err := idParam(c, param)
	if err != nil {
		return auth.Claims{}, 0, err
	}
	return claims, id, nil
}

// idParam parses a positive integer route parameter for usecase calls.
func idParam(c echo.Context, param string) (int, error) {
	id, err := strconv.Atoi(c.Param(param))
	if err != nil || id <= 0 {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "Id không hợp lệ")
	}
	return id, nil
}

// optionalIntQuery parses an optional integer query param with a fallback value.
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
