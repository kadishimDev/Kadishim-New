import React, { useState, useEffect, useRef } from 'react';
import { SystemEngine } from '../../services/intelligence/SystemEngine';
import { CommandProcessor } from '../../services/intelligence/CommandProcessor';
import { Shield, Activity, Eye, FileText, Terminal, Play, Wrench, CheckCircle, AlertTriangle, XCircle, Database, TrendingUp, ExternalLink, Loader2, Send, Calendar, Users, Flame, Upload } from 'lucide-react';
import { useData } from '../../context/DataContext';

const MissionControl = ({ onNavigate }) => {
    const { memorials, pages, savePage } = useData();
    const [engine] = useState(() => new SystemEngine({ memorials, pages }));

    // Initialize Commander with capabilities
    const [commander] = useState(() => new CommandProcessor({
        navigate: onNavigate,
        savePage: savePage
    }));

    const [scanning, setScanning] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false); // Mobile: terminal collapsed by default

    // State for Chat & Logs
    const [logs, setLogs] = useState([]);
    const [modelName, setModelName] = useState("Connecting...");
    const [chatHistory, setChatHistory] = useState([
        { sender: 'ai', text: 'שלום! אני מנהל המערכת האישי שלך. אני מכיר את האתר לפני ולפנים ויכול לעזור לך לשנות תוכן, לעצב מחדש, ולהבין איך הכל עובד. מה תרצה לעשות?' }
    ]);

    // Check connection on mount
    useEffect(() => {
        setTimeout(() => {
            if (commander.currentModelName) setModelName(commander.currentModelName);
        }, 1000); // Give it a sec to init
    }, [commander]);

    const [results, setResults] = useState(null);

    const logsEndRef = useRef(null);
    const chatEndRef = useRef(null);

    // Auto-scroll logs & chat
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, processing]);

    const addLog = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString('he-IL');
        setLogs(prev => [...prev, { time, msg, type }]);
    };

    const runScan = async () => {
        setScanning(true);
        setLogs([]);
        setResults(null);
        addLog("מתחיל סריקת מערכת...", "system");

        try {
            const res = await engine.runFullScan((msg, type) => addLog(msg, type));
            setResults(res);
            addLog(`סריקה הושלמה. ציון בריאות כללי: ${res.totalScore}%`, "system");
        } catch (e) {
            addLog(`שגיאה קריטית: ${e.message}`, "error");
        } finally {
            setScanning(false);
        }
    };

    const executeCommand = async (cmdResult) => {
        const { type, msg, action, target, payload } = cmdResult;

        if (msg) addLog(msg, type === 'error' ? 'error' : 'system');

        let replyText = null;

        if (type === 'action') {
            if (action === 'SCAN') { runScan(); }
            if (action === 'CLEAR_LOGS') { setLogs([]); }
        }

        if (type === 'nav') {
            if (onNavigate) { onNavigate(target, payload); }
        }

        if (type === 'design') {
            if (action === 'THEME_DARK') { document.documentElement.classList.add('dark'); }
            if (action === 'THEME_LIGHT') { document.documentElement.classList.remove('dark'); }

            if (action === 'FONT_INC') {
                const cur = parseInt(getComputedStyle(document.documentElement).fontSize);
                document.documentElement.style.fontSize = (cur + 1) + 'px';
            }
            if (action === 'FONT_DEC') {
                const cur = parseInt(getComputedStyle(document.documentElement).fontSize);
                document.documentElement.style.fontSize = (cur - 1) + 'px';
            }
            if (action === 'COLOR_BLUE') { document.documentElement.style.setProperty('--color-primary', '#3b82f6'); }
            if (action === 'COLOR_ORANGE') { document.documentElement.style.setProperty('--color-primary', '#f97316'); }
        }

        if (type === 'content') {
            if (action === 'UPDATE_TITLE') {
                const homePage = pages.find(p => p.slug === 'home');
                if (homePage) {
                    await savePage({ ...homePage, title: payload.title });
                    addLog(`עודכן בהצלחה: כותרת שונתה ל"${payload.title}"`, 'success');
                }
            }
            if (action === 'UPDATE_CONTENT') {
                const targetPage = pages.find(p => p.slug === payload.page || p.slug === 'home'); // Default to home if not specified
                if (targetPage) {
                    await savePage({ ...targetPage, content: payload.content });
                    addLog(`עודכן בהצלחה: תוכן העמוד "${targetPage.title}" נשמר במסד הנתונים.`, 'success');
                } else {
                    addLog(`שגיאה: העמוד ${payload.page} לא נמצא.`, 'error');
                }
            }
        }

        return replyText;
    };

    const handleCommander = async (inputObj) => {
        // Handle both raw events (e.g. from input) and direct text (from clicks)
        let cmd = '';

        if (inputObj.key === 'Enter') {
            cmd = inputObj.target.value.trim();
            inputObj.target.value = ''; // clear input
        } else if (typeof inputObj === 'string') {
            // Direct call
            cmd = inputObj;
        } else {
            return; // invalid event
        }

        if (cmd) {
            // 1. Add User Message
            setChatHistory(prev => [...prev, { sender: 'user', text: cmd }]);
            setProcessing(true);

            try {
                // 2. Process (AI Returns { answer, command })
                const result = await commander.process(cmd);

                // 3. Add AI Text Reply
                if (result.answer) {
                    setChatHistory(prev => [...prev, { sender: 'ai', text: result.answer }]);
                }

                // 4. Execute Action (if exists)
                if (result.command) {
                    await executeCommand(result.command);
                } else if (!result.answer) {
                    // Fallback if empty
                    setChatHistory(prev => [...prev, { sender: 'ai', text: "בוצע." }]);
                }

            } catch (err) {
                setChatHistory(prev => [...prev, { sender: 'ai', text: "מצטער, הייתה שגיאה טכנית." }]);
                addLog('Error processing command', 'error');
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleCardClick = (category) => {
        const prompts = {
            infrastructure: "תן לי דוח מצב טכני על התשתיות והבסיס נתונים.",
            visual: "מה מצב העיצוב (UI/UX)? האם יש בעיות נגישות?",
            content: "האם יש בעיות בתוכן באתר (דפים ריקים, קישורים שבורים)?",
            success: "איך הביצועים של האתר? האם יש מדדי הצלחה?"
        };
        const text = prompts[category];
        if (text) {
            handleCommander(text); // Send direct text
        }
    };

    // State for Yizkor Count
    const [yizkorCount, setYizkorCount] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // 1. Try Local Storage Override
        const localData = localStorage.getItem('yizkor_local_data');
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                if (Array.isArray(parsed)) {
                    setYizkorCount(parsed.length);
                    return;
                }
            } catch (e) { console.error("Bad local yizkor data"); }
        }

        // 2. Try API
        fetch('/api/get_yizkor.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setYizkorCount(data.length);
            })
            .catch(err => {
                // 3. Fallback to sample data
                import('../../data/yizkor_martyrs.json').then(module => {
                    if (module.default) setYizkorCount(module.default.length);
                }).catch(() => { });
            });
    }, []);

    const handleYizkorImport = (event) => {
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
                // Simple CSV parser (assuming header row)
                const lines = content.split('\n').filter(line => line.trim() !== '');
                // Skip header? Assuming yes
                data = lines.slice(1).map(line => ({ name: line.split(',')[0] })); // Very basic
            }

            if (Array.isArray(data)) {
                localStorage.setItem('yizkor_local_data', JSON.stringify(data));
                setYizkorCount(data.length);
                addLog(`Success: Imported ${data.length} Yizkor records locally.`, 'success');
                alert(`יובאו בהצלחה ${data.length} רשומות!`);
            }
        };
        reader.readAsText(file);
    };

    const memorialsThisMonth = React.useMemo(() => {
        const currentMonth = new Date().getMonth(); // 0-11
        return memorials.filter(m => {
            if (!m.gregorian_date) return false;
            const d = new Date(m.gregorian_date);
            return d.getMonth() === currentMonth;
        }).length;
    }, [memorials]);

    // Initial Scan
    useEffect(() => {
        runScan();
    }, []);

    return (
        <div className="space-y-4 text-slate-800 animate-fade-in flex flex-col" dir="rtl">
            {/* Header */}
            <div className="bg-slate-900 text-white p-3 md:p-4 rounded-xl shadow-xl flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                <div className="relative z-10 flex items-center gap-3">
                    <Shield className="text-blue-400" size={24} />
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold">Mission Control</h1>
                        <p className="text-slate-400 font-mono text-xs">System Architect AI ({modelName}) 🟢</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-2">
                    <button
                        onClick={() => setShowTerminal(v => !v)}
                        className="md:hidden px-3 py-2 rounded-lg font-bold flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600"
                    >
                        <Terminal size={14} /> לוג
                    </button>
                    <button
                        onClick={runScan}
                        disabled={scanning}
                        className={`px-3 md:px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm ${scanning ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {scanning ? <Activity className="animate-spin" size={16} /> : <Play size={16} />}
                        {scanning ? 'סורק...' : 'סריקה'}
                    </button>
                </div>
            </div>

            {/* Business Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1 shrink-0">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">סה"כ אזכרות</p>
                        <h3 className="text-2xl font-black text-gray-800">{memorials.length}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Database size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">אזכרות החודש</p>
                        <h3 className="text-2xl font-black text-gray-800">{memorialsThisMonth}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-green-600">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative group">
                    <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">חללי צה"ל</p>
                        <h3 className="text-2xl font-black text-gray-800">{yizkorCount.toLocaleString()}</h3>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                        <Flame size={24} />
                    </div>

                    {/* Import Button (Hidden by default, shown on hover/focus) */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full shadow-sm"
                            title="ייבוא נתונים (CSV/JSON)"
                        >
                            <Upload size={14} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleYizkorImport}
                            accept=".csv,.json"
                            className="hidden"
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-bold mb-1">עמודים באתר</p>
                        <h3 className="text-2xl font-black text-gray-800">{pages.length}</h3>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                        <FileText size={24} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

                {/* Left Col: Chat Interface */}
                <div className="flex-1 flex flex-col gap-4 min-h-0">

                    {/* Chat Window */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                        {/* Chat Header */}
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold text-slate-700 text-sm">מומחה מערכת (System Expert)</span>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] p-3 px-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {processing && (
                                <div className="flex justify-end">
                                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                        <Loader2 className="animate-spin text-blue-500" size={16} />
                                        <span className="text-xs text-slate-500">מקליד...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                            <div className="relative flex items-center gap-2">
                                <div className="absolute right-3 text-slate-400">
                                    <Terminal size={18} />
                                </div>
                                <input
                                    type="text"
                                    autoFocus
                                    disabled={processing}
                                    placeholder="שאל אותי משהו, או לחץ על הכרטיס למטה..."
                                    className="w-full bg-slate-100 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                    onKeyDown={handleCommander}
                                />
                                <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats (Interactive) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                        <AgentCard onClick={() => handleCardClick('infrastructure')} title="תשתיות" icon={<Database size={16} />} data={results?.infrastructure} color="blue" />
                        <AgentCard onClick={() => handleCardClick('visual')} title="עיצוב" icon={<Eye size={16} />} data={results?.visual} color="purple" />
                        <AgentCard onClick={() => handleCardClick('content')} title="תוכן" icon={<FileText size={16} />} data={results?.content} color="emerald" />
                        <AgentCard onClick={() => handleCardClick('success')} title="הצלחה" icon={<TrendingUp size={16} />} data={results?.success} color="orange" />
                    </div>
                </div>

                {/* Right Col: Terminal Log */}
                <div className={`bg-black rounded-xl p-3 font-mono text-xs shadow-xl border border-slate-800 flex flex-col overflow-hidden min-h-0 lg:h-auto ${showTerminal ? 'h-64' : 'hidden lg:flex'}`}>
                    <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2 mb-2 shrink-0">
                        <Terminal size={12} />
                        <span>TERMINAL LOG</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                        {logs.map((log, i) => (
                            <div key={i} className={`flex gap-2 mb-1 border-b border-slate-900 pb-1 ${log.type === 'error' ? 'text-red-400' :
                                log.type === 'warn' ? 'text-orange-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'system' ? 'text-blue-400 font-bold' :
                                            'text-slate-300'
                                }`}>
                                <span className="text-slate-600 opacity-50 block w-12 shrink-0">[{log.time}]</span>
                                <span className="break-all">{log.msg}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Clickable Agent Card
const AgentCard = ({ title, icon, data, color, onClick }) => {
    const isHealthy = data?.score > 80;
    const theme = {
        blue: 'bg-blue-50 text-blue-700',
        purple: 'bg-purple-50 text-purple-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        orange: 'bg-orange-50 text-orange-700',
    }[color] || 'bg-gray-50';

    if (!data) return <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse h-full" />;

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col justify-between h-full hover:shadow-md transition-all cursor-pointer active:scale-95 active:bg-slate-50 relative group ${!isHealthy ? 'border-red-200 bg-red-50/10' : ''}`}
        >
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-xl transition-colors pointer-events-none"></div>
            <div className="flex justify-between items-start">
                <div className={`p-1.5 rounded-lg ${theme}`}>{icon}</div>
                <div className={`font-mono font-bold text-lg ${data.score < 80 ? 'text-red-500' : 'text-slate-700'}`}>{data.score}</div>
            </div>
            <div>
                <div className="text-xs font-bold text-slate-700">{title}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {data.checks.length} בדיקות
                </div>
            </div>
        </div>
    );
};

export default MissionControl;
