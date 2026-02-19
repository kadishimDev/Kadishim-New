import React, { useState, useEffect } from 'react';
import { Send, Check, ArrowRight, Calendar, UserPlus, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { sendKaddishRequest } from '../services/distributionService';
import HebrewDatePicker from '../components/HebrewDatePicker';
import { HDate, gematriya } from '@hebcal/core';
import { formatHebrewDate, getStructuredHebrewDate } from '../utils/dateUtils';

const RequestKaddish = () => {
    const { settings } = useSettings();
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState('death'); // 'death' or 'birth'

    const [formData, setFormData] = useState({
        deceased_name: '',
        deceased_father_name: '',
        deceased_mother_name: '',
        gender: 'male',

        hebrew_death_day: '',
        hebrew_death_month: '',
        hebrew_death_year: '',
        gregorian_death_date: '',
        death_after_sunset: false,

        hebrew_birth_day: '',
        hebrew_birth_month: '',
        hebrew_birth_year: '',
        gregorian_birth_date: '',

        requester_name: '',
        requester_email: '',
        requester_phone: '',
        requester_relation: '',

        requester_city: '',
        requester_street: '',
        requester_house_number: '',
        requester_apartment: '',
        requester_zip: '',

        notes: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateSelect = (selectedDateObj) => {
        if (!selectedDateObj) return;
        try {
            let hDate = selectedDateObj instanceof HDate ? selectedDateObj : new HDate(selectedDateObj);

            // Use structured formatter
            const { day, month, year } = getStructuredHebrewDate(hDate);

            const gregDate = hDate.greg();
            const gregStr = gregDate.toISOString().split('T')[0];

            if (datePickerTarget === 'death') {
                setFormData(prev => ({
                    ...prev,
                    hebrew_death_day: day,
                    hebrew_death_month: month,
                    hebrew_death_year: year,
                    gregorian_death_date: gregStr
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    hebrew_birth_day: day,
                    hebrew_birth_month: month,
                    hebrew_birth_year: year,
                    gregorian_birth_date: gregStr
                }));
            }
        } catch (e) {
            console.error("Date Selection Error:", e);
        }
    };

    const handleGregorianChange = (target, value) => {
        if (!value) return;
        try {
            const d = new Date(value);
            const hDate = new HDate(d);

            // Auto convert using structured formatter
            const { day, month, year } = getStructuredHebrewDate(hDate);

            if (target === 'death') {
                setFormData(prev => ({
                    ...prev,
                    gregorian_death_date: value,
                    hebrew_death_day: day,
                    hebrew_death_month: month,
                    hebrew_death_year: year
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    gregorian_birth_date: value,
                    hebrew_birth_day: day,
                    hebrew_birth_month: month,
                    hebrew_birth_year: year
                }));
            }
        } catch (e) {
            console.error("Invalid Date", e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Basic Validation
        if (!formData.deceased_name || !formData.deceased_mother_name) {
            alert('נא למלא שם הנפטר ושם האם');
            setStatus('idle');
            return;
        }

        if (!formData.hebrew_death_day && !formData.gregorian_death_date) {
            alert('נא להזין תאריך פטירה (עברי או לועזי)');
            setStatus('idle');
            return;
        }

        try {
            await sendKaddishRequest(formData);
            setStatus('success');
            // Optional: Reset form or redirect
        } catch (error) {
            console.error(error);
            setStatus('error');
            alert('אירעה שגיאה בשליחת הבקשה. אנא נסה שנית.');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-light p-4 text-center">
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full transform transition-all animate-fade-in-up">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">הבקשה התקבלה בהצלחה!</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        פרטי הנפטר/ת נרשמו במערכת ויועברו לאברכי הכולל לאמירת קדיש וללימוד משניות.
                        <br />
                        תזכורת תשלח אליכם לקראת יום השנה.
                    </p>
                    <Link to="/" className="inline-flex items-center text-primary font-bold hover:underline">
                        חזרה לדף הבית <ArrowRight className="mr-2" size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600 leading-tight">
                        בקשת אמירת קדיש
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        הנצחת יקיריכם על ידי אברכי כולל "יצחק" בירושלים. השירות ניתן ללא עלות כחלק ממפעל החסד.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 space-y-12">

                    {/* Section 1: Deceased Info */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-700 text-xl border-r-4 border-primary pr-3 flex items-center gap-2">
                            <UserPlus size={24} />
                            פרטי הנפטר/ת
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="שם הנפטר/ת (פרטי + משפחה)" name="deceased_name" required onChange={handleChange} />

                            <div className="md:col-span-2 grid grid-cols-2 gap-6">
                                <InputGroup label="שם האב" name="deceased_father_name" onChange={handleChange} />
                                <InputGroup label="שם האם" name="deceased_mother_name" required onChange={handleChange} />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-bold text-gray-700">מין הנפטר</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg flex-1 hover:bg-gray-100 transition">
                                        <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="text-primary focus:ring-primary" />
                                        <span className="font-medium">זכר (בן)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg flex-1 hover:bg-gray-100 transition">
                                        <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="text-primary focus:ring-primary" />
                                        <span className="font-medium">נקבה (בת)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates Section */}
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 space-y-6">
                        <h4 className="font-bold text-dark text-lg border-b border-yellow-200 pb-2">תאריכים חשובים</h4>

                        {/* Death Date */}
                        <div>
                            <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={18} /> תאריך פטירה (חובה להזין לפחות אחד)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-gray-500">תאריך עברי</label>
                                        <button
                                            type="button"
                                            onClick={() => { setDatePickerTarget('death'); setShowDatePicker(true); }}
                                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-orange-600 transition"
                                        >
                                            בחר יום 📅
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="text" name="hebrew_death_day" value={formData.hebrew_death_day || ''} placeholder="יום (למשל: י')" className="p-2 border rounded text-center w-full" onChange={handleChange} />
                                        <input type="text" name="hebrew_death_month" value={formData.hebrew_death_month || ''} placeholder="חודש" className="p-2 border rounded text-center w-full" onChange={handleChange} />
                                        <input type="text" name="hebrew_death_year" value={formData.hebrew_death_year || ''} placeholder="שנה" className="p-2 border rounded text-center w-full" onChange={handleChange} />
                                    </div>
                                    <label className="flex items-center gap-2 text-xs text-gray-500 mt-2 cursor-pointer">
                                        <input type="checkbox" name="death_after_sunset" checked={formData.death_after_sunset} onChange={handleChange} className="rounded text-primary" />
                                        נפטר לאחר השקיעה?
                                    </label>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <label className="text-sm font-bold text-gray-500 mb-2 block">תאריך לועזי</label>
                                    <input type="date" name="gregorian_death_date" value={formData.gregorian_death_date || ''} className="p-2 border rounded w-full" onChange={handleChange} />
                                    <p className="text-[10px] text-gray-400 mt-1">* המערכת תמיר אוטומטית בין התאריכים</p>
                                </div>
                            </div>
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <p className="font-medium">📌 לידיעתכם:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700 text-xs">
                                    <li>אמירת הקדיש תתבצע במשך <strong>כל שנת האבל</strong> מתאריך הפטירה.</li>
                                    <li>תזכורת תשלח אליכם לקראת <strong>יום השנה (יארצייט)</strong> מדי שנה.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Birth Date (Optional) */}
                        <div>
                            <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={18} /> תאריך לידה (אופציונלי)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-4 rounded-lg border border-gray-200 relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-gray-500">תאריך עברי</label>
                                        <button
                                            type="button"
                                            onClick={() => { setDatePickerTarget('birth'); setShowDatePicker(true); }}
                                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-orange-600 transition"
                                        >
                                            בחר יום 📅
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="text" name="hebrew_birth_day" value={formData.hebrew_birth_day || ''} placeholder="יום" className="p-2 border rounded text-center w-full" onChange={handleChange} />
                                        <input type="text" name="hebrew_birth_month" value={formData.hebrew_birth_month || ''} placeholder="חודש" className="p-2 border rounded text-center w-full" onChange={handleChange} />
                                        <input type="text" name="hebrew_birth_year" value={formData.hebrew_birth_year || ''} placeholder="שנה" className="p-2 border rounded text-center w-full" onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <label className="text-sm font-bold text-gray-500 mb-2 block">תאריך לועזי</label>
                                    <input type="date" name="gregorian_birth_date" value={formData.gregorian_birth_date || ''} className="p-2 border rounded w-full" onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Requester Info */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-700 text-xl border-r-4 border-primary pr-3 flex items-center gap-2">
                            <Globe size={24} />
                            פרטי המבקש/ת וכתובת
                        </h4>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputGroup label="שמך המלא" name="requester_name" required onChange={handleChange} />
                            <InputGroup label="טלפון נייד" name="requester_phone" type="tel" required onChange={handleChange} />
                            <InputGroup label="אימייל" name="requester_email" type="email" required onChange={handleChange} />
                        </div>

                        {/* Address */}
                        <div className="p-6 bg-gray-50 rounded-xl space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1"><InputGroup label="עיר" name="requester_city" onChange={handleChange} /></div>
                                <div className="md:col-span-2"><InputGroup label="רחוב" name="requester_street" onChange={handleChange} /></div>
                                <InputGroup label="מס' בית" name="requester_house_number" onChange={handleChange} />
                                <InputGroup label="מס' דירה" name="requester_apartment" onChange={handleChange} />
                                <div className="md:col-span-2"><InputGroup label="מיקוד" name="requester_zip" onChange={handleChange} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-primary text-dark font-bold text-xl py-6 rounded-xl hover:bg-yellow-400 hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            {status === 'submitting' ? 'שולח...' : (
                                <>שליחת הבקשה <Send size={24} /></>
                            )}
                        </button>
                        <p className="text-center text-gray-400 text-sm mt-4">
                            השירות ניתן ע"י ארגון קדישים ללא מטרות רווח. הנתונים נשמרים בבטחה.
                        </p>
                    </div>
                </form>

                {/* Modals */}
                <HebrewDatePicker
                    isOpen={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    onSelect={handleDateSelect}
                />
            </div>
        </div>
    );
};

const InputGroup = ({ label, name, type = "text", placeholder, dir = "rtl", onChange, required = false }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            required={required}
            placeholder={placeholder}
            dir={dir}
            onChange={onChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
    </div>
);

export default RequestKaddish;
