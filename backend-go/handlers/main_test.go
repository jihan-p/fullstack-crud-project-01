package handlers_test

import (
	"log"
	"os"
	"testing"

	"fullstack-crud-project-01/backend-go/config"
	"fullstack-crud-project-01/backend-go/models"
	"gorm.io/gorm"
)

// testDB akan digunakan oleh semua file test di paket 'handlers'
var testDB *gorm.DB

// TestMain adalah titik masuk tunggal untuk semua tes di paket ini.
func TestMain(m *testing.M) {
	// Muat .env untuk mendapatkan kredensial DB dan JWT Secret
	config.LoadEnv()

	// Setup: Koneksi ke database test
	var err error
	testDB, err = config.ConnectTestDatabase()
	if err != nil {
		log.Fatalf("Gagal konek ke DB test: %v", err)
	}
	testDB.AutoMigrate(&models.User{}, &models.Product{})

	os.Exit(m.Run())
}