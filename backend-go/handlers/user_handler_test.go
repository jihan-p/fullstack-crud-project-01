package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"fullstack-crud-project-01/backend-go/handlers"
	"fullstack-crud-project-01/backend-go/middleware"
	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/repositories"
	"fullstack-crud-project-01/backend-go/services"
	"fullstack-crud-project-01/backend-go/utils"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupUserRouter() (*gin.Engine, *models.User, string) {
	// Setup a user and a valid token for testing protected routes
	testDB.Exec("DELETE FROM users")
	user := &models.User{
		Name:         "Test User",
		Email:        "test@handler.com",
		PasswordHash: "some_hash",
		Role:         "user", // Explicitly set role for test user
		IsActive:     true,
	}
	testDB.Create(user)

	token, _ := utils.GenerateToken(user.ID, user.Email, user.Role) // Add role to token generation

	// Setup DI
	userRepo := repositories.NewUserRepository(testDB)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	// Setup Router
	r := gin.Default()
	userProfile := r.Group("/api/v1/users/me")
	userProfile.Use(middleware.AuthMiddleware())
	{
		userProfile.GET("", userHandler.ReadUserHandler)
		userProfile.PUT("", userHandler.UpdateUserHandler)
		userProfile.DELETE("", userHandler.DeleteUserHandler)
	}

	return r, user, token
}

func TestUserHandler_ReadUser_Success(t *testing.T) {
	router, user, token := setupUserRouter()

	req, _ := http.NewRequest("GET", "/api/v1/users/me", nil) // Corrected endpoint
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]models.User
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, user.Name, response["data"].Name)
	assert.Equal(t, user.Email, response["data"].Email)
	assert.Empty(t, response["data"].PasswordHash, "Password hash should not be in the response")
}

func TestUserHandler_ReadUser_NoToken(t *testing.T) {
	router, _, _ := setupUserRouter()

	req, _ := http.NewRequest("GET", "/api/v1/users/me", nil) // Corrected endpoint
	// No Authorization header

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestUserHandler_UpdateUser_Success(t *testing.T) {
	router, user, token := setupUserRouter()

	updatePayload := `{"Name": "Updated Name", "Email": "updated@handler.com"}`
	req, _ := http.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(updatePayload)) // Corrected endpoint
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Verify in DB
	var updatedUser models.User
	testDB.First(&updatedUser, user.ID)
	assert.Equal(t, "Updated Name", updatedUser.Name)
	assert.Equal(t, "updated@handler.com", updatedUser.Email)
}

func TestUserHandler_UpdateUser_ValidationError(t *testing.T) {
	router, _, token := setupUserRouter()

	// Invalid payload (empty email)
	updatePayload := `{"Name": "New Name", "Email": ""}`
	req, _ := http.NewRequest("PUT", "/api/v1/users/me", bytes.NewBufferString(updatePayload)) // Corrected endpoint
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUserHandler_DeleteUser_Success(t *testing.T) {
	router, user, token := setupUserRouter()

	req, _ := http.NewRequest("DELETE", "/api/v1/users/me", nil) // Corrected endpoint
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code) // Note: Handler returns 200 OK with a message

	// Verify in DB
	var deletedUser models.User
	err := testDB.First(&deletedUser, user.ID).Error
	assert.Error(t, err) // Should be gorm.ErrRecordNotFound
}