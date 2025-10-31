// src/api/productApi.ts

import axios from 'axios';
import type { Product } from '../types/Product';

// URL dasar API Go Anda
const API_BASE_URL = 'http://localhost:8080/api';

// --- SERVICE GET (READ ALL) ---
export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get<{ data: Product[] }>(`${API_BASE_URL}/products`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

// --- SERVICE POST (CREATE) ---
export const createProduct = async (productData: Omit<Product, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'>): Promise<Product> => {
    try {
        const response = await axios.post<{ data: Product }>(`${API_BASE_URL}/products`, productData);
        return response.data.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

// --- SERVICE PUT (UPDATE) ---
export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
    try {
        const response = await axios.put<{ data: Product }>(`${API_BASE_URL}/products/${id}`, productData);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating product ID ${id}:`, error);
        throw error;
    }
};

// --- SERVICE DELETE ---
export const deleteProduct = async (id: number): Promise<void> => {
    try {
        // Go backend mengembalikan status 204 No Content untuk delete
        await axios.delete(`${API_BASE_URL}/products/${id}`);
    } catch (error) {
        console.error(`Error deleting product ID ${id}:`, error);
        throw error;
    }
};