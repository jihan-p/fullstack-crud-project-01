package services

import (
	"errors"
	"fullstack-crud-project-01/backend-go/models"
)

// Custom errors for user service
var (
	ErrUserNotFound    = errors.New("user not found")
	ErrEmailExists     = errors.New("email already in use by another user")
	ErrUpdateForbidden = errors.New("user can only update their own data")
)

// UserService defines the business logic for user operations.
type UserService interface {
	ReadUserByID(id uint) (models.User, error)
	UpdateUser(user *models.User) error
	DeleteUser(id uint) error
	FindAll(offset int, limit int, search string) ([]models.User, int64, error)
}

// UserRepository defines the database operations for a user.
type UserRepository interface {
	Create(user *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindByID(id uint) (models.User, error)
	FindByResetToken(token string) (*models.User, error)
	Update(user *models.User) error
	Delete(id uint) error
	FindAll(offset int, limit int, search string) ([]models.User, int64, error)
}

type userServiceImpl struct {
	userRepo UserRepository
}

// NewUserService creates a new user service.
func NewUserService(repo UserRepository) UserService {
	return &userServiceImpl{userRepo: repo}
}

// ReadUserByID retrieves a user by their ID.
func (s *userServiceImpl) ReadUserByID(id uint) (models.User, error) {
	return s.userRepo.FindByID(id)
}

// UpdateUser validates and updates a user's information.
func (s *userServiceImpl) UpdateUser(user *models.User) error {
	// 1. Basic validation
	if user.Name == "" {
		return errors.New("user name cannot be empty")
	}
	if user.Email == "" {
		return errors.New("user email cannot be empty")
	}

	// 2. Check if the new email is already taken by another user
	existingUser, err := s.userRepo.FindByEmail(user.Email)
	if err == nil && existingUser.ID != user.ID {
		// Email exists and belongs to another user
		return ErrEmailExists
	}

	// 3. Get the original user to preserve the password hash if it's not being updated
	originalUser, err := s.userRepo.FindByID(user.ID)
	if err != nil {
		return ErrUserNotFound
	}
	user.PasswordHash = originalUser.PasswordHash // Preserve original password hash

	return s.userRepo.Update(user)
}

// DeleteUser removes a user by their ID.
func (s *userServiceImpl) DeleteUser(id uint) error {
	return s.userRepo.Delete(id)
}

// FindAll retrieves a paginated and searchable list of users.
func (s *userServiceImpl) FindAll(offset int, limit int, search string) ([]models.User, int64, error) {
	return s.userRepo.FindAll(offset, limit, search)
}