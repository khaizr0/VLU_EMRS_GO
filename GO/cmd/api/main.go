package main

import (
	"log"

	"github.com/khaizr0/VLU_EMRS_GO/internal/app"
	"github.com/khaizr0/VLU_EMRS_GO/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	if err := app.Run(cfg); err != nil {
		log.Fatal(err)
	}
}
