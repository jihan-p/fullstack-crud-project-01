// frontend-react-ts/src/mocks/handlers.ts

import { http, HttpResponse } from 'msw';
import type { Product } from '../types/Product';
const API_BASE_URL = 'http://localhost:8080/api/v1';
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
    console.log('🎯 MSW: GET /products handler called');
    console.log('📦 MSW: mockProducts to return:', mockProducts);
    
    // FIX: Pastikan struktur response benar-benar sesuai dengan backend Go
    const response = { 
      data: mockProducts 
    };
    
    console.log('✅ MSW: Returning response:', response);
    return HttpResponse.json(response);
  }),

  // 2. CREATE PRODUCT (POST)
  http.post(`${API_BASE_URL}/products`, async ({ request }) => {
    console.log('🎯 MSW: POST /products handler called');
    const newProductData = await request.json() as Omit<Product, 'ID'>;
    
    const newProduct: Product = { 
      ID: nextId++, 
      name: newProductData.name,
      description: newProductData.description || '',
      price: newProductData.price
    };
    
    mockProducts.push(newProduct);
    console.log('✅ MSW: Product created, new mockProducts:', mockProducts);
    
    return HttpResponse.json({ data: newProduct }, { status: 201 });
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

    // FIX: Update produk dengan data baru
    mockProducts[productIndex] = { 
        ...mockProducts[productIndex], 
        ...updatedData 
    };
    
    console.log('✅ MSW: Product updated, new data:', mockProducts[productIndex]);
    
    return HttpResponse.json({ data: mockProducts[productIndex] });
  }),
];