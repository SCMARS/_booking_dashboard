'use client';
import React from 'react';

export default function login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-heading mb-4 md:mb-6 text-center">Login</h1>
                <p className="text-sm md:text-base text-gray-600 text-center mb-6">
                    Здесь будет страница входа для пользователей.
                </p>

                {/* Placeholder for login form */}
                <div className="space-y-4">
                    <div className="border border-gray-300 rounded-md p-3 h-10"></div>
                    <div className="border border-gray-300 rounded-md p-3 h-10"></div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
