package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"fullstack-crud-project-01/backend-go/middleware"
	"fullstack-crud-project-01/backend-go/utils"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// setupRouterWithMiddleware membuat router Gin dengan satu endpoint yang dilindungi oleh AuthMiddleware.
func setupRouterWithMiddleware() *gin.Engine {
	// Set mode test untuk Gin agar log tidak terlalu verbose
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	// Endpoint "/protected" hanya bisa diakses jika middleware lolos
	r.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		// Handler ini hanya akan tercapai jika middleware berhasil.
		// Kita bisa mengecek apakah data pengguna (claims) sudah disuntikkan dengan benar.
		claims, exists := c.Get(middleware.UserKey)
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User claims tidak ditemukan di context"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Welcome!", "claims": claims})
	})
	return r
}

func TestAuthMiddleware(t *testing.T) {
	// Setup: Set secret key untuk membuat token yang valid selama pengujian
	os.Setenv("JWT_SECRET_KEY", "kunci-rahasia-untuk-testing-middleware")
	defer os.Unsetenv("JWT_SECRET_KEY") // Cleanup setelah tes selesai

	router := setupRouterWithMiddleware()

	// Skenario 1: Gagal - Tidak ada header Authorization
	t.Run("Failure_NoAuthHeader", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/protected", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "Header otorisasi diperlukan")
	})

	// Skenario 2: Gagal - Format token salah
	t.Run("Failure_InvalidTokenFormat", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "InvalidFormat 12345") // Format salah
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "Format token tidak valid")
	})

	// Skenario 3: Gagal - Token tidak valid/salah
	t.Run("Failure_InvalidToken", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer token-yang-salah-dan-tidak-valid")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "Token tidak valid atau kedaluwarsa")
	})

	// Skenario 4: Sukses - Token valid
	t.Run("Success_ValidToken", func(t *testing.T) {
		// Buat token yang valid
		userID := uint(99)
		email := "test.middleware@example.com"
		validToken, err := utils.GenerateToken(userID, email)
		assert.NoError(t, err)

		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+validToken)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Verifikasi bahwa request berhasil (diteruskan ke handler)
		assert.Equal(t, http.StatusOK, w.Code)

		// Verifikasi bahwa handler menerima data pengguna dari context
		assert.Contains(t, w.Body.String(), "Welcome!")
		assert.Contains(t, w.Body.String(), `"claims":99`) // Check for the user ID
	})
}