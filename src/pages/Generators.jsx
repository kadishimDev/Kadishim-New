import React from 'react';
import MemorialServiceGenerator from '../components/TehillimGenerator';

const Generators = () => {
    return (
        <div className="overflow-x-hidden">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">מחוללי הנצחה ותפילה</h1>
                    <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
                        כאן תוכלו לייצר סדר לימוד משניות, פרקי תהילים לפי שם, או נוסח קדיש יתום המותאם אישית ליקירכם.
                    </p>
                </div>
            </div>

            <MemorialServiceGenerator />
        </div>
    );
};

export default Generators;
