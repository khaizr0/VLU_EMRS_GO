package app

import (
	"net/http"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/config"
	appmiddleware "github.com/khaizr0/VLU_EMRS_GO/internal/middleware"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func newServer(cfg config.Config, repository *auth.Repository) *echo.Echo {
	server := echo.New()
	server.HideBanner = true
	server.HidePort = true
	server.HTTPErrorHandler = appmiddleware.ErrorHandler

	server.Server.ReadHeaderTimeout = 5 * time.Second
	server.Server.ReadTimeout = 15 * time.Second
	server.Server.WriteTimeout = 30 * time.Second
	server.Server.IdleTimeout = 60 * time.Second

	server.Use(middleware.RequestID())
	server.Use(middleware.Recover())
	server.Use(middleware.Logger())
	server.Use(middleware.BodyLimit("2M"))
	server.Use(middleware.Secure())
	server.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{cfg.ClientBaseURL},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
			echo.HeaderXRequestID,
		},
	}))

	registerRoutes(server, cfg, repository)
	return server
}
