// src/components/molecules/FieldGroup.tsx

import React from 'react';

// Define a more flexible props interface
type FieldGroupProps = {
    id: string;
    label: string;
    as?: 'input' | 'select';
    children?: React.ReactNode;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement> & React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>;

const FieldGroup: React.FC<FieldGroupProps> = ({
    label,
    id,
    as = 'input',
    children,
    ...props
}) => {
    const commonClasses = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

    const renderField = () => {
        if (as === 'select') {
            return (
                <select id={id} className={commonClasses} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
                    {children}
                </select>
            );
        }
        return <input id={id} className={commonClasses} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />;
    };

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
            {renderField()}
        </div>
    );
};

export default FieldGroup;