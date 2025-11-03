package repositories_test

import (
	"fmt"
	"os"
	"testing"

	"fullstack-crud-project-01/backend-go/config"
	"fullstack-crud-project-01/backend-go/models"
	"gorm.io/gorm"
)

var testDB *gorm.DB

// TestMain sets up the test database connection for the entire package.
func TestMain(m *testing.M) {
	config.LoadEnv()
	db, err := config.ConnectTestDatabase()
	if err != nil {
		fmt.Printf("Failed to connect to the test database: %v\n", err)
		os.Exit(1)
	}
	testDB = db

	// Run migrations for all models
	testDB.AutoMigrate(&models.Product{}, &models.User{})

	os.Exit(m.Run())
}