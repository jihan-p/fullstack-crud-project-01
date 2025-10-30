package repositories

import (
	"fullstack-crud-project-01/backend-go/config"
	"fullstack-crud-project-01/backend-go/models"
)

// ProductRepositoryImpl adalah implementasi nyata dari ProductRepository
type ProductRepositoryImpl struct{}

// Create menyimpan produk ke database menggunakan GORM
func (r *ProductRepositoryImpl) Create(product *models.Product) error {
	result := config.DB.Create(product)
	return result.Error
}

func (r *ProductRepositoryImpl) ReadAll() ([]models.Product, error) {
	var products []models.Product
	result := config.DB.Find(&products)
	return products, result.Error
}

// ReadByID mendapatkan produk berdasarkan ID
func (r *ProductRepositoryImpl) ReadByID(id uint) (*models.Product, error) {
	var product models.Product
	result := config.DB.First(&product, id)
	return &product, result.Error
}

// Update menyimpan perubahan produk
func (r *ProductRepositoryImpl) Update(product *models.Product) error {
	// Akan melakukan Update hanya pada field yang dimodifikasi, bukan mengganti semua field.
	result := config.DB.Save(product)
	return result.Error
}

// Delete menghapus produk berdasarkan ID (soft delete karena GORM.Model)
func (r *ProductRepositoryImpl) Delete(id uint) error {
	result := config.DB.Delete(&models.Product{}, id)
	return result.Error
}