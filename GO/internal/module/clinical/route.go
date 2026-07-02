package clinical

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/hematology"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/shared"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/clinical/xray"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/importpdf"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/notification/publish"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/notification/stream"
	"github.com/labstack/echo/v4"
)

// RegisterRoutes mounts clinical endpoints under the medical record URL tree.
func RegisterRoutes(group *echo.Group, db *pgxpool.Pool, clientBaseURL string, broker *stream.Broker, authentication echo.MiddlewareFunc) {
	clinicals := group.Group("/medical-records/:recordId/clinicals", authentication)
	sharedStore := shared.NewStore(db)
	publisher := publish.NewService(publish.NewRepository(db), broker, clientBaseURL)

	importpdf.RegisterClinicalRoutes(clinicals)
	xray.RegisterRoutes(clinicals, xray.NewHandler(xray.NewService(xray.NewStore(db), sharedStore, publisher)))
	hematology.RegisterRoutes(clinicals, hematology.NewHandler(hematology.NewService(hematology.NewStore(db), sharedStore, publisher)))
}
