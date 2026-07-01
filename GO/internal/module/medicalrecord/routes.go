package medicalrecord

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/base"
	recorddelete "github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/delete"
	recordread "github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/read"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/recorddetail"
	recordwrite "github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/internalandsurgeryrecord/write"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/medicalrecord/recordcomposer"
	"github.com/khaizr0/VLU_EMRS_GO/internal/module/pdfimport"
	"github.com/labstack/echo/v4"
)

func RegisterRoutes(group *echo.Group, db *pgxpool.Pool, authentication echo.MiddlewareFunc) {
	records := group.Group("/medical-records", authentication)
	baseStore := base.NewStore(db)
	detailStore := recorddetail.NewStore(db)
	viewStore := recordcomposer.NewStore(db, detailStore)
	readHandler := recordread.NewHandler(recordread.NewService(baseStore, viewStore))
	writeHandler := recordwrite.NewHandler(recordwrite.NewService(baseStore, detailStore))
	deleteHandler := recorddelete.NewHandler(recorddelete.NewService(baseStore))

	records.GET("", readHandler.List)
	records.GET("/:id", readHandler.Get)
	pdfimport.RegisterMedicalRecordRoutes(records)
	records.POST("/:patientId", writeHandler.Create)
	records.PUT("/:id", writeHandler.Update)
	records.DELETE("/:id", deleteHandler.Delete)
}
