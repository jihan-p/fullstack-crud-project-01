package services

import (
	"fullstack-crud-project-01/backend-go/models"
	"errors"
)

// --- 1. DEFINISI INTERFACE REPOSITORY ---
// Ini adalah kontrak (interface) yang harus dipenuhi oleh implementasi DB (Repository).
// Service mendefinisikan dependensi yang dibutuhkannya.
type ProductRepository interface {
	Create(product *models.Product) error
	ReadAll() ([]models.Product, error)
	ReadByID(id uint) (*models.Product, error)
	Update(product *models.Product) error
	Delete(id uint) error
}

// --- 2. STRUCT SERVICE ---
// Struct ini akan memegang implementasi repository (real DB atau Mock DB)
type ProductService struct {
	Repo ProductRepository
}

// NewProductService adalah konstruktor untuk ProductService
func NewProductService(repo ProductRepository) *ProductService {
	return &ProductService{Repo: repo}
}

// --- 3. LOGIKA BISNIS (CreateProduct) ---
// Metode ini sekarang memanggil method Create dari interface Repo
func (s *ProductService) CreateProduct(product *models.Product) error {
    // Implementasi validasi Sederhana: Nama tidak boleh kosong
    if product.Name == "" {
        return models.ErrProductNameRequired
    }
    
    // Panggil Repository (yang sebenarnya bisa berupa DB atau Mock)
	return s.Repo.Create(product)
}

// ReadAllProducts memanggil repository untuk mendapatkan semua produk
func (s *ProductService) ReadAllProducts() ([]models.Product, error) {
	return s.Repo.ReadAll()
}

// ReadProductByID memanggil repository untuk mendapatkan produk spesifik
func (s *ProductService) ReadProductByID(id uint) (*models.Product, error) {
	return s.Repo.ReadByID(id)
}

// UpdateProduct (Asumsi validasi tambahan di sini jika diperlukan)
func (s *ProductService) UpdateProduct(product *models.Product) error {
	// Contoh validasi ringan: ID harus ada untuk update
	if product.ID == 0 {
		return errors.New("ID produk wajib diisi untuk update") 
	}
	return s.Repo.Update(product)
}

// DeleteProduct memanggil repository untuk menghapus produk
func (s *ProductService) DeleteProduct(id uint) error {
	return s.Repo.Delete(id)
}