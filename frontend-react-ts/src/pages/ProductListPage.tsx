// src/pages/ProductListPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../types/Product';
import { getAllProducts, deleteProduct } from '../api/productApi';
import ProductForm from '../components/organisms/ProductForm';
import ProductItem from '../components/molecules/ProductItem';

const ProductListPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [formKey, setFormKey] = useState(0);
    const { token, logout } = useAuth(); // ❗ FIX: Ambil 'token' dari context

    const fetchProducts = useCallback(async () => {
        if (!token) {
            // Tidak perlu melakukan apa-apa jika tidak ada token,
            // ProtectedRoute sudah menangani pengalihan.
            return; 
        }
        setLoading(true);
        setError(null);
        try {
            const productsData = await getAllProducts(token);
            setProducts(productsData);
        } catch (err) {
            console.error('❌ Error fetching products:', err);
            const errorMessage = (err as Error).message;
            if (errorMessage.includes('401')) { // Jika token tidak valid/kadaluwarsa
                setError("Sesi Anda telah berakhir. Silakan login kembali.");
                logout(); // Otomatis logout
            } else {
                setError('Gagal memuat data produk dari API Go.');
            }
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [token, logout]); // ✨ IMPROVEMENT: Tambahkan dependensi

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); // ✨ IMPROVEMENT: Gunakan fetchProducts sebagai dependensi

    const handleDelete = useCallback(async (id: number) => {
        if (!token) {
            setError("Sesi tidak valid. Silakan login kembali.");
            logout();
            return;
        }
        try {
            await deleteProduct(id, token);
            await fetchProducts();
        } catch (error) {
            alert("Gagal menghapus produk.");
        }
    }, [token, logout, fetchProducts]); // ✨ IMPROVEMENT: Tambahkan dependensi

    const handleEditStart = (product: Product) => {
        setEditingProduct(product);
    };

    const handleFormSuccess = useCallback(async () => {
        setEditingProduct(undefined);
        setFormKey(prev => prev + 1);
        await fetchProducts(); // Tunggu sampai selesai
    }, [fetchProducts]); // ✨ IMPROVEMENT: Bungkus dengan useCallback

    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            logout();
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Aplikasi CRUD Produk (Go + React)</h1>
                {/* ✨ IMPROVEMENT: Gunakan handler dengan konfirmasi */}
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
                    Logout
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-1">
                    <ProductForm 
                        onSuccess={handleFormSuccess}
                        initialProduct={editingProduct}
                        key={formKey}
                    />
                </div>

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
                                <ProductItem key={p.id} product={p} onEdit={handleEditStart} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;