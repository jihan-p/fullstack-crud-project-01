package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	
	"fullstack-crud-project-01/backend-go/config"
	"fullstack-crud-project-01/backend-go/middleware"
	"fullstack-crud-project-01/backend-go/handlers"
	"fullstack-crud-project-01/backend-go/services"
	"fullstack-crud-project-01/backend-go/repositories"
)

func main() {
	// Muat variabel lingkungan dari .env SEBELUM hal lain dilakukan
	config.LoadEnv()

	// 1. KONEKSI DATABASE
	// Inisialisasi koneksi ke database (mengatur variabel global config.DB)
	config.ConnectDatabase()
	db := config.DB // Gunakan variabel global yang sudah diinisialisasi
	if db == nil {
		log.Fatal("Gagal terhubung ke database. Cek konfigurasi.")
	}
	
	r := gin.Default()

	// --- KONFIGURASI CORS ---
	// Konfigurasi ini penting untuk mengizinkan frontend React (http://localhost:5173) mengakses API
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, // Tambahkan OPTIONS untuk CORS Preflight
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"}, // Tambahkan Authorization untuk JWT
		AllowCredentials: true,
		MaxAge:           3600,
	}))

	// --- Inisialisasi Dependencies (Repository, Service, Handler) ---

	// Inisialisasi Repository dengan koneksi DB
	productRepo := repositories.NewProductRepository(db)
	
	// Inisialisasi Service dengan Repository
	productService := services.NewProductService(productRepo)

	// Inisialisasi Handler dengan Service
	productHandler := handlers.NewProductHandler(productService)
	authHandler := handlers.AuthHandler{DB: db} 
	
	// Membuat grup route utama /api/v1
	api := r.Group("/api/v1")
	
	// ===================================
	// A. ROUTE PUBLIK (AUTENTIKASI)
	// ===================================
	auth := api.Group("/auth")
	{
		// Endpoint Pendaftaran (Register)
		auth.POST("/register", authHandler.RegisterUser) 
		
		// Endpoint Login
		auth.POST("/login", authHandler.LoginUser)
	}
	
	// ===================================
	// B. ROUTE TERLINDUNGI (CRUD PRODUK)
	// ===================================
	products := api.Group("/products")
	products.Use(middleware.AuthMiddleware()) // Melindungi semua route di dalam grup /products
	{
		products.POST("", productHandler.CreateProductHandler)
		products.GET("", productHandler.ReadAllProductsHandler)
		products.GET("/:id", productHandler.ReadProductByIDHandler)
		products.PUT("/:id", productHandler.UpdateProductHandler)
		products.DELETE("/:id", productHandler.DeleteProductHandler)
	}


	log.Println("Server berjalan di http://localhost:8080")
	r.Run(":8080")
}