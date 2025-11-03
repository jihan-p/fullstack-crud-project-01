package config

import (
	"log"

	"github.com/joho/godotenv"
)

// LoadEnv memuat variabel dari file .env di root direktori.
func LoadEnv() {
	// Coba muat dari direktori saat ini (untuk `go run main.go`)
	err := godotenv.Load()
	if err != nil {
		// Jika gagal, coba muat dari direktori induk (untuk `go test ./...`)
		err = godotenv.Load("../.env")
		if err != nil {
			log.Fatalf("Error memuat file .env: %v", err)
		}
	}
}