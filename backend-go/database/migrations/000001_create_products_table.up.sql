-- database/migrations/000001_create_products_table.up.sql

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    deleted_at DATETIME NULL
);

-- Opsional: Tambahkan index untuk pencarian nama produk yang lebih cepat
CREATE INDEX idx_products_name ON products (name);