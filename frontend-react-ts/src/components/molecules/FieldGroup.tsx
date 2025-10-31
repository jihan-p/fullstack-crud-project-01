import React from 'react';

// Menggunakan Atom Input yang baru dibuat
import Input from '../atoms/Input'; 

interface FieldGroupProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const FieldGroup: React.FC<FieldGroupProps> = ({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  placeholder 
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default FieldGroup;