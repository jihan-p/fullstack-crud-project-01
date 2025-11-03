package config

import (
	"log"

	"github.com/joho/godotenv"
)

// LoadEnv memuat variabel dari file .env di root direktori.
func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error memuat file .env: %v", err)
	}
}