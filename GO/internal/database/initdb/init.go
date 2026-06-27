package initdb

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
)

func Run(ctx context.Context, databaseURL string, maintenanceDatabase string) error {
	if err := ensureDatabase(ctx, databaseURL, maintenanceDatabase); err != nil {
		return err
	}

	log.Printf("initializing database %q", databaseName(databaseURL))

	db, err := database.Connect(ctx, databaseURL)
	if err != nil {
		return err
	}
	defer db.Close()

	if err := initDatabase(ctx, db); err != nil {
		return err
	}

	log.Println("database initialized successfully")
	return nil
}

func initDatabase(ctx context.Context, pool *pgxpool.Pool) error {
	if err := createSchema(ctx, pool); err != nil {
		return fmt.Errorf("create database schema: %w", err)
	}
	if err := seedMasterData(ctx, pool); err != nil {
		return fmt.Errorf("seed master data: %w", err)
	}
	return nil
}

func createSchema(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, createSchemaSQL)
	return err
}

func seedMasterData(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, seedMasterDataSQL)
	return err
}

func databaseName(databaseURL string) string {
	parsed, err := url.Parse(databaseURL)
	if err != nil {
		return ""
	}
	return strings.TrimPrefix(parsed.Path, "/")
}
