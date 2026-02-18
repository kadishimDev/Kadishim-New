import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import yizkorDataSample from '../../data/yizkor_martyrs.json';
import { formatHebrewDate } from '../../utils/hebrewDate';

const AdminYizkor = () => {
    const [martyrs, setMartyrs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const [formData, setFormData] = useState({
        name: '',
        rank: '',
        date: '',
        description: '',
        link: ''
    });

    const fileInputRef = React.useRef(null);

    useEffect(() => {
        setLoading(true);
        // 1. Try Local Storage Override
        const localData = localStorage.getItem('yizkor_local_data');
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                if (Array.isArray(parsed)) {
                    setMartyrs(parsed);
                    setLoading(false);
                    return;
                }
            } catch (e) { console.error("Bad local yizkor data"); }
        }

        // 2. Try API
        fetch('/api/get_yizkor.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMartyrs(data);
                else setMartyrs(yizkorDataSample);
            })
            .catch(err => {
                console.error("Failed to load yizkor", err);
                setMartyrs(yizkorDataSample);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            let data = [];

            if (file.name.endsWith('.json')) {
                try {
                    data = JSON.parse(content);
                } catch (e) { alert("Invalid JSON"); return; }
            } else if (file.name.endsWith('.csv')) {
                const lines = content.split('\n').filter(line => line.trim() !== '');
                data = lines.slice(1).map((line, idx) => {
                    const parts = line.split(',');
                    return {
                        id: 'csv_' + Date.now() + '_' + idx,
                        name: parts[0] || '',
                        rank: parts[1] || '',
                        date: parts[2] || '',
                        description: parts[3] || '',
                        link: parts[4] || '',
                        type: 'idf'
                    };
                });
            }

            if (Array.isArray(data)) {
                localStorage.setItem('yizkor_local_data', JSON.stringify(data));
                setMartyrs(data);
                alert(`יובאו בהצלחה ${data.length} רשומות!`);
            }
        };
        reader.readAsText(file);
    };

    const saveToServer = async (newData) => {
        try {
            await fetch('/api/save_yizkor.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
        } catch (e) {
            console.error("Save error", e);
            alert('שגיאת תקשורת');
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        let newData;
        if (editingId) {
            newData = martyrs.map(m => m.id === editingId ? { ...m, ...formData } : m);
        } else {
            const newM = {
                ...formData,
                id: Date.now().toString(),
                type: 'idf'
            };
            newData = [newM, ...martyrs];
        }
        setMartyrs(newData);
        saveToServer(newData);
        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק?')) {
            const newData = martyrs.filter(m => m.id !== id);
            setMartyrs(newData);
            saveToServer(newData);
        }
    };

    const openModal = (martyr = null) => {
        if (martyr) {
            setEditingId(martyr.id);
            setFormData(martyr);
        } else {
            setEditingId(null);
            setFormData({ name: '', rank: '', date: '', description: '', link: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const [typeFilter, setTypeFilter] = useState('all');

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Filter
    let processedData = martyrs.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || m.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Sort
    if (sortConfig.key) {
        processedData.sort((a, b) => {
            let aVal = a[sortConfig.key] || '';
            let bVal = b[sortConfig.key] || '';

            // Special handling for dates
            if (sortConfig.key === 'date') {
                const getHebrewTime = (m) => {
                    // Check if hebrewDate exists
                    if (m.hebrewDate) {
                        // Sort Order: Month -> Day -> Year
                        // This groups all occurrences of a specific Hebrew date (e.g., 1st Tishrei) together, regardless of year.
                        // Tishrei = 1, Elul = 13.
                        // Formula: Month * 1,000,000 + Day * 10,000 + Year
                        return (m.hebrewDate.month * 1000000) + (m.hebrewDate.day * 10000) + m.hebrewDate.year;
                    }
                    // Fallback to Gregorian if no Hebrew date
                    const parts = m.date.split('.');
                    if (parts.length === 3) {
                        return (parseInt(parts[1]) * 1000000) + (parseInt(parts[0]) * 10000) + parseInt(parts[2]);
                    }
                    return 0;
                };

                aVal = getHebrewTime(a);
                bVal = getHebrewTime(b);
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <div className="w-4 inline-block" />;
        return sortConfig.direction === 'asc' ? <span className="text-xs">▲</span> : <span className="text-xs">▼</span>;
    };

    const ThSortable = ({ label, colKey }) => (
        <th
            className="p-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
            onClick={() => requestSort(colKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                <SortIcon column={colKey} />
            </div>
        </th>
    );

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">ניהול חללי צה"ל ונפגעי איבה</h2>
                    <p className="text-gray-500">סך הכול: {processedData.length} רשומות</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current.click()} className="btn-secondary flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                        <Upload size={20} />
                        ייבוא
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv,.json" className="hidden" />

                    <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors">
                        <Plus size={20} />
                        הוסף חדש
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם..."
                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                {/* Type Filter */}
                <select
                    className="p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary/50"
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                >
                    <option value="all">כל הקטגוריות</option>
                    <option value="idf">חללי צה"ל</option>
                    <option value="hostile_actions">נפגעי פעולות איבה</option>
                </select>
            </div>

            <div className="flex-1 overflow-auto border rounded-xl">
                <table className="w-full text-right border-collapse bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                        <tr className="text-gray-600 text-sm uppercase">
                            <ThSortable label="שם" colKey="name" />
                            <ThSortable label="דרגה / תואר" colKey="rank" />
                            <ThSortable label="תאריך פטירה" colKey="date" />
                            <ThSortable label="תיאור" colKey="description" />
                            <th className="p-4">קישור</th>
                            <th className="p-4 text-center">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="p-10 text-center">טוען נתונים...</td></tr>
                        ) : currentItems.map(m => (
                            <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 font-bold">
                                    {m.name}
                                    {m.type === 'hostile_actions' && <span className="mr-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">איבה</span>}
                                </td>
                                <td className="p-4">{m.rank}</td>
                                <td className="p-4 text-gray-700">
                                    {m.hebrewDate ? formatHebrewDate(m.hebrewDate.day, m.hebrewDate.month, m.hebrewDate.year) : m.date}
                                </td>
                                <td className="p-4 text-gray-500 max-w-xs truncate">{m.description}</td>
                                <td className="p-4">
                                    {m.link && (
                                        <a href={m.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">
                                            יזכור
                                        </a>
                                    )}
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => openModal(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center gap-2 dir-ltr">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span className="text-sm font-bold mx-2">
                        עמוד {currentPage} מתוך {totalPages}
                    </span>

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Form Content same as before */}
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold">{editingId ? 'עריכת פרטי חלל' : 'הוספת חלל חדש'}</h3>
                            <button onClick={closeModal}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* ... Inputs ... */}
                            <div>
                                <label className="block text-sm font-medium mb-1">שם מלא</label>
                                <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">דרגה / תואר</label>
                                    <input className="w-full p-2 border rounded-lg" value={formData.rank} onChange={e => setFormData({ ...formData, rank: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">תאריך לועזי</label>
                                    <input type="date" className="w-full p-2 border rounded-lg" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">תיאור</label>
                                <input className="w-full p-2 border rounded-lg" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">קישור לדף יזכור</label>
                                <input type="url" className="w-full p-2 border rounded-lg text-left" dir="ltr" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">ביטול</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-dark font-bold rounded-lg hover:shadow-lg">
                                    {editingId ? 'שמור' : 'הוסף'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminYizkor;
