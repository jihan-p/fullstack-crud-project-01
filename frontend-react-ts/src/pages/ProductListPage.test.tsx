// src/pages/ProductListPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import ProductListPage from './ProductListPage';

const API_BASE_URL = 'http://localhost:8080/api';

// Reset handler sebelum setiap pengujian untuk memastikan independensi
beforeEach(() => server.resetHandlers());

// Mock data awal untuk pengujian UPDATE dan DELETE
const mockInitialProduct = { ID: 1, name: 'Laptop Awal', description: 'Deskripsi Awal', price: 12000000 };

describe('ProductListPage Integration Test (Full CRUD)', () => {
    // 1. Uji Coba READ (Ambil Data)
    test('should fetch and display products on initial load', async () => {
        // Tambahkan produk dummy awal ke mock database
        server.use(
            http.get(`${API_BASE_URL}/products`, () => {
                return HttpResponse.json({
                    data: [{ ID: 100, name: 'Dummy Item', description: 'Test', price: 100000 }],
                });
            })
        );

        render(<ProductListPage />);
        
        // Verifikasi loading state muncul
        expect(screen.getByText(/memuat data.../i)).toBeInTheDocument();

        // Tunggu hingga data muncul
        await waitFor(() => {
            expect(screen.queryByText(/memuat data.../i)).not.toBeInTheDocument();
            expect(screen.getByText(/dummy item/i)).toBeInTheDocument();
            expect(screen.getByText(/rp100\.000/i)).toBeInTheDocument();
        });
    });
    
    // 2. Uji Coba CREATE (Buat Data)
    test('should create a new product and update the list', async () => {
        render(<ProductListPage />);
        
        // Tunggu hingga list kosong muncul
        await waitFor(() => {
            expect(screen.getByText(/belum ada produk\. silakan tambahkan satu!/i)).toBeInTheDocument();
        });

        // Isi Form
        fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: 'Laptop Baru' } });
        fireEvent.change(screen.getByLabelText(/deskripsi/i), { target: { value: 'Spesifikasi Tinggi' } });
        fireEvent.change(screen.getByLabelText(/harga/i), { target: { value: '15000000' } });

        // Klik Simpan
        fireEvent.click(screen.getByRole('button', { name: /simpan produk/i }));

        // Tunggu hingga list diperbarui dan produk baru muncul
        await waitFor(() => {
            expect(screen.getByText(/laptop baru/i)).toBeInTheDocument();
            expect(screen.getByText(/rp15\.000\.000/i)).toBeInTheDocument();
            // Verifikasi form kosong setelah submit sukses
            expect(screen.getByLabelText(/nama produk/i)).toHaveValue('');
        }, { timeout: 3000 }); // Beri waktu tunggu lebih karena melibatkan dua request
    });

    // 3. Uji Coba UPDATE (Ubah Data)
    test('should update an existing product', async () => {
        // Sediakan data awal untuk pengujian ini
        server.use(
            http.get(`${API_BASE_URL}/products`, () => {
                return HttpResponse.json({
                    data: [mockInitialProduct],
                });
            })
        );

        render(<ProductListPage />);
        
        // Tunggu hingga item dan tombol Edit-nya muncul
        expect(await screen.findByText(mockInitialProduct.name)).toBeInTheDocument();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editButton);

        // Verifikasi form berubah ke mode Edit
        expect(screen.getByText(/edit produk/i)).toBeInTheDocument();

        // Ubah nilai
        fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: 'Laptop Baru [EDITED]' } });

        // Klik Simpan Perubahan
        fireEvent.click(screen.getByRole('button', { name: /simpan perubahan/i }));

        // Tunggu hingga daftar diperbarui
        await waitFor(() => {
            expect(screen.getByText(/laptop baru \[edited\]/i)).toBeInTheDocument();
            // Verifikasi kembali ke mode Create
            expect(screen.getByText(/tambah produk baru/i)).toBeInTheDocument();
        });
    });

    // 4. Uji Coba DELETE (Hapus Data)
    test('should delete a product and remove it from the list', async () => {
        // Sediakan data awal untuk pengujian ini
        server.use(
            http.get(`${API_BASE_URL}/products`, () => {
                return HttpResponse.json({
                    data: [mockInitialProduct],
                });
            })
        );

        render(<ProductListPage />);

        // Tunggu hingga item dan tombol Hapus-nya muncul
        expect(await screen.findByText(mockInitialProduct.name)).toBeInTheDocument();
        const deleteButton = screen.getByRole('button', { name: 'Hapus' });
        
        // Mock window.confirm (karena ada pop-up konfirmasi)
        window.confirm = jest.fn(() => true); 
        
        fireEvent.click(deleteButton);
        
        // Tunggu hingga item dihapus dari daftar
        await waitFor(() => {
            expect(screen.queryByText(mockInitialProduct.name)).not.toBeInTheDocument();
            expect(screen.getByText(/belum ada produk\. silakan tambahkan satu!/i)).toBeInTheDocument();
        });
    });
});