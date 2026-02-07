import React, { useState, useEffect } from 'react';
import { Save, Edit2, Globe, Image as ImageIcon, Eye, EyeOff, ChevronDown, ChevronLeft, Layout, Smartphone, Monitor, Plus, PlusCircle, FileText, Square, Columns, Minus, Folder, FolderOpen } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import menuData from '../../data/menu_structure.json';
import ContactForm from '../ContactForm';

// Enhanced Toolbar Configuration
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }, { 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'color', 'background',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video'
];

// Recursive Menu Item Component
const MenuItem = ({ item, level = 0, onSelect, selectedPage, allPages, onToggleVisibility }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.items && item.items.length > 0;

    // Find the page data corresponding to this menu item
    // Matches based on path (slug)
    let pageSlug = null;
    if (item.path && item.path.startsWith('/page/')) {
        pageSlug = item.path.split('/page/')[1];
    }

    const pageData = pageSlug ? allPages.find(p => p.slug === pageSlug) : null;
    const isSelected = selectedPage?.slug === pageSlug && pageSlug;
    const isVisible = pageData ? (pageData.isVisible !== false) : true;

    const toggleOpen = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleToggleVisibility = (e) => {
        e.stopPropagation();
        if (pageData) {
            onToggleVisibility(pageData);
        }
    };

    return (
        <div className="select-none">
            <div
                className={`
                    flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all mb-1 group
                    ${isSelected ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}
                    ${!isVisible && pageData ? 'opacity-60 grayscale' : ''}
                    ${!pageData && !hasChildren && pageSlug ? 'opacity-70 border-dashed border-gray-300' : ''}
                `}
                onClick={() => {
                    if (pageData) {
                        onSelect(pageData);
                    } else if (hasChildren) {
                        setIsOpen(!isOpen);
                    } else if (pageSlug) {
                        // Ghost Page - Allow creating it
                        onSelect({
                            title: item.title || item.name,
                            slug: pageSlug,
                            content: `<h1>${item.title || item.name}</h1><p>תוכן חדש...</p>`,
                            type: 'page',
                            isVisible: true,
                            isGhost: true
                        });
                    }
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1" style={{ paddingRight: level * 12 }}>
                    {hasChildren ? (
                        <button
                            onClick={toggleOpen}
                            className={`p-1 rounded-md transition-colors ${isOpen ? 'text-primary' : 'text-gray-400'}`}
                        >
                            {isOpen ? <FolderOpen size={14} /> : <Folder size={14} />}
                        </button>
                    ) : (
                        <span className="w-6 flex justify-center text-gray-300">
                            <FileText size={14} className={isSelected ? 'text-primary' : ''} />
                        </span>
                    )}

                    <span className={`truncate text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}>
                        {item.title || item.name}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Visibility Toggle */}
                    {pageData && (
                        <button
                            onClick={handleToggleVisibility}
                            className={`p-1 rounded hover:bg-gray-200 transition-colors ${!isVisible ? 'text-gray-400' : 'text-green-600'}`}
                            title={isVisible ? "הסתר מהאתר" : "הצג באתר"}
                        >
                            {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                    )}
                </div>
            </div>

            {hasChildren && isOpen && (
                <div className="border-r border-gray-100 mr-3.5">
                    {item.items.map((subItem, index) => (
                        <MenuItem
                            key={index}
                            item={subItem}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedPage={selectedPage}
                            allPages={allPages}
                            onToggleVisibility={onToggleVisibility}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Generic Item for pages not in menu structure
const LoosePageItem = ({ page, onSelect, selectedPage, onToggleVisibility }) => {
    const isSelected = selectedPage?.slug === page.slug;
    const isVisible = page.isVisible !== false;

    return (
        <div
            onClick={() => onSelect(page)}
            className={`
                flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-all mb-1 group
                ${isSelected ? 'bg-primary/10 text-primary border border-primary/20 font-bold shadow-sm' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}
                ${!isVisible ? 'opacity-60 grayscale' : ''}
            `}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <FileText size={14} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                <span className="truncate">{page.title}</span>
                <span className="text-[10px] bg-gray-100 text-gray-400 px-1 rounded">לא משויך</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(page); }}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${!isVisible ? 'text-gray-400' : 'text-green-600'}`}
                    title={isVisible ? "הסתר מהאתר" : "הצג באתר"}
                >
                    {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
            </div>
        </div>
    );
}

const PageEditor = ({ pages, onUpdate }) => {
    // State
    const [selectedPage, setSelectedPage] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
    const [showPreview, setShowPreview] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState('');

    // Handlers
    const handleSelect = (page) => {
        setSelectedPage(page);
        // Ensure legacy pages have isVisible property
        setEditForm({ ...page, isVisible: page.isVisible !== undefined ? page.isVisible : true });
    };

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleContentChange = (content) => {
        setEditForm({ ...editForm, content });
    };

    const handleSave = () => {
        onUpdate(editForm);
        // Dispatch custom event for notifications
        const event = new CustomEvent('show-toast', { detail: { message: 'השינויים נשמרו בהצלחה' } });
        window.dispatchEvent(event);
    };

    const handleCreatePage = (e) => {
        e.preventDefault();
        if (!newPageTitle) return;

        const newSlug = newPageTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w\u0590-\u05ff-]/g, '');
        const newPage = {
            title: newPageTitle,
            slug: newSlug,
            content: '<h1>' + newPageTitle + '</h1><p>תוכן חדש...</p>',
            type: 'page',
            isVisible: true
        };

        onUpdate(newPage);
        setNewPageTitle('');
        setIsCreating(false);
        handleSelect(newPage);
    };

    const toggleVisibility = () => {
        const updatedPage = { ...editForm, isVisible: !editForm.isVisible };
        setEditForm(updatedPage);
        // For immediate sidebar update, we allow save or just local state update? 
        // Sidebar reads from 'pages' prop. Changing editForm doesn't update 'pages'.
        // So we should prob call onUpdate(updatedPage) immediately OR rely on user to save.
        // User expects immediate toggle from sidebar, so we need a separate handler for sidebar toggles that saves immediately.
    };

    // Handler for Sidebar Toggles (Immediate Save)
    const handleSidebarToggle = (page) => {
        const isCurrentlyVisible = page.isVisible !== false;
        const updatedPage = { ...page, isVisible: !isCurrentlyVisible };

        // If currently editing this page, update form too
        if (selectedPage?.slug === page.slug) {
            setEditForm(prev => ({ ...prev, isVisible: updatedPage.isVisible }));
        }

        onUpdate(updatedPage);
    };

    // Filter pages that are NOT in the menu structure
    const getLinkedSlugs = (items) => {
        let slugs = [];
        items.forEach(item => {
            if (item.path && item.path.startsWith('/page/')) {
                slugs.push(item.path.split('/page/')[1]);
            }
            if (item.items) {
                slugs = [...slugs, ...getLinkedSlugs(item.items)];
            }
        });
        return slugs;
    };

    const linkedSlugs = getLinkedSlugs(menuData);
    // Filter out 'home' and any pages already in menu
    const loosePages = pages.filter(p => !linkedSlugs.includes(p.slug) && p.slug !== 'home');

    // Helper to render content with shortcodes (Matching ContentPage.jsx)
    const renderPreviewContent = (htmlContent) => {
        if (!htmlContent) return null;

        // Check for [form] shortcode
        if (htmlContent.includes('[form]')) {
            const parts = htmlContent.split('[form]');
            return (
                <div>
                    <div
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: parts[0] }}
                    ></div>

                    <div className="my-8 relative group cursor-not-allowed opacity-80 decoration-slate-400">
                        <div className="absolute inset-0 bg-primary/5 border border-primary/20 border-dashed rounded-xl z-20 flex items-center justify-center">
                            <span className="bg-white px-3 py-1 rounded shadow-sm text-xs font-bold text-primary">אזור טופס יצירת קשר (פעיל באתר)</span>
                        </div>
                        <div className="opacity-50 pointer-events-none blur-[1px]">
                            <ContactForm />
                        </div>
                    </div>

                    {parts[1] && (
                        <div
                            className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: parts[1] }}
                        ></div>
                    )}
                </div>
            );
        }

        // Default rendering
        return (
            <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            ></div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 bg-gray-50/50 p-2 rounded-xl">
            {/* Sidebar - Site Tree */}
            <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Layout size={18} />
                            מבנה האתר
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">ניהול דפים ותוכן</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        title="צור עמוד חדש"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {isCreating && (
                    <form onSubmit={handleCreatePage} className="p-3 bg-orange-50 border-b border-orange-100">
                        <input
                            type="text"
                            placeholder="שם העמוד החדש..."
                            className="w-full text-sm p-2 border border-orange-200 rounded mb-2"
                            value={newPageTitle}
                            onChange={(e) => setNewPageTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-primary text-white text-xs py-1 rounded">צור</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-white border border-gray-200 text-xs py-1 rounded">ביטול</button>
                        </div>
                    </form>
                )}

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                    <div className="space-y-1">
                        {/* Recursive Menu Tree */}
                        {menuData.map((item, index) => (
                            <MenuItem
                                key={index}
                                item={item}
                                onSelect={handleSelect}
                                selectedPage={selectedPage}
                                allPages={pages}
                                onToggleVisibility={handleSidebarToggle}
                            />
                        ))}

                        {/* Divider for Unlinked Pages */}
                        {loosePages.length > 0 && (
                            <>
                                <div className="border-t border-gray-100 my-2 pt-2 px-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">דפים נוספים</span>
                                </div>
                                {loosePages.map(page => (
                                    <LoosePageItem
                                        key={page.slug}
                                        page={page}
                                        onSelect={handleSelect}
                                        selectedPage={selectedPage}
                                        onToggleVisibility={handleSidebarToggle}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-gray-100/50 rounded-2xl border border-gray-200 overflow-hidden relative">
                {!selectedPage ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Layout size={40} className="opacity-20" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-500 mb-2">עורך ה-CMS החדש</h2>
                        <p className="max-w-md text-center text-sm">בחר עמוד מהרשימה או צור עמוד חדש כדי להתחיל.</p>
                    </div>
                ) : (
                    <>
                        {/* Header Toolbar */}
                        <div className="flex flex-col border-b border-gray-200 bg-white z-10 sticky top-0 shadow-sm">
                            <div className="flex justify-between items-center p-4">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-gray-800">{editForm.title}</h2>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${editForm.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {editForm.isVisible ? 'פעיל' : 'מוסתר'}
                                                {editForm.isGhost && <span className="mr-1 text-orange-500">(חדש)</span>}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono">/{editForm.slug}</p>
                                    </div>
                                    <div className="h-6 w-px bg-gray-200" />

                                    {/* View Toggles */}
                                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                                        <button
                                            onClick={() => setShowPreview(false)}
                                            className={`p-1.5 rounded-md transition-all ${!showPreview ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="עורך בלבד"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setShowPreview(true)}
                                            className={`p-1.5 rounded-md transition-all ${showPreview ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="תצוגה מפוצלת"
                                        >
                                            <Layout size={16} />
                                        </button>
                                    </div>

                                    {/* Visibility Toggle */}
                                    <button
                                        onClick={toggleVisibility}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${editForm.isVisible ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        title={editForm.isVisible ? 'הסתר עמוד מהאתר' : 'פרסם עמוד באתר'}
                                    >
                                        {editForm.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {editForm.isVisible ? 'ON' : 'OFF'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            const win = window.open('/#/page/preview', 'LivePreview', 'width=1200,height=800');
                                            const interval = setInterval(() => {
                                                if (win.closed) {
                                                    clearInterval(interval);
                                                } else {
                                                    win.postMessage({ type: 'PREVIEW_UPDATE', payload: editForm }, '*');
                                                }
                                            }, 500);
                                        }}
                                        className="flex items-center gap-2 text-primary border border-primary/20 hover:bg-primary/5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Monitor size={16} /> תצוגה מקדימה
                                    </button>
                                    <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
                                        <Save size={18} /> שמור
                                    </button>
                                </div>
                            </div>

                            {/* Blocks Toolbar */}
                            <div className="flex items-center gap-2 px-4 pb-2 text-sm overflow-x-auto border-t border-gray-50 pt-2 bg-gray-50/30">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><PlusCircle size={12} /> הוסף:</span>
                                <button
                                    onClick={() => handleContentChange(editForm.content + '<a href="#" class="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors mx-1">כפתור פעולה</a>')}
                                    className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm transition-all hover:-translate-y-0.5"
                                >
                                    <Square size={12} className="text-primary" /> כפתור
                                </button>
                                <button
                                    onClick={() => handleContentChange(editForm.content + '<div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8"><div class="bg-gray-50 p-6 rounded-xl border border-gray-100"><h3>עמודה 1</h3><p>טקסט...</p></div><div class="bg-gray-50 p-6 rounded-xl border border-gray-100"><h3>עמודה 2</h3><p>טקסט...</p></div></div>')}
                                    className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm transition-all hover:-translate-y-0.5"
                                >
                                    <Columns size={12} className="text-blue-500" /> 2 עמודות
                                </button>
                                <button
                                    onClick={() => handleContentChange(editForm.content + '<div class="bg-dark text-white p-12 rounded-2xl my-8 text-center relative overflow-hidden"><div class="absolute inset-0 bg-primary/10"></div><h2 class="text-3xl font-bold relative z-10">כותרת באנר</h2><p class="text-gray-300 mt-2 relative z-10">תת כותרת מרשימה</p></div>')}
                                    className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm transition-all hover:-translate-y-0.5"
                                >
                                    <ImageIcon size={12} className="text-purple-500" /> באנר כהה
                                </button>
                                <button
                                    onClick={() => handleContentChange(editForm.content + '<hr class="my-8 border-t-2 border-gray-100" />')}
                                    className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm transition-all hover:-translate-y-0.5"
                                >
                                    <Minus size={12} className="text-gray-400" /> קו מפריד
                                </button>
                            </div>
                        </div>

                        {/* Split View Container */}
                        <div className="flex-1 flex overflow-hidden relative bg-gray-100">
                            {/* Editor Pane (Styled as a Page Card) */}
                            <div className={`transition-all duration-300 overflow-y-auto p-8 flex justify-center ${showPreview ? 'w-1/2 border-l border-gray-200' : 'w-full'}`}>
                                <div className="w-full max-w-3xl bg-white shadow-sm rounded-xl min-h-[500px] flex flex-col">
                                    <ReactQuill
                                        theme="snow"
                                        value={editForm.content}
                                        onChange={handleContentChange}
                                        modules={modules}
                                        formats={formats}
                                        className="flex-1 rounded-xl border-none"
                                    />
                                    {/* Note: ReactQuill styles might need tweaks to remove outer border 
                                        and make it fill the card naturally. 
                                        We prefer the 'snow' theme but might want to hide the toolbar inside and rely on our outer toolbar?
                                        Actually, for now, standard Quill behavior is fine inside the 'Card'.
                                    */}
                                </div>
                            </div>

                            {/* Preview Pane - Internal */}
                            {showPreview && (
                                <div className="w-1/2 flex flex-col bg-gray-200 border-r border-gray-200 shadow-inner">
                                    <div className="p-2 bg-white border-b border-gray-200 flex justify-between items-center text-xs text-gray-400">
                                        <span className="font-mono">תצוגה מקדימה ({viewMode})</span>
                                        <div className="flex gap-1 bg-gray-100 p-0.5 rounded">
                                            <button
                                                onClick={() => setViewMode('desktop')}
                                                className={`p-1 rounded ${viewMode === 'desktop' ? 'bg-white shadow text-gray-800' : 'hover:text-gray-600'}`}
                                            >
                                                <Monitor size={12} />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('mobile')}
                                                className={`p-1 rounded ${viewMode === 'mobile' ? 'bg-white shadow text-gray-800' : 'hover:text-gray-600'}`}
                                            >
                                                <Smartphone size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden flex justify-center items-start pt-8 pb-8 bg-gray-200/50">
                                        <div
                                            className={`
                                                bg-white shadow-2xl transition-all duration-300 overflow-y-auto scrollbar-thin
                                                ${viewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[3rem] border-8 border-gray-900 ring-2 ring-gray-300' : 'w-[90%] h-[95%] rounded-lg border border-gray-300'}
                                            `}
                                        >
                                            {viewMode === 'mobile' && <div className="w-32 h-6 bg-black absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>}

                                            <div className="h-6 bg-gray-100 border-b flex items-center px-2 gap-1 sticky top-0 z-10">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                                <div className="flex-1 bg-white mx-2 rounded px-2 py-0.5 text-[10px] text-gray-400 text-center truncate">
                                                    kadishim.co.il/page/{editForm.slug}
                                                </div>
                                            </div>

                                            <div className={`p-4 md:p-8 ${!editForm.isVisible ? 'opacity-50 grayscale' : ''}`}>
                                                {!editForm.isVisible && (
                                                    <div className="bg-red-50 text-red-500 p-2 text-center text-xs font-bold mb-4 border border-red-100 rounded">
                                                        עמוד זה מוסתר מהאתר
                                                    </div>
                                                )}
                                                {/* Content Simulation */}
                                                <h1 className="text-3xl font-bold text-gray-900 mb-6 border-r-4 border-primary pr-4">{editForm.title}</h1>

                                                {editForm.image && (
                                                    <img src={editForm.image} alt={editForm.title} className="w-full h-48 object-cover rounded-xl mb-6" />
                                                )}

                                                {renderPreviewContent(editForm.content)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PageEditor;
