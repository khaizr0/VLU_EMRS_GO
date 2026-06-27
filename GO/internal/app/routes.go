package app

import (
	"net/http"

	"github.com/khaizr0/VLU_EMRS_GO/internal/config"
	appmiddleware "github.com/khaizr0/VLU_EMRS_GO/internal/middleware"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
)

func registerRoutes(
	server *echo.Echo,
	cfg config.Config,
	repository *auth.Repository,
) {
	server.GET("/healthz", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	verifier := auth.NewTokenVerifier(
		cfg.MicrosoftJWKSURL,
		cfg.MicrosoftAudience,
		cfg.MicrosoftTenantID,
		cfg.MicrosoftAPIScope,
	)
	service := auth.NewService(repository, cfg.AllowedEmailDomains)
	handler := auth.NewHandler(service)

	auth.RegisterRoutes(
		server.Group("/api"),
		handler,
		appmiddleware.Authentication(verifier),
	)
}
