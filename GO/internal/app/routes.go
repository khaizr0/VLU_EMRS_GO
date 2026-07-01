package app

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/config"
	appmiddleware "github.com/khaizr0/VLU_EMRS_GO/internal/middleware"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/account"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/auth"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/department"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/ethnicity"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/patient"
	"github.com/labstack/echo/v4"
)

func registerRoutes(
	server *echo.Echo,
	cfg config.Config,
	db *pgxpool.Pool,
) {
	server.GET("/healthz", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	verifier := auth.NewTokenVerifier(
		cfg.MicrosoftJWKSURL,
		cfg.MicrosoftAudience,
		cfg.MicrosoftAPIScope,
	)
	authentication := appmiddleware.Authentication(verifier)

	authRepository := auth.NewRepository(db)
	authService := auth.NewService(authRepository, cfg.AllowedEmailDomains)
	authHandler := auth.NewHandler(authService)

	accountRepository := account.NewRepository(db)
	accountService := account.NewService(accountRepository)
	accountHandler := account.NewHandler(accountService)

	departmentRepository := department.NewRepository(db)
	departmentService := department.NewService(departmentRepository)
	departmentHandler := department.NewHandler(departmentService)

	ethnicityRepository := ethnicity.NewRepository(db)
	ethnicityService := ethnicity.NewService(ethnicityRepository)
	ethnicityHandler := ethnicity.NewHandler(ethnicityService)

	patientStore := patient.NewPatientStore(db)
	patientService := patient.NewService(patientStore)
	patientHandler := patient.NewHandler(patientService)

	api := server.Group("/api")
	auth.RegisterRoutes(api, authHandler, authentication)
	account.RegisterRoutes(api, accountHandler, authentication)
	department.RegisterRoutes(api, departmentHandler, authentication)
	ethnicity.RegisterRoutes(api, ethnicityHandler, authentication)
	patient.RegisterRoutes(api, patientHandler, authentication)
	medicalrecord.RegisterRoutes(api, db, authentication)
	clinical.RegisterRoutes(api, db, authentication)
}
