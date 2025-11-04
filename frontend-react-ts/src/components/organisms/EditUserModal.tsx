// src/components/organisms/EditUserModal.tsx

import React, { useState, useEffect } from 'react';
import type { User } from '../../types/User';
import Button from '../atoms/Button';
import FieldGroup from '../molecules/FieldGroup';

interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number, data: { Name: string; Email: string }) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.Name);
            setEmail(user.Email);
        } else {
            setName('');
            setEmail('');
        }
        setError(null); // Reset error when user changes
    }, [user]);

    if (!isOpen || !user) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await onSave(user.ID, { Name: name, Email: email });
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit User (ID: {user.ID})</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <FieldGroup
                        label="Name"
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <FieldGroup
                        label="Email"
                        id="edit-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="flex justify-end space-x-4 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;