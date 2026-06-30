package storagecode

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

func Generate(ctx context.Context, tx pgx.Tx) (string, error) {
	yearPrefix := fmt.Sprintf("%02d", time.Now().Year()%100)
	var last *string
	err := tx.QueryRow(ctx, `
		SELECT "StorageCode" FROM "MedicalRecords"
		WHERE "StorageCode" LIKE $1
		ORDER BY "StorageCode" DESC
		LIMIT 1
	`, yearPrefix+".%").Scan(&last)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return "", fmt.Errorf("find last storage code: %w", err)
	}

	sequence := 1
	if last != nil {
		parts := strings.Split(*last, ".")
		if len(parts) == 2 {
			_, _ = fmt.Sscanf(parts[1], "%d", &sequence)
			sequence++
		}
	}
	return fmt.Sprintf("%s.%06d", yearPrefix, sequence), nil
}
