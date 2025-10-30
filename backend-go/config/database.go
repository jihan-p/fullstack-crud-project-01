package config

import (
    "fmt"
    "log"
    "fullstack-crud-project-01/backend-go/models"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

// DB adalah variabel global untuk koneksi database
var DB *gorm.DB

// ConnectDatabase menginisialisasi koneksi ke MySQL
func ConnectDatabase() {
    // Sesuaikan kredensial Anda di sini!
    // Format DSN (Data Source Name): "user:password@tcp(host:port)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
    dsn := "axzm1:2@tcp(127.0.0.1:3306)/grt_crud_db?charset=utf8mb4&parseTime=True&loc=Local"

    database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

    if err != nil {
        log.Fatal("Koneksi ke database GAGAL! \n", err)
    }

    // Set variabel DB global
    DB = database
    fmt.Println("Koneksi database Berhasil!")

    // Otomatis membuat/memperbarui tabel 'products' di database
	err = DB.AutoMigrate(&models.Product{})
    if err != nil {
        log.Fatal("Migrasi tabel GAGAL! \n", err)
    }
    fmt.Println("Migrasi tabel 'products' Berhasil.")
}

// TestConnectDatabase menginisialisasi koneksi ke MySQL untuk pengujian
func TestConnectDatabase() {
    // --- PENTING: Ganti nama database ke crud_db_test ---
    dsn := "axzm1:2@tcp(127.0.0.1:3306)/grt_crud_db_test?charset=utf8mb4&parseTime=True&loc=Local"

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Koneksi ke database TEST GAGAL! \n", err)
	}

	DB = database
	fmt.Println("Koneksi database TEST Berhasil!")

	// Tidak perlu AutoMigrate di sini, akan dilakukan di setup handler test
}
