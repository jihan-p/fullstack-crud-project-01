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

// Tambahkan update dan delete di sini nanti (Fase 4.2)