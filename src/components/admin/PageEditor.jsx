import React, { useState } from 'react';
import { Save, Edit2, Globe, Image as ImageIcon } from 'lucide-react';

const PageEditor = ({ pages, onUpdate }) => {
    const [selectedPage, setSelectedPage] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const handleSelect = (page) => {
        setSelectedPage(page);
        setEditForm({ ...page });
    };

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // In a real app, this would be an API call.
        // Here we just bubble up the change to the parent.
        onUpdate(editForm);
        alert('השינויים נשמרו בהצלחה (simulated)!');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[700px]">
            {/* Sidebar List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-y-auto">
                <h3 className="font-bold text-gray-700 mb-4 sticky top-0 bg-white pb-2 border-b">עמודי האתר</h3>
                <div className="space-y-2">
                    {pages.map(page => (
                        <div
                            key={page.slug}
                            onClick={() => handleSelect(page)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${selectedPage?.slug === page.slug ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span className="font-bold">{page.title}</span>
                            <Edit2 size={16} className="opacity-50" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                {!selectedPage ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Globe size={48} className="mb-4 opacity-20" />
                        <p>בחר עמוד מהרשימה לעריכה</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in flex-1 flex flex-col">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-800">עריכת עמוד: {selectedPage.title}</h2>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-sm">
                                <Save size={18} /> שמירה
                            </button>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">כותרת העמוד</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">תמונה ראשית (URL)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="image"
                                        value={editForm.image || ''}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary ltr"
                                    />
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                                        {editForm.image ? <img src={editForm.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label className="block text-sm font-bold text-gray-700 mb-2">תוכן העמוד</label>
                                <textarea
                                    name="content"
                                    value={editForm.content}
                                    onChange={handleChange}
                                    className="w-full flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary resize-none min-h-[300px]"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageEditor;
