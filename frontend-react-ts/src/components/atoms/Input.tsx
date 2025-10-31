import React from 'react';

// InputProps extends semua properti HTML Input standar
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Hanya tambah properti spesifik jika ada
}

const Input: React.FC<InputProps> = ({ className = '', ...rest }) => {
  const baseStyle = 'border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 w-full';
  
  return (
    <input 
      className={`${baseStyle} ${className}`} 
      {...rest} 
    />
  );
};

export default Input;