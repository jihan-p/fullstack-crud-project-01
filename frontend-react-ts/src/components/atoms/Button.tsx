import React from 'react';

// Tentukan Props (Input) untuk komponen Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Tambahkan type safety untuk prop 'variant'
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...rest 
}) => {
  // Logika sederhana untuk menentukan kelas berdasarkan variant
  const baseStyle = 'py-2 px-4 rounded font-semibold transition duration-150';
  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle = 'bg-blue-500 hover:bg-blue-700 text-white';
      break;
    case 'secondary':
      variantStyle = 'bg-gray-300 hover:bg-gray-400 text-gray-800';
      break;
    case 'danger':
      variantStyle = 'bg-red-500 hover:bg-red-700 text-white';
      break;
    default:
      variantStyle = 'bg-blue-500 hover:bg-blue-700 text-white';
  }

  return (
    <button 
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...rest} // Meneruskan props HTML native lainnya (onClick, disabled, dll.)
    >
      {children}
    </button>
  );
};

export default Button;
