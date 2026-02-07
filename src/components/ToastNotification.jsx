import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const ToastNotification = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const handleShowToast = (event) => {
            const { message, type = 'success', duration = 3000 } = event.detail || {};
            setToast({ message, type, id: Date.now() });

            // Auto dismiss
            const timer = setTimeout(() => {
                setToast(null);
            }, duration);

            return () => clearTimeout(timer);
        };

        window.addEventListener('show-toast', handleShowToast);
        return () => window.removeEventListener('show-toast', handleShowToast);
    }, []);

    if (!toast) return null;

    return (
        <div className="fixed bottom-8 left-8 z-50 animate-fade-in-up">
            <div className={`
                flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border
                ${toast.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-gray-800 text-white border-gray-700'}
            `}>
                <div className="bg-white/20 p-1 rounded-full">
                    <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">הפעולה בוצעה בהצלחה</h4>
                    <p className="text-xs opacity-90">{toast.message}</p>
                </div>
                <button
                    onClick={() => setToast(null)}
                    className="mr-4 text-white/50 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default ToastNotification;
