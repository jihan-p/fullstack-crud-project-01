package config

import (
    "fmt"
    "log"
    "os"
    "fullstack-crud-project-01/backend-go/models"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

// DB adalah variabel global untuk koneksi database
var DB *gorm.DB

// buildDSN membuat Data Source Name (DSN) dari variabel lingkungan
func buildDSN(dbNameEnvKey string) string {
    // Ambil nilai dari variabel lingkungan
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	dbName := os.Getenv(dbNameEnvKey) // Menggunakan DB_NAME atau DB_NAME_TEST

    if user == "" || password == "" || dbName == "" {
        log.Fatal("Kredensial database di .env belum lengkap!")
    }

	// Format DSN
	return fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, dbName,
	)
}

// ConnectDatabase menginisialisasi koneksi ke MySQL
func ConnectDatabase() {
    dsn := buildDSN("DB_NAME")
    
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

    if err != nil {
        log.Fatal("Koneksi ke database GAGAL! \n", err)
    }

    // Set variabel DB global
    DB = database
    fmt.Println("Koneksi database Berhasil!")

    // Auto-migrate models to create/update tables
	err = DB.AutoMigrate(&models.Product{}, &models.User{})
    if err != nil {
        log.Fatalf("Migrasi tabel GAGAL! \n%v", err)
    }
    fmt.Println("Migrasi tabel 'products' & 'users' Berhasil.")
}

// ConnectTestDatabase menginisialisasi koneksi ke database TEST dan mengembalikannya.
func ConnectTestDatabase() (*gorm.DB, error) {
    dsn := buildDSN("DB_NAME_TEST") // Gunakan DB_NAME_TEST untuk pengujian
    
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, fmt.Errorf("koneksi ke database TEST GAGAL: %w", err)
	}

	fmt.Println("Koneksi database TEST Berhasil!")
	// Mengembalikan instance DB, bukan menyimpannya di variabel global
	return database, nil
}
