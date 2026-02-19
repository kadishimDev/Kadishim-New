import React, { useState } from 'react';
import MemorialServiceGenerator from '../components/TehillimGenerator';

const Generators = () => {
    const [isGeneratedView, setIsGeneratedView] = useState(false);

    return (
        <div className="overflow-x-hidden">
            <div className="container mx-auto px-4 py-4">
                <div className="text-center mb-4">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">מחוללי הנצחה ותפילה</h1>
                    <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
                        כאן תוכלו לייצר סדר לימוד משניות, פרקי תהילים לפי שם, או נוסח קדיש יתום המותאם אישית ליקירכם.
                    </p>
                </div>
            </div>

            <MemorialServiceGenerator onViewChange={(hasContent) => setIsGeneratedView(hasContent)} />
        </div>
    );
};

export default Generators;
