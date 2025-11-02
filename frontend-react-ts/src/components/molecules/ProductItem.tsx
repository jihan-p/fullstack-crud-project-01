import React from 'react';
import type { Product } from '../../types/Product';
import Button from '../atoms/Button'; // Asumsi Anda memiliki komponen Button

interface ProductItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

// Helper untuk format mata uang yang sesuai dengan tes (misalnya, Rp100.000)
const formatCurrencyForTest = (value: number) => {
  // Intl.NumberFormat('id-ID') menghasilkan pemisah ribuan berupa titik.
  // Kita menempelkan 'Rp' di depan string yang diformat.
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
};

const ProductItem: React.FC<ProductItemProps> = ({ product, onEdit, onDelete }) => {
  
  // LOGIC DELETE dengan konfirmasi
  const handleDeleteClick = () => {
    // window.confirm di-mock di test, sehingga logika ini aman
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${product.name}?`)) {
      onDelete(product.ID);
    }
  };

  return (
    <div 
      className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
        
        {/* Menggunakan formatCurrencyForTest untuk harga */}
        <p className="text-md font-semibold mt-2">{formatCurrencyForTest(product.price)}</p>
        
      </div>
      <div className="flex space-x-2">
        {/* Tombol Edit dan Hapus */}
        <Button variant="secondary" onClick={() => onEdit(product)}>Edit</Button>
        <Button variant="danger" onClick={handleDeleteClick}>Hapus</Button>
      </div>
    </div>
  );
};

export default ProductItem;