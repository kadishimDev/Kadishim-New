


import React, { useState, useEffect } from 'react';
import {
    Activity, Shield, ListTodo, AlertTriangle, CheckCircle,
    Server, Users, FileText, Database, Clock, RefreshCw
} from 'lucide-react';

import { Analytics } from '../../services/analytics'; // Keep for client-side stats

const TechnicianDashboard = ({ memorials, pages, onNavigate }) => {
    const [diagnostics, setDiagnostics] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [topPages, setTopPages] = useState([]);

    const fetchDiagnostics = async () => {
        setLoadingInfo(true);
        try {
            const res = await fetch('/api/diagnostics.php');
            const data = await res.json();
            setDiagnostics(data);
        } catch (err) {
            console.error("Diagnostics failed", err);
        } finally {
            setLoadingInfo(false);
        }
    };

    useEffect(() => {
        fetchDiagnostics();
        setTopPages(Analytics.getTopPages(5));
    }, []);

    // Calculate Health Score
    const calculateHealth = () => {
        if (!diagnostics) return 0;
        let score = 100;
        if (diagnostics.status === 'error') score -= 50;

        Object.values(diagnostics.checks || {}).forEach(check => {
            if (check.status !== 'ok') score -= 15;
        });

        return Math.max(0, score);
    };

    const healthScore = calculateHealth();
    const isHealthy = healthScore > 80;

    const handleExportJSON = () => {
        const jsonString = JSON.stringify({ memorials, pages, date: new Date() }, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `site_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">לוח בקרה טכני</h1>
                    <p className="text-gray-500">סטטוס מערכת בזמן אמת</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-bold text-sm ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
                        {isHealthy ? 'המערכת תקינה' : 'נדרשת תשומת לב'}
                    </span>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    label="סה״כ אזכרות"
                    value={memorials.length.toLocaleString()}
                    trend="Live Data"
                />
                <StatsCard
                    icon={<FileText className="w-6 h-6 text-purple-500" />}
                    label="דפי תוכן"
                    value={pages.length}
                    trend="Live Data"
                />
                <StatsCard
                    icon={<Activity className="w-6 h-6 text-green-500" />}
                    label="ציון בריאות"
                    value={diagnostics ? `${healthScore}%` : '...'}
                    Color={isHealthy ? "text-green-600" : "text-red-600"}
                />
                <StatsCard
                    icon={<Shield className="w-6 h-6 text-indigo-500" />}
                    label="PHP Version"
                    value={diagnostics?.checks?.php_version?.value || '...'}
                    subtext="Server Environment"
                    Color="text-gray-800"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Main Content: Real Diagnostics */}
                <div className="lg:col-span-2 space-y-8">

                    {/* System Checks */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Server className="w-5 h-5 text-gray-600" />
                                בדיקות מערכת (Live)
                            </h3>
                            <button
                                onClick={fetchDiagnostics}
                                disabled={loadingInfo}
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <RefreshCw size={14} className={loadingInfo ? "animate-spin" : ""} /> רענן
                            </button>
                        </div>

                        {!diagnostics ? (
                            <div className="text-center py-8 text-gray-400">טוען נתונים...</div>
                        ) : (
                            <div className="space-y-3">
                                {Object.values(diagnostics.checks).map((check, idx) => (
                                    <TaskItem key={idx} check={check} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Pages Analytics */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                דפים נצפים ביותר (מקומי)
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

                {/* Sidebar: Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            פעולות תחזוקה
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleExportJSON}
                                className="w-full bg-white/10 hover:bg-white/20 transition p-3 rounded-lg text-right flex items-center gap-3"
                            >
                                <Database className="w-4 h-4" />
                                גיבוי נתונים מלא (JSON)
                            </button>
                            <div className="text-xs text-gray-400 mt-2 p-2 bg-black/20 rounded">
                                * מוריד קובץ המכיל את כל האזכרות והדפים כרגע במערכת.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
            {trend && <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{trend}</span>}
        </div>
        <div className="text-gray-500 text-sm mb-1">{label}</div>
        <div className={`text-2xl font-bold ${Color || 'text-gray-800'}`}>{value}</div>
        {subtext && <div className="text-xs text-gray-400 mt-2">{subtext}</div>}
    </div>
);

const TaskItem = ({ check }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-gray-100">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${check.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
                {check.label}
            </span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-mono">{check.value}</span>
            {check.status === 'ok' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
        </div>
    </div>
);

export default TechnicianDashboard;
