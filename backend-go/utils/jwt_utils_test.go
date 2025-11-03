package utils_test

import (
	"os"
	"testing"

	"fullstack-crud-project-01/backend-go/utils"
	"github.com/stretchr/testify/assert"
)

func TestGenerateAndValidateToken(t *testing.T) {
	// Setup: Set a secret key for testing
	os.Setenv("JWT_SECRET_KEY", "my-super-secret-key-for-testing")
	defer os.Unsetenv("JWT_SECRET_KEY") // Cleanup

	userID := uint(123)
	email := "test@example.com"

	// 1. Test Token Generation
	tokenString, err := utils.GenerateToken(userID, email)
	assert.NoError(t, err, "Token generation should not produce an error")
	assert.NotEmpty(t, tokenString, "Generated token string should not be empty")

	// 2. Test Token Validation (Success)
	claims, err := utils.ValidateToken(tokenString)
	assert.NoError(t, err, "Token validation should not produce an error for a valid token")
	assert.NotNil(t, claims, "Claims should not be nil for a valid token")
	assert.Equal(t, userID, claims.UserID, "User ID in claims should match the original")
	assert.Equal(t, email, claims.Email, "Email in claims should match the original")

	// 3. Test Token Validation (Failure - Invalid Token)
	invalidTokenString := tokenString + "invalid-part"
	_, err = utils.ValidateToken(invalidTokenString)
	assert.Error(t, err, "Validation should fail for an invalid token signature")

	// 4. Test with empty secret
	os.Unsetenv("JWT_SECRET_KEY")
	_, err = utils.GenerateToken(userID, email)
	assert.Error(t, err, "Generation should fail if JWT_SECRET_KEY is not set")
}