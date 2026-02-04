import React, { useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Calendar
} from 'lucide-react';

const AdminLayout = ({ activeTab, setActiveTab, children, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
        { id: 'memorials', label: 'ניהול אזכרות', icon: BookOpen },
        { id: 'calendar', label: 'לוח שנה עברי', icon: Calendar },
        { id: 'pages', label: 'עריכת עמודים', icon: FileText },
        { id: 'settings', label: 'הגדרות', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* Sidebar (Desktop) */}
            <aside className={`
                fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                        <span className="text-primary">קדישים</span> אדמין
                    </h1>
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar (Mobile) */}
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex justify-between items-center sticky top-0 z-40 shadow-sm">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-800">פאנל ניהול</span>
                    <div className="w-8"></div> {/* Spacer */}
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
