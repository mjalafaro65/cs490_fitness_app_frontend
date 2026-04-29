import React, { useEffect, useState } from 'react';

function Alert({ isOpen, onClose, message, type = 'success' }) {

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setTimeout(() => onClose(), 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform`}>
            <div className={`rounded-lg shadow-lg p-4 min-w-[300px] max-w-md ${
                type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
            }`}>
                <div className="flex items-center gap-3">
                    {type === 'success' ? (
                        <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span className={`text-sm flex-1 ${
                        type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {message}
                    </span>
                    <button 
                        onClick={() => {
                            setTimeout(() => onClose(), 300);
                        }}
                        className={`flex-shrink-0 cursor-pointer ${
                            type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                        } transition-colors`}
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Alert;