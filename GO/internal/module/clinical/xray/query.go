package xray

import (
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

const xraySelect = `
	SELECT
		"x"."Id", "x"."MedicalRecordId", "x"."RequestedById", "x"."PerformedById",
		"x"."DepartmentOfHealth", "x"."HospitalName", "x"."FormNumber", "x"."RoomNumber",
		"x"."Status", "x"."RequestDescription", "x"."ResultDescription", "x"."DoctorAdvice",
		"x"."RequestedAt", "x"."CompletedAt", "requested"."Name", "performed"."Name", "latest"."DepartmentName"
	FROM "XRays" AS "x"
	JOIN "Users" AS "requested" ON "requested"."Id" = "x"."RequestedById"
	LEFT JOIN "Users" AS "performed" ON "performed"."Id" = "x"."PerformedById"
	LEFT JOIN LATERAL (
		SELECT "DepartmentName"
		FROM "XRayStatusLogs"
		WHERE "XRayId" = "x"."Id"
		ORDER BY "CreatedAt" DESC, "Id" DESC
		LIMIT 1
	) AS "latest" ON true`

const xrayLogSelect = `
	SELECT "l"."Id", "l"."XRayId", "l"."UpdatedById", "u"."Name", "l"."Status", "l"."DepartmentName", "l"."CreatedAt"
	FROM "XRayStatusLogs" AS "l"
	JOIN "Users" AS "u" ON "u"."Id" = "l"."UpdatedById"`

// scanXRay maps one x-ray row into the domain response shape.
func scanXRay(row pgx.Row) (domain.XRay, error) {
	var item domain.XRay
	err := row.Scan(
		&item.ID, &item.MedicalRecordID, &item.RequestedByID, &item.PerformedByID,
		&item.DepartmentOfHealth, &item.HospitalName, &item.FormNumber, &item.RoomNumber,
		&item.Status, &item.RequestDescription, &item.ResultDescription, &item.DoctorAdvice,
		&item.RequestedAt, &item.CompletedAt, &item.RequestedByName, &item.PerformedByName, &item.DepartmentName,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.XRay{}, domain.ErrXRayNotFound
	}
	if err != nil {
		return domain.XRay{}, fmt.Errorf("query x-ray: %w", err)
	}
	return item, nil
}

// scanXRayLog maps one x-ray status history row.
func scanXRayLog(row pgx.Row) (domain.XRayStatusLog, error) {
	var log domain.XRayStatusLog
	if err := row.Scan(&log.ID, &log.XRayID, &log.UpdatedByID, &log.UpdatedByName, &log.Status, &log.DepartmentName, &log.CreatedAt); err != nil {
		return domain.XRayStatusLog{}, fmt.Errorf("query x-ray status log: %w", err)
	}
	return log, nil
}
