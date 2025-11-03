// src/api/productApi.ts

// HAPUS import axios yang tidak digunakan
import type { Product } from '../types/Product';

// Sesuaikan dengan routing backend yang sekarang menggunakan /v1
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Helper untuk membuat header autentikasi
const getAuthHeaders = (token: string, contentType: string = 'application/json') => {
    const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
    };
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
};

// --- SERVICE GET (READ ALL) ---
export const getAllProducts = async (token: string): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: getAuthHeaders(token)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

// --- SERVICE POST (CREATE) ---
type CreateProductData = {
    name: string;
    description: string;
    price: number;
};

export const createProduct = async (productData: CreateProductData, token: string): Promise<Product> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

// --- SERVICE PUT (UPDATE) ---
export const updateProduct = async (id: number, productData: Partial<Omit<Product, 'id'>>, token: string): Promise<Product> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error updating product ID ${id}:`, error);
        throw error;
    }
};

// --- SERVICE DELETE ---
export const deleteProduct = async (id: number, token: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error deleting product ID ${id}:`, error);
        throw error;
    }
};