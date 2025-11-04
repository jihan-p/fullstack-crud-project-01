package repositories_test

import (
	"testing"
	"fmt"

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

func TestUserRepository_FindAll(t *testing.T) {
	setupUserTest(t)
	repo := repositories.NewUserRepository(testDB)

	// --- Setup: Create a set of users for testing ---
	// Create 12 users to test pagination and search
	for i := 1; i <= 12; i++ {
		name := fmt.Sprintf("User %d", i)
		email := fmt.Sprintf("user%d@test.com", i)
		if i == 5 {
			name = "Alice Special"
			email = "alice.special@test.com"
		}
		if i == 10 {
			name = "Bob Tester"
			email = "bob.tester@test.com"
		}
		err := repo.Create(&models.User{Name: name, Email: email, PasswordHash: "hash"})
		assert.NoError(t, err)
	}

	t.Run("Pagination - First Page", func(t *testing.T) {
		users, total, err := repo.FindAll(0, 5, "") // offset 0, limit 5
		assert.NoError(t, err)
		assert.Len(t, users, 5, "Should return 5 users for the first page")
		assert.Equal(t, int64(12), total, "Total count should be 12")
		assert.Equal(t, "User 1", users[0].Name)
	})

	t.Run("Pagination - Second Page", func(t *testing.T) {
		users, total, err := repo.FindAll(5, 5, "") // offset 5, limit 5
		assert.NoError(t, err)
		assert.Len(t, users, 5, "Should return 5 users for the second page")
		assert.Equal(t, int64(12), total, "Total count should be 12")
		assert.Equal(t, "User 6", users[0].Name)
	})

	t.Run("Pagination - Last Page (Partial)", func(t *testing.T) {
		users, total, err := repo.FindAll(10, 5, "") // offset 10, limit 5
		assert.NoError(t, err)
		assert.Len(t, users, 2, "Should return the remaining 2 users")
		assert.Equal(t, int64(12), total, "Total count should still be 12")
		assert.Equal(t, "User 11", users[0].Name)
	})

	t.Run("Search - by Name (case-insensitive)", func(t *testing.T) {
		users, total, err := repo.FindAll(0, 10, "alice special")
		assert.NoError(t, err)
		assert.Len(t, users, 1, "Should find one user named Alice")
		assert.Equal(t, int64(1), total, "Total count should be 1 for the search term")
		assert.Equal(t, "Alice Special", users[0].Name)
	})

	t.Run("Search - by Email", func(t *testing.T) {
		users, total, err := repo.FindAll(0, 10, "bob.tester@test.com")
		assert.NoError(t, err)
		assert.Len(t, users, 1, "Should find one user by email")
		assert.Equal(t, int64(1), total, "Total count should be 1 for the search term")
		assert.Equal(t, "Bob Tester", users[0].Name)
	})

	t.Run("Search - No Results", func(t *testing.T) {
		users, total, err := repo.FindAll(0, 10, "nonexistent")
		assert.NoError(t, err)
		assert.Len(t, users, 0, "Should return no users")
		assert.Equal(t, int64(0), total, "Total count should be 0")
	})
}