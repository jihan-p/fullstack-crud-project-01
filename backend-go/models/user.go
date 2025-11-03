// models/user.go

package models

import (
	"time"
)

// User merepresentasikan model pengguna di database
// User merepresentasikan model data untuk seorang pengguna.
type User struct {
	ID              uint      `gorm:"primaryKey"`
	Name            string    `gorm:"not null"`
	Email           string    `gorm:"unique;not null"`
	PasswordHash    string    `gorm:"not null"`
	IsActive        bool      `gorm:"default:false"`
	ActivationToken *string   // Pointer agar bisa NULL
	ResetToken      *string   // Token untuk reset password
	ResetTokenExpiry *time.Time // Waktu kedaluwarsa token reset
	CreatedAt       time.Time `gorm:"autoCreateTime"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime"`
}