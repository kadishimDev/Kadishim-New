import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

// Layout & Components
import AdminLayout from '../layouts/AdminLayout';
import DashboardHome from '../components/admin/DashboardHome';
import MemorialsManager from '../components/admin/MemorialsManager';
import PageEditor from '../components/admin/PageEditor';
import HebrewCalendarWidget from '../components/HebrewCalendarWidget';

// Data
import memorialsData from '../data/memorials.json';
import pagesData from '../data/pages_db.json';

const Admin = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(false);

    // Navigation (Managed by Layout)
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data State
    const [memorials, setMemorials] = useState(memorialsData);
    const [pages, setPages] = useState(pagesData);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            // Optional: Save to localStorage
        } else {
            setAuthError(true);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
    };

    const handlePageUpdate = (updatedPage) => {
        // Optimistic Update
        setPages(prev => prev.map(p => p.slug === updatedPage.slug ? updatedPage : p));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" dir="rtl">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="bg-black inline-block p-4 rounded-full mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">ממשק ניהול מרכזי</h2>
                        <p className="text-gray-500 mt-2">גישה לצוות האתר בלבד</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password-input" className="block text-sm font-bold text-gray-700 mb-1">סיסמת מערכת</label>
                            <input
                                id="password-input"
                                type="password"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
                                autoFocus
                            />
                        </div>

                        {authError && (
                            <div className="text-red-500 text-sm bg-red-50 p-2 rounded flex items-center gap-2 font-bold">
                                ⚠ סיסמה שגויה
                            </div>
                        )}

                        <button className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                            כניסה למערכת
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Main Router Switch
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardHome memorials={memorials} pages={pages} />;
            case 'memorials':
                return <MemorialsManager memorials={memorials} />;
            case 'calendar':
                // Full screen calendar widget
                return (
                    <div className="animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-start">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">לוח שנה עברי - צפייה באזכרות</h2>
                            <HebrewCalendarWidget kaddishList={memorials} />
                        </div>
                    </div>
                );
            case 'pages':
                return <PageEditor pages={pages} onUpdate={handlePageUpdate} />;
            case 'settings':
                return <div className="text-center text-gray-400 mt-20">מודול הגדרות בבנייה...</div>;
            default:
                return <DashboardHome memorials={memorials} pages={pages} />;
        }
    };

    return (
        <AdminLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
        >
            {renderContent()}
        </AdminLayout>
    );
};

export default Admin;
