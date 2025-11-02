// dto/register.go (Data Transfer Object)
package dto

type RegisterRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=8"` // Enforce minimum length
    Name     string `json:"name"`
}