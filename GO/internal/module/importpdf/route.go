package importpdf

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// RegisterMedicalRecordRoutes mounts medical record PDF import endpoints.
func RegisterMedicalRecordRoutes(records *echo.Group) {
	records.POST("/:patientId/import-pdf", notImplemented)
}

// RegisterClinicalRoutes mounts clinical PDF import endpoints.
func RegisterClinicalRoutes(clinicals *echo.Group) {
	clinicals.POST("/x-rays/import-pdf", notImplemented)
	clinicals.POST("/x-rays/import-pdf/completed", notImplemented)
	clinicals.POST("/hematologies/import-pdf", notImplemented)
	clinicals.POST("/hematologies/import-pdf/completed", notImplemented)
}

func notImplemented(c echo.Context) error {
	return echo.NewHTTPError(http.StatusNotImplemented, "Import PDF đang được phát triển")
}
