import React, { useEffect, useState } from 'react';

const SysCheck = () => {
    const [status, setStatus] = useState({ loading: true, data: null, error: null });

    useEffect(() => {
        const checkSystem = async () => {
            try {
                // Try to fetch from the API (via proxy)
                const res = await fetch('/api/get_all_memorials.php');
                const text = await res.text();

                try {
                    const json = JSON.parse(text);
                    setStatus({ loading: false, data: json, raw: text.substring(0, 100) });
                } catch (e) {
                    setStatus({ loading: false, error: "Invalid JSON", raw: text.substring(0, 500) });
                }
            } catch (err) {
                setStatus({ loading: false, error: err.message });
            }
        };

        checkSystem();
    }, []);

    if (!status.error && !status.data) return <div className="p-4 bg-blue-100 text-blue-800 rounded-lg m-4">בדיקת מערכת...</div>;

    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm w-full bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden text-sm" dir="ltr">
            <div className={`p-3 font-bold text-white flex justify-between items-center ${status.error ? 'bg-red-600' : 'bg-green-600'}`}>
                <span>System Status</span>
                <button onClick={() => setStatus({ ...status, dismissed: true })} className="text-white hover:bg-white/20 rounded p-1">X</button>
            </div>

            {!status.dismissed && (
                <div className="p-4 max-h-60 overflow-auto">
                    {status.error ? (
                        <div>
                            <p className="font-bold text-red-600 mb-2">Connection Error:</p>
                            <code className="block bg-gray-100 p-2 rounded text-xs mb-2">{status.error}</code>
                            {status.raw && (
                                <>
                                    <p className="font-bold text-gray-700 mb-1">Server Response (HTML?):</p>
                                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">{status.raw}</pre>
                                </>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                This usually means XAMPP is not running, or the proxy in vite.config.js is wrong.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-bold text-green-600 mb-2">Connection Successful!</p>
                            <p>Records found: {Array.isArray(status.data) ? status.data.length : 'Unknown Struct'}</p>
                            <p className="text-xs text-gray-400 mt-2">API is reachable.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SysCheck;
