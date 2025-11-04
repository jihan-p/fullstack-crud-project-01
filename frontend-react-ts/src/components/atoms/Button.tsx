// src/components/atoms/Button.tsx

import React from 'react';

// Define the types for the new props
type ButtonVariant = 'primary' | 'danger' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

// Extend the standard button props with our custom ones
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // Base classes
  const baseClasses = 'font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    danger: 'bg-red-500 hover:bg-red-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-black',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;

  return (
    <button className={combinedClasses.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;