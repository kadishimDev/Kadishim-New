import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, FileText, Users, Settings, Flame } from 'lucide-react';

// Layout & Components
// Layout & Components
import AdminLayout from '../layouts/AdminLayoutFix'; // Setup Fix
import DashboardHome from '../components/admin/DashboardHome';
import MissionControl from '../components/admin/MissionControl';
import MemorialsManager from '../components/admin/MemorialsManager';
import PageEditor from '../components/admin/PageEditor';
import DistributionPanel from '../components/admin/DistributionPanel';
import SettingsManager from '../components/admin/SettingsManager';
import HebrewCalendarWidget from '../components/HebrewCalendarWidget';
import AdminRequests from '../components/admin/AdminRequests';
import AdminInbox from '../components/admin/AdminInbox';
import AdminYizkor from '../components/admin/AdminYizkor'; // Added

// Data (Imports removed as we use DataContext/SettingsContext)


import { useData } from '../context/DataContext';

const Admin = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(false);

    // Navigation (Managed by Layout)
    const [activeTab, setActiveTab] = useState('dashboard');
    const [navParams, setNavParams] = useState(null);

    // Data from Context
    const {
        memorials,
        pages,
        loading: dataLoading,
        savePage,
        updateMemorial
    } = useData();

    // Derived loading state
    const isLoading = dataLoading.pages || dataLoading.memorials;

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            setAuthError(true);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
    };

    const handleNavigate = (tab, params = null) => {
        setNavParams(params);
        setActiveTab(tab);
    };

    // Main Router Switch
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return <MissionControl onNavigate={handleNavigate} />;
            case 'memorials':
                return <MemorialsManager memorials={memorials} onUpdate={updateMemorial} initialParams={navParams} />;
            case 'yizkor': // New Tab Case
                return <AdminYizkor />;
            case 'calendar':
                return (
                    <div className="animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-start">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">לוח שנה עברי - צפייה באזכרות</h2>
                            <HebrewCalendarWidget kaddishList={memorials} onUpdate={updateMemorial} />
                        </div>
                    </div>
                );
            case 'pages':
                return <PageEditor pages={pages} onUpdate={savePage} />;
            case 'requests':
                return <AdminRequests />;
            case 'inbox':
                return <AdminInbox />;
            case 'distribution':
                return <DistributionPanel />;
            case 'settings':
                return <SettingsManager />;
            default:
                return <MissionControl />;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <Lock size={32} className="text-primary" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">כניסה למערכת ניהול</h1>
                        <p className="text-gray-500 mt-2">אנא הזינו סיסמה להמשך</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-lg tracking-widest"
                                placeholder="סיסמה"
                                autoFocus
                            />
                            {authError && (
                                <p className="text-red-500 text-sm mt-2 text-center font-medium animate-pulse">
                                    סיסמה שגויה, נסו שוב
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-95"
                        >
                            כניסה
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <a
                            href="/"
                            className="text-gray-400 hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            חזרה לדף הבית
                        </a>
                    </div>
                </div>
            </div>
        );
    }

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
