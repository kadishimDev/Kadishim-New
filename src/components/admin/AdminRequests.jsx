import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, User, Search, RefreshCw, ClipboardList, CheckCircle } from 'lucide-react';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await fetch('/new/api/get_requests.php');
            const data = await response.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = requests.filter(req =>
        req.deceased_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requester_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">בקשות קדיש</h2>
                    <p className="text-gray-500">ניהול בקשות אמירת קדיש</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    title="רענן"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="relative max-w-md mb-6">
                <input
                    type="text"
                    placeholder="חיפוש נפטר או מבקש..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
                    {loading && requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">טוען נתונים...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">אין בקשות להצגה</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredRequests.map(req => (
                                <div
                                    key={req.id}
                                    onClick={() => setSelectedRequest(req)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition border-r-4 ${selectedRequest?.id === req.id ? 'bg-orange-50 border-orange-500' : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-800">{req.deceased_name}</span>
                                        <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('he-IL')}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">ע״י: {req.requester_name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
                    {selectedRequest ? (
                        <div className="space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedRequest.deceased_name}</h3>
                                <div className="text-gray-500 mb-4">
                                    בן/בת {selectedRequest.father_name} ו-{selectedRequest.mother_name}
                                </div>
                                <div className="flex gap-2">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">פטירה עברי: {selectedRequest.death_date_hebrew}</span>
                                    {selectedRequest.death_date_gregorian && <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">לועזי: {selectedRequest.death_date_gregorian}</span>}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <User size={18} /> פרטי המבקש
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs text-gray-400">שם מלא</span>
                                        <span className="font-medium">{selectedRequest.requester_name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">קירבה לנפטר</span>
                                        <span className="font-medium">{selectedRequest.relationship}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <a href={`tel:${selectedRequest.requester_phone}`} className="hover:text-primary">{selectedRequest.requester_phone}</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <a href={`mailto:${selectedRequest.requester_email}`} className="hover:text-primary">{selectedRequest.requester_email}</a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button className="text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition font-medium flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    סמן כטופל
                                </button>
                                <a
                                    href={`mailto:${selectedRequest.requester_email}?subject=לגבי בקשת הקדיש עבור ${selectedRequest.deceased_name}`}
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                                >
                                    <Mail size={18} />
                                    צור קשר עם המבקש
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <ClipboardList size={48} className="mb-4 opacity-50" />
                            <p>בחר בקשה לצפייה בפרטים</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminRequests;
