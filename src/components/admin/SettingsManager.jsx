import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Save, RefreshCw, Shield, Globe, Smartphone, Mail, Lock, Server, Share2, BarChart, Bell, Zap, FileText } from 'lucide-react';

const SettingsManager = () => {
    const { settings, updateSetting, persistSettings, resetSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await persistSettings();
            if (result.success) {
                // Dispatch custom event for notifications
                const event = new CustomEvent('show-toast', { detail: { message: 'הגדרות נשמרו בהצלחה!' } });
                window.dispatchEvent(event);
            } else {
                alert(result.error);
            }
        } catch (e) {
            alert('שגיאה בשמירת ההגדרות');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearCache = () => {
        if (window.confirm('האם אתה בטוח שברצונך לנקות את מטמון השרת? (פעולה זו עלולה להאט את האתר זמנית)')) {
            alert('פקודת ניקוי נשלחה לשרת (סימולציה).');
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-3 rounded-t-lg transition-colors shrink-0 text-sm ${activeTab === id
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6" dir="rtl">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2">
                <Settings size={24} className="text-blue-600" />
                ניהול הגדרות אתר
            </h2>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-4 md:mb-6 overflow-x-auto gap-1 pb-0">
                <TabButton id="general" label="כללי" icon={Globe} />
                <TabButton id="contact" label="קשר" icon={Smartphone} />
                <TabButton id="social" label="סושיאל" icon={Share2} />
                <TabButton id="analytics" label="אנליטיקס" icon={BarChart} />
                <TabButton id="notifications" label="התראות" icon={Bell} />
                <TabButton id="features" label="פיצ'רים" icon={Zap} />
                <TabButton id="upress" label="שרת" icon={Server} />
            </div>

            {/* Content Area */}
            <div className="space-y-6">

                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">כותרת האתר</label>
                            <input
                                type="text"
                                value={settings.general.siteTitle}
                                onChange={(e) => updateSetting('general', 'siteTitle', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור האתר (SEO)</label>
                            <textarea
                                value={settings.general.siteDescription}
                                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-24"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת לוגו</label>
                                <input
                                    type="text"
                                    value={settings.general.logoUrl}
                                    onChange={(e) => updateSetting('general', 'logoUrl', e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">אייקון (Favicon)</label>
                                <input
                                    type="text"
                                    value={settings.general.faviconUrl || ''}
                                    onChange={(e) => updateSetting('general', 'faviconUrl', e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">טקסט כותרת תחתונה</label>
                            <input
                                type="text"
                                value={settings.general.footerText || ''}
                                onChange={(e) => updateSetting('general', 'footerText', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Contact Settings */}
                {activeTab === 'contact' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון ראשי</label>
                                <input
                                    type="text"
                                    value={settings.contact.phone}
                                    onChange={(e) => updateSetting('contact', 'phone', e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">מספר וואטסאפ (בינלאומי)</label>
                                <input
                                    type="text"
                                    value={settings.contact.whatsapp}
                                    onChange={(e) => updateSetting('contact', 'whatsapp', e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="97250..."
                                    dir="ltr"
                                />
                                <p className="text-xs text-gray-500 mt-1">מספר מלא כולל קידומת מדינה, ללא פלוס או מקפים.</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">כתובת אימייל</label>
                            <input
                                type="email"
                                value={settings.contact.email}
                                onChange={(e) => updateSetting('contact', 'email', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">כתובת פיזית</label>
                            <input
                                type="text"
                                value={settings.contact.address || ''}
                                onChange={(e) => updateSetting('contact', 'address', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">שעות פעילות</label>
                            <input
                                type="text"
                                value={settings.contact.officeHours || ''}
                                onChange={(e) => updateSetting('contact', 'officeHours', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Social Settings */}
                {activeTab === 'social' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">פייסבוק</label>
                            <input
                                type="text"
                                value={settings.social?.facebook || ''}
                                onChange={(e) => updateSetting('social', 'facebook', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">אינסטגרם</label>
                            <input
                                type="text"
                                value={settings.social?.instagram || ''}
                                onChange={(e) => updateSetting('social', 'instagram', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">יוטיוב</label>
                            <input
                                type="text"
                                value={settings.social?.youtube || ''}
                                onChange={(e) => updateSetting('social', 'youtube', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">טוויטר / X</label>
                            <input
                                type="text"
                                value={settings.social?.twitter || ''}
                                onChange={(e) => updateSetting('social', 'twitter', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                dir="ltr"
                            />
                        </div>
                    </div>
                )}

                {/* Analytics Settings */}
                {activeTab === 'analytics' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-4">
                            <p className="text-sm text-yellow-800 flex items-center gap-2">
                                <Shield size={16} />
                                שים לב: שינוי הגדרות אלו דורש ידע טכני. קוד שגוי עלול לשבור את האתר.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                            <input
                                type="text"
                                value={settings.analytics?.googleAnalyticsId || ''}
                                onChange={(e) => updateSetting('analytics', 'googleAnalyticsId', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder="G-XXXXXXXXXX"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                            <input
                                type="text"
                                value={settings.analytics?.facebookPixelId || ''}
                                onChange={(e) => updateSetting('analytics', 'facebookPixelId', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder="1234567890"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">סקריפטים ב-HEAD (מותאם אישית)</label>
                            <textarea
                                value={settings.analytics?.customHeadScripts || ''}
                                onChange={(e) => updateSetting('analytics', 'customHeadScripts', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-xs h-32"
                                placeholder="<script>...</script>"
                                dir="ltr"
                            />
                        </div>
                    </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל מנהל (לקבלת התראות)</label>
                            <input
                                type="email"
                                value={settings.notifications?.adminEmail || ''}
                                onChange={(e) => updateSetting('notifications', 'adminEmail', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                dir="ltr"
                            />
                        </div>
                        <div className="flex items-center gap-3 py-2 border-b">
                            <input
                                type="checkbox"
                                id="enableEmailAlerts"
                                checked={settings.notifications?.enableEmailAlerts || false}
                                onChange={(e) => updateSetting('notifications', 'enableEmailAlerts', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="enableEmailAlerts" className="text-gray-700">קבלת התראות במייל על בקשות תפילה חדשות</label>
                        </div>
                        <div className="flex items-center gap-3 py-2 border-b">
                            <input
                                type="checkbox"
                                id="enableSmsAlerts"
                                checked={settings.notifications?.enableSmsAlerts || false}
                                onChange={(e) => updateSetting('notifications', 'enableSmsAlerts', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="enableSmsAlerts" className="text-gray-700">קבלת התראות SMS (כרוך בעלויות)</label>
                        </div>
                        {settings.notifications?.enableSmsAlerts && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון ל-SMS</label>
                                <input
                                    type="text"
                                    value={settings.notifications?.smsPhoneNumber || ''}
                                    onChange={(e) => updateSetting('notifications', 'smsPhoneNumber', e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    dir="ltr"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Feature Flags */}
                {activeTab === 'features' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-purple-50 p-4 rounded border border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                                <label className="font-bold text-gray-800 flex items-center gap-2">
                                    <Lock size={18} />
                                    מצב תחזוקה
                                </label>
                                <input
                                    type="checkbox"
                                    checked={settings.features?.maintenanceMode || false}
                                    onChange={(e) => updateSetting('features', 'maintenanceMode', e.target.checked)}
                                    className="w-5 h-5 toggle-checkbox"
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                הפעלת מצב זה תחסום את הגישה לאתר למבקרים ותציג הודעת תחזוקה.
                            </p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded border border-orange-100">
                            <div className="flex items-center justify-between mb-2">
                                <label className="font-bold text-gray-800 flex items-center gap-2">
                                    <Globe size={18} />
                                    באנר חגים/חירום
                                </label>
                                <input
                                    type="checkbox"
                                    checked={settings.features?.showHolidayBanner || false}
                                    onChange={(e) => updateSetting('features', 'showHolidayBanner', e.target.checked)}
                                    className="w-5 h-5 toggle-checkbox"
                                />
                            </div>
                            {settings.features?.showHolidayBanner && (
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">טקסט הבאנר</label>
                                    <input
                                        type="text"
                                        value={settings.features?.holidayBannerText || ''}
                                        onChange={(e) => updateSetting('features', 'holidayBannerText', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Upress / Server Settings */}
                {activeTab === 'upress' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                                <Server size={20} />
                                סטטוס שרת (uPress)
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-green-700">
                                    <Shield size={16} /> WAF פעיל
                                </span>
                                <span className="flex items-center gap-1 text-green-700">
                                    <Globe size={16} /> CDN מחובר
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 border rounded shadow-sm">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <RefreshCw size={18} /> ניקוי מטמון (Cache)
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    נקה את זיכרון המטמון בשרת כדי ששינויים באתר יופיעו מיד לכל הגולשים.
                                </p>
                                <button
                                    onClick={handleClearCache}
                                    className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded hover:bg-orange-200 transition-colors border border-orange-200 font-medium"
                                >
                                    נקה מטמון שרת
                                </button>
                            </div>

                            <div className="bg-white p-4 border rounded shadow-sm opacity-75">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-500">
                                    <Lock size={18} /> מצב פיתוח (בקרוב)
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    חסימת גישה לאתר לגולשים (מציג דף "בבנייה").
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-6 bg-gray-300 rounded-full cursor-not-allowed"></div>
                                </div>
                            </div>

                            {/* Data Migration */}
                            <div className="bg-white p-4 border rounded shadow-sm border-blue-100">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-800">
                                    <FileText size={18} /> שחזור נתונים (Legacy)
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    ייבוא נתונים מקובץ היסטורי (memorials_v2.json) למסד הנתונים החדש.
                                    <br />
                                    <strong>שים לב:</strong> בצע פעולה זו רק פעם אחת אם הטבלה ריקה.
                                </p>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('האם לייבא נתונים? פעולה זו תיקח מספר שניות.')) {
                                            try {
                                                const res = await fetch('/api/import_memorials.php');
                                                const data = await res.json();
                                                alert(JSON.stringify(data, null, 2));
                                            } catch (e) {
                                                alert('Error: ' + e.message);
                                            }
                                        }
                                    }}
                                    className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 transition-colors border border-blue-200 font-medium"
                                >
                                    ייבא נתונים היסטוריים
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Save Bar – sticky on mobile, inline on desktop */}
            <div className="fixed md:static bottom-0 left-0 right-0 md:mt-8 bg-white md:bg-transparent border-t md:border-t-0 border-gray-200 p-4 md:p-0 flex justify-between items-center z-50 shadow-lg md:shadow-none">
                <button
                    onClick={() => { if (window.confirm('לאפס את כל ההגדרות לברירת מחדל?')) resetSettings(); }}
                    className="text-red-500 text-sm hover:underline"
                >
                    אפס לברירת מחדל
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all font-bold ${isSaving ? 'opacity-80' : ''}`}
                >
                    {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSaving ? 'שומר...' : 'שמור שינויים'}
                </button>
            </div>
        </div>
    );
};


// Simple Icon component for the header
const Settings = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default SettingsManager;
