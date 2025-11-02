// src/pages/ProductListPage.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetMockProducts, setMockProducts } from '../mocks/handlers';
import ProductListPage from './ProductListPage';

// Helper untuk membuat produk mock
const createMockProduct = (id: number, name: string, price: number, description?: string) => ({ 
    ID: id, 
    name, 
    description: description || `Deskripsi untuk ${name}`, 
    price 
});

describe('ProductListPage Integration Test (Full CRUD)', () => {
    beforeEach(() => {
        resetMockProducts();
    });

    // 1. Test READ (Menampilkan data)
    test('should fetch and display products on initial load', async () => {
        // SETUP: Set mock products
        setMockProducts([{
            ID: 100,
            name: 'Dummy Item',
            price: 100000,
            description: 'Deskripsi Dummy'
        }]);

        render(<ProductListPage />);
        
        // Verifikasi loading state muncul
        expect(screen.getByText(/memuat data.../i)).toBeInTheDocument();

        // Tunggu hingga data muncul menggunakan findBy*
        expect(await screen.findByText(/dummy item/i)).toBeInTheDocument();
        expect(screen.getByText(/rp100\.000/i)).toBeInTheDocument();
        expect(screen.queryByText(/memuat data.../i)).not.toBeInTheDocument();
    });
    
    // 2. Test CREATE (Membuat data)
    test('should create a new product and update the list', async () => {
        const user = userEvent.setup();
        render(<ProductListPage />);
        
        // Tunggu hingga list kosong muncul
        expect(await screen.findByText(/belum ada produk\. silakan tambahkan satu!/i)).toBeInTheDocument();

        // Isi form
        await user.type(screen.getByLabelText(/nama produk/i), 'Laptop Baru');
        await user.type(screen.getByLabelText(/deskripsi/i), 'Spesifikasi Tinggi');
        await user.type(screen.getByLabelText(/harga/i), '15000000');

        const submitButton = screen.getByRole('button', { name: /simpan produk/i });
        await user.click(submitButton);

        // Tunggu hingga produk baru muncul
        expect(await screen.findByText(/laptop baru/i)).toBeInTheDocument();
        expect(screen.getByText(/rp15\.000\.000/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nama produk/i)).toHaveValue('');
    });

    // Kelompokkan test yang memerlukan data awal
    describe('when there is an existing product', () => {
        const mockInitialProduct = createMockProduct(101, 'Mock Item Pre-seeded', 500000);

        // 3. Test UPDATE (Mengubah data)
        test('should update an existing product', async () => {
            const user = userEvent.setup();
            
            // SETUP: Set mock products
            setMockProducts([mockInitialProduct]);
            render(<ProductListPage />);
            
            // Tunggu hingga item muncul - gunakan findBy untuk menunggu async
            await screen.findByText(/mock item pre-seeded/i, { selector: 'h3' });
            
            // Klik tombol Edit
            const editButtons = screen.getAllByRole('button', { name: /edit/i });
            await user.click(editButtons[0]); // Gunakan yang pertama

            // Verifikasi form berubah ke mode Edit
            expect(screen.getByText(/edit produk/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/nama produk/i)).toHaveValue(mockInitialProduct.name);

            // Clear field dan isi dengan nilai baru - pastikan tidak ada spasi
            const nameInput = screen.getByLabelText(/nama produk/i);
            await user.clear(nameInput);
            await user.type(nameInput, 'Laptop Baru Edited'); // Gunakan tanpa [EDITED] untuk menghindari karakter khusus

            // Klik Simpan Perubahan
            const saveButton = screen.getByRole('button', { name: /simpan perubahan/i });
            await user.click(saveButton);

            // Tunggu hingga produk yang di-update muncul
            await waitFor(() => {
                expect(screen.getByText(/laptop baru edited/i, { selector: 'h3' })).toBeInTheDocument();
            }, { timeout: 5000 });

            // Verifikasi kembali ke mode Create
            expect(screen.getByText(/tambah produk baru/i)).toBeInTheDocument();
        }, 10000); // Timeout test 10 detik

        // 4. Test DELETE (Menghapus data)
        test('should delete a product and remove it from the list', async () => {
            const user = userEvent.setup();
            
            // Mock window.confirm
            window.confirm = jest.fn(() => true);

            // SETUP: Set mock products
            setMockProducts([mockInitialProduct]);
            render(<ProductListPage />);

            // Tunggu hingga item muncul
            await screen.findByText(/mock item pre-seeded/i, { selector: 'h3' });

            // Klik tombol Hapus
            const deleteButtons = screen.getAllByRole('button', { name: /hapus/i });
            await user.click(deleteButtons[0]); // Gunakan yang pertama
            
            // Tunggu hingga item dihapus dan pesan "empty" muncul
            await waitFor(() => {
                expect(screen.getByText(/belum ada produk\. silakan tambahkan satu!/i)).toBeInTheDocument();
            }, { timeout: 5000 });
            
            expect(screen.queryByText(mockInitialProduct.name)).not.toBeInTheDocument();
        }, 10000);

        // 5. Test CANCEL edit operation
        test('should cancel edit operation and return to create mode', async () => {
            const user = userEvent.setup();
            
            // SETUP: Set mock products
            setMockProducts([mockInitialProduct]);
            render(<ProductListPage />);
            
            // Tunggu hingga item muncul
            await screen.findByText(/mock item pre-seeded/i, { selector: 'h3' });
            
            // Klik tombol Edit
            const editButtons = screen.getAllByRole('button', { name: /edit/i });
            await user.click(editButtons[0]); // Gunakan yang pertama

            // Verifikasi mode edit
            expect(screen.getByText(/edit produk/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/nama produk/i)).toHaveValue(mockInitialProduct.name);

            // Klik tombol Batal
            const cancelButton = screen.getByRole('button', { name: /batal/i });
            await user.click(cancelButton);

            // Verifikasi kembali ke mode create
            expect(screen.getByText(/tambah produk baru/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/nama produk/i)).toHaveValue('');
        });
    });

    // 6. Test FORM VALIDATION
    test('should disable submit button when form is invalid', async () => {
        const user = userEvent.setup();
        render(<ProductListPage />);
        
        // Tunggu hingga form loaded
        await screen.findByText(/tambah produk baru/i);
        
        const submitButton = screen.getByRole('button', { name: /simpan produk/i });
        
        // Button harus disabled saat form kosong
        expect(submitButton).toBeDisabled();
        
        // Isi hanya nama
        await user.type(screen.getByLabelText(/nama produk/i), 'Test Product');
        expect(submitButton).toBeDisabled(); // Masih disabled karena harga belum diisi
        
        // Isi harga
        await user.type(screen.getByLabelText(/harga/i), '100000');
        expect(submitButton).not.toBeDisabled(); // Sekarang harus enabled
        
        // Hapus nama
        await user.clear(screen.getByLabelText(/nama produk/i));
        expect(submitButton).toBeDisabled(); // Kembali disabled
    });

    // 7. Test MULTIPLE PRODUCTS handling
    test('should handle multiple products correctly', async () => {
        const user = userEvent.setup();
        
        // SETUP: Multiple mock products dengan deskripsi yang unik
        const multipleProducts = [
            createMockProduct(1, 'Product A', 100000, 'Deskripsi khusus Product A'),
            createMockProduct(2, 'Product B', 200000, 'Deskripsi khusus Product B'),
            createMockProduct(3, 'Product C', 300000, 'Deskripsi khusus Product C')
        ];
        setMockProducts(multipleProducts);
        
        render(<ProductListPage />);
        
        // Verifikasi semua produk muncul - gunakan selector yang spesifik
        expect(await screen.findByText(/product a/i, { selector: 'h3' })).toBeInTheDocument();
        expect(screen.getByText(/product b/i, { selector: 'h3' })).toBeInTheDocument();
        expect(screen.getByText(/product c/i, { selector: 'h3' })).toBeInTheDocument();
        
        // Verifikasi deskripsi
        expect(screen.getByText(/deskripsi khusus product a/i)).toBeInTheDocument();
        expect(screen.getByText(/deskripsi khusus product b/i)).toBeInTheDocument();
        expect(screen.getByText(/deskripsi khusus product c/i)).toBeInTheDocument();
        
        // Verifikasi harga format
        expect(screen.getByText(/rp100\.000/i)).toBeInTheDocument();
        expect(screen.getByText(/rp200\.000/i)).toBeInTheDocument();
        expect(screen.getByText(/rp300\.000/i)).toBeInTheDocument();
        
        // Tambah produk baru
        await user.type(screen.getByLabelText(/nama produk/i), 'Product D');
        await user.type(screen.getByLabelText(/deskripsi/i), 'New Product Description');
        await user.type(screen.getByLabelText(/harga/i), '400000');
        
        await user.click(screen.getByRole('button', { name: /simpan produk/i }));
        
        // Verifikasi produk baru ditambahkan
        expect(await screen.findByText(/product d/i, { selector: 'h3' })).toBeInTheDocument();
        expect(screen.getByText(/new product description/i)).toBeInTheDocument();
        expect(screen.getByText(/rp400\.000/i)).toBeInTheDocument();
    }, 10000);

    // 8. Test EMPTY state
    test('should display empty state when no products', async () => {
        render(<ProductListPage />);
        
        // Tunggu hingga loading selesai
        await waitFor(() => {
            expect(screen.queryByText(/memuat data.../i)).not.toBeInTheDocument();
        }, { timeout: 3000 });
        
        // Verifikasi empty state
        expect(screen.getByText(/belum ada produk\. silakan tambahkan satu!/i)).toBeInTheDocument();
    });
});