package handlers

import (
	"log"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"

    "fullstack-crud-project-01/backend-go/models" // Ganti dengan path model Anda
	"fullstack-crud-project-01/backend-go/utils" // Ganti dengan path utilitas Anda
	"fullstack-crud-project-01/backend-go/dto" // Ganti dengan path DTO Anda
	"fullstack-crud-project-01/backend-go/services"
)

type AuthHandler struct {
	UserRepo services.UserRepository
}

func NewAuthHandler(userRepo services.UserRepository) *AuthHandler {
	return &AuthHandler{UserRepo: userRepo}
}

// RegisterUser menghandle proses pendaftaran pengguna baru
func (h *AuthHandler) RegisterUser(c *gin.Context) {
    var req dto.RegisterRequest
    
    // 1. Binding & Validasi
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Permintaan tidak valid", "details": err.Error()})
        return
    }

    // 2. Cek Duplikasi Email
    if _, err := h.UserRepo.FindByEmail(req.Email); err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar."})
        return
    }

    // 3. Hash Password
    passwordHash, err := utils.HashPassword(req.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password."})
        return
    }

    // 4. Buat Token Aktivasi
    activationToken := uuid.NewString()

    newUser := models.User{
        Email:    req.Email,
        PasswordHash: passwordHash,
        Name:     req.Name,
        IsActive: false, // Wajib FALSE
        ActivationToken: &activationToken,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    // 5. Simpan User
    if err := h.UserRepo.Create(&newUser); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan user ke database."})
        return
    }

    // 6. Kirim Email (SIMULASI - Ganti dengan logika kirim email sesungguhnya)
    // Di sini Anda akan memanggil layanan email Anda untuk mengirim link:
    // Contoh link: http://localhost:3000/activate?token=activationToken
    
    c.JSON(http.StatusCreated, gin.H{
        "message": "Pendaftaran berhasil. Silakan cek email Anda untuk aktivasi akun.",
        "user_id": newUser.ID,
    })
}

// LoginUser menghandle proses login pengguna
func (h *AuthHandler) LoginUser(c *gin.Context) {
    var req dto.LoginRequest // Anda perlu membuat struct ini
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Permintaan tidak valid"})
        return
    }

    // 1. Cari User berdasarkan Email
	user, err := h.UserRepo.FindByEmail(req.Email)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid."})
        return
    }

    // 2. Verifikasi Password
    if err := utils.CheckPasswordHash(user.PasswordHash, req.Password); err != nil {
        // Password tidak cocok
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid."})
        return
    }
    
    // 3. Cek Status Aktif (Penting!)
    if !user.IsActive {
        c.JSON(http.StatusForbidden, gin.H{"error": "Akun belum diaktifkan. Silakan cek email Anda."})
        return
    }

    // 4. Buat JWT
    token, err := utils.GenerateToken(user.ID, user.Email) // Asumsikan utilitas sudah dibuat
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token otentikasi."})
        return
    }

    // 5. Response Sukses
    c.JSON(http.StatusOK, gin.H{
        "message": "Login berhasil!",
        "token":   token,
        "user_id": user.ID,
        "name": user.Name,
    })
}

// ForgotPassword menghandle permintaan untuk mereset password.
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
    var req dto.ForgotPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Email tidak valid"})
        return
    }

    // 1. Cari user berdasarkan email
	user, err := h.UserRepo.FindByEmail(req.Email)
    if err != nil {
        // Cukup kirim respons sukses seolah-olah email terkirim.
        c.JSON(http.StatusOK, gin.H{"message": "Jika email terdaftar, link reset password telah dikirim."})
        return
    }

    // 2. Buat token reset dan waktu kedaluwarsa (misal: 15 menit)
    resetToken := uuid.NewString()
    expiryTime := time.Now().Add(15 * time.Minute)

    user.ResetToken = &resetToken
    user.ResetTokenExpiry = &expiryTime

    // 3. Simpan token ke database
    if err := h.UserRepo.Update(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses permintaan."})
        return
    }

    // 4. Kirim email (SIMULASI)
    // Kirim email ke user.Email dengan link: http://localhost:5173/reset-password?token=resetToken
    log.Printf("SIMULASI: Mengirim email reset ke %s dengan token %s", user.Email, resetToken)

    c.JSON(http.StatusOK, gin.H{"message": "Jika email terdaftar, link reset password telah dikirim."})
}

// ResetPassword menghandle proses penggantian password baru menggunakan token.
func (h *AuthHandler) ResetPassword(c *gin.Context) {
    var req dto.ResetPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid", "details": err.Error()})
        return
    }

    // 1. Cari user berdasarkan token reset
	user, err := h.UserRepo.FindByResetToken(req.Token)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Token tidak valid atau sudah kedaluwarsa."})
        return
    }

    // 2. Cek apakah token sudah kedaluwarsa
    if user.ResetTokenExpiry == nil || time.Now().After(*user.ResetTokenExpiry) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Token tidak valid atau sudah kedaluwarsa."})
        return
    }

    // 3. Hash password baru
    newPasswordHash, err := utils.HashPassword(req.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password baru."})
        return
    }

    // 4. Update password dan hapus token dari database
    user.PasswordHash = newPasswordHash
    user.ResetToken = nil       // Hapus token setelah digunakan
    user.ResetTokenExpiry = nil // Hapus waktu kedaluwarsa

	h.UserRepo.Update(user)

    c.JSON(http.StatusOK, gin.H{"message": "Password berhasil direset. Silakan login dengan password baru Anda."})
}