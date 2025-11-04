package repositories

import (
	"fullstack-crud-project-01/backend-go/models"
	"fullstack-crud-project-01/backend-go/services" // Import services to get the interface definition
	"gorm.io/gorm"
)

// userRepositoryImpl is the implementation of UserRepository.
type userRepositoryImpl struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository.
func NewUserRepository(db *gorm.DB) services.UserRepository { // Returns the interface from the services package
	return &userRepositoryImpl{db: db}
}

// Create saves a new user to the database.
func (r *userRepositoryImpl) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByEmail retrieves a user by their email address.
func (r *userRepositoryImpl) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

// FindByID retrieves a user by their ID.
func (r *userRepositoryImpl) FindByID(id uint) (models.User, error) {
	var user models.User
	// Menggunakan Omit("password_hash") agar password tidak pernah dikirim keluar dari DB
	err := r.db.Omit("password_hash").First(&user, id).Error
	return user, err
}

// FindAll retrieves a paginated and searchable list of users.
func (r *userRepositoryImpl) FindAll(offset int, limit int, search string) ([]models.User, int64, error) {
	var users []models.User
	var total int64
	
	// 1. Build the base query
	query := r.db.Model(&models.User{})
	
	// 2. Apply search filter if a search term is provided
	if search != "" {
		searchQuery := "%" + search + "%"
		// Use LOWER() for case-insensitive search, which is compatible with MySQL and other databases.
		// PostgreSQL's ILIKE is not universally supported.
		query = query.Where("LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)", searchQuery, searchQuery)
	}
	
	// 3. Get the total count of records matching the search (before applying limit/offset)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// 4. Get the paginated data, omitting the password hash for security
	err := query.Omit("password_hash").Offset(offset).Limit(limit).Find(&users).Error
	return users, total, err
}

// FindByResetToken retrieves a user by their reset token.
func (r *userRepositoryImpl) FindByResetToken(token string) (*models.User, error) {
	var user models.User
	// Pastikan token tidak NULL dan cocok
	err := r.db.Where("reset_token = ?", token).First(&user).Error
	return &user, err
}

// Update modifies an existing user's data in the database.
func (r *userRepositoryImpl) Update(user *models.User) error {
	// Menggunakan Save untuk memastikan semua field (termasuk yang pointer) diupdate
	return r.db.Save(user).Error
}

// Delete removes a user from the database by their ID.
func (r *userRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}