// frontend-react-ts/src/mocks/handlers.ts

import { rest } from 'msw';
import type { Product } from '../types/Product';

const API_BASE_URL = 'http://localhost:8080/api';
let mockProducts: Product[] = []; // Mock database in-memory
let nextId = 1;

export const resetMockProducts = () => {
  mockProducts = [];
  nextId = 1;
};

export const handlers = [
  // 1. GET ALL PRODUCTS (READ)
  rest.get(`${API_BASE_URL}/products`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockProducts }));
  }),

  // 2. CREATE PRODUCT (POST)
  rest.post(`${API_BASE_URL}/products`, async (req, res, ctx) => {
    const newProductData = await req.json();
    const newProduct: Product = { ID: nextId++, ...newProductData };
    mockProducts.push(newProduct);
    return res(ctx.status(201), ctx.json({ data: newProduct }));
  }),

  // 3. DELETE PRODUCT (DELETE)
  rest.delete(`${API_BASE_URL}/products/:id`, (req, res, ctx) => {
    const productId = Number(req.params.id);
    mockProducts = mockProducts.filter(p => p.ID !== productId);
    return res(ctx.status(204)); 
  }),

  // 4. UPDATE PRODUCT (PUT)
  rest.put(`${API_BASE_URL}/products/:id`, async (req, res, ctx) => {
    const productId = Number(req.params.id);
    const updatedData = await req.json();
    const productIndex = mockProducts.findIndex(p => p.ID === productId);
    
    if (productIndex === -1) return res(ctx.status(404));

    mockProducts[productIndex] = { ...mockProducts[productIndex], ...updatedData };
    return res(ctx.status(200), ctx.json({ data: mockProducts[productIndex] }));
  }),
];