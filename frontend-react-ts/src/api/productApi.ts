// src/api/productApi.ts

// HAPUS import axios yang tidak digunakan
import type { Product } from '../types/Product';

const API_BASE_URL = 'http://localhost:8080/api';

// --- SERVICE GET (READ ALL) ---
export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
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
export const createProduct = async (productData: Omit<Product, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'>): Promise<Product> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
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
export const deleteProduct = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error deleting product ID ${id}:`, error);
        throw error;
    }
};