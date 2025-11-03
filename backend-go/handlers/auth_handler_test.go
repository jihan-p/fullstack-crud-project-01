package handlers_test

import (
	"errors"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"fullstack-crud-project-01/backend-go/services"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"fullstack-crud-project-01/backend-go/handlers"
	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/utils"
)

// MockUserRepository is a mock for the services.UserRepository interface
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *models.User) error {
	args := m.Called(user)
	// Simulate setting the ID on creation
	user.ID = 1
	return args.Error(0)
}

func (m *MockUserRepository) FindByEmail(email string) (*models.User, error) {
	args := m.Called(email)
	if user, ok := args.Get(0).(*models.User); ok {
		return user, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockUserRepository) FindByID(id uint) (models.User, error) { return models.User{}, nil }
func (m *MockUserRepository) FindByResetToken(token string) (*models.User, error) { return nil, nil }
func (m *MockUserRepository) Update(user *models.User) error { return nil }
func (m *MockUserRepository) Delete(id uint) error { return nil }


func setupAuthRouter(mockRepo services.UserRepository) *gin.Engine {
	// 1. Inisialisasi Handler dengan Mock Repo
	authHandler := handlers.NewAuthHandler(mockRepo)
	
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
	mockRepo := new(MockUserRepository)
	// Expect FindByEmail to fail (user does not exist)
	mockRepo.On("FindByEmail", "test@register.com").Return(nil, errors.New("not found")).Once()
	// Expect Create to be called and succeed
	mockRepo.On("Create", mock.AnythingOfType("*models.User")).Return(nil).Once()
	
	r := setupAuthRouter(mockRepo)
	
	body := bytes.NewBufferString(`{"name":"Test User", "email":"test@register.com", "password":"password123"}`)
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", body)
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code) // Verifikasi 201 Created

	// Verify that the mock's expectations were met
	mockRepo.AssertExpectations(t)
}

func TestAuth_LoginUser_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	// Setup mock user data
	mockUser := &models.User{
		ID:           1,
		Name:         "Login User",
		Email:        "test@login.com",
		PasswordHash: "$2a$10$fakedhashfortestingpurposes", // A valid bcrypt hash structure
		IsActive:     true,
	}
	// Expect FindByEmail to be called and return the mock user
	mockRepo.On("FindByEmail", "test@login.com").Return(mockUser, nil).Once()

	// This is a trick: we can't easily test the real password check without the real password,
	// so for this unit test, we assume the password check utility works.
	// A more advanced test could mock the password check function itself.
	// For now, we just need a valid hash format.
	// Let's use a known hash for a known password.
	// Hash for "password123"
	mockUser.PasswordHash, _ = utils.HashPassword("password123")
	
	r := setupAuthRouter(mockRepo)
	
	body := bytes.NewBufferString(`{"email":"test@login.com", "password":"password123"}`)
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", body)
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response, "token")
	mockRepo.AssertExpectations(t)
}