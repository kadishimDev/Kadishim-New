import React, { useState } from 'react';
import { Send, Check, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const RequestKaddish = () => {
    const [formData, setFormData] = useState({
        // Requester Details
        requester_first_name: '',
        requester_last_name: '',
        requester_phone_prefix: '050',
        requester_phone: '',
        requester_email: '',
        requester_city: '',
        requester_street: '',
        requester_house_number: '',
        requester_apartment: '',
        requester_zip: '',

        // Deceased Details
        relationship: '',
        deceased_first_name: '',
        deceased_last_name: '',
        deceased_gender: 'son_of', // 'son_of' (Ben) or 'daughter_of' (Bat)
        father_name: '',
        mother_name: '', // NEW
        calendar_type: 'hebrew', // 'hebrew' or 'gregorian'
        death_date_day: '',
        death_date_month: '',
        death_date_year: '',
        death_after_sunset: false
    });

    const [status, setStatus] = useState('idle');

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulating API
        setTimeout(() => setStatus('success'), 1500);
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-2xl shadow-xl max-w-xl w-full text-center space-y-8 animate-fade-in border-t-8 border-primary">
                    <div className="w-24 h-24 bg-green-100 text-green-600 mx-auto rounded-full flex items-center justify-center mb-6">
                        <Check size={48} />
                    </div>
                    <h2 className="text-4xl font-bold text-dark">הבקשה התקבלה בהצלחה</h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        תודה רבה לך, {formData.requester_first_name}.<br />
                        פרטי הבקשה לעילוי נשמת <br />
                        <span className="font-bold text-dark text-2xl">{formData.deceased_first_name} {formData.deceased_last_name}</span> <br />
                        נקלטו במערכת והועברו לטיפול.
                    </p>
                    <div className="pt-8">
                        <button onClick={() => setStatus('idle')} className="text-primary font-bold underline hover:text-dark transition-colors text-lg">
                            הגש בקשה נוספת
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light py-12 px-4 md:px-8">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-dark text-white p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <Link to="/" className="absolute top-8 right-8 text-white/60 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowRight size={20} /> חזרה
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">טופס בקשת קדיש</h1>
                    <p className="text-xl text-gray-400 font-light relative z-10">
                        אנא מלאו את הפרטים במדויק על מנת שנוכל להנציח את יקירכם כראוי.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-12">

                    {/* SECTION 1: DECEASED INFO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-dark font-bold">1</div>
                            <h3 className="text-2xl font-bold text-dark">פרטי הנפטר/ת</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputGroup label="שם פרטי" name="deceased_first_name" onChange={handleChange} required />
                            <InputGroup label="שם משפחה" name="deceased_last_name" onChange={handleChange} required />
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">קירבה לנפטר</label>
                                <select name="relationship" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary outline-none">
                                    <option value="">בחר/י קירבה...</option>
                                    <option value="father">אבא</option>
                                    <option value="mother">אמא</option>
                                    <option value="brother">אח/אחות</option>
                                    <option value="spouse">בעל/אישה</option>
                                    <option value="son">בן/בת</option>
                                    <option value="grandfather">סבא/סבתא</option>
                                    <option value="other">אחר</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">בן / בת ?</label>
                                <select name="deceased_gender" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary outline-none">
                                    <option value="son_of">בן (ר' פלוני בן...)</option>
                                    <option value="daughter_of">בת (מרת פלונית בת...)</option>
                                </select>
                            </div>
                            <InputGroup label="שם האב" name="father_name" placeholder="למשל: יצחק" onChange={handleChange} required />
                            <InputGroup label="שם האם" name="mother_name" placeholder="למשל: שרה" onChange={handleChange} required />
                        </div>

                        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <Calendar className="text-primary" />
                                <h4 className="font-bold text-dark">תאריך הפטירה</h4>
                            </div>

                            <div className="flex gap-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="calendar_type" value="hebrew" checked={formData.calendar_type === 'hebrew'} onChange={handleChange} className="text-primary focus:ring-primary" />
                                    <span>תאריך עברי</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="calendar_type" value="gregorian" checked={formData.calendar_type === 'gregorian'} onChange={handleChange} className="text-primary focus:ring-primary" />
                                    <span>תאריך לועזי</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-w-md">
                                <input type="number" name="death_date_day" placeholder="יום" required className="p-3 border rounded-lg text-center" onChange={handleChange} min="1" max="31" />
                                <input type="text" name="death_date_month" placeholder="חודש" required className="p-3 border rounded-lg text-center" onChange={handleChange} />
                                <input type="number" name="death_date_year" placeholder="שנה" required className="p-3 border rounded-lg text-center" onChange={handleChange} min="1900" />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
                                <input type="checkbox" name="death_after_sunset" onChange={handleChange} className="rounded text-primary" />
                                נפטר לאחר השקיעה? (משפיע על התאריך העברי)
                            </label>
                        </div>
                    </div>

                    {/* SECTION 2: REQUESTER INFO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                            <div className="w-10 h-10 bg-dark text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <h3 className="text-2xl font-bold text-dark">פרטי המבקש/ת</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="שם פרטי" name="requester_first_name" onChange={handleChange} required />
                            <InputGroup label="שם משפחה" name="requester_last_name" onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">טלפון נייד</label>
                                <div className="flex" dir="ltr">
                                    <select name="requester_phone_prefix" onChange={handleChange} className="p-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg w-24 outline-none">
                                        <option>050</option><option>052</option><option>053</option><option>054</option><option>055</option><option>058</option>
                                    </select>
                                    <input type="tel" name="requester_phone" required onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-r-lg outline-none" placeholder="1234567" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <InputGroup label="כתובת אימייל" name="requester_email" type="email" dir="ltr" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                            <h4 className="font-bold text-gray-700">כתובת למשלוח קבלות</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2"><InputGroup label="עיר" name="requester_city" onChange={handleChange} /></div>
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
