import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Info, FileText, Phone, Mail, MapPin, Edit2, Save, Users } from 'lucide-react';

const DeceasedPopup = ({ data, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(data || {});

    // Update formData when data prop changes
    useEffect(() => {
        if (data) setFormData(data);
    }, [data]);

    if (!data) return null;

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(formData); // Send updated data back
        }
        setIsEditing(false); // Exit edit mode
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper for input fields to reduce code repetition
    const InputField = ({ label, name, value, type = 'text', placeholder = '' }) => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">{label}</label>
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none transition-colors"
            />
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in_modal"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-start shrink-0">
                    <div className="flex-grow">
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 w-full mb-2"
                                placeholder="שם הנפטר"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                        )}

                        <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                            {/* Gender Toggle for Hebrew texts if needed in future, essentially Read-Only for now or simple select */}
                            <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">{formData.gender === 'male' ? 'זכר' : 'נקבה'}</span>
                            {isEditing && (
                                <select name="gender" value={formData.gender || 'male'} onChange={handleChange} className="text-xs bg-white border rounded px-1">
                                    <option value="male">זכר</option>
                                    <option value="female">נקבה</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Toggle Edit Button */}
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`p-2 rounded-full transition-colors flex items-center gap-2 px-4 shadow-sm ${isEditing
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                        >
                            {isEditing ? <><Save size={18} /> שמור</> : <><Edit2 size={18} /> ערוך</>}
                        </button>

                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

                    {/* 1. Parents Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-r-4 border-primary pr-3">
                            <Users size={20} className="text-gray-400" />
                            פרטי הורים
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <InputField label="שם האב" name="father_name" value={formData.father_name} />
                                    <InputField label="שם האם" name="mother_name" value={formData.mother_name} />
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">שם האב</p>
                                        <p className="font-medium text-gray-900">{formData.father_name || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">שם האם</p>
                                        <p className="font-medium text-gray-900">{formData.mother_name || '-'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 2. Dates */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-r-4 border-blue-500 pr-3">
                            <Calendar size={20} className="text-gray-400" />
                            תאריכים
                        </h3>

                        {/* Death Date */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm font-bold text-blue-900 mb-3 border-b border-blue-100 pb-2">תאריך פטירה</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isEditing ? (
                                    <>
                                        <InputField label="תאריך עברי (פטירה)" name="hebrew_date_text" value={formData.hebrew_date_text} placeholder="למשל: כ״ט באייר תשפ״ד" />
                                        <InputField label="תאריך לועזי (פטירה)" name="gregorian_date" value={formData.gregorian_date} type="date" />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">תאריך עברי</p>
                                            <p className="font-bold text-lg text-gray-800">{formData.hebrew_date_text || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">תאריך לועזי</p>
                                            <p className="font-mono text-gray-600">{formData.gregorian_date || '-'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Birth Date (New) */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">תאריך לידה</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isEditing ? (
                                    <>
                                        <InputField label="תאריך עברי (לידה)" name="birth_hebrew_date" value={formData.birth_hebrew_date} placeholder="למשל: א׳ בניסן תשי״ח" />
                                        <InputField label="תאריך לועזי (לידה)" name="birth_gregorian_date" value={formData.birth_gregorian_date} type="date" />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">תאריך עברי</p>
                                            <p className="font-medium text-gray-800">{formData.birth_hebrew_date || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">תאריך לועזי</p>
                                            <p className="font-mono text-gray-600">{formData.birth_gregorian_date || '-'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Personal Details & Bio (Residence, Children) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-r-4 border-purple-500 pr-3">
                            <Info size={20} className="text-gray-400" />
                            פרטים נוספים
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {isEditing ? (
                                <>
                                    <InputField label="מקום מגורים" name="residence" value={formData.residence} placeholder="עיר מגורים, ארץ" />
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">שמות צאצאים (לתפילה)</label>
                                        <textarea
                                            name="children_names"
                                            value={formData.children_names || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="הזיני שמות מופרדים בפסיקים..."
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none transition-colors"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <MapPin size={18} className="text-purple-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">מקום מגורים</p>
                                            <p className="font-medium text-gray-900">{formData.residence || 'לא צוין'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <Users size={18} className="text-purple-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">שמות צאצאים</p>
                                            <p className="font-medium text-gray-900 whitespace-pre-wrap">{formData.children_names || 'לא צוינו'}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 4. Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-r-4 border-green-500 pr-3">
                            <Phone size={20} className="text-gray-400" />
                            פרטי קשר (מזמין האזכרה)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <InputField label="שם מלא (איש קשר)" name="requester_name" value={formData.requester_name} />
                                    <InputField label="טלפון" name="requester_phone" value={formData.requester_phone} type="tel" />
                                    <InputField label="אימייל" name="requester_email" value={formData.requester_email} type="email" />
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">שם המזמין</p>
                                        <p className="font-medium text-gray-900">{formData.requester_name || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                        <Phone size={16} className="text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">טלפון</p>
                                            <p className="font-medium text-gray-900" dir="ltr">{formData.requester_phone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 md:col-span-2">
                                        <Mail size={16} className="text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">אימייל</p>
                                            <p className="font-medium text-gray-900">{formData.requester_email || '-'}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
                        >
                            <Save size={18} /> שמור שינויים
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            סגור חלון
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeceasedPopup;
