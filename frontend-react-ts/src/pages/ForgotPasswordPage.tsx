// src/pages/ForgotPasswordPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';
import FieldGroup from '../components/molecules/FieldGroup';
import Button from '../components/atoms/Button';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await forgotPassword(email);
            setMessage(response.message);
        } catch (err) {
            // For security, we can show the same message even on error
            setMessage("If that email address is in our database, we will send a link to reset your password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
                {message ? (
                    <p className="text-green-600 text-center">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="text-sm text-gray-600 mb-4">Enter your email address and we will send you a link to reset your password.</p>
                        <FieldGroup
                            label="Email"
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                )}
                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;