// src/components/organisms/EditUserModal.tsx

import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '../../types/User';
import Button from '../atoms/Button';
import FieldGroup from '../molecules/FieldGroup';

type SaveUserData = { Name: string; Email: string; Role: UserRole; Password?: string };

interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number, data: SaveUserData) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const isCreateMode = user === null;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('user');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.Name);
            setEmail(user.Email);
            setRole(user.Role);
        } else {
            // Reset for create mode
            setName('');
            setEmail('');
            setRole('user');
            setPassword('');
        }
        setError(null); // Reset error when user changes
    }, [user]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await onSave(user?.ID || 0, { Name: name, Email: email, Role: role, Password: password });
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                    {isCreateMode ? 'Create New User' : `Edit User (ID: ${user?.ID})`}
                </h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <FieldGroup
                        label="Name"
                        id="edit-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <FieldGroup
                        label="Email"
                        id="edit-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <FieldGroup
                        label="Role"
                        id="edit-role"
                        as="select"
                        value={role}
                        onChange={e => setRole(e.target.value as UserRole)}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </FieldGroup>

                    {isCreateMode && (
                        <FieldGroup
                            label="Password"
                            id="edit-password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            required={isCreateMode}
                        />
                    )}

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