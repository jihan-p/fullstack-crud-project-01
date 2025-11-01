// src/pages/ProductListPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { resetMockProducts, setMockProducts } from '../mocks/handlers';
import ProductListPage from './ProductListPage';

// Helper untuk membuat produk mock
const createMockProduct = (id: number, name: string, price: number) => ({ ID: id, name, description: `Deskripsi untuk ${name}`, price });

// Definisikan produk dummy yang akan digunakan untuk tes Update/Delete
const mockInitialProduct = createMockProduct(101, 'Mock Item Pre-seeded', 500000);

afterEach(() => {
  // Membersihkan mock products setelah setiap test untuk memastikan isolasi
  // Ini akan memanggil server.resetHandlers() juga, jadi tidak perlu dipanggil dua kali.
  resetMockProducts();
});

describe('ProductListPage Integration Test (Full CRUD)', () => {
    // 1. Test READ (Menampilkan data)
    test('should fetch and display products on initial load', async () => {
        // Gunakan setMockProducts untuk mengisi data awal
        setMockProducts([{
            ID: 100, // <-- TAMBAHKAN ID
            name: 'Dummy Item',
            price: 100000,
            description: 'Deskripsi Dummy'
        }]);

        render(<ProductListPage />);
        
        // Verifikasi loading state muncul
        expect(screen.getByText(/memuat data.../i)).toBeInTheDocument();

        // Tunggu hingga data muncul menggunakan findBy*
        expect(await screen.findByText(/dummy item/i, {}, { timeout: 4000 })).toBeInTheDocument();
        expect(screen.getByText(/rp100\.000/i)).toBeInTheDocument();
        expect(screen.queryByText(/memuat data.../i)).not.toBeInTheDocument();
    });
    
    // 2. Test CREATE (Membuat data)
    test('should create a new product and update the list', async () => {
        render(<ProductListPage />);
        
        // Tunggu hingga list kosong muncul
        expect(await screen.findByText(/belum ada produk\. silakan tambahkan satu!/i, {}, { timeout: 2000 })).toBeInTheDocument();

        // Isi Form
        fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: 'Laptop Baru' } });
        fireEvent.change(screen.getByLabelText(/deskripsi/i), { target: { value: 'Spesifikasi Tinggi' } });
        fireEvent.change(screen.getByLabelText(/harga/i), { target: { value: '15000000' } });

        // Klik Simpan Produk
        fireEvent.click(screen.getByRole('button', { name: /simpan produk/i }));

        // Tunggu hingga list diperbarui dan produk baru muncul
        expect(await screen.findByText(/laptop baru/i, {}, { timeout: 4000 })).toBeInTheDocument();
        expect(screen.getByText(/rp15\.000\.000/i)).toBeInTheDocument();
        // Verifikasi form kosong setelah submit sukses
        expect(screen.getByLabelText(/nama produk/i)).toHaveValue('');
    });

    // Kelompokkan test yang memerlukan data awal
    describe('when there is an existing product', () => {
        // FIX KRITIS: Panggil setMockProducts untuk mengisi mock DB sebelum setiap tes di suite ini
        beforeEach(() => {
            setMockProducts([mockInitialProduct]);
        });

        // 3. Test UPDATE (Mengubah data)
        test('should update an existing product', async () => {
            render(<ProductListPage />);
            
            // Tunggu hingga item dan tombol Edit-nya muncul (Akan berhasil karena mock state sudah terisi)
            const editButton = await screen.findByRole('button', { name: /edit/i }, { timeout: 4000 });
            fireEvent.click(editButton);

            // Verifikasi form berubah ke mode Edit dan terisi data
            expect(await screen.findByText(/edit produk/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/nama produk/i)).toHaveValue(mockInitialProduct.name);

            // Ubah nilai
            fireEvent.change(screen.getByLabelText(/nama produk/i), { target: { value: 'Laptop Baru [EDITED]' } });

            // Klik Simpan Perubahan
            fireEvent.click(screen.getByRole('button', { name: /simpan perubahan/i }));

            // Tunggu hingga daftar diperbarui dan form kembali ke mode Create
            expect(await screen.findByText(/laptop baru \[edited\]/i)).toBeInTheDocument();
            // Verifikasi kembali ke mode Create
            expect(screen.getByText(/tambah produk baru/i)).toBeInTheDocument();
        });

        // 4. Test DELETE (Menghapus data)
        test('should delete a product and remove it from the list', async () => {
            // Mock window.confirm (karena ada pop-up konfirmasi)
            window.confirm = jest.fn(() => true); 

            render(<ProductListPage />);

            // Tunggu hingga item dan tombol Hapus-nya muncul, lalu klik (Akan berhasil karena mock state sudah terisi)
            const deleteButton = await screen.findByRole('button', { name: /hapus/i }, { timeout: 4000 });
            fireEvent.click(deleteButton);
            
            // Tunggu hingga item dihapus dari daftar dan pesan "empty" muncul
            expect(await screen.findByText(/belum ada produk\. silakan tambahkan satu!/i)).toBeInTheDocument();
            expect(screen.queryByText(mockInitialProduct.name)).not.toBeInTheDocument();
        });
    });
});