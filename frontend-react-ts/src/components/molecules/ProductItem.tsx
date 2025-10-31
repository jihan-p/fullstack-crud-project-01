// src/components/molecules/ProductItem.tsx

import React from 'react';
import type { Product } from '../../types/Product';
import Button from '../atoms/Button';

interface ProductItemProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onEdit, onDelete }) => {
    const productId = product.ID!; // ID dijamin ada karena ini data yang sudah tersimpan
    
    return (
        <div className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm">
            {/* Informasi Produk */}
            <div>
                <p className="font-semibold text-lg">{product.name}</p>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-green-600 font-bold">Rp{product.price.toLocaleString('id-ID')}</p>
            </div>
            
            {/* Aksi */}
            <div className="space-x-2 flex">
                <Button variant="secondary" onClick={() => onEdit(product)}>
                    Edit
                </Button>
                <Button 
                    variant="danger" 
                    onClick={() => {
                        if (window.confirm(`Yakin ingin menghapus produk "${product.name}"?`)) {
                            onDelete(productId);
                        }
                    }}
                >
                    Hapus
                </Button>
            </div>
        </div>
    );
};

export default ProductItem;