import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        }, 1500);
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">הודעתך התקבלה בהצלחה!</h3>
                <p className="text-green-700">תודה שפנית אלינו, נחזור אליך בהקדם.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-green-700 font-bold hover:underline"
                >
                    שליחת הודעה נוספת
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-100 rounded-xl p-6 md:p-8 mt-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">טופס יצירת קשר</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">שם מלא</label>
                    <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">טלפון</label>
                    <input
                        type="tel"
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">דואר אלקטרוני</label>
                <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">תוכן ההודעה</label>
                <textarea
                    rows="4"
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
            </div>

            <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-primary hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
                {status === 'submitting' ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <>
                        שליחת הודעה <Send size={18} />
                    </>
                )}
            </button>
        </form>
    );
};

export default ContactForm;
