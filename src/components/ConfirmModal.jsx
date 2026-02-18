import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'אישור', cancelText = 'ביטול', showCancel = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative transform transition-all scale-100" dir="rtl">
                <div className={`p-6 text-center ${type === 'error' ? 'bg-red-50' : (type === 'success' ? 'bg-green-50' : 'bg-white')}`}>
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white shadow-sm">
                        {type === 'error' && <AlertCircle size={32} className="text-red-500" />}
                        {type === 'success' && <CheckCircle size={32} className="text-green-500" />}
                        {type === 'info' && <AlertCircle size={32} className="text-blue-500" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 ${type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-orange-600'}`}
                    >
                        {confirmText}
                    </button>
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
