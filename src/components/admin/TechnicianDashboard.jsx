
import React, { useState, useEffect } from 'react';
import {
    Activity, Shield, ListTodo, AlertTriangle, CheckCircle,
    Server, Users, FileText, Database, Clock
} from 'lucide-react';

import { Analytics } from '../../services/analytics';

const TechnicianDashboard = ({ memorials, pages, onNavigate }) => {
    const [stats, setStats] = useState({
        totalMemorials: 0,
        totalPages: 0,
        systemHealth: 100,
        pendingTasks: 2,
        vulnerabilities: 0
    });
    const [topPages, setTopPages] = useState([]);

    useEffect(() => {
        setStats({
            totalMemorials: memorials.length,
            totalPages: pages.length,
            systemHealth: 98,
            pendingTasks: 1,
            vulnerabilities: 0
        });

        // Load Analytics
        setTopPages(Analytics.getTopPages(5));
    }, [memorials, pages]);

    const handleExportJSON = () => {
        const jsonString = JSON.stringify(memorials, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `memorials_backup_${new Date().toLocaleDateString()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const openModal = (title, body) => {
        setModalContent({ title, body });
        setShowModal(true);
    };

    const handleShowLogs = () => {
        // Mock Logs
        const logs = [
            `[${new Date().toLocaleTimeString('he-IL')}] המערכת נטענה בהצלחה`,
            `[${new Date().toLocaleTimeString('he-IL')}] בדיקת תקינות מסד נתונים עברה`,
            `[${new Date().toLocaleTimeString('he-IL')}] משתמש 'Admin' התחבר למערכת`,
            `[${new Date().toLocaleTimeString('he-IL')}] נתונים סונכרנו מול השרת`
        ].join('\n');

        const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'system_logs.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        openModal("הורדת יומן שגיאות", "יומן המערכת (system_logs.txt) והורד למחשבך בהצלחה.");
    };

    const handleShowHistory = () => {
        const history = (
            <div className="space-y-4 text-right" dir="rtl">
                <div className="border-b pb-2">
                    <h4 className="font-bold text-lg text-blue-600">v2.1 (07/02/2026)</h4>
                    <ul className="list-disc list-inside text-gray-700">
                        <li>לוח בקרה טכני חדש עם אנליטיקה</li>
                        <li>דיאגנוסטיקה מתקדמת (DNA)</li>
                        <li>תיקון מיון תאריכים עבריים</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg text-gray-600">v2.0 (05/02/2026)</h4>
                    <ul className="list-disc list-inside text-gray-700">
                        <li>העלאת מסד נתונים מחודש</li>
                        <li>תיקון תצוגת לוח שנה</li>
                    </ul>
                </div>
            </div>
        );
        openModal("היסטוריית גרסאות", history);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">לוח בקרה טכני</h1>
                    <p className="text-gray-500">סקירת מערכת ותחזוקה שוטפת</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-bold text-sm">המערכת תקינה V2.1</span>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    label="סה״כ אזכרות"
                    value={stats.totalMemorials.toLocaleString()}
                    trend="+12 השבוע"
                />
                <StatsCard
                    icon={<FileText className="w-6 h-6 text-purple-500" />}
                    label="דפי תוכן"
                    value={stats.totalPages}
                    trend="מעודכן"
                />
                <StatsCard
                    icon={<Activity className="w-6 h-6 text-green-500" />}
                    label="ציון בריאות"
                    value={`${stats.systemHealth}%`}
                    Color="text-green-600"
                />
                <StatsCard
                    icon={<Shield className="w-6 h-6 text-indigo-500" />}
                    label="נקודות תורפה"
                    value={stats.vulnerabilities}
                    subtext="סריקה אחרונה: היום"
                    Color="text-gray-800"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Main Content: Tasks & Health */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Tasks */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ListTodo className="w-5 h-5 text-orange-500" />
                                משימות תחזוקה
                            </h3>
                            <button className="text-sm text-blue-600 hover:underline">ניהול משימות</button>
                        </div>
                        <div className="space-y-3">
                            <TaskItem
                                title="גיבוי מסד נתונים חודשי"
                                status="pending"
                                priority="medium"
                                date="01/03/2026"
                            />
                            <TaskItem
                                title="עדכון גרסת React (v19.2)"
                                status="completed"
                                priority="low"
                                date="הושלם"
                            />
                            <TaskItem
                                title="בדיקת תאימות דפדפנים"
                                status="completed"
                                priority="high"
                                date="הושלם"
                            />
                        </div>
                    </div>

                    {/* Top Pages Analytics */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                דפים נצפים ביותר (Top 5)
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {topPages.length === 0 ? (
                                <p className="text-gray-400 text-sm">אין עדיין נתונים...</p>
                            ) : (
                                topPages.map((page, index) => (
                                    <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-400 w-4">{index + 1}</span>
                                            <span className="text-sm font-medium text-gray-700" dir="ltr">{page.path}</span>
                                        </div>
                                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                                            {page.views} צפיות
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Quick Actions & Log */}
                <div className="space-y-6">
                    {/* Technician Quick Actions */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5" />
                            פעולות טכנאי
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleExportJSON}
                                className="w-full bg-white/10 hover:bg-white/20 transition p-3 rounded-lg text-right flex items-center gap-3"
                            >
                                <Database className="w-4 h-4" />
                                ייצוא נתונים (JSON)
                            </button>
                            <button
                                onClick={handleShowLogs}
                                className="w-full bg-white/10 hover:bg-white/20 transition p-3 rounded-lg text-right flex items-center gap-3"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                יומן שגיאות (Error Log)
                            </button>
                            <button
                                onClick={handleShowHistory}
                                className="w-full bg-white/10 hover:bg-white/20 transition p-3 rounded-lg text-right flex items-center gap-3"
                            >
                                <Clock className="w-4 h-4" />
                                היסטוריית שינויים
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2">עדכון מערכת אחרון</h4>
                        <p className="text-sm text-blue-600 mb-4">
                            בוצע עדכון גרסה 2.1 הכולל תיקון לוח שנה ושיפורי אבטחה.
                        </p>
                        <span className="text-xs text-blue-400 font-mono">Build: v2.1.0-beta</span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-blue-500" />
                            סטטוס רכיבים
                        </h3>
                        <div className="space-y-3">
                            <HealthCheckItem label="Database" status="ok" />
                            <HealthCheckItem label="API Latency" status="ok" value="45ms" />
                            <HealthCheckItem label="Storage" status="ok" value="12%" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">{modalContent.title}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition">
                                <CheckCircle className="w-5 h-5 rotate-45 text-gray-500 hover:text-red-500" style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <div className="p-6 text-gray-600">
                            {modalContent.body}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                                סגור
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const StatsCard = ({ icon, label, value, trend, subtext, Color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-50 rounded-xl">
                {icon}
            </div>
            {trend && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
        </div>
        <div className="text-gray-500 text-sm mb-1">{label}</div>
        <div className={`text-2xl font-bold ${Color || 'text-gray-800'}`}>{value}</div>
        {subtext && <div className="text-xs text-gray-400 mt-2">{subtext}</div>}
    </div>
);

const TaskItem = ({ title, status, priority, date }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-gray-100">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
            <span className={`text-sm font-medium ${status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {title}
            </span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{date}</span>
            {status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
            )}
        </div>
    </div>
);

const HealthCheckItem = ({ label, status, value }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
            {value && <span className="text-xs font-mono text-gray-500">{value}</span>}
            {status === 'ok' ? (
                <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <CheckCircle className="w-3 h-3" /> OK
                </div>
            ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-orange-600">
                    <AlertTriangle className="w-3 h-3" /> Warn
                </div>
            )}
        </div>
    </div>
);

export default TechnicianDashboard;
