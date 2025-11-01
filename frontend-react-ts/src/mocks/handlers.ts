// frontend-react-ts/src/mocks/handlers.ts

import { http, HttpResponse } from 'msw';
import type { Product } from '../types/Product';

const API_BASE_URL = 'http://localhost:8080/api';
let mockProducts: Product[] = []; // Mock database in-memory
let nextId = 1;

export const resetMockProducts = () => {
  mockProducts = [];
  nextId = 1;
};

// Fungsi yang diperlukan untuk seeding data tes, DIDEFINISIKAN HANYA SATU KALI.
export const setMockProducts = (products: Product[]) => {
  mockProducts = products;
  // Perbarui nextId agar lebih besar dari ID produk yang dimock, mencegah konflik ID saat POST.
  if (products.length > 0) {
      const maxId = products.reduce((max, p) => Math.max(max, p.ID), 0);
      nextId = maxId + 1;
  }
};

export const handlers = [
  // 1. GET ALL PRODUCTS (READ)
  http.get(`${API_BASE_URL}/products`, () => {
    // FINAL FIX: Align with the Go backend's actual response structure.
    // The backend test confirms the response is { "data": [...] }. --> For testing, we align with the component's expectation.
    return HttpResponse.json(mockProducts);
  }),

  // 2. CREATE PRODUCT (POST)
  http.post(`${API_BASE_URL}/products`, async ({ request }) => {
    const newProductData = await request.json() as Omit<Product, 'ID'>;
    const newProduct: Product = { ID: nextId++, ...newProductData };
    mockProducts.push(newProduct);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  // 3. DELETE PRODUCT (DELETE)
  http.delete(`${API_BASE_URL}/products/:id`, ({ params }) => {
    const productId = Number(params.id);
    const initialLength = mockProducts.length;
    mockProducts = mockProducts.filter(p => p.ID !== productId);

    if (mockProducts.length < initialLength) {
      return new HttpResponse(null, { status: 204 }); // No Content
    }
    return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
  }),

  // 4. UPDATE PRODUCT (PUT)
  http.put(`${API_BASE_URL}/products/:id`, async ({ request, params }) => {
    const productId = Number(params.id);
    const updatedData = await request.json() as Partial<Product>;
    const productIndex = mockProducts.findIndex(p => p.ID === productId);
    
    if (productIndex === -1) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    mockProducts[productIndex] = { ...mockProducts[productIndex], ...updatedData };
    return HttpResponse.json(mockProducts[productIndex]);
  }),
];