// src/pages/ResetPasswordPage.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import FieldGroup from '../components/molecules/FieldGroup';
import Button from '../components/atoms/Button';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('No reset token provided. Please request a new password reset link.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
            setError('Invalid or missing token.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await resetPassword(token, password, passwordConfirm);
            setMessage(response.message);
            setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
        } catch (err) {
            setError((err as Error).message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
                {message ? (
                    <div className="text-center">
                        <p className="text-green-600">{message}</p>
                        <Link to="/login" className="text-sm text-blue-600 hover:underline mt-4 inline-block">Proceed to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <FieldGroup
                            label="New Password"
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <FieldGroup
                            label="Confirm New Password"
                            id="password-confirm"
                            type="password"
                            value={passwordConfirm}
                            onChange={e => setPasswordConfirm(e.target.value)}
                            required
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <Button type="submit" disabled={isLoading || !token} className="w-full">
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;