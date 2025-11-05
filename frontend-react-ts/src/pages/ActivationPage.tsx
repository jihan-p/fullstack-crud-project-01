// src/pages/ActivationPage.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { activateUser } from '../api/authApi';

const ActivationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [message, setMessage] = useState('Activating your account, please wait...');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const performActivation = async () => {
            if (!token) {
                setMessage('Activation token is missing or invalid.');
                setIsSuccess(false);
                return;
            }

            try {
                const response = await activateUser(token);
                setMessage(response.message);
                setIsSuccess(true);
            } catch (err) {
                setMessage((err as Error).message || 'Account activation failed.');
                setIsSuccess(false);
            }
        };

        performActivation();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">Account Activation</h2>
                <p className={isSuccess ? 'text-green-600' : 'text-red-500'}>
                    {message}
                </p>
                {isSuccess && (
                    <Link to="/login" className="mt-4 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                        Proceed to Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ActivationPage;