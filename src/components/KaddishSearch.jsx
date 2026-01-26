import React, { useState, useMemo } from 'react';
import { Search, User, Calendar } from 'lucide-react';
import kaddishList from '../data/kaddish_list.json';

const KaddishSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredList = useMemo(() => {
        return kaddishList.filter(item => {
            const matchesSearch = item.name.includes(searchTerm) || (item.original_string && item.original_string.includes(searchTerm));
            const matchesType = filterType === 'all' || item.type.includes(filterType);
            return matchesSearch && matchesType;
        });
    }, [searchTerm, filterType]);

    // Pagination or limit to avoid rendering 1600 items
    const displayList = filteredList.slice(0, 50);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="glass p-6 rounded-2xl mb-8">
                <h2 className="text-3xl font-bold text-center mb-6 text-primary">חיפוש נפטרים</h2>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="חפש לפי שם..."
                            className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-primary transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="text-sm text-gray-400 text-center">
                    נמצאו {filteredList.length} תוצאות
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayList.map((item, index) => (
                    <div key={item.id || index} className="glass p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-primary/30 group">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/20 p-3 rounded-full text-primary group-hover:scale-110 transition-transform">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{item.type}</span>
                                    {item.id && <span className="text-xs opacity-50">ID: {item.id}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredList.length > 50 && (
                <div className="text-center mt-8 text-gray-500">
                    מציג 50 תוצאות ראשונות. אנא צמצם את החיפוש.
                </div>
            )}
        </div>
    );
};

export default KaddishSearch;
