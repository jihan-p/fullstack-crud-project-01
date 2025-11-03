// src/types/Product.ts

// Definisikan tipe data untuk sebuah produk.
// Perhatikan bahwa properti disesuaikan dengan output JSON dari backend Go.
export interface Product {
    id: number; // <-- Menggunakan 'id' (lowercase) agar cocok dengan JSON tag `json:"id"`
    name: string;
    description: string;
    price: number;
    created_at?: string; // Opsional, tergantung kebutuhan UI
    updated_at?: string; // Opsional, tergantung kebutuhan UI
}