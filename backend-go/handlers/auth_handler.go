package handlers

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "gorm.io/gorm"

    "fullstack-crud-project-01/backend-go/models" // Ganti dengan path model Anda
    "fullstack-crud-project-01/backend-go/utils"  // Ganti dengan path utilitas Anda
    "fullstack-crud-project-01/backend-go/dto"   // Ganti dengan path DTO Anda
)

type AuthHandler struct {
    DB *gorm.DB
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
    var existingUser models.User
    if err := h.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
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
    if err := h.DB.Create(&newUser).Error; err != nil {
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
    var user models.User
    if err := h.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        // Gagal mencari user (atau email tidak ditemukan)
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