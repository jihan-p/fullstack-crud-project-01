package main

import (
	"github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "fullstack-crud-project-01/backend-go/config"
    "fullstack-crud-project-01/backend-go/handlers"
    "fullstack-crud-project-01/backend-go/services"
    "fullstack-crud-project-01/backend-go/repositories"
)

func main() {
    config.ConnectDatabase()

	r := gin.Default()

    // --- KONFIGURASI CORS BARU ---
    r.Use(cors.New(cors.Config{
        // Izinkan semua request dari frontend React Anda
        AllowOrigins:     []string{"http://localhost:5173"}, 
        // Izinkan semua method yang diperlukan CRUD
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type"},
        // Izinkan kredensial (jika Anda menggunakan cookies/authentication)
        AllowCredentials: true,
        // Durasi cache untuk preflight request
        MaxAge: 3600, 
    }))
    
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