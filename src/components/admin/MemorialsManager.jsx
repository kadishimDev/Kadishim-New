import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Eye, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { normalizeHebrewDate } from '../../utils/dateUtils';
import DeceasedPopup from '../DeceasedPopup'; // Import Popup

const MemorialsManager = ({ memorials, onUpdate }) => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [popupItem, setPopupItem] = useState(null); // Popup State

    // Processing
    const processedData = useMemo(() => {
        let data = [...memorials];

        // 1. Filter
        if (searchTerm || dateFilter) {
            data = data.filter(item => {
                const searchLower = searchTerm.toLowerCase();
                const matchesName = (item.name && item.name.toLowerCase().includes(searchLower)) ||
                    (item.id && item.id.toString().includes(searchLower));

                const dateLower = dateFilter.trim().toLowerCase();
                let matchesDate = true;
                if (dateLower) {
                    const hebrewDate = item.hebrew_date_text || '';
                    const gregorianDate = item.gregorian_date || '';
                    matchesDate = hebrewDate.includes(dateLower) || gregorianDate.includes(dateLower);
                }
                return matchesName && matchesDate;
            });
        }

        // 2. Sort
        if (sortConfig.key) {
            data.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'name') {
                    // Hebrew priority
                    const isHebrewA = /^\s*["'״׳]*[\u0590-\u05FF]/.test(aVal);
                    const isHebrewB = /^\s*["'״׳]*[\u0590-\u05FF]/.test(bVal);
                    if (isHebrewA && !isHebrewB) return -1;
                    if (!isHebrewA && isHebrewB) return 1;
                }

                if (sortConfig.key === 'hebrew_date_text') {
                    // Custom Hebrew Month Sort
                    const getMonthValue = (dateStr) => {
                        if (!dateStr) return 999;
                        const monthsOrder = {
                            'תשרי': 1, 'חשון': 2, 'חשוון': 2, 'כסלו': 3, 'טבת': 4, 'שבט': 5, 'אדר': 6, 'אדר א': 6, 'אדר ב': 7,
                            'ניסן': 8, 'אייר': 9, 'סיון': 10, 'תמוז': 11, 'אב': 12, 'אלול': 13
                        };
                        for (const [month, val] of Object.entries(monthsOrder)) {
                            if (dateStr.includes(month)) return val;
                        }
                        return 999; // Unknown
                    };
                    aVal = getMonthValue(a.hebrew_date_text);
                    bVal = getMonthValue(b.hebrew_date_text);
                }

                // Date sort adjustment
                if (sortConfig.key === 'created_at') {
                    aVal = new Date(aVal || 0);
                    bVal = new Date(bVal || 0);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [memorials, searchTerm, dateFilter, sortConfig]);

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Father Name", "Hebrew Date", "Gregorian Date", "Created At"];
        const csvContent = [
            headers.join(","),
            ...processedData.map(item => {
                const row = [
                    item.id,
                    `"${item.name || ''}"`, // Quote to handle commas
                    `"${item.father_name || ''}"`,
                    `"${item.hebrew_date_text || ''}"`,
                    item.gregorian_date || '',
                    item.created_at || ''
                ];
                return row.join(",");
            })
        ].join("\n");

        // Add BOM for Excel Hebrew support
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `memorials_export_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    // Date formatter
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('he-IL');
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">ניהול אזכרות</h2>
                {/* Simulated Action */}
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-sm"
                    >
                        <Download size={18} /> ייצוא לאקסל
                    </button>
                    <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-sm">
                        <UserPlus size={18} /> הוסף ידני
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">חיפוש שם / מזהה</label>
                    <div className="relative">
                        <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="הקלד לחיפוש..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 pr-10 outline-none focus:border-primary"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">סינון תאריך</label>
                    <input
                        type="text"
                        placeholder="למשל: כסלו"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">רשומות לעמוד</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary"
                        value={itemsPerPage}
                        onChange={e => setItemsPerPage(Number(e.target.value))}
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div className="text-left text-sm text-gray-500 pb-3">
                    סה"כ {processedData.length} רשומות
                </div>
            </div>

            {/* Popup */}
            {popupItem && <DeceasedPopup data={popupItem} onClose={() => setPopupItem(null)} onUpdate={onUpdate} />}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th onClick={() => requestSort('id')} className="p-4 cursor-pointer hover:bg-gray-100 transition-colors w-24">
                                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('name')} className="p-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                    שם הנפטר {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('hebrew_date_text')} className="p-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                    תאריך עברי {sortConfig.key === 'hebrew_date_text' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('created_at')} className="p-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                    תאריך הוספה {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-4 w-32">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentData.map(item => (
                                <tr
                                    key={item.id}
                                    onClick={() => {
                                        console.log('Row clicked:', item);
                                        setPopupItem(item);
                                    }}
                                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer" // Pointer cursor
                                >
                                    <td className="p-4 font-mono text-gray-400 text-sm">#{item.id}</td>
                                    <td className="p-4 font-bold text-gray-800">
                                        {item.name}
                                        {item.father_name && <span className="text-xs font-normal text-gray-500 block">בן/בת {item.father_name}</span>}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {item.hebrew_date_text || '-'}
                                        {item.gregorian_date && <span className="text-xs block text-gray-400 font-mono">{item.gregorian_date}</span>}
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {formatDate(item.created_at)}
                                    </td>
                                    <td className="p-4">
                                        <button className="text-primary bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg text-sm font-bold transition-colors flex items-center gap-1">
                                            <Eye size={14} /> צפה
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <span className="font-bold text-gray-600 text-sm">
                        עמוד {currentPage} מתוך {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemorialsManager;
