package utils 

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword mengenkripsi password menggunakan bcrypt.
func HashPassword(password string) (string, error) {
    // bcrypt.DefaultCost adalah level kekuatan enkripsi yang direkomendasikan
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", err
    }
    // Mengembalikan hash sebagai string
    return string(hashedPassword), nil
}

// CheckPasswordHash membandingkan hash password yang tersimpan dengan password yang dimasukkan.
// Mengembalikan nil jika cocok, atau error jika tidak cocok.
func CheckPasswordHash(hashedPassword, password string) error {
    // Fungsi ini secara otomatis menangani perbandingan hash
    return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}