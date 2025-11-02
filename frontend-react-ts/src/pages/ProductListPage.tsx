// src/pages/ProductListPage.tsx

import React, { useState, useEffect } from 'react';
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

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const productsData = await getAllProducts();
            setProducts(productsData);
        } catch (err) {
            console.error('❌ Error fetching products:', err);
            setError('Gagal memuat data produk dari API Go.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id);
            await fetchProducts();
        } catch (error) {
            alert("Gagal menghapus produk.");
        }
    };

    const handleEditStart = (product: Product) => {
        setEditingProduct(product);
    };

    const handleFormSuccess = async () => {
        setEditingProduct(undefined);
        setFormKey(prev => prev + 1);
        await fetchProducts(); // Tunggu sampai selesai
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Aplikasi CRUD Produk (Go + React)</h1>
            
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