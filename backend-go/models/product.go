package models

import (
	"errors"
	"gorm.io/gorm"
)

var ErrProductNameRequired = errors.New("nama produk wajib diisi")

// Product struct merepresentasikan data di tabel 'products'
type Product struct {
	gorm.Model           // Menyediakan field ID, CreatedAt, UpdatedAt, DeletedAt
	Name        string   `gorm:"type:varchar(255);not null" json:"name"`
	Description string   `gorm:"type:text" json:"description"`
	Price       int      `gorm:"not null" json:"price"`
}
