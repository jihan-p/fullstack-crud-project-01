// middleware/role_middleware.go (File BARU)

package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RoleKey is the key for storing the user's role in the Gin Context
const UserRoleKey = "user_role" 

// RoleCheckMiddleware memverifikasi apakah pengguna memiliki salah satu dari peran yang diizinkan.
func RoleCheckMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Ambil Role dari Gin Context (setelah AuthMiddleware berjalan)
		userRole, exists := c.Get(UserRoleKey) 

		if !exists {
			// Ini seharusnya tidak terjadi jika AuthMiddleware sudah berjalan
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Informasi peran (role) pengguna tidak tersedia di context."})
			c.Abort()
			return
		}
		
		roleString := userRole.(string)

		// 2. Cek apakah role pengguna ada dalam daftar requiredRoles
		isAuthorized := false
		for _, required := range requiredRoles {
			if strings.EqualFold(roleString, required) {
				isAuthorized = true
				break
			}
		}

		if !isAuthorized {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses Ditolak. Anda tidak memiliki izin Admin."})
			c.Abort()
			return
		}
		
		c.Next()
	}
}