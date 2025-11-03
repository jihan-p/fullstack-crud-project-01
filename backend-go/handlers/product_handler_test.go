package handlers_test

import (
	"fullstack-crud-project-01/backend-go/handlers"
	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/repositories"
	"fullstack-crud-project-01/backend-go/services"

	"github.com/gin-gonic/gin"

	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"strings"
)

var testRouter *gin.Engine

func setupProductRouter() *gin.Engine {
	// Setup Dependency Injection untuk testing
	productRepo := repositories.NewProductRepository(testDB)
	productService := services.NewProductService(productRepo)
	productHandler := handlers.NewProductHandler(productService)

	// Setup Router
	r := gin.Default()
	api := r.Group("/api/v1") // Sesuaikan dengan main.go
	{
		// Endpoint ini dilindungi, jadi kita perlu token. Untuk simplisitas, kita nonaktifkan middleware di test.
		// Jika ingin test middleware, perlu setup yang lebih kompleks.
		products := api.Group("/products")
		// products.Use(middleware.AuthMiddleware()) // Nonaktifkan middleware untuk unit test handler
		{
			products.POST("", productHandler.CreateProductHandler)
			products.GET("", productHandler.ReadAllProductsHandler)
			products.GET("/:id", productHandler.ReadProductByIDHandler)
			products.PUT("/:id", productHandler.UpdateProductHandler)
			products.DELETE("/:id", productHandler.DeleteProductHandler)
		}
	}
	return r
}

// Helper untuk membuat request
func executeRequest(req *http.Request) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req) // Gunakan router global yang di-setup
	return w
}

// Test jalur lengkap CRUD (seringkali lebih efisien untuk menguji C-R-U-D dalam satu fungsi)
func TestProductCRUD(t *testing.T) {
	testDB.Exec("DELETE FROM products") // Kosongkan tabel sebelum test
	testRouter = setupProductRouter() // Inisialisasi router global

	// --- 1. TEST CREATE (POST /api/products) ---
	t.Run("CreateProduct", func(t *testing.T) {
		payload := []byte(`{"name": "Buku Go", "description": "Belajar GoLang dari Dasar", "price": 150000}`)
		req, _ := http.NewRequest("POST", "/api/v1/products", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		
		response := executeRequest(req)
		
		if response.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d. Body: %s", http.StatusCreated, response.Code, response.Body.String())
		}
		
		// Verifikasi respons mengandung data
		if !strings.Contains(response.Body.String(), "Buku Go") {
			t.Errorf("Response body does not contain created product name")
		}
	})

	// --- 2. TEST READ ALL (GET /api/products) ---
	t.Run("ReadAllProducts", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/products", nil)
		response := executeRequest(req)

		if response.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, response.Code)
		}
        
		var result map[string][]models.Product
		json.Unmarshal(response.Body.Bytes(), &result)

		if len(result["data"]) != 1 {
			t.Errorf("Expected 1 product, got %d", len(result["data"]))
		}

		// Ambil ID produk yang baru dibuat untuk test selanjutnya
		if len(result["data"]) > 0 {
			productID := result["data"][0].ID
			t.Logf("Created Product ID: %d", productID) 
			
			// --- 3. TEST READ BY ID (GET /api/products/:id) ---
			t.Run("ReadProductByID", func(t *testing.T) {
				req, _ := http.NewRequest("GET", "/api/v1/products/"+strconv.Itoa(int(productID)), nil)
				response := executeRequest(req)

				if response.Code != http.StatusOK {
					t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, response.Code, response.Body.String())
				}
			})

			// --- 4. TEST UPDATE (PUT /api/products/:id) ---
			t.Run("UpdateProduct", func(t *testing.T) {
				updatePayload := []byte(`{"name": "Buku Go TERBARU", "description": "Edisi Revisi", "price": 175000}`)
				req, _ := http.NewRequest("PUT", "/api/v1/products/"+strconv.Itoa(int(productID)), bytes.NewBuffer(updatePayload))
				req.Header.Set("Content-Type", "application/json")
				response := executeRequest(req)

				if response.Code != http.StatusOK {
					t.Errorf("Expected status %d, got %d. Body: %s", http.StatusOK, response.Code, response.Body.String())
				}
				if !strings.Contains(response.Body.String(), "TERBARU") {
					t.Errorf("Update failed. Expected 'TERBARU', got: %s", response.Body.String())
				}
			})

			// --- 5. TEST DELETE (DELETE /api/products/:id) ---
			t.Run("DeleteProduct", func(t *testing.T) {
				req, _ := http.NewRequest("DELETE", "/api/v1/products/"+strconv.Itoa(int(productID)), nil)
				response := executeRequest(req)

				if response.Code != http.StatusNoContent {
					t.Errorf("Expected status %d, got %d. Body: %s", http.StatusNoContent, response.Code, response.Body.String())
				}
				
				// Verifikasi produk benar-benar hilang (optional tapi disarankan)
				req, _ = http.NewRequest("GET", "/api/v1/products/"+strconv.Itoa(int(productID)), nil)
				response = executeRequest(req)
				
				if response.Code != http.StatusNotFound {
					t.Errorf("Expected status %d after delete, got %d", http.StatusNotFound, response.Code)
				}
			})
		}
	})
}