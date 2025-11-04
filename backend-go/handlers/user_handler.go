package handlers

import (
	"strconv"
	"net/http"

	"errors"
	"fullstack-crud-project-01/backend-go/middleware"
	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UserHandler handles HTTP requests for user operations.
type UserHandler struct {
	UserService services.UserService
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(svc services.UserService) *UserHandler {
	return &UserHandler{UserService: svc}
}

// ReadUserHandler handles GET /users/me
func (h *UserHandler) ReadUserHandler(c *gin.Context) {
	// Ambil User ID dari JWT yang disisipkan oleh middleware
	userID, exists := c.Get(middleware.UserKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	user, err := h.UserService.ReadUserByID(userID.(uint))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}
	// Karena Repository sudah Omit("password_hash"), kita bisa langsung merespons
	c.JSON(http.StatusOK, gin.H{"data": user})
}

// UpdateUserHandler handles PUT /users/me
func (h *UserHandler) UpdateUserHandler(c *gin.Context) {
	userID, exists := c.Get(middleware.UserKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	var req models.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	// Ensure the ID from the token is used, not from the request body
	req.ID = userID.(uint)

	err := h.UserService.UpdateUser(&req)
	if err != nil {
		// Check for specific validation errors from the service
		if errors.Is(err, services.ErrEmailExists) || err.Error() == "user name cannot be empty" || err.Error() == "user email cannot be empty" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Check for not found error
		if errors.Is(err, services.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		// Fallback for other errors
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user", "details": err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// UpdateUserByIDHandler handles PUT /users/:id (for admins)
func (h *UserHandler) UpdateUserByIDHandler(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req models.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	// Ensure the ID from the URL is used, not from the request body
	req.ID = uint(userID)

	err = h.UserService.UpdateUser(&req)
	if err != nil {
		if errors.Is(err, services.ErrEmailExists) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// DeleteUserHandler handles DELETE /users/me (deleting own account)
func (h *UserHandler) DeleteUserHandler(c *gin.Context) {
	userID, exists := c.Get(middleware.UserKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	err := h.UserService.DeleteUser(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// DeleteUserByIDHandler handles DELETE /users/:id (for admins)
func (h *UserHandler) DeleteUserByIDHandler(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	err = h.UserService.DeleteUser(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// ReadAllUsersHandler handles GET /users for listing all users with pagination and search.
func (h *UserHandler) ReadAllUsersHandler(c *gin.Context) {
	// 1. Parse query parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.DefaultQuery("search", "")

	page, errPage := strconv.Atoi(pageStr)
	limit, errLimit := strconv.Atoi(limitStr)
	if errPage != nil || errLimit != nil || page < 1 || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pagination parameters"})
		return
	}

	offset := (page - 1) * limit

	// 2. Call the service to get users
	users, total, err := h.UserService.FindAll(offset, limit, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	// 3. Respond with data and pagination metadata
	c.JSON(http.StatusOK, gin.H{
		"data": users,
		"meta": gin.H{"total": total, "page": page, "limit": limit},
	})
}