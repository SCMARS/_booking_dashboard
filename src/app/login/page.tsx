'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.email || !formData.password) {
            setError(t('auth.errors.fillAllFields') as string);
            return;
        }

        setLoading(true);

        try {

            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            

            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            

            switch (error.code) {
                case 'auth/user-not-found':
                    setError(t('auth.errors.userNotFound') as string);
                    break;
                case 'auth/wrong-password':
                    setError(t('auth.errors.wrongPassword') as string);
                    break;
                case 'auth/invalid-email':
                    setError(t('auth.errors.invalidEmail') as string);
                    break;
                case 'auth/too-many-requests':
                    setError(t('auth.errors.tooManyRequests') as string);
                    break;
                default:
                    setError(t('auth.errors.loginGeneric') as string);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-heading mb-4 md:mb-6 text-center">
                    {t('auth.login')}
                </h1>
                {user && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded text-sm text-center">
                        {t('auth.alreadyLoggedIn')}
                    </div>
                )}
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('auth.placeholders.email') as string}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auth.password')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('auth.placeholders.password') as string}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? `${t('auth.login')}...` : t('auth.signIn')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        
                        
                        <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                            {t('auth.signUp')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
