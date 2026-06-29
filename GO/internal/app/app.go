package app

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/khaizr0/VLU_EMRS_GO/internal/config"
	"github.com/khaizr0/VLU_EMRS_GO/internal/database"
)

func Run(cfg config.Config) error {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer db.Close()

	server := newServer(cfg, db)
	serverError := make(chan error, 1)

	go func() {
		log.Printf("server listening on http://localhost:%s", cfg.Port)
		serverError <- server.Start(":" + cfg.Port)
	}()

	select {
	case err := <-serverError:
		if !errors.Is(err, http.ErrServerClosed) {
			return fmt.Errorf("start server on port %s: %w", cfg.Port, err)
		}
		return nil
	case <-ctx.Done():
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("shutdown server: %w", err)
	}
	return nil
}
