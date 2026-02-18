import React, { useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Calendar,
    Send,
    Inbox,
    ClipboardList,
    Flame
} from 'lucide-react';
import ToastNotification from '../components/ToastNotification';

const AdminLayout = ({ activeTab, setActiveTab, children, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServerLive, setIsServerLive] = useState(null); // null, true, false

    React.useEffect(() => {
        if (!import.meta.env.DEV) return;

        const checkHealth = async () => {
            try {
                // Use relative path through Vite proxy
                const res = await fetch(`/api/dev/health?t=${Date.now()}`);
                setIsServerLive(res.ok);
            } catch (e) {
                setIsServerLive(false);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
        { id: 'memorials', label: 'ניהול אזכרות', icon: BookOpen },
        { id: 'yizkor', label: 'ניהול חללים', icon: Flame },
        { id: 'calendar', label: 'לוח שנה עברי', icon: Calendar },
        { id: 'pages', label: 'עריכת עמודים', icon: FileText },
        { id: 'requests', label: 'בקשות קדיש', icon: ClipboardList },
        { id: 'inbox', label: 'פניות וצור קשר', icon: Inbox },
        { id: 'distribution', label: 'מערכת תפוצה', icon: Send },
        { id: 'settings', label: 'הגדרות', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <aside className={`
                fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                            <span className="text-primary">קדישים</span> אדמין
                        </h1>
                        {import.meta.env.DEV && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className={`w-2 h-2 rounded-full ${isServerLive === true ? 'bg-green-500 animate-pulse' : isServerLive === false ? 'bg-red-500' : 'bg-gray-300'}`} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    {isServerLive === true ? 'Persistence Live' : isServerLive === false ? 'Persistence Offline' : 'Checking...'}
                                </span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold
                                ${activeTab === item.id
                                    ? 'bg-primary text-white shadow-lg shadow-orange-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}
                            `}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
                    >
                        <LogOut size={20} />
                        התנתק
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center sticky top-0 z-40 shadow-sm">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-800">פאנל ניהול</span>
                    <div className="w-8"></div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <ToastNotification />
        </div>
    );
};

export default AdminLayout;
