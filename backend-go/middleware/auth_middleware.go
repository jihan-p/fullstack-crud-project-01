package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"fullstack-crud-project-01/backend-go/utils" // Import utils/jwt_utils.go
)

// UserKey adalah kunci yang digunakan untuk menyimpan data pengguna di Gin Context
const UserKey = "user_id"

// AuthMiddleware memverifikasi JWT dari header Authorization.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Ekstrak Token dari Header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Header otorisasi diperlukan."})
			c.Abort() // Menghentikan eksekusi handler berikutnya
			return
		}

		// Header biasanya berbentuk: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Format token tidak valid. Gunakan 'Bearer <token>'."})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 2. Validasi Token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			// Token tidak valid (expired, signature salah, dll.)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau kedaluwarsa.", "details": err.Error()})
			c.Abort()
			return
		}

		// 3. Suntikkan Data Pengguna ke Konteks
		// Data ini (UserID dan Email) sekarang bisa diakses oleh handler produk
		c.Set(UserKey, claims.UserID)
		c.Set(UserRoleKey, claims.Role) // <-- TAMBAH INI
		
		// Lanjutkan ke handler berikutnya (misalnya, CreateProductHandler)
		c.Next()
	}
}