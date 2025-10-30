package main

import (
	"github.com/gin-gonic/gin"
    "fullstack-crud-project-01/backend-go/config"
    "fullstack-crud-project-01/backend-go/handlers"
    "fullstack-crud-project-01/backend-go/services"
    "fullstack-crud-project-01/backend-go/repositories"
)

func main() {
    config.ConnectDatabase()

	r := gin.Default()
    
    // --- Inisialisasi Dependency Injection ---
    productRepo := &repositories.ProductRepositoryImpl{}
    productService := &services.ProductService{Repo: productRepo}
    
    // Inisialisasi Handler dengan Service
    productHandler := handlers.NewProductHandler(productService)

	api := r.Group("/api")
	{
        // CREATE
		api.POST("/products", productHandler.CreateProductHandler)
        
        // READ ALL
        api.GET("/products", productHandler.ReadAllProductsHandler)
        
        // READ BY ID
        api.GET("/products/:id", productHandler.ReadProductByIDHandler)
        
        // UPDATE
        api.PUT("/products/:id", productHandler.UpdateProductHandler)
        
        // DELETE
        api.DELETE("/products/:id", productHandler.DeleteProductHandler)
	}

	r.Run(":8080")
}