// src/components/organisms/ProductForm.tsx

import React, { useState } from 'react';
import FieldGroup from '../molecules/FieldGroup';
import Button from '../atoms/Button';
import { createProduct } from '../../api/productApi';

interface ProductFormProps {
    onSuccess: () => void; // Callback setelah submit sukses
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Memanggil helper API (POST ke Go backend)
            await createProduct({ 
                name, 
                description, 
                price: Number(price) // Pastikan price dikirim sebagai number
            });
            
            // Bersihkan form dan panggil callback
            setName('');
            setDescription('');
            setPrice('');
            onSuccess();

        } catch (err) {
            setError('Gagal membuat produk. Cek konsol untuk detail.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Tambah Produk Baru</h3>
            
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
                {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
        </form>
    );
};

export default ProductForm;