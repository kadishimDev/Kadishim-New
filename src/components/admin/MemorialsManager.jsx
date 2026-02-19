import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Eye, ChevronRight, ChevronLeft, Download, AlertTriangle } from 'lucide-react';
import { normalizeRecord } from '../../utils/dataNormalization'; // Import Normalization
import DeceasedPopup from '../DeceasedPopup'; // Import Popup

const MemorialsManager = ({ memorials, onUpdate, initialParams }) => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showIncomplete, setShowIncomplete] = useState(false); // New Filter State
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [popupItem, setPopupItem] = useState(null); // Popup State

    // Handle Deep Links (from Mission Control)
    React.useEffect(() => {
        if (initialParams && initialParams.editId && memorials.length > 0) {
            const target = memorials.find(m => m.id == initialParams.editId);
            if (target) {
                setSearchTerm(target.id.toString()); // Isolate the record
                setPopupItem(target); // Open the editor
            }
        }
    }, [initialParams, memorials]);

    // Helper to identify missing fields
    const getMissingFields = (item) => {
        const missing = [];
        if (!item.name && !item.deceased_name) missing.push('שם נפטר');
        if (!item.father_name) missing.push('שם האב');
        if (!item.mother_name) missing.push('שם האם');

        // Dates (Check if at least ONE format exists for birth/death, user wanted ALL?)
        // User said: "תאריך לידה עברי / לועזי, תאריך פטירה עברי + לועזי"
        // Interpretation: Birth can be either, Death MUST be both? Or user meant "Hebrew + Gregorian" for both?
        // Let's be strict based on "תאריך פטירה עברי + לועזי" -> Both needed for death.
        // For birth "עברי / לועזי" -> One is enough? Or slash means "and"?
        // Let's assume strict for Death (critical), lenient for Birth?
        // Actually, user listed them as "Minimum".

        if (!item.death_date_hebrew && !item.hebrew_date_text) missing.push('תאריך פטירה עברי');
        if (!item.death_date_gregorian && !item.gregorian_date) missing.push('תאריך פטירה לועזי');

        // Birth dates often missing in old data, but user listed them as minimum.
        if (!item.birth_date_hebrew && !item.birth_hebrew_date) missing.push('תאריך לידה עברי');
        if (!item.birth_date_gregorian && !item.birth_gregorian_date) missing.push('תאריך לידה לועזי');

        if (!item.contact_phone) missing.push('טלפון');
        if (!item.contact_email) missing.push('אימייל');
        if (!item.residence && !item.address) missing.push('כתובת');

        return missing;
    };

    // Processing
    const processedData = useMemo(() => {
        // 0. Normalize ALL Data on entry
        let data = memorials.map(item => normalizeRecord(item).normalized);

        // 1. Filter
        if (searchTerm || dateFilter || showIncomplete) {
            data = data.filter(item => {
                const searchLower = searchTerm.toLowerCase();
                // Check against both JSON keys (name) and DB keys (deceased_name)
                const name = item.name || item.deceased_name || '';
                const id = item.id ? item.id.toString() : '';

                const matchesName = name.toLowerCase().includes(searchLower) || id.includes(searchLower);

                const dateLower = dateFilter.trim().toLowerCase();
                let matchesDate = true;
                if (dateLower) {
                    const hebrewDate = item.hebrew_date_text || item.death_date_hebrew || '';
                    const gregorianDate = item.gregorian_date || item.death_date_gregorian || '';
                    matchesDate = hebrewDate.includes(dateLower) || gregorianDate.includes(dateLower);
                }

                let matchesIncomplete = true;
                if (showIncomplete) {
                    const deepMissing = getMissingFields(item);
                    matchesIncomplete = deepMissing.length > 0;
                }

                return matchesName && matchesDate && matchesIncomplete;
            });
        }

        // 2. Sort
        if (sortConfig.key) {
            data.sort((a, b) => {
                // Normalization for sorting logic
                let aVal = a[sortConfig.key] || a['deceased_' + sortConfig.key] || '';
                let bVal = b[sortConfig.key] || b['deceased_' + sortConfig.key] || '';

                // Specific overrides
                if (sortConfig.key === 'name') {
                    aVal = a.name || a.deceased_name || '';
                    bVal = b.name || b.deceased_name || '';
                }
                if (sortConfig.key === 'hebrew_date_text') {
                    aVal = a.hebrew_date_text || a.death_date_hebrew || '';
                    bVal = b.hebrew_date_text || b.death_date_hebrew || '';
                }

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
                    aVal = getMonthValue(aVal);
                    bVal = getMonthValue(bVal);
                }

                // Simple string sort fallback
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [memorials, searchTerm, dateFilter, sortConfig, showIncomplete]);

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Father Name", "Mother Name", "Gender", "Death Date (Heb)", "Death Date (Greg)", "Birth Date (Heb)", "Birth Date (Greg)", "Payment Status", "Contact Name", "Contact Email", "Contact Phone", "Created At", "Notes"];
        const csvContent = [
            headers.join(","),
            ...processedData.map(item => {
                const name = item.name || item.deceased_name || '';
                const hDeath = item.hebrew_date_text || item.death_date_hebrew || '';
                const gDeath = item.gregorian_date || item.death_date_gregorian || '';
                const hBirth = item.birth_hebrew_date || item.birth_date_hebrew || '';
                const gBirth = item.birth_gregorian_date || item.birth_date_gregorian || '';

                const gender = item.gender === 'male' ? 'Male' : (item.gender === 'female' ? 'Female' : 'Unknown');
                const paymentStatus = item.is_paid == 1 ? 'Paid' : 'Unpaid';
                const contactName = item.contact_name || item.requester_name || '';

                const row = [
                    item.id,
                    `"${name.replace(/"/g, '""')}"`,
                    `"${(item.father_name || '').replace(/"/g, '""')}"`,
                    `"${(item.mother_name || '').replace(/"/g, '""')}"`,
                    gender,
                    `"${hDeath.replace(/"/g, '""')}"`,
                    gDeath,
                    `"${hBirth.replace(/"/g, '""')}"`,
                    gBirth,
                    paymentStatus,
                    `"${contactName.replace(/"/g, '""')}"`,
                    `"${(item.contact_email || '').replace(/"/g, '""')}"`,
                    `"${(item.contact_phone || '').replace(/"/g, '""')}"`,
                    item.created_at || '',
                    `"${(item.notes || '').replace(/"/g, '""')}"`
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
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">ניהול אזכרות</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-sm text-sm"
                    >
                        <Download size={16} /> ייצוא
                    </button>
                    <button className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-sm text-sm">
                        <UserPlus size={16} /> הוסף
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

                {/* Incomplete Filter */}
                <div className="flex items-center mb-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none bg-red-50 px-3 py-2 rounded-lg border border-red-100 hover:bg-red-100 transition">
                        <input
                            type="checkbox"
                            checked={showIncomplete}
                            onChange={(e) => setShowIncomplete(e.target.checked)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                            <AlertTriangle size={14} />
                            הצג חסרים בלבד
                        </span>
                    </label>
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
                <div className="text-left text-sm text-gray-500 pb-3 md:col-span-4">
                    סה"כ {processedData.length} רשומות
                </div>
            </div>

            {/* Popup */}
            {popupItem && <DeceasedPopup data={popupItem} onClose={() => setPopupItem(null)} onUpdate={onUpdate} />}

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                            {currentData.map(item => {
                                const name = item.deceased_name || item.name;
                                const hDate = item.death_date_hebrew || item.hebrew_date_text;
                                const gDate = item.death_date_gregorian || item.gregorian_date;
                                const isMissingData = !hDate || hDate.trim() === '';

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => setPopupItem(item)}
                                        className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${isMissingData ? 'bg-red-50/10' : ''}`}
                                    >
                                        <td className="p-4 font-mono text-gray-400 text-sm">#{item.id}</td>
                                        <td className="p-4 font-bold text-gray-800">
                                            {name}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.father_name && <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1 rounded">בן/בת {item.father_name}</span>}
                                            </div>
                                            {(() => {
                                                const missing = getMissingFields(item);
                                                if (missing.length === 0) return null;
                                                return (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {missing.map(field => (
                                                            <span key={field} className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap">
                                                                חסר: {field}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {hDate || '-'}
                                            {gDate && <span className="text-xs block text-gray-400 font-mono">{gDate}</span>}
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
                                )
                            })}
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {currentData.map(item => {
                    const name = item.deceased_name || item.name;
                    const hDate = item.death_date_hebrew || item.hebrew_date_text;
                    const gDate = item.death_date_gregorian || item.gregorian_date;
                    const missing = getMissingFields(item);

                    return (
                        <div
                            key={item.id}
                            onClick={() => setPopupItem(item)}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer active:bg-blue-50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 text-base truncate">{name}</div>
                                    {item.father_name && (
                                        <div className="text-sm text-gray-500 mt-0.5">בן/בת {item.father_name}</div>
                                    )}
                                    <div className="text-sm text-gray-600 mt-1">{hDate || '-'}</div>
                                    {gDate && <div className="text-xs text-gray-400 font-mono">{gDate}</div>}
                                </div>
                                <div className="flex flex-col items-end gap-2 mr-3">
                                    <span className="text-xs text-gray-400 font-mono">#{item.id}</span>
                                    <button className="text-primary bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                                        <Eye size={14} /> צפה
                                    </button>
                                </div>
                            </div>
                            {missing.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {missing.slice(0, 3).map(field => (
                                        <span key={field} className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100">
                                            חסר: {field}
                                        </span>
                                    ))}
                                    {missing.length > 3 && (
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">+{missing.length - 3} נוספים</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Mobile Pagination */}
                <div className="flex justify-between items-center pt-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm font-bold"
                    >
                        הקודם
                    </button>
                    <span className="font-bold text-gray-600 text-sm">{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm font-bold"
                    >
                        הבא
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemorialsManager;
