import React, { useState } from 'react';
import { Send, Mail, Smartphone, MessageCircle, Users, CheckCircle, AlertCircle } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { sendEmail, sendSMS, sendWhatsApp, sendNewsletter } from '../../services/distributionService';

const DistributionPanel = () => {
    const [selectedChannel, setSelectedChannel] = useState('email'); // 'email', 'sms', 'whatsapp'
    const [recipientType, setRecipientType] = useState('all'); // 'all', 'specific'
    const [specificRecipient, setSpecificRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

    const handleSend = async () => {
        setIsSending(true);
        setStatus(null);

        try {
            let result;
            // Validate inputs
            if (!content) throw new Error('נא להזין תוכן להודעה');
            if (selectedChannel === 'email' && !subject) throw new Error('נא להזין נושא להודעה');
            if (recipientType === 'specific' && !specificRecipient) throw new Error('נא להזין נמען');

            // Determine recipient list (for SMS/WhatsApp)
            const recipients = recipientType === 'specific' ? specificRecipient : '+972500000000';

            if (selectedChannel === 'email') {
                if (recipientType === 'specific') {
                    // Send to specific recipient (test)
                    result = await sendNewsletter(subject, content, [specificRecipient]);
                } else {
                    // Send to all subscribers via backend
                    result = await sendNewsletter(subject, content);
                }
            } else if (selectedChannel === 'sms') {
                result = await sendSMS(recipients, content.replace(/<[^>]*>?/gm, '')); // Strip HTML for SMS
            } else if (selectedChannel === 'whatsapp') {
                result = await sendWhatsApp(recipients, content.replace(/<[^>]*>?/gm, '')); // Strip HTML for WhatsApp
            }

            setStatus({ type: 'success', message: result.message });
            // Clear form
            setContent('');
            setSubject('');
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto" dir="rtl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Send size={28} className="text-blue-600" />
                מערכת תפוצה והודעות
            </h2>

            {/* Channel Selection */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setSelectedChannel('email')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${selectedChannel === 'email' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}
                >
                    <Mail size={20} /> מייל
                </button>
                <button
                    onClick={() => setSelectedChannel('sms')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${selectedChannel === 'sms' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'hover:bg-gray-50'}`}
                >
                    <Smartphone size={20} /> SMS
                </button>
                <button
                    onClick={() => setSelectedChannel('whatsapp')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${selectedChannel === 'whatsapp' ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'hover:bg-gray-50'}`}
                >
                    <MessageCircle size={20} /> וואטסאפ
                </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {/* Recipients */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">נמענים</label>
                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="recipientType"
                                value="all"
                                checked={recipientType === 'all'}
                                onChange={() => setRecipientType('all')}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span>כל המנויים</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="recipientType"
                                value="specific"
                                checked={recipientType === 'specific'}
                                onChange={() => setRecipientType('specific')}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span>נמען ספציפי (לבדיקה)</span>
                        </label>
                    </div>
                    {recipientType === 'specific' && (
                        <input
                            type="text"
                            placeholder={selectedChannel === 'email' ? 'example@email.com' : '97250...'}
                            value={specificRecipient}
                            onChange={(e) => setSpecificRecipient(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            dir="ltr"
                        />
                    )}
                </div>

                {/* Subject (Email Only) */}
                {selectedChannel === 'email' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">נושא ההודעה</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תוכן ההודעה</label>
                    {selectedChannel === 'email' ? (
                        <div className="h-64 mb-12">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                className="h-full"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    ) : (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
                            placeholder="הקלד כאן את תוכן ההודעה..."
                        />
                    )}
                    {selectedChannel !== 'email' && (
                        <p className="text-xs text-gray-500 mt-1">
                            {content.length} תווים (שים לב: עלות הודעת SMS מחושבת לפי כמות התווים)
                        </p>
                    )}
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`p-3 rounded flex items-center gap-2 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSend}
                    disabled={isSending}
                    className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                >
                    {isSending ? (
                        <>שולח...</>
                    ) : (
                        <>
                            <Send size={20} />
                            שלח הודעה ב-{selectedChannel === 'email' ? 'מייל' : (selectedChannel === 'sms' ? 'SMS' : 'וואטסאפ')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DistributionPanel;
