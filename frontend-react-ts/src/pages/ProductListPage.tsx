// src/pages/ProductListPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types/Product';
import { getAllProducts } from '../api/productApi';
import ProductForm from '../components/organisms/ProductForm';

const ProductListPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi untuk mengambil data produk dari backend
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProducts();
            setProducts(data);
        } catch (err) {
            setError('Gagal memuat data produk dari API Go.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Panggil fungsi fetch saat komponen dimuat
        fetchProducts();
    }, [fetchProducts]);

    const handleProductCreated = () => {
        console.log("Produk berhasil dibuat. Memuat ulang daftar.");
        fetchProducts(); // Muat ulang daftar setelah produk baru dibuat
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Aplikasi CRUD Produk (Go + React)</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Kolom Form (CREATE) */}
                <div className="md:col-span-1">
                    <ProductForm onSuccess={handleProductCreated} />
                </div>

                {/* Kolom Daftar (READ) */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4">Daftar Produk</h2>
                    
                    {loading && <p className="text-blue-500">Memuat data...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    
                    {!loading && products.length === 0 && !error && (
                        <p className="text-gray-500">Belum ada produk. Silakan tambahkan satu!</p>
                    )}

                    {!loading && products.length > 0 && (
                        <div className="space-y-4">
                            {products.map((p) => (
                                <div key={p.ID} className="p-4 border rounded-lg flex justify-between items-center bg-white">
                                    <div>
                                        <p className="font-semibold text-lg">{p.name}</p>
                                        <p className="text-sm text-gray-600">{p.description}</p>
                                        <p className="text-green-600 font-bold">Rp{p.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    {/* Tombol Update/Delete akan ditambahkan di Fase 4.2 */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;