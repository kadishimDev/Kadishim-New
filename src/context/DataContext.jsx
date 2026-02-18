import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import localPagesData from '../data/pages_db.json';
import localMemorialsData from '../data/memorials_v2.json';

// Context
const DataContext = createContext();

// Provider
export const DataProvider = ({ children }) => {
    // State
    const [pages, setPages] = useState([]);
    const [memorials, setMemorials] = useState([]);
    const [loading, setLoading] = useState({ pages: true, memorials: true });
    const [error, setError] = useState({ pages: null, memorials: null });
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // --- Fetch Actions ---

    const fetchPages = useCallback(async () => {
        setLoading(prev => ({ ...prev, pages: true }));

        // In development, fetch from local dev server (disk files)
        if (import.meta.env.DEV) {
            console.log('DEV MODE: Fetching pages from local dev server');
            try {
                // Use cache busting to ensure we get the latest from disk
                // Using relative path through Vite proxy
                const res = await fetch(`/api/dev/get-pages?t=${Date.now()}`);
                if (!res.ok) throw new Error(`Dev Server Error: ${res.status}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    const formatted = data.map(p => ({
                        ...p,
                        isVisible: p.isVisible === false || p.isVisible === 0 || p.isVisible === "0" ? false : true
                    }));
                    setPages(formatted);
                    setError(prev => ({ ...prev, pages: null }));
                }
            } catch (err) {
                console.error("DEV MODE: Failed to fetch from dev server, using local import fallback:", err);
                if (localPagesData && Array.isArray(localPagesData)) {
                    const formatted = localPagesData.map(p => ({
                        ...p,
                        isVisible: p.isVisible === false || p.isVisible === 0 || p.isVisible === "0" ? false : true
                    }));
                    setPages(formatted);
                }
            }
            setLoading(prev => ({ ...prev, pages: false }));
            return;
        }

        // Production: Fetch from API
        try {
            const res = await fetch('/api/get_pages.php');
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                // Ensure boolean visibility - default to TRUE if undefined
                const formatted = data.map(p => ({
                    ...p,
                    isVisible: p.isVisible === false || p.isVisible === 0 || p.isVisible === "0" ? false : true
                }));
                setPages(formatted);
                setError(prev => ({ ...prev, pages: null }));
            } else {
                throw new Error("Invalid data format");
            }
        } catch (err) {
            console.error("DataContext: Failed to fetch pages, using local backup:", err);
            // Fallback to local JSON
            if (localPagesData && Array.isArray(localPagesData)) {
                const formatted = localPagesData.map(p => ({
                    ...p,
                    isVisible: p.isVisible === false || p.isVisible === 0 || p.isVisible === "0" ? false : true
                }));
                setPages(formatted);
                setError(prev => ({ ...prev, pages: null }));
            } else {
                setError(prev => ({ ...prev, pages: err.message }));
            }
        } finally {
            setLoading(prev => ({ ...prev, pages: false }));
        }
    }, []);

    const fetchMemorials = useCallback(async () => {
        setLoading(prev => ({ ...prev, memorials: true }));
        try {
            const res = await fetch('/api/get_all_memorials.php');
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setMemorials(data);
                setError(prev => ({ ...prev, memorials: null }));
            } else {
                throw new Error("Invalid data format");
            }
        } catch (err) {
            console.error("DataContext: Failed to fetch memorials, using local backup:", err);
            // Fallback to local JSON if API fails
            if (localMemorialsData && Array.isArray(localMemorialsData)) {
                setMemorials(localMemorialsData);
                setError(prev => ({ ...prev, memorials: null })); // Clear error as we have data
            } else {
                setError(prev => ({ ...prev, memorials: err.message }));
            }
        } finally {
            setLoading(prev => ({ ...prev, memorials: false }));
        }
    }, []);

    // --- Initial Load ---
    useEffect(() => {
        fetchPages();
        fetchMemorials();
    }, [fetchPages, fetchMemorials]);

    // --- CRUD Actions (Wrappers for API calls that also update state) ---

    const savePage = async (pageData) => {
        // Optimistic Update
        setPages(prev => {
            const idx = prev.findIndex(p => p.slug === pageData.slug);
            if (idx !== -1) {
                const newPages = [...prev];
                newPages[idx] = pageData;
                return newPages;
            }
            return [...prev, pageData];
        });

        // In development, save to local dev server (hardcode to files)
        if (import.meta.env.DEV) {
            console.log('DEV MODE: Saving page to dev server', pageData.slug);
            try {
                // Use relative path through Vite proxy
                const res = await fetch('/api/dev/save-page', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pageData)
                });

                if (!res.ok) throw new Error(`Server responded with ${res.status}`);

                // Clear localStorage for this page so we only trust the server next time
                localStorage.removeItem('dev_pages');

                setLastUpdated(Date.now());
                return { success: true };
            } catch (err) {
                console.error("DEV Persistence failed:", err);
                return { success: false, error: "שגיאת חיבור לשרת המקומי: וודא ששרת ה-Node פועל (npm run dev:all)" };
            }
        }

        // Production: Save to API
        try {
            const res = await fetch('/api/save_page.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pageData)
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error);

            setLastUpdated(Date.now());
            return { success: true };
        } catch (err) {
            console.error("Save Page Failed:", err);
            fetchPages(); // Re-sync on error
            return { success: false, error: err.message };
        }
    };

    const updateMemorial = async (memorialData) => {
        // Optimistic
        setMemorials(prev => prev.map(m => m.id === memorialData.id ? memorialData : m));

        try {
            const res = await fetch('/api/update_memorial.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memorialData)
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            setLastUpdated(Date.now());
            return { success: true };
        } catch (err) {
            console.error("Update Memorial Failed:", err);
            fetchMemorials(); // Re-sync
            return { success: false, error: err.message };
        }
    };

    const refreshData = () => {
        fetchPages();
        fetchMemorials();
        setLastUpdated(Date.now());
    };

    // Value Object
    const value = {
        pages,
        memorials,
        loading,
        error,
        savePage,
        updateMemorial,
        refreshData,
        lastUpdated
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
