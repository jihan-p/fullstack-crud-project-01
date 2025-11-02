// models/user.go

package models

import (
	"time"
)

// User merepresentasikan model pengguna di database
type User struct {
    ID              uint       `gorm:"primaryKey" json:"id"`
    Email           string     `gorm:"unique;not null" json:"email"`
    PasswordHash    string     `gorm:"not null" json:"-"` // Hash password disimpan, tidak diekspos di JSON
    Name            string     `json:"name"`
    IsActive        bool       `gorm:"default:false" json:"isActive"` // Status aktivasi akun (via email)
    ActivationToken *string    `json:"-"` // Token acak untuk aktivasi email
    ResetToken      *string    `json:"-"` // Token acak untuk lupa password
    ResetTokenExpiry *time.Time `json:"-"` // Waktu kedaluwarsa token reset
    CreatedAt       time.Time
    UpdatedAt       time.Time
}

// Catatan:
// 1. Tag `json:"-"` menyembunyikan field sensitif (PasswordHash, token) dari respons API JSON.
// 2. Tipe *string dan *time.Time (pointer) membuat kolom-kolom token menjadi NULLABLE di database.