import React, { useEffect, useRef } from 'react';

function Alert({ isOpen, onClose, message, type = 'success' }) {

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            ></div>
   
            <div className="relative w-full max-w-md mx-4">
                <div className={`bg-white shadow-xl p-0 overflow-hidden animate-slide-up`}>
                    <div className="p-6 w-full">
                        <div className="flex flex-col items-center text-center">

                            <p className="text-lg font-medium mb-6">
                                {message}
                            </p>

                            <button 
                                onClick={onClose}
                                className="btn bg-red-600 text-white btn-sm hover:bg-red-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Alert;
