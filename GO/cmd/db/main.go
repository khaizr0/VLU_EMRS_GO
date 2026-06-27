package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/config"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database/initdb"
)

func main() {
	if len(os.Args) != 2 || os.Args[1] != "init" {
		fmt.Fprintln(os.Stderr, "usage: go run ./cmd/db init")
		os.Exit(2)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := initdb.Run(ctx, cfg.DatabaseURL, cfg.DatabaseMaintenanceDB); err != nil {
		log.Fatal(err)
	}
}
