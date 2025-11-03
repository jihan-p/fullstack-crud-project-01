package repositories

import (
	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/services"
	"gorm.io/gorm"
)

// ProductRepositoryImpl adalah implementasi nyata dari ProductRepository
type ProductRepositoryImpl struct{
	DB *gorm.DB
}

// NewProductRepository adalah konstruktor untuk ProductRepositoryImpl
func NewProductRepository(db *gorm.DB) services.ProductRepository { // Returns the interface from the services package
	return &ProductRepositoryImpl{DB: db}
}

// Create menyimpan produk ke database menggunakan GORM
func (r *ProductRepositoryImpl) Create(product *models.Product) error {
	result := r.DB.Create(product)
	return result.Error
}

func (r *ProductRepositoryImpl) ReadAll() ([]models.Product, error) {
	var products []models.Product
	result := r.DB.Find(&products)
	return products, result.Error
}

// ReadByID mendapatkan produk berdasarkan ID
func (r *ProductRepositoryImpl) ReadByID(id uint) (*models.Product, error) {
	var product models.Product
	result := r.DB.First(&product, id)
	return &product, result.Error
}

// Update menyimpan perubahan produk
func (r *ProductRepositoryImpl) Update(product *models.Product) error {
	// Akan melakukan Update hanya pada field yang dimodifikasi, bukan mengganti semua field.
	result := r.DB.Save(product)
	return result.Error
}

// Delete menghapus produk berdasarkan ID (soft delete karena GORM.Model)
func (r *ProductRepositoryImpl) Delete(id uint) error {
	result := r.DB.Delete(&models.Product{}, id)
	return result.Error
}