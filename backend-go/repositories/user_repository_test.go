package repositories_test

import (
	"testing"

	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/repositories"
	"github.com/stretchr/testify/assert"
)

// setupUserTest cleans the users table before each test.
func setupUserTest(t *testing.T) {
	testDB.Exec("DELETE FROM users")
	testDB.Exec("ALTER TABLE users AUTO_INCREMENT = 1")
}

func TestUserRepository_CreateAndFind(t *testing.T) {
	setupUserTest(t)
	repo := repositories.NewUserRepository(testDB)

	user := &models.User{
		Name:         "John Doe",
		Email:        "john.doe@example.com",
		PasswordHash: "hashed_password",
		IsActive:     true,
	}

	// 1. Test Create
	err := repo.Create(user)
	assert.NoError(t, err)
	assert.NotEqual(t, uint(0), user.ID, "User ID should be set after creation")

	// 2. Test FindByID
	foundByID, err := repo.FindByID(user.ID)
	assert.NoError(t, err)
	assert.Equal(t, user.Name, foundByID.Name)
	assert.Equal(t, user.Email, foundByID.Email)
	assert.Empty(t, foundByID.PasswordHash, "Password hash should be omitted")

	// 3. Test FindByEmail
	foundByEmail, err := repo.FindByEmail(user.Email)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, foundByEmail.ID)
	assert.Equal(t, user.Name, foundByEmail.Name)
}

func TestUserRepository_Update(t *testing.T) {
	setupUserTest(t)
	repo := repositories.NewUserRepository(testDB)

	// Create initial user
	user := &models.User{Name: "Old Name", Email: "update@test.com", PasswordHash: "old_hash"}
	err := repo.Create(user)
	assert.NoError(t, err)

	// Update data
	user.Name = "New Name"
	user.PasswordHash = "new_hash"
	err = repo.Update(user)
	assert.NoError(t, err)

	// Verify update
	updatedUser, err := repo.FindByID(user.ID)
	assert.NoError(t, err)
	assert.Equal(t, "New Name", updatedUser.Name)

	// Verify password hash was updated by checking it directly
	var checkUser models.User
	testDB.First(&checkUser, user.ID)
	assert.Equal(t, "new_hash", checkUser.PasswordHash)
}

func TestUserRepository_Delete(t *testing.T) {
	setupUserTest(t)
	repo := repositories.NewUserRepository(testDB)

	// Create initial user
	user := &models.User{Name: "To Delete", Email: "delete@test.com", PasswordHash: "hash"}
	err := repo.Create(user)
	assert.NoError(t, err)

	// Delete user
	err = repo.Delete(user.ID)
	assert.NoError(t, err)

	// Verify deletion
	_, err = repo.FindByID(user.ID)
	assert.Error(t, err, "Expected an error when finding a deleted user")
	assert.Contains(t, err.Error(), "record not found")
}

func TestUserRepository_FindByEmail_NotFound(t *testing.T) {
	setupUserTest(t)
	repo := repositories.NewUserRepository(testDB)

	_, err := repo.FindByEmail("nonexistent@email.com")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "record not found")
}