package dto

// ActivationRequest defines the structure for the account activation payload.
type ActivationRequest struct {
	Token string `json:"token" binding:"required"`
}