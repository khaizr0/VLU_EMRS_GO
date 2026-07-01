package hematology

import (
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/khaizr0/VLU_EMRS_GO/internal/domain"
)

const hematologySelect = `
	SELECT
		"h"."Id", "h"."MedicalRecordId", "h"."RequestedById", "h"."PerformedById",
		"h"."DepartmentOfHealth", "h"."HospitalName", "h"."FormNumber", "h"."RoomNumber",
		"h"."RequestedAt", "h"."CompletedAt", "h"."Status", "h"."RequestDescription",
		"h"."RedBloodCellCount", "h"."WhiteBloodCellCount", "h"."Hemoglobin", "h"."Hematocrit",
		"h"."Mcv", "h"."Mch", "h"."Mchc", "h"."ReticulocyteCount", "h"."PlateletCount",
		"h"."Neutrophil", "h"."Eosinophil", "h"."Basophil", "h"."Monocyte", "h"."Lymphocyte",
		"h"."NucleatedRedBloodCell", "h"."AbnormalCells", "h"."MalariaParasite", "h"."Esr1h", "h"."Esr2h",
		"h"."BleedingTime", "h"."ClottingTime", "h"."BloodTypeAbo", "h"."BloodTypeRh",
		"requested"."Name", "performed"."Name", "latest"."DepartmentName"
	FROM "Hematologies" AS "h"
	JOIN "Users" AS "requested" ON "requested"."Id" = "h"."RequestedById"
	LEFT JOIN "Users" AS "performed" ON "performed"."Id" = "h"."PerformedById"
	LEFT JOIN LATERAL (
		SELECT "DepartmentName"
		FROM "HematologyStatusLogs"
		WHERE "HematologyId" = "h"."Id"
		ORDER BY "CreatedAt" DESC, "Id" DESC
		LIMIT 1
	) AS "latest" ON true`

const hematologyLogSelect = `
	SELECT "l"."Id", "l"."HematologyId", "l"."UpdatedById", "u"."Name", "l"."Status", "l"."DepartmentName", "l"."CreatedAt"
	FROM "HematologyStatusLogs" AS "l"
	JOIN "Users" AS "u" ON "u"."Id" = "l"."UpdatedById"`

const completeSQL = `
	UPDATE "Hematologies"
	SET "PerformedById" = $1, "CompletedAt" = $2, "DepartmentOfHealth" = $3, "HospitalName" = $4,
		"FormNumber" = $5, "RoomNumber" = $6, "RequestDescription" = $7,
		"RedBloodCellCount" = $8, "WhiteBloodCellCount" = $9, "Hemoglobin" = $10, "Hematocrit" = $11,
		"Mcv" = $12, "Mch" = $13, "Mchc" = $14, "ReticulocyteCount" = $15, "PlateletCount" = $16,
		"Neutrophil" = $17, "Eosinophil" = $18, "Basophil" = $19, "Monocyte" = $20, "Lymphocyte" = $21,
		"NucleatedRedBloodCell" = $22, "AbnormalCells" = $23, "MalariaParasite" = $24, "Esr1h" = $25, "Esr2h" = $26,
		"BleedingTime" = $27, "ClottingTime" = $28, "BloodTypeAbo" = $29, "BloodTypeRh" = $30
	WHERE "Id" = $31 AND "MedicalRecordId" = $32`

// completeArgs keeps the long hematology result update readable.
func completeArgs(recordID int, id int, performerID int, item domain.Hematology) []any {
	return []any{
		performerID, item.CompletedAt, item.DepartmentOfHealth, item.HospitalName, item.FormNumber, item.RoomNumber,
		item.RequestDescription, item.RedBloodCellCount, item.WhiteBloodCellCount, item.Hemoglobin, item.Hematocrit,
		item.Mcv, item.Mch, item.Mchc, item.ReticulocyteCount, item.PlateletCount, item.Neutrophil, item.Eosinophil,
		item.Basophil, item.Monocyte, item.Lymphocyte, item.NucleatedRedBloodCell, item.AbnormalCells, item.MalariaParasite,
		item.Esr1h, item.Esr2h, item.BleedingTime, item.ClottingTime, item.BloodTypeAbo, item.BloodTypeRh, id, recordID,
	}
}

// scanHematology maps one hematology row into the domain response shape.
func scanHematology(row pgx.Row) (domain.Hematology, error) {
	var item domain.Hematology
	err := row.Scan(
		&item.ID, &item.MedicalRecordID, &item.RequestedByID, &item.PerformedByID,
		&item.DepartmentOfHealth, &item.HospitalName, &item.FormNumber, &item.RoomNumber,
		&item.RequestedAt, &item.CompletedAt, &item.Status, &item.RequestDescription,
		&item.RedBloodCellCount, &item.WhiteBloodCellCount, &item.Hemoglobin, &item.Hematocrit,
		&item.Mcv, &item.Mch, &item.Mchc, &item.ReticulocyteCount, &item.PlateletCount,
		&item.Neutrophil, &item.Eosinophil, &item.Basophil, &item.Monocyte, &item.Lymphocyte,
		&item.NucleatedRedBloodCell, &item.AbnormalCells, &item.MalariaParasite, &item.Esr1h, &item.Esr2h,
		&item.BleedingTime, &item.ClottingTime, &item.BloodTypeAbo, &item.BloodTypeRh,
		&item.RequestedByName, &item.PerformedByName, &item.DepartmentName,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Hematology{}, domain.ErrHematologyNotFound
	}
	if err != nil {
		return domain.Hematology{}, fmt.Errorf("query hematology: %w", err)
	}
	return item, nil
}

// scanHematologyLog maps one hematology status history row.
func scanHematologyLog(row pgx.Row) (domain.HematologyStatusLog, error) {
	var log domain.HematologyStatusLog
	if err := row.Scan(&log.ID, &log.HematologyID, &log.UpdatedByID, &log.UpdatedByName, &log.Status, &log.DepartmentName, &log.CreatedAt); err != nil {
		return domain.HematologyStatusLog{}, fmt.Errorf("query hematology status log: %w", err)
	}
	return log, nil
}
