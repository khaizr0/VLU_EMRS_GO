package middleware

import (
	"errors"
	"log"
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/labstack/echo/v4"
)

type errorResponse struct {
	Code    domain.Code `json:"code,omitempty"`
	Message string      `json:"message"`
}

func ErrorHandler(err error, c echo.Context) {
	if c.Response().Committed {
		return
	}

	var domainError *domain.Error
	if errors.As(err, &domainError) {
		writeError(c, statusFromCode(domainError.Code), domainError.Code, domainError.Message)
		return
	}

	var httpError *echo.HTTPError
	if errors.As(err, &httpError) {
		message, ok := httpError.Message.(string)
		if !ok {
			message = http.StatusText(httpError.Code)
		}
		writeError(c, httpError.Code, "", message)
		return
	}

	log.Printf("request failed: %v", err)
	writeError(c, http.StatusInternalServerError, "", "Internal server error")
}

func writeError(c echo.Context, status int, code domain.Code, message string) {
	_ = c.JSON(status, errorResponse{
		Code:    code,
		Message: message,
	})
}

func statusFromCode(code domain.Code) int {
	switch code {
	case domain.Unauthorized:
		return http.StatusUnauthorized
	case domain.Forbidden:
		return http.StatusForbidden
	case domain.NotFound:
		return http.StatusNotFound
	case domain.BadRequest:
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}
