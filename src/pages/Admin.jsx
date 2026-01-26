import React, { useState, useEffect, useMemo } from 'react';
import { Database, Search, Calendar, Lock, Unlock, RefreshCw, UserPlus, ChevronRight, ChevronLeft } from 'lucide-react';
import kaddishList from '../data/kaddish_list.json';
import HebrewCalendarWidget from '../components/HebrewCalendarWidget';

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);

    // Data States
    const [archiveData, setArchiveData] = useState([]);
    const [activeTab, setActiveTab] = useState('archive'); // 'archive' or 'new'

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        // Load archive data on mount
        setArchiveData(kaddishList);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') { // Slightly more secure for "special link" feel
            setIsAuthenticated(true);
        } else {
            setLoginError(true);
        }
    };

    const handleEdit = (item) => {
        // Placeholder for edit functionality
        alert(`עריכת רשומה ${item.id} (${item.name})\nפונקציונליות עריכה מלאה בפיתוח.`);
    };

    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Handle Sorting
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Calculate Filtered & Sorted
    const processedData = useMemo(() => {
        let data = [...archiveData];

        // 1. Filter
        if (searchTerm || dateFilter) {
            data = data.filter(item => {
                const searchLower = searchTerm.toLowerCase();
                const matchesName = item.name.toLowerCase().includes(searchLower) ||
                    (item.original_string && item.original_string.toLowerCase().includes(searchLower)) ||
                    (item.id && item.id.toString().includes(searchLower));

                const dateLower = dateFilter.trim().toLowerCase();
                let matchesDate = true;
                if (dateLower) {
                    const hebrewDate = item.hebrew_date_text || item.hebrew_date || '';
                    const gregorianDate = item.gregorian_date || '';
                    matchesDate = hebrewDate.includes(dateLower) ||
                        gregorianDate.toLowerCase().includes(dateLower) ||
                        (item.hebrew_date && item.hebrew_date.includes(dateLower));
                }
                return matchesName && matchesDate;
            });
        }

        // 2. Sort
        if (sortConfig.key) {
            data.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Special handling for Key "date"
                if (sortConfig.key === 'date') {
                    // Start with Gregorian because it's sortable
                    aVal = a.gregorian_date || a.hebrew_date_text || '';
                    bVal = b.gregorian_date || b.hebrew_date_text || '';

                    // If both are dates, try to parse them (assuming YYYY-MM-DD or simple string)
                    // If strict Hebrew only, we rely on string comparison which is imperfect but better than nothing
                    // Ideally we'd use hDate value
                }

                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    }, [archiveData, searchTerm, dateFilter, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
                    <div className="text-center mb-8">
                        <div className="bg-black inline-block p-4 rounded-full mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">ממשק ניהול מסווג</h2>
                        <p className="text-gray-500 mt-2">גישה למורשים בלבד</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמת גישה</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                                autoFocus
                            />
                        </div>

                        {loginError && (
                            <div className="text-red-500 text-sm bg-red-50 p-2 rounded flex items-center gap-2">
                                <span className="font-bold">⚠</span> סיסמה שגויה
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

    return (
        <div className="min-h-screen bg-gray-50 pb-12 pt-24">
            <div className="container mx-auto px-4 max-w-[1600px]">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Database className="text-primary" /> מאגר הנצחה וקדישים
                        </h1>
                        <p className="text-gray-500 mt-1">ניהול ואיתור נפטרים - לשימוש פנימי בלבד</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'archive' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border'}`}
                            onClick={() => setActiveTab('archive')}
                        >
                            ארכיון היסטורי ({archiveData.length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'new' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border'}`}
                            onClick={() => setActiveTab('new')}
                        >
                            בקשות חדשות
                        </button>
                    </div>
                </div>

                {/* Calendar Widget - Full Width */}
                <div className="mb-8">
                    <HebrewCalendarWidget kaddishList={archiveData} />
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Search size={20} className="text-primary" />
                        סינון וחיפוש מתקדם
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">חיפוש חופשי</label>
                            <input
                                type="text"
                                placeholder="שם, מזהה, או פרטים..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">סינון תאריך</label>
                            <input
                                type="text"
                                placeholder="לדוגמה: י' בטבת..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">תוצאות בעמוד</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary"
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
                        </div>
                        <button
                            className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 text-sm font-bold text-gray-600 transition-colors h-full"
                            onClick={() => { setSearchTerm(''); setDateFilter(''); setSortConfig({ key: 'name', direction: 'asc' }); }}
                        >
                            נקה סינונים
                        </button>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                <tr>
                                    <th
                                        className="p-5 font-bold whitespace-nowrap w-20 cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('id')}
                                    >
                                        מזהה {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-5 font-bold cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('name')}
                                    >
                                        שם מלא {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-5 font-bold cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('date')}
                                    >
                                        תאריך פטירה / אזכרה {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-5 font-bold">סוג הנצחה</th>
                                    <th className="p-5 font-bold w-24">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'archive' ? (
                                    currentData.map((item, index) => (
                                        <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="p-5 text-gray-400 font-mono text-sm">{item.id || '#'}</td>
                                            <td className="p-5 font-bold text-lg text-gray-900">
                                                {item.name}
                                                {item.details && item.details.father_name && (
                                                    <div className="text-xs text-gray-400 font-normal mt-1">
                                                        בן/בת {item.details.father_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-5 text-sm">
                                                {item.hebrew_date_text ? (
                                                    <div className="font-bold text-gray-800">{item.hebrew_date_text}</div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                                {item.gregorian_date && (
                                                    <div className="text-xs text-gray-400 font-mono mt-1">{item.gregorian_date}</div>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                                                    {item.type || 'כללי'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-primary hover:text-black font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                                                >
                                                    ערוך
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">
                                            אין בקשות חדשות כרגע (יש לחבר ל-API)
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {activeTab === 'archive' && (
                        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-100"
                            >
                                <ChevronRight size={16} /> הקודם
                            </button>
                            <span className="text-sm text-gray-600">
                                עמוד {currentPage} מתוך {totalPages} (סה"כ {processedData.length} רשומות)
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-100"
                            >
                                הבא <ChevronLeft size={16} />
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Admin;
