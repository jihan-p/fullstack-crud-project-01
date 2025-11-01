// src/pages/ProductListPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types/Product'; // <--- Import deleteProduct
import { getAllProducts, deleteProduct } from '../api/productApi'; // <--- Import ProductItem
import ProductForm from '../components/organisms/ProductForm';
import ProductItem from '../components/molecules/ProductItem';

const ProductListPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined); // State untuk mode edit: menyimpan produk yang sedang di-edit

    // Fungsi untuk mengambil data produk dari backend
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProducts();
            setProducts(data || []); // Fallback to empty array if data is undefined
        } catch (err) {
            setError('Gagal memuat data produk dari API Go.');
            setProducts([]); // Reset products on error to prevent render issues
        } finally {
            setLoading(false);
        }
    }, []);

    // --- LOGIC DELETE ---
    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id);
            // Muat ulang daftar produk
            fetchProducts(); 
        } catch (error) {
            alert("Gagal menghapus produk.");
        }
    };

    // --- LOGIC EDIT ---
    const handleEditStart = (product: Product) => {
        setEditingProduct(product);
    };

    const handleFormSuccess = () => {
        setEditingProduct(undefined); // Keluar dari mode edit
        fetchProducts(); // Muat ulang daftar produk
    };

    useEffect(() => {
        // Panggil fungsi fetch saat komponen dimuat
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Aplikasi CRUD Produk (Go + React)</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Kolom Form (CREATE/UPDATE) */}
                <div className="md:col-span-1">
                    <ProductForm 
                        onSuccess={handleFormSuccess}
                        initialProduct={editingProduct} // Kirim data produk jika mode edit
                        key={editingProduct ? editingProduct.ID : 'new'} // Ganti key untuk mereset form
                    />
                </div>

                {/* Kolom Daftar (READ) */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4">Daftar Produk</h2>
                    
                    {/* ... (Loading/Error/Empty state) */}
                    {loading && <p className="text-blue-500">Memuat data...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    
                    {!loading && products.length === 0 && !error && (
                        <p className="text-gray-500">Belum ada produk. Silakan tambahkan satu!</p>
                    )}
                    {!loading && products.length > 0 && (
                        <div className="space-y-4">
                            {products.map((p) => (
                                // Ganti div dengan ProductItem
                                <ProductItem key={p.ID} product={p} onEdit={handleEditStart} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;