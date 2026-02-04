import React from 'react';
import { X, Calendar, User, Info, FileText } from 'lucide-react';

const DeceasedPopup = ({ data, onClose }) => {
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in_modal">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
                        {data.details && data.details.father_name && (
                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                <User size={14} className="text-primary" />
                                בן/בת {data.details.father_name}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Dates */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                        <Calendar className="text-blue-500 w-6 h-6 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-blue-900 mb-1">תאריך פטירה / אזכרה</p>
                            <div className="text-lg font-bold text-gray-800">
                                {data.hebrew_date_text || data.hebrew_date || 'לא צוין תאריך עברי'}
                            </div>
                            {data.gregorian_date && (
                                <div className="text-gray-500 text-sm font-mono mt-1">
                                    {data.gregorian_date}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Details */}
                    {data.type && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Info size={20} className="text-gray-400" />
                            <span className="font-bold">סוג הנצחה:</span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                {data.type === 'kaddish' ? 'קדיש יתום' : data.type === 'mishnayot' ? 'לימוד משניות' : data.type}
                            </span>
                        </div>
                    )}

                    {data.status && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <FileText size={20} className="text-gray-400" />
                            <span className="font-bold">סטטוס:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${data.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {data.status === 'approved' ? 'מאושר' : 'ממתין לאישור'}
                            </span>
                        </div>
                    )}

                </div>

                {/* Actions */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        סגור חלון
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeceasedPopup;
