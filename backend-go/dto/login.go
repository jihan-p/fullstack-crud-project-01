package dto

// LoginRequest adalah DTO untuk menerima kredensial login
type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}