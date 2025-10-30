package services_test

import (
	"errors"
	"testing"

	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/services"
)

// --- MOCK REPOSITORY ---
// MockProductRepo adalah implementasi palsu dari services.ProductRepository
type MockProductRepo struct {
	CreateFunc func(product *models.Product) error
}

// Implementasi method Create dari interface ProductRepository
func (m *MockProductRepo) Create(product *models.Product) error {
	return m.CreateFunc(product)
}

// Implementasi method ReadAll, ReadByID, Update, Delete di sini nanti...
// (Untuk saat ini, kita hanya fokus pada Create)
func (m *MockProductRepo) ReadAll() ([]models.Product, error) { return nil, nil }
func (m *MockProductRepo) ReadByID(id uint) (*models.Product, error) { return nil, nil }
func (m *MockProductRepo) Update(product *models.Product) error { return nil }
func (m *MockProductRepo) Delete(id uint) error { return nil }

func TestCreateProduct(t *testing.T) {
	// Definisikan test cases
	tests := []struct {
		name         string
		inputProduct *models.Product
		mockRepo     services.ProductRepository // Interface
		expectedErr  error
	}{
		// Skenario 1: Sukses Membuat Produk
		{
			name: "Success_ValidProduct",
			inputProduct: &models.Product{
				Name:        "Test Laptop",
				Description: "Deskripsi",
				Price:       10000000,
			},
			mockRepo: &MockProductRepo{
				// Mocking: CreateFunc akan mengembalikan nil (sukses DB)
				CreateFunc: func(product *models.Product) error {
					return nil
				},
			},
			expectedErr: nil,
		},
		// Skenario 2: Gagal Validasi (Nama Produk Kosong)
		{
			name: "Failure_NameRequired",
			inputProduct: &models.Product{
				Name:        "", // Nama kosong
				Description: "Deskripsi",
				Price:       10000000,
			},
			mockRepo: &MockProductRepo{
				// Meskipun CreateFunc di-mock untuk sukses, logika service harus memblokir ini
				CreateFunc: func(product *models.Product) error {
					return nil
				},
			},
			expectedErr: models.ErrProductNameRequired, // Error dari logika validasi service
		},
		// Skenario 3: Gagal Database (Misal: Error koneksi atau duplikat)
		{
			name: "Failure_DatabaseError",
			inputProduct: &models.Product{
				Name:        "Valid Product",
				Description: "Deskripsi",
				Price:       10000000,
			},
			mockRepo: &MockProductRepo{
				// Mocking: CreateFunc mengembalikan error dari DB
				CreateFunc: func(product *models.Product) error {
					return errors.New("database connection failed")
				},
			},
			expectedErr: errors.New("database connection failed"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Inisialisasi service dengan Mock Repository
			productService := services.ProductService{
				Repo: tt.mockRepo,
			}

			// Eksekusi fungsi yang diuji
			err := productService.CreateProduct(tt.inputProduct)

			// Pengecekan Hasil
			if tt.expectedErr != nil {
				// Cek apakah error yang dikembalikan sesuai
				if err == nil || err.Error() != tt.expectedErr.Error() {
					t.Errorf("Expected error: %v, got: %v", tt.expectedErr, err)
				}
			} else {
				// Cek apakah tidak ada error yang dikembalikan
				if err != nil {
					t.Errorf("Expected nil error, got: %v", err)
				}
			}
		})
	}
}