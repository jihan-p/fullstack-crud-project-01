package utils

import (
	"os"
	"time"
    "fmt" // Import fmt untuk formatting error

	"github.com/golang-jwt/jwt/v5"
)

// CustomClaims mendefinisikan payload kustom yang akan dimasukkan ke dalam JWT.
// Ini harus menyertakan StandardClaims (Registered Claims) yang wajib dari library JWT.
type CustomClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// GenerateToken membuat JWT baru untuk pengguna yang berhasil login.
func GenerateToken(userID uint, email string) (string, error) {
	jwtSecret := os.Getenv("JWT_SECRET_KEY")

	// Pastikan Secret Key sudah diatur
	if jwtSecret == "" {
		return "", fmt.Errorf("JWT_SECRET_KEY tidak diatur dalam environment variables")
	}

	// 1. Definisikan waktu kedaluwarsa (misalnya 1 jam dari sekarang)
	expirationTime := time.Now().Add(time.Hour * 1).Unix()
	
	// 2. Definisikan claims
	claims := &CustomClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Unix(expirationTime, 0)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "go-backend-auth", // Opsional: Tanda pengenal penerbit token
		},
	}

	// 3. Buat token baru dengan algoritma HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 4. Tandatangani token dengan secret key
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", fmt.Errorf("gagal menandatangani token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken memverifikasi token JWT.
// Fungsi ini digunakan di Middleware pada Langkah 3.
func ValidateToken(tokenString string) (*CustomClaims, error) {
    jwtSecret := os.Getenv("JWT_SECRET_KEY")

    if jwtSecret == "" {
        return nil, fmt.Errorf("JWT_SECRET_KEY tidak diatur")
    }

	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Pastikan algoritma yang digunakan sama dengan saat pembuatan
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("metode penandatanganan tidak valid: %v", token.Header["alg"])
		}
		// Mengembalikan secret key
		return []byte(jwtSecret), nil
	})

	if err != nil {
		// Ini akan menangani error umum seperti token kedaluwarsa atau signature tidak valid
		return nil, fmt.Errorf("token tidak valid: %w", err)
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("token tidak valid atau claim tidak ditemukan")
}