// src/api/productApi.ts

import type { Product } from '../types/Product';
import { fetchWithAuth } from './apiUtils'; // Re-use fungsi fetchWithAuth

// --- SERVICE GET (READ ALL) ---
export const getAllProducts = async (token: string): Promise<Product[]> => {
    try {
        const data = await fetchWithAuth('/products', { method: 'GET' }, token); // Menggunakan fetchWithAuth
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
        const data = await fetchWithAuth('/products', { // Menggunakan fetchWithAuth
            method: 'POST',
            body: JSON.stringify(productData)
        }, token);
        return data.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

// --- SERVICE PUT (UPDATE) ---
export const updateProduct = async (id: number, productData: Partial<Omit<Product, 'id'>>, token: string): Promise<Product> => {
    try {
        const data = await fetchWithAuth(`/products/${id}`, { // Menggunakan fetchWithAuth
            method: 'PUT',
            body: JSON.stringify(productData)
        }, token);
        return data.data;
    } catch (error) {
        console.error(`Error updating product ID ${id}:`, error);
        throw error;
    }
};

// --- SERVICE DELETE ---
export const deleteProduct = async (id: number, token: string): Promise<void> => {
    try {
        await fetchWithAuth(`/products/${id}`, { // Menggunakan fetchWithAuth
            method: 'DELETE',
        }, token);
    } catch (error) {
        console.error(`Error deleting product ID ${id}:`, error);
        throw error;
    }
};