// src/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCurrentUser, updateCurrentUser, deleteCurrentUser } from '../api/userApi';
import FieldGroup from '../components/molecules/FieldGroup';
import Button from '../components/atoms/Button';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            if (!token) return;
            try {
                const response = await fetchCurrentUser(token);
                setName(response.data.Name);
                setEmail(response.data.Email);
            } catch (err) {
                setError('Failed to load user data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, [token]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await updateCurrentUser({ Name: name, Email: email }, token);
            setSuccessMessage('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token) return;
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await deleteCurrentUser(token);
                logout();
                navigate('/login');
            } catch (err) {
                setError('Failed to delete account.');
            }
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>
            <form onSubmit={handleUpdate} className="p-6 bg-white rounded-lg shadow-md">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                <FieldGroup
                    label="Name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <FieldGroup
                    label="Email"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="flex justify-between items-center mt-6">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="danger" onClick={handleDelete}>
                        Delete Account
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;