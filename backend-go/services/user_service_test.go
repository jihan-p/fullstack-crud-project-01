package services_test

import (
	"errors"
	"testing"

	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/services"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserRepository is a mock implementation of the UserRepository interface.
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *models.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) FindByEmail(email string) (*models.User, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) FindByID(id uint) (models.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return models.User{}, args.Error(1)
	}
	user := args.Get(0).(models.User)
	return user, args.Error(1)
}

func (m *MockUserRepository) FindByResetToken(token string) (*models.User, error) {
	args := m.Called(token)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) Update(user *models.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockUserRepository) FindAll(offset int, limit int, search string) ([]models.User, int64, error) {
	args := m.Called(offset, limit, search)
	if users, ok := args.Get(0).([]models.User); ok {
		return users, args.Get(1).(int64), args.Error(2)
	}
	// Return empty slice and 0 if the mock is not configured for a specific call
	return []models.User{}, 0, args.Error(2)
}

func TestUserService_UpdateUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	userService := services.NewUserService(mockRepo)

	t.Run("Success", func(t *testing.T) {
		userToUpdate := &models.User{ID: 1, Name: "New Name", Email: "new@example.com"}
		originalUser := models.User{ID: 1, Name: "Old Name", Email: "old@example.com", PasswordHash: "original_hash"}

		// Setup expectations
		// 1. Check for duplicate email (finds no other user)
		mockRepo.On("FindByEmail", userToUpdate.Email).Return(nil, errors.New("not found")).Once()
		// 2. Get original user to preserve password
		mockRepo.On("FindByID", userToUpdate.ID).Return(originalUser, nil).Once()
		// 3. Call update
		mockRepo.On("Update", userToUpdate).Return(nil).Once()

		// Call the method
		err := userService.UpdateUser(userToUpdate)

		// Assertions
		assert.NoError(t, err)
		assert.Equal(t, "original_hash", userToUpdate.PasswordHash, "Password hash should be preserved")
		mockRepo.AssertExpectations(t)
	})

	t.Run("Failure_DuplicateEmail", func(t *testing.T) {
		userToUpdate := &models.User{ID: 1, Name: "Any Name", Email: "taken@example.com"}
		otherUser := &models.User{ID: 2, Name: "Other User", Email: "taken@example.com"}

		// Setup expectations
		mockRepo.On("FindByEmail", userToUpdate.Email).Return(otherUser, nil).Once()

		// Call the method
		err := userService.UpdateUser(userToUpdate)

		// Assertions
		assert.Error(t, err)
		assert.Equal(t, services.ErrEmailExists, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Failure_InvalidData_EmptyName", func(t *testing.T) {
		userToUpdate := &models.User{ID: 1, Name: "", Email: "valid@email.com"}

		// Call the method
		err := userService.UpdateUser(userToUpdate)

		// Assertions
		assert.Error(t, err)
		assert.Equal(t, "user name cannot be empty", err.Error())
	})
}

func TestUserService_ReadUserByID(t *testing.T) {
	mockRepo := new(MockUserRepository)
	userService := services.NewUserService(mockRepo)
	userID := uint(1)
	expectedUser := models.User{ID: userID, Name: "Test User", Email: "test@example.com"}

	mockRepo.On("FindByID", userID).Return(expectedUser, nil).Once()

	user, err := userService.ReadUserByID(userID)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, expectedUser.Name, user.Name)
	mockRepo.AssertExpectations(t)
}

func TestUserService_DeleteUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	userService := services.NewUserService(mockRepo)
	userID := uint(1)

	mockRepo.On("Delete", userID).Return(nil).Once()

	err := userService.DeleteUser(userID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}