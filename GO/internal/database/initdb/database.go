package initdb

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// It is used only by cmd/db init;
func ensureDatabase(ctx context.Context, databaseURL string, maintenanceDatabase string) error {
	config, err := pgx.ParseConfig(databaseURL)
	if err != nil {
		return fmt.Errorf("parse DATABASE_URL: %w", err)
	}
	if maintenanceDatabase == "" {
		return fmt.Errorf("DATABASE_MAINTENANCE_DB is required")
	}

	conn, err := pgx.ConnectConfig(ctx, config)
	if err == nil {
		return conn.Close(ctx)
	}
	if !isMissingDatabase(err) {
		return fmt.Errorf("connect to PostgreSQL: %w", err)
	}

	databaseName := config.Database
	if databaseName == "" {
		return fmt.Errorf("DATABASE_URL must include a database name")
	}

	maintenanceConfig := config.Copy()
	maintenanceConfig.Database = maintenanceDatabase

	maintenanceConn, err := pgx.ConnectConfig(ctx, maintenanceConfig)
	if err != nil {
		return fmt.Errorf("connect to %q database: %w", maintenanceDatabase, err)
	}
	defer func() { _ = maintenanceConn.Close(ctx) }()

	_, err = maintenanceConn.Exec(
		ctx,
		"CREATE DATABASE "+pgx.Identifier{databaseName}.Sanitize(),
	)
	if err != nil && !isDuplicateDatabase(err) {
		return fmt.Errorf("create database %q: %w", databaseName, err)
	}

	return nil
}

func isMissingDatabase(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "3D000"
}

func isDuplicateDatabase(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "42P04"
}
