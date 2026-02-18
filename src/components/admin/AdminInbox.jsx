import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, User, Search, RefreshCw, MessageSquare } from 'lucide-react';

const AdminInbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // In dev, we might not have the full path working without proxy, assuming /new/api in production
            const response = await fetch('/new/api/get_messages.php');
            const data = await response.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            // setMessages([]); // Keep existing if fail?
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reply Modal State
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replySubject, setReplySubject] = useState('');
    const [replyBody, setReplyBody] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const openReplyModal = () => {
        if (!selectedMessage) return;
        setReplySubject(`Re: ${selectedMessage.name} - פנייתך לאתר קדישים`);
        setReplyBody(`שלום ${selectedMessage.name},\n\nבהמשך לפנייתך:\n\n`);
        setShowReplyModal(true);
    };

    const handleSendReply = async () => {
        if (!replyBody.trim()) return;
        setSendingReply(true);

        try {
            const response = await fetch('/new/api/reply_message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedMessage.id,
                    subject: replySubject,
                    body: replyBody
                })
            });
            const data = await response.json();

            if (data.success) {
                alert('התגובה נשלחה בהצלחה!');
                setShowReplyModal(false);
                // Optimistically update status
                setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' } : m));
                setSelectedMessage(prev => ({ ...prev, status: 'replied' }));
            } else {
                alert('שגיאה בשליחה: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('שגיאה בשליחת התגובה');
        } finally {
            setSendingReply(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">דואר נכנס (צור קשר)</h2>
                    <p className="text-gray-500">ניהול פניות מהאתר</p>
                </div>
                <button
                    onClick={fetchMessages}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    title="רענן"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם, אימייל..."
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* List */}
                <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
                    {loading && messages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">טוען הודעות...</div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">אין הודעות להצגה</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition border-r-4 ${selectedMessage?.id === msg.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'
                                        } ${msg.status === 'new' ? 'font-bold' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-gray-800">{msg.name}</span>
                                        <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString('he-IL')}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">{msg.email}</div>
                                    <div className="text-sm text-gray-400 truncate mt-1">{msg.message}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
                    {selectedMessage ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{selectedMessage.name}</h3>
                                    <div className="flex items-center gap-4 text-gray-500 mt-2 text-sm">
                                        <span className="flex items-center gap-1"><Mail size={16} /> {selectedMessage.email}</span>
                                        {selectedMessage.phone && <span className="flex items-center gap-1"><Phone size={16} /> {selectedMessage.phone}</span>}
                                        <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(selectedMessage.created_at).toLocaleString('he-IL')}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${selectedMessage.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {selectedMessage.status === 'new' ? 'חדש' : selectedMessage.status}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.message}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={openReplyModal}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <MessageSquare size={18} />
                                    השב לפנייה
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Mail size={48} className="mb-4 opacity-50" />
                            <p>בחר הודעה לצפייה</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {showReplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all scale-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">השב לפנייה: {selectedMessage?.name}</h3>
                            <button onClick={() => setShowReplyModal(false)} className="text-gray-400 hover:text-red-500 transition">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">נושא ההודעה</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                                    value={replySubject}
                                    onChange={(e) => setReplySubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">תוכן ההודעה</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 h-40 focus:ring-2 focus:ring-primary outline-none"
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                            >
                                ביטול
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={sendingReply}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2"
                            >
                                {sendingReply ? 'שולח...' : 'שלח תגובה'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInbox;
