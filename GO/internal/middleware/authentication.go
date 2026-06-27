package middleware

import (
	"strings"

	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

func Authentication(verifier *auth.TokenVerifier) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set(echo.HeaderWWWAuthenticate, "Bearer")

			rawToken, err := bearerToken(c)
			if err != nil {
				return err
			}
			if len(rawToken) > 16*1024 {
				return domain.ErrInvalidMicrosoftToken
			}

			claims, err := verifier.Verify(c.Request().Context(), rawToken)
			if err != nil {
				return domain.ErrInvalidMicrosoftToken
			}

			auth.PutClaims(c, claims)
			return next(c)
		}
	}
}

func bearerToken(c echo.Context) (string, error) {
	header := strings.TrimSpace(c.Request().Header.Get(echo.HeaderAuthorization))
	parts := strings.Fields(header)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return "", domain.ErrBearerTokenRequired
	}
	return parts[1], nil
}
