package shared

import (
	"net/http"
	"strconv"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

func ClaimsAndID(c echo.Context, param string) (auth.Claims, int, error) {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return auth.Claims{}, 0, domain.ErrInvalidMicrosoftToken
	}
	id, err := IDParam(c, param)
	if err != nil {
		return auth.Claims{}, 0, err
	}
	return claims, id, nil
}

func IDParam(c echo.Context, param string) (int, error) {
	id, err := strconv.Atoi(c.Param(param))
	if err != nil || id <= 0 {
		return 0, echo.NewHTTPError(http.StatusBadRequest, "Id không hợp lệ")
	}
	return id, nil
}

func OptionalIntQuery(c echo.Context, name string, fallback int) (int, error) {
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
