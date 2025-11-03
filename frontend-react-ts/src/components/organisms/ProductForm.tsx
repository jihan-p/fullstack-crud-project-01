// src/components/organisms/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import FieldGroup from '../molecules/FieldGroup';
import Button from '../atoms/Button';
import { createProduct, updateProduct } from '../../api/productApi';
import type { Product } from '../../types/Product';
import { useAuth } from '../../../context/AuthContext';

interface ProductFormProps {
    onSuccess: () => void; // Callback setelah submit sukses
    initialProduct?: Product; // Opsional: data produk untuk mode edit
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, initialProduct }) => {
    const [name, setName] = useState(initialProduct?.name || '');
    const [description, setDescription] = useState(initialProduct?.description || '');
    const [price, setPrice] = useState<number | ''>(initialProduct?.price || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth(); // Ambil token dari context

    const isEditMode = !!initialProduct;

    // Mengisi form jika dalam mode edit
    useEffect(() => {
        if (initialProduct) {
            setName(initialProduct.name);
            setDescription(initialProduct.description);
            setPrice(initialProduct.price);
        } else {
            // Clear form when exiting edit mode
            setName('');
            setDescription('');
            setPrice('');
        }
        setError(null); 
    }, [initialProduct]); // <-- Jalankan efek ini saat initialProduct berubah

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const productData = {
            name,
            description,
            price: Number(price)
        };

        try {
            if (!token) {
                setError("Sesi tidak valid. Silakan login kembali.");
                return;
            }

            if (isEditMode && initialProduct) {
                await updateProduct(initialProduct.id, productData, token);
            } else {
                await createProduct(productData, token);
            }
            
            onSuccess(); // Panggil callback, form akan di-reset oleh parent component via 'key'

        } catch (err) {
            setError(`Gagal ${isEditMode ? 'memperbarui' : 'membuat'} produk. Cek konsol.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md bg-white sticky top-6">
            <h3 className="text-xl font-bold mb-4">
                {isEditMode ? `Edit Produk (ID: ${initialProduct.id})` : 'Tambah Produk Baru'}
            </h3>
            
            <FieldGroup
                label="Nama Produk"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Laptop Pro X"
            />
            <FieldGroup
                label="Deskripsi"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat produk"
            />
            <FieldGroup
                label="Harga"
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="Ex: 5000000"
            />
            
            {error && <p className="text-red-500 mb-3">{error}</p>}
            
            <Button type="submit" disabled={isLoading || !name || price === ''}>
                {isLoading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan Produk')}
            </Button>

            {/* Tombol Batal hanya muncul saat mode edit */}
            {isEditMode && (
                <Button
                    type="button"
                    variant="secondary"
                    className="ml-2"
                    onClick={onSuccess} // onSuccess akan mereset `editingProduct` di parent
                >
                    Batal
                </Button>
            )}
        </form>
    );
};

export default ProductForm;