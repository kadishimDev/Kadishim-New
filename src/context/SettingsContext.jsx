import React, { createContext, useState, useContext, useEffect } from 'react';
import defaultConfig from '../data/siteConfig.json';
import defaultMenu from '../data/menu_structure.json'; // Updated with all pages

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    // 1. General Site Settings
    const [settings, setSettings] = useState(defaultConfig);

    // Initial load for settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (import.meta.env.DEV) {
                try {
                    // Using relative path through Vite proxy
                    const res = await fetch(`/api/dev/get-settings?t=${Date.now()}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSettings(data);
                        localStorage.setItem('siteSettings', JSON.stringify(data));
                    }
                } catch (e) {
                    console.error("DEV MODE: Failed to fetch settings from server", e);
                }
                return;
            }

            const savedSettings = localStorage.getItem('siteSettings');
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    setSettings(parsed);
                } catch (e) {
                    console.error("Error parsing settings", e);
                }
            }
        };
        fetchSettings();
    }, []);

    // 2. Dynamic Menu Structure - Always use fresh data in DEV mode
    const [menu, setMenu] = useState(() => {
        if (import.meta.env.DEV) {
            // In dev mode, always start with the imported menu
            console.log('DEV MODE: Initializing with defaultMenu');
            return defaultMenu;
        }
        // In production, use localStorage or fallback to default
        const savedMenu = localStorage.getItem('siteMenu');
        return savedMenu ? JSON.parse(savedMenu) : defaultMenu;
    });

    // Save Settings to LocalStorage
    useEffect(() => {
        localStorage.setItem('siteSettings', JSON.stringify(settings));
    }, [settings]);

    // Save Menu to LocalStorage (skip in dev mode)
    useEffect(() => {
        if (!import.meta.env.DEV) {
            localStorage.setItem('siteMenu', JSON.stringify(menu));
        }
    }, [menu]);

    // Fetch Menu from API on Mount
    useEffect(() => {
        const fetchMenu = async () => {
            // In development, fetch from local dev server (disk files)
            if (import.meta.env.DEV) {
                console.log('DEV MODE: Fetching menu from local dev server');
                try {
                    // Use cache busting through relative proxy
                    const res = await fetch(`/api/dev/get-menu?t=${Date.now()}`);
                    if (!res.ok) throw new Error(`Dev Server Error: ${res.status}`);
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        setMenu(data);
                        // Also sync to localStorage to prevent "flicker" on next load, 
                        // but the dev server is the source of truth.
                        localStorage.setItem('siteMenu', JSON.stringify(data));
                    }
                } catch (err) {
                    console.error("DEV MODE: Failed to fetch menu from dev server, using local fallback:", err);
                    setMenu(defaultMenu);
                }
                return;
            }

            // FORCE CLEAR CACHE ONCE for structural updates (using a version/flag)
            const MENU_VERSION = '1.1';
            const currentVersion = localStorage.getItem('siteMenuVersion');
            if (currentVersion !== MENU_VERSION) {
                console.log('Clearing old menu cache');
                localStorage.removeItem('siteMenu');
                localStorage.setItem('siteMenuVersion', MENU_VERSION);
                setMenu(defaultMenu);
            }

            // Production: Fetch from API
            try {
                const paths = [
                    '/new/api/get_menu.php',
                    '/api/get_menu.php',
                ];

                let data = null;
                for (const path of paths) {
                    try {
                        const res = await fetch(path);
                        if (res.ok) {
                            const json = await res.json();
                            if (json && Array.isArray(json)) {
                                data = json;
                                break;
                            }
                        }
                    } catch (e) {
                        // Continue to next path
                    }
                }

                if (data) {
                    setMenu(data);
                    localStorage.setItem('siteMenu', JSON.stringify(data));
                }
            } catch (err) {
                console.error("Failed to fetch menu structure", err);
            }
        };

        fetchMenu();
    }, []);

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const saveMenu = async (newMenu) => {
        setMenu(newMenu);

        // In development, save to local dev server (hardcode to files)
        if (import.meta.env.DEV) {
            console.log('DEV MODE: Saving menu to dev server');
            try {
                // Using relative path through Vite proxy
                const res = await fetch('/api/dev/save-menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newMenu)
                });

                if (!res.ok) throw new Error(`Server responded with ${res.status}`);

                localStorage.setItem('siteMenu', JSON.stringify(newMenu));
                return { success: true };
            } catch (err) {
                console.error("DEV Persistence failed for menu:", err);
                return { success: false, error: "שגיאת חיבור לשרת המקומי: וודא ששרת ה-Node פועל (npm run dev:all)" };
            }
        }

        // Production: Persist to API
        try {
            const paths = ['/new/api/save_menu.php', '/api/save_menu.php'];
            for (const path of paths) {
                try {
                    await fetch(path, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newMenu)
                    });
                    break;
                } catch (e) { }
            }
        } catch (e) {
            console.error("Failed to save menu remotely", e);
        }
    };

    const persistSettings = async () => {
        if (import.meta.env.DEV) {
            console.log('DEV MODE: Persisting settings to disk');
            try {
                // Using relative path through Vite proxy
                const res = await fetch('/api/dev/save-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                });
                if (!res.ok) throw new Error("Server error");
                return { success: true };
            } catch (e) {
                console.error("Failed to save settings to disk", e);
                return { success: false, error: "שגיאת חיבור לשרת המקומי: וודא ששרת ה-Node פועל." };
            }
        }

        localStorage.setItem('siteSettings', JSON.stringify(settings));
        return { success: true };
    };

    // Helper to reset to defaults (useful for testing/debug)
    const resetSettings = () => {
        setSettings(defaultConfig);
        setMenu(defaultMenu);
    };

    return (
        <SettingsContext.Provider value={{ settings, menu, updateSetting, saveMenu, persistSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
