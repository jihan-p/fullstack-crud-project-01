package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"fullstack-crud-project-01/backend-go/handlers"
	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/utils"
	"golang.org/x/crypto/bcrypt"
)

func setupAuthRouter() *gin.Engine {
	// 1. Inisialisasi Handler dengan DB Test
	authHandler := handlers.AuthHandler{DB: testDB}
	
	// 2. Setup Router
	r := gin.Default()
	api := r.Group("/api/v1")
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.RegisterUser)
		auth.POST("/login", authHandler.LoginUser)
	}
	return r
}

func TestAuth_RegisterUser_Success(t *testing.T) {
	// Setup: Hapus semua user
	testDB.Exec("DELETE FROM users")
	
	r := setupAuthRouter()
	
	body := bytes.NewBufferString(`{"name":"Test User", "email":"test@register.com", "password":"password123"}`)
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", body)
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code) // Verifikasi 201 Created

	// Verifikasi di database
	var user models.User
	err := testDB.Where("email = ?", "test@register.com").First(&user).Error
	assert.NoError(t, err)
	assert.Equal(t, "Test User", user.Name)
}

func TestAuth_LoginUser_Success(t *testing.T) {
	// Setup: Buat user yang sudah aktif (simulasi)
	testDB.Exec("DELETE FROM users")

	// 1. Buat User Fixture (dengan password ter-hash)
	password := "password123"
	hashedPassword, err := utils.HashPassword(password)
	assert.NoError(t, err)

	testDB.Create(&models.User{
		Name: "Login User", 
		Email: "test@login.com", 
		PasswordHash: hashedPassword,
		IsActive: true,
	}) 

	r := setupAuthRouter()
	
	body := bytes.NewBufferString(`{"email":"test@login.com", "password":"` + password + `"}`)
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", body)
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code) // Verifikasi 200 OK

	// 2. Verifikasi Body Respons (cek keberadaan token)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	
	assert.Contains(t, response, "token")
	assert.NotEmpty(t, response["token"])
}

func TestAuth_LoginUser_WrongPassword(t *testing.T) {
	// Setup
	testDB.Exec("DELETE FROM users")
	passwordHash, _ := bcrypt.GenerateFromPassword([]byte("correct_password"), bcrypt.DefaultCost)
	testDB.Create(&models.User{Email: "wrong@pass.com", PasswordHash: string(passwordHash), IsActive: true})

	r := setupAuthRouter()

	// Action
	body := bytes.NewBufferString(`{"email":"wrong@pass.com", "password":"wrong_password"}`)
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", body)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}