package models

import (
	"errors"
	"time"
)

// Product merepresentasikan model data untuk sebuah produk.
type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Price       int       `gorm:"not null" json:"price"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Error kustom untuk validasi produk
var (
	ErrProductNameRequired = errors.New("nama produk tidak boleh kosong")
	ErrProductPriceInvalid = errors.New("harga produk harus lebih besar dari nol")
)