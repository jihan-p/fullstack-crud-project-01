package handlers

import (
	"net/http"
    "fullstack-crud-project-01/backend-go/models"
    "fullstack-crud-project-01/backend-go/services" // Import service interface
	"strconv"
    "gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"errors"
)

// ProductHandler struct menyimpan referensi ke ProductService
type ProductHandler struct {
    ProductSvc *services.ProductService
}

// Konstruktor untuk ProductHandler
func NewProductHandler(svc *services.ProductService) *ProductHandler {
    return &ProductHandler{ProductSvc: svc}
}

// CreateProductHandler sekarang memanggil service dari struct handler
func (h *ProductHandler) CreateProductHandler(c *gin.Context) {
	var product models.Product
    
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

    // Panggil Service
	if err := h.ProductSvc.CreateProduct(&product); err != nil {
        if err == models.ErrProductNameRequired {
             c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}) // Bad Request for validation
             return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan produk"})
        return
    }

	c.JSON(http.StatusCreated, gin.H{"data": product})
}

// ReadAllProductsHandler
func (h *ProductHandler) ReadAllProductsHandler(c *gin.Context) {
	products, err := h.ProductSvc.ReadAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar produk"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": products})
}

// ReadProductByIDHandler
func (h *ProductHandler) ReadProductByIDHandler(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	product, err := h.ProductSvc.ReadProductByID(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil produk"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": product})
}

// UpdateProductHandler
func (h *ProductHandler) UpdateProductHandler(c *gin.Context) {
    id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
    
    // Set ID dari URL ke struct input
    input.ID = uint(id)

    if err := h.ProductSvc.UpdateProduct(&input); err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
			return
		}
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate produk"})
        return
    }

	c.JSON(http.StatusOK, gin.H{"data": input})
}

// DeleteProductHandler
func (h *ProductHandler) DeleteProductHandler(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produk tidak valid"})
		return
	}

	if err := h.ProductSvc.DeleteProduct(uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Produk tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus produk"})
		return
	}
    
    // Status 204 No Content untuk operasi penghapusan yang sukses
	c.JSON(http.StatusNoContent, nil) 
}