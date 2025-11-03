package services

import (
	"fullstack-crud-project-01/backend-go/models"
)

// ProductRepository mendefinisikan operasi yang diperlukan untuk produk.
// Ini adalah "port" dalam arsitektur Hexagonal.
type ProductRepository interface {
	Create(product *models.Product) error
	ReadAll() ([]models.Product, error)
	ReadByID(id uint) (*models.Product, error)
	Update(product *models.Product) error
	Delete(id uint) error
}

// ProductService menyediakan logika bisnis untuk produk.
type ProductService struct {
	Repo ProductRepository
}

// NewProductService adalah konstruktor untuk ProductService.
func NewProductService(repo ProductRepository) *ProductService {
	return &ProductService{Repo: repo}
}

// CreateProduct memvalidasi dan membuat produk baru.
func (s *ProductService) CreateProduct(product *models.Product) error {
	// Contoh validasi sederhana
	if product.Name == "" {
		return models.ErrProductNameRequired
	}
	if product.Price <= 0 {
		return models.ErrProductPriceInvalid
	}

	// Panggil repository untuk menyimpan ke database
	return s.Repo.Create(product)
}

// ReadAllProducts mengambil semua produk.
func (s *ProductService) ReadAllProducts() ([]models.Product, error) {
	return s.Repo.ReadAll()
}

// ReadProductByID mengambil produk berdasarkan ID.
func (s *ProductService) ReadProductByID(id uint) (*models.Product, error) {
	return s.Repo.ReadByID(id)
}

// UpdateProduct memvalidasi dan memperbarui produk.
func (s *ProductService) UpdateProduct(product *models.Product) error {
	// Anda bisa menambahkan validasi di sini jika perlu
	return s.Repo.Update(product)
}

// DeleteProduct menghapus produk berdasarkan ID.
func (s *ProductService) DeleteProduct(id uint) error {
	return s.Repo.Delete(id)
}