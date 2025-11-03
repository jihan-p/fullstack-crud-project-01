package repositories_test

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"

	"fullstack-crud-project-01/backend-go/config"     
	"fullstack-crud-project-01/backend-go/models"    
	"fullstack-crud-project-01/backend-go/repositories" 
)

var testDB *gorm.DB

func TestMain(m *testing.M) {
	// --- SETUP GLOBAL ---
	
	// Muat variabel lingkungan dari .env SEBELUM koneksi DB
	config.LoadEnv()

	// ASUMSI: config.ConnectTestDatabase() adalah fungsi khusus yang menggunakan DB_NAME_TEST
	db, err := config.ConnectTestDatabase()
	if err != nil {
		fmt.Printf("Gagal menyambungkan ke DB Test: %v\n", err)
		os.Exit(1)
	}
	testDB = db

	// Pastikan model sudah dimigrasi ke DB Test
	testDB.AutoMigrate(&models.Product{}, &models.User{})

	// --- Jalankan Semua Tes ---
	code := m.Run()

	// --- TEARDOWN GLOBAL ---
	// Opsional: Hapus DB Test setelah semua tes selesai
	
	os.Exit(code)
}

// setupTest membersihkan tabel sebelum setiap tes
func setupTest(t *testing.T) {
	// Hapus semua data dari tabel Products
	testDB.Exec("DELETE FROM products")
	
	// Reset Auto Increment (Opsional, tapi bagus)
	testDB.Exec("ALTER TABLE products AUTO_INCREMENT = 1") 
}

func TestProductRepository_CreateAndFindByID(t *testing.T) {
	setupTest(t)
	repo := repositories.NewProductRepository(testDB)
	
	product := models.Product{
		Name:        "Test Laptop",
		Description: "Good for testing",
		Price:       5000000,
	}

	// 1. Test Create
	err := repo.Create(&product)
	assert.NoError(t, err)
	assert.NotEqual(t, uint(0), product.ID)

	// 2. Test FindByID
	foundProduct, err := repo.ReadByID(product.ID)
	assert.NoError(t, err)
	assert.Equal(t, product.Name, foundProduct.Name)
}

func TestProductRepository_Update(t *testing.T) {
	setupTest(t)
	repo := repositories.NewProductRepository(testDB)
	
	// Buat produk awal
	product := models.Product{Name: "Old Name", Price: 100}
	repo.Create(&product)

	// Update data
	product.Name = "New Name"
	product.Price = 200

	// 1. Test Update
	err := repo.Update(&product)
	assert.NoError(t, err)

	// 2. Verifikasi
	updatedProduct, _ := repo.ReadByID(product.ID)
	assert.Equal(t, "New Name", updatedProduct.Name)
	assert.Equal(t, 200, updatedProduct.Price)
}

func TestProductRepository_Delete(t *testing.T) {
	setupTest(t)
	repo := repositories.NewProductRepository(testDB)
	
	// Buat produk awal
	product := models.Product{Name: "To Delete", Price: 10}
	repo.Create(&product)

	// 1. Test Delete
	err := repo.Delete(product.ID)
	assert.NoError(t, err)

	// 2. Verifikasi (seharusnya tidak ditemukan)
	_, err = repo.ReadByID(product.ID)
	assert.Error(t, err) // GORM akan mengembalikan error jika record tidak ditemukan
	assert.Contains(t, err.Error(), "record not found")
}