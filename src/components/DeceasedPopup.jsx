import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Info, Phone, Mail, MapPin, Edit2, Save, Users } from 'lucide-react';
import HebrewDatePicker from './HebrewDatePicker';
import { HDate } from '@hebcal/core';

// Helper Component defined outside to prevent re-renders
const InputField = ({ label, name, value, onChange, isEditing, type = 'text', placeholder = '' }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none transition-colors disabled:opacity-60 disabled:bg-gray-100"
            disabled={!isEditing}
        />
    </div>
);

const DeceasedPopup = ({ data, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(data || {});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState('death'); // 'death' or 'birth'

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

    const handleDateSelect = (hDate) => {
        const gregDate = hDate.greg();
        const gregStr = gregDate.toISOString().split('T')[0];

        // Strict Hebrew Date Formatter
        const formatStrict = (hd) => {
            // Use internal render if available or just construct from parts
            let s = hd.render('h'); // e.g. "כ׳ בכסלו התשפ״ה"

            // Fix Year: Ensure 'ה' prefix if missing for 5000+ years
            const parts = s.split(' ');
            let yearStr = parts[parts.length - 1]; // Last part is year

            // Remove existing quotes to normalize
            yearStr = yearStr.replace(/['"״]/g, '');

            // Add 'ה' if missing
            if (!yearStr.startsWith('ה')) {
                yearStr = 'ה' + yearStr;
            }

            // Re-insert quotes: If length > 1, put before last letter
            if (yearStr.length > 1) {
                yearStr = yearStr.slice(0, -1) + '"' + yearStr.slice(-1);
            } else {
                yearStr += "'";
            }

            parts[parts.length - 1] = yearStr;
            return parts.join(' ');
        };

        const dateStr = formatStrict(hDate);

        if (datePickerTarget === 'death') {
            setFormData(prev => ({
                ...prev,
                hebrew_date_text: dateStr,
                death_date_hebrew: dateStr,
                gregorian_date: gregStr,
                death_date_gregorian: gregStr
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                birth_hebrew_date: dateStr,
                birth_date_hebrew: dateStr,
                birth_gregorian_date: gregStr,
                birth_date_gregorian: gregStr
            }));
        }
        setShowDatePicker(false);
    };

    // InputField removed from here (moved to top)

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in_modal"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-start shrink-0">
                    <div className="flex-grow">
                        {isEditing ? (
                            <input
                                type="text"
                                name="name" // Mapped to 'deceased_name' in API usually, but kept as 'name' here based on prop
                                value={formData.name || ''}
                                onChange={handleChange}
                                className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 w-full mb-2"
                                placeholder="שם הנפטר"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                        )}

                        <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                            <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">{formData.gender === 'male' || formData.gender === 'son_of' ? 'זכר' : 'נקבה'}</span>
                            {isEditing && (
                                <select name="gender" value={formData.gender || 'son_of'} onChange={handleChange} className="text-xs bg-white border rounded px-1">
                                    <option value="son_of">זכר</option>
                                    <option value="daughter_of">נקבה</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                            <InputField label="שם האב" name="father_name" value={formData.father_name} onChange={handleChange} isEditing={isEditing} />
                            <InputField label="שם האם" name="mother_name" value={formData.mother_name} onChange={handleChange} isEditing={isEditing} />
                        </div>
                    </div>

                    {/* 2. Dates */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-r-4 border-blue-500 pr-3">
                            <Calendar size={20} className="text-gray-400" />
                            תאריכים
                        </h3>

                        {/* Death Date */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative">
                            <div className="flex justify-between items-center mb-3 border-b border-blue-100 pb-2">
                                <p className="text-sm font-bold text-blue-900">תאריך פטירה</p>
                                {isEditing && (
                                    <button
                                        onClick={() => { setDatePickerTarget('death'); setShowDatePicker(true); }}
                                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                                    >
                                        בחר תאריך 📅
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="תאריך עברי (פטירה)" name="hebrew_date_text" value={formData.hebrew_date_text} onChange={handleChange} isEditing={isEditing} />
                                <InputField label="תאריך לועזי (פטירה)" name="gregorian_date" value={formData.gregorian_date} type="date" onChange={handleChange} isEditing={isEditing} />
                            </div>
                        </div>

                        {/* Birth Date */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                                <p className="text-sm font-bold text-gray-700">תאריך לידה</p>
                                {isEditing && (
                                    <button
                                        onClick={() => { setDatePickerTarget('birth'); setShowDatePicker(true); }}
                                        className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition"
                                    >
                                        בחר תאריך 📅
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="תאריך עברי (לידה)" name="birth_hebrew_date" value={formData.birth_hebrew_date} onChange={handleChange} isEditing={isEditing} />
                                <InputField label="תאריך לועזי (לידה)" name="birth_gregorian_date" value={formData.birth_gregorian_date} type="date" onChange={handleChange} isEditing={isEditing} />
                            </div>
                        </div>
                    </div>

                    {/* 3. Personal Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-r-4 border-purple-500 pr-3">
                            <Info size={20} className="text-gray-400" />
                            פרטים נוספים
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <InputField label="מקום מגורים" name="memorial_residence" value={formData.memorial_residence || formData.residence} placeholder="עיר מגורים, ארץ" onChange={handleChange} isEditing={isEditing} />
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">שמות צאצאים (לתפילה)</label>
                                <textarea
                                    name="memorial_children"
                                    value={formData.memorial_children || formData.children_names || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none transition-colors"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-r-4 border-green-500 pr-3">
                            <Phone size={20} className="text-gray-400" />
                            פרטי קשר (מזמין האזכרה)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="שם מלא (איש קשר)" name="requester_name" value={formData.requester_name} onChange={handleChange} isEditing={isEditing} />
                            <InputField label="טלפון" name="requester_phone" value={formData.requester_phone} type="tel" onChange={handleChange} isEditing={isEditing} />
                            <InputField label="אימייל" name="requester_email" value={formData.requester_email} type="email" onChange={handleChange} isEditing={isEditing} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
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

            {/* Date Picker Modal */}
            <HebrewDatePicker
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelectDate={handleDateSelect}
                initialDate={datePickerTarget === 'death'
                    ? (formData.gregorian_date || formData.death_date_gregorian)
                    : (formData.birth_gregorian_date || formData.birth_date_gregorian)}
            />
        </div>
    );
};

export default DeceasedPopup;
