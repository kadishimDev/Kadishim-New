import React, { useMemo } from 'react';
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react';
import { formatHebrewDateSmart } from '../../utils/dateUtils';
import { HDate } from '@hebcal/core';
import DeceasedPopup from '../DeceasedPopup';

const DashboardHome = ({ memorials, pages, onUpdate }) => {
    const [popupItem, setPopupItem] = React.useState(null); // Local state for popup

    // Stats
    const stats = useMemo(() => {
        const total = memorials.length;
        const totalPages = pages.length;

        // New today (approximate check matching creation date)
        const todayStr = new Date().toISOString().split('T')[0];
        const newToday = memorials.filter(m => m.created_at && m.created_at.startsWith(todayStr)).length;

        // Upcoming Yahrzeits (This month)
        const thisMonth = new HDate().getMonth();
        const upcoming = memorials.filter(m => m.hebrew_date_struct && m.hebrew_date_struct.month === thisMonth).length;

        return { total, totalPages, newToday, upcoming };
    }, [memorials, pages]);

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800">לוח בקרה</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="סה&quot;כ אזכרות" value={stats.total} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard title="נוספו היום" value={stats.newToday} icon={TrendingUp} color="bg-green-50 text-green-600" />
                <StatCard title="אזכרות החודש" value={stats.upcoming} icon={Calendar} color="bg-orange-50 text-orange-600" />
                <StatCard title="דפי תוכן" value={stats.totalPages} icon={FileText} color="bg-purple-50 text-purple-600" />
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">נוספו לאחרונה</h3>
                <div className="space-y-3">
                    {memorials.slice(0, 5).map(m => (
                        <div
                            key={m.id}
                            onClick={() => setPopupItem(m)}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {m.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{m.name}</div>
                                    <div className="text-xs text-gray-500">נוסף ע"י {m.requester_name}</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {m.hebrew_date_text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popup */}
            {popupItem && (
                <div style={{ position: 'fixed', zIndex: 9999 }}> {/* Inline style fallback just in case, though component handles it */}
                    <DeceasedPopup data={popupItem} onClose={() => setPopupItem(null)} onUpdate={onUpdate} />
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

export default DashboardHome;
