
import React, { useState, useEffect } from 'react';
import memorialsData from '../data/memorials_v2.json';

const DebugChecker = () => {
    const [sample, setSample] = useState(null);

    useEffect(() => {
        // Find record 602 as our control
        const control = memorialsData.find(m => m.id === "602");
        setSample(control);
        console.log("DEBUG: Loaded Sample 602:", control);
    }, []);

    if (!sample) return <div className="p-4 bg-red-100 text-red-800">Debug: Finding Record 602...</div>;

    return (
        <div className="fixed top-0 left-0 bg-yellow-100 border-2 border-yellow-400 p-4 z-[9999] max-w-sm m-4 shadow-xl rounded-lg text-xs font-mono">
            <h3 className="font-bold underline mb-2">Debug Info (V2 Data)</h3>
            <div>ID: {sample.id}</div>
            <div className={sample.hebrew_date_text.includes('"') ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                Hebrew Text: {sample.hebrew_date_text}
            </div>
            <div>Struct: {JSON.stringify(sample.hebrew_date_struct)}</div>
            <div className="mt-2 text-gray-500">If Text is green, data is correct.</div>
        </div>
    );
};

export default DebugChecker;
