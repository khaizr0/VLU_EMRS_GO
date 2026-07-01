package shared

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

// ClaimsFromContext reads verified Microsoft claims from middleware context.
func ClaimsFromContext(c echo.Context) (auth.Claims, error) {
	claims, ok := auth.ClaimsFromContext(c)
	if !ok {
		return auth.Claims{}, domain.ErrInvalidMicrosoftToken
	}
	return claims, nil
}

// ParamID parses a positive integer route parameter.
func ParamID(c echo.Context, name string) (int, error) {
	id, err := strconv.Atoi(c.Param(name))
	if err != nil || id <= 0 {
		return 0, echo.NewHTTPError(http.StatusBadRequest, name+" không hợp lệ")
	}
	return id, nil
}

// CleanText trims optional text and converts empty strings to nil.
func CleanText(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

// RequiredText trims required text and fails on empty values.
func RequiredText(value string) (string, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return "", domain.ErrInvalidClinicalRequest
	}
	return trimmed, nil
}

// Date parses an optional yyyy-mm-dd date from the frontend forms.
func Date(value string) (*time.Time, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil, nil
	}
	parsed, err := time.Parse("2006-01-02", trimmed)
	if err != nil {
		return nil, domain.ErrInvalidMedicalRecordDate
	}
	return &parsed, nil
}
