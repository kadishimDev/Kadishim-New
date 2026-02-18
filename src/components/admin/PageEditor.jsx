import React, { useState, useEffect } from 'react';
import { Save, Edit2, Globe, Image as ImageIcon, Eye, EyeOff, ChevronDown, ChevronLeft, Layout, Smartphone, Monitor, Plus, PlusCircle, FileText, Square, Columns, Minus, Folder, FolderOpen, Move, ArrowUp, ArrowDown, Trash2, Settings, GripVertical, Link as LinkIcon, HelpCircle } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useSettings } from '../../context/SettingsContext'; // Import hook
import ContactForm from '../ContactForm';

// Configure Quill Fonts
const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = ['assistant', 'rubik', 'frank-ruhl', 'secular', 'arial'];
ReactQuill.Quill.register(Font, true);

const Size = ReactQuill.Quill.import('formats/size');
Size.whitelist = ['small', 'medium', 'large', 'huge'];
ReactQuill.Quill.register(Size, true);

// Enhanced Toolbar Configuration
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }],
        [{ 'font': Font.whitelist }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'header': '1' }, { 'header': '2' }, { 'align': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        ['link', 'image', 'video'],
        ['clean']
    ],
};

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'color', 'background',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video'
];

// Recursive Menu Item Component
const MenuItem = ({ item, level = 0, onSelect, selectedPage, allPages, onToggleVisibility, onUpdateMenuItem, isEditingStructure, onMove, onDelete, pathIndices = [] }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Find linked page data if exists
    // Clean path for comparison (remove leading slash if needed)
    const cleanPath = item.path?.replace(/^\//, '') || '';
    const pageSlug = cleanPath.startsWith('page/') ? cleanPath.replace('page/', '') : null;
    const pageData = pageSlug ? allPages.find(p => p.slug === pageSlug) : null;

    const hasChildren = item.items && item.items.length > 0;

    // Selection Logic: Matches Page Data OR Menu Node Indices
    const isSelected = selectedPage && (
        (pageData && selectedPage.slug === pageData.slug) ||
        (selectedPage.type === 'menu-node' && selectedPage.pathIndices?.join(',') === pathIndices?.join(','))
    );

    // Visibility Logic
    // 1. Menu Item Visibility (Structure)
    const isItemVisible = item.isVisible !== false;
    // 2. Page Visibility (Content)
    const isPageVisible = pageData ? (pageData.isVisible !== false) : true;

    // Combined for display state
    const isEffectiveVisible = isItemVisible && isPageVisible;

    const toggleOpen = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleToggleVisibility = (e) => {
        e.stopPropagation();
        if (pageData) {
            onToggleVisibility(pageData);
        } else {
            // Toggle menu structure visibility
            onUpdateMenuItem(pathIndices, { isVisible: !isItemVisible });
        }
    };

    const handleEditMenuNode = (e) => {
        e.stopPropagation();
        onSelect({
            ...item,
            title: item.title || item.name,
            type: 'menu-node', // Special type for structure items
            pathIndices: pathIndices,
            hasChildren: hasChildren,
            isVisible: isItemVisible
        });
    };

    return (
        <div className="select-none">
            <div
                className={`
                    flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all mb-1 group
                    ${isSelected ? 'bg-orange-50 ring-1 ring-orange-200' : 'hover:bg-gray-50 border border-transparent'}
                    ${!isEffectiveVisible ? 'opacity-60' : ''}
                    ${!pageData && !hasChildren && pageSlug ? 'opacity-70 border-dashed border-gray-300' : ''}
                `}
                style={{ paddingRight: `${level * 12 + 8}px` }}
                onClick={() => {
                    if (isEditingStructure) return;
                    if (pageData) {
                        onSelect(pageData);
                    } else if (hasChildren) {
                        // For folders, toggle open AND select for editing if clicked on text (handled by UI structure, but here we just toggle or select)
                        // Let's make text click select it, icon click toggle it.
                        // Actually simplicity: Folder -> Open.
                        setIsOpen(!isOpen);
                    } else if (pageSlug) {
                        // Ghost Page (Broken Link) - Allow creating it
                        onSelect({
                            title: item.title || item.name,
                            slug: pageSlug,
                            content: `<h1>${item.title || item.name}</h1><p>תוכן חדש...</p>`,
                            type: 'page',
                            isVisible: true,
                            isGhost: true
                        });
                    } else {
                        // System Link or External - Edit Menu Node
                        handleEditMenuNode({ stopPropagation: () => { } });
                    }
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {/* Icon based on type */}
                    {hasChildren ? (
                        <button
                            onClick={toggleOpen}
                            className={`p-0.5 rounded-md transition-colors ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}
                        >
                            {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
                        </button>
                    ) : pageData ? (
                        <FileText size={16} className={`flex-shrink-0 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                    ) : (
                        <LinkIcon size={16} className={`flex-shrink-0 ${isSelected ? 'text-orange-500' : 'text-gray-300'}`} />
                    )}

                    <span className={`truncate text-sm ${isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {item.title || item.name}
                    </span>

                    {/* Status Indicators */}
                    {!isItemVisible && <span className="text-[10px] bg-gray-200 text-gray-500 px-1 rounded mx-1">מוסתר</span>}
                    {pageData && !pageData.isVisible && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded mx-1">טיוטה</span>}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Structure Edit Controls */}
                    {isEditingStructure && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onMove(pathIndices, 'up') }}
                                className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-primary transition-colors disabled:opacity-30"
                                title="הזז למעלה"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onMove(pathIndices, 'down') }}
                                className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-primary transition-colors disabled:opacity-30"
                                title="הזז למטה"
                            >
                                <ArrowDown size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(pathIndices) }}
                                className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                title="מחק מהתפריט"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}

                    {/* Edit Settings Button for Menu items (always available for non-pages, or during structure edit) */}
                    {(!pageData || isEditingStructure) && (
                        <button
                            onClick={handleEditMenuNode}
                            className="p-1 hover:bg-white hover:text-primary rounded text-gray-400"
                            title="ערוך הגדרות תפריט"
                        >
                            <Settings size={14} />
                        </button>
                    )}

                    {/* Visibility Toggle */}
                    {!isEditingStructure && (
                        <button
                            onClick={handleToggleVisibility}
                            className={`p-1 rounded hover:bg-gray-200 transition-colors ${!isEffectiveVisible ? 'text-gray-400' : 'text-green-600'}`}
                            title={isEffectiveVisible ? "הסתר מהאתר" : "הצג באתר"}
                        >
                            {isEffectiveVisible ? <Eye size={12} /> : <EyeOff size={12} />}
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
                            onUpdateMenuItem={onUpdateMenuItem}
                            isEditingStructure={isEditingStructure}
                            onMove={onMove}
                            onDelete={onDelete}
                            pathIndices={[...pathIndices, index]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Generic Item for pages not in menu structure
const LoosePageItem = ({ page, onSelect, selectedPage, onToggleVisibility, isEditingStructure, onAddToMenu }) => {
    const isSelected = selectedPage?.slug === page.slug;
    const isVisible = page.isVisible !== false;

    return (
        <div
            onClick={() => !isEditingStructure && onSelect(page)}
            className={`
                flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-all mb-1 group
                ${isSelected ? 'bg-primary/10 text-primary border border-primary/20 font-bold shadow-sm' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}
                ${!isVisible ? 'opacity-60 grayscale' : ''}
            `}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                {isEditingStructure ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToMenu(page); }}
                        className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                        title="הוסף לתפריט הראשי"
                    >
                        <Plus size={14} />
                    </button>
                ) : (
                    <FileText size={14} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                )}

                <span className="truncate">{page.title}</span>
                <span className="text-[10px] bg-gray-100 text-gray-400 px-1 rounded">לא משויך</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditingStructure && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(page); }}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${!isVisible ? 'text-gray-400' : 'text-green-600'}`}
                        title={isVisible ? "הסתר מהאתר" : "הצג באתר"}
                    >
                        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
}

const PageEditor = ({ pages, onUpdate }) => {
    // State
    const { menu: menuData, saveMenu } = useSettings(); // Use menu from context
    const [selectedPage, setSelectedPage] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
    const [showPreview, setShowPreview] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState('');
    const [isEditingStructure, setIsEditingStructure] = useState(false); // Structure Edit Mode

    // Handlers
    const handleSelect = (page) => {
        // Find the latest page data from the prop to ensure we have the most recent version
        const latestPage = page.slug ? pages.find(p => p.slug === page.slug) : page;
        const pageToSelect = latestPage || page;

        setSelectedPage(pageToSelect);
        // Ensure legacy pages have isVisible property
        setEditForm({ ...pageToSelect, isVisible: pageToSelect.isVisible !== undefined ? pageToSelect.isVisible : true });
    };

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleContentChange = (content) => {
        setEditForm({ ...editForm, content });
    };

    const handleSave = async () => {
        const result = await onUpdate(editForm);
        if (result?.success) {
            // Dispatch custom event for notifications
            const event = new CustomEvent('show-toast', { detail: { message: 'השינויים נשמרו בהצלחה' } });
            window.dispatchEvent(event);
        } else {
            // Show real error from server
            alert(result?.error || "שגיאה בשמירת הנתונים. וודא ששרת ה-Node פועל.");
        }
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

    const toggleVisibility = async () => {
        const updatedPage = { ...editForm, isVisible: !editForm.isVisible };
        setEditForm(updatedPage);

        // Immediate sync for visibility changes
        const result = await onUpdate(updatedPage);
        if (result?.success) {
            syncWithMenu(updatedPage);
        } else {
            alert(result?.error || "שגיאה בעדכון הסטטוס");
        }
    };

    // Helper for Deep Sync with Menu
    const syncWithMenu = (page) => {
        let menuModified = false;
        const updateItemVisibility = (items) => {
            return items.map(item => {
                // Support both exact path match and slug match
                const isMatch = item.path === `/page/${page.slug}` || (item.slug && item.slug === page.slug);
                if (isMatch) {
                    if (item.isVisible !== page.isVisible) {
                        menuModified = true;
                        return { ...item, isVisible: page.isVisible };
                    }
                }
                if (item.items) {
                    return { ...item, items: updateItemVisibility(item.items) };
                }
                return item;
            });
        };

        const newMenu = updateItemVisibility(menuData);
        if (menuModified) {
            console.log('Deep Sync: Updating menu visibility for', page.slug);
            saveMenu(newMenu);
        }
    };

    // Handler for Sidebar Toggles (Immediate Save + Sync)
    const handleSidebarToggle = async (page) => {
        const isCurrentlyVisible = page.isVisible !== false;
        const updatedPage = { ...page, isVisible: !isCurrentlyVisible };

        // 1. Update the page itself (persistence)
        const result = await onUpdate(updatedPage);

        if (result?.success) {
            // 2. Sync with Menu Structure
            syncWithMenu(updatedPage);

            // If currently editing this page, update form too
            if (selectedPage?.slug === page.slug) {
                setEditForm(prev => ({ ...prev, isVisible: updatedPage.isVisible }));
            }

            // Success Toast
            const event = new CustomEvent('show-toast', { detail: { message: 'סטטוס העמוד עודכן' } });
            window.dispatchEvent(event);
        } else {
            alert(result?.error || "שגיאה בעדכון הסטטוס");
        }
    };

    // --- Structure Editing Handlers ---

    // Helper to get nested array
    const getNestedArray = (data, indices) => {
        let current = data;
        // Navigate down to the *parent* of the target item
        // If indices has 1 element [i], we want the root array 'data'
        // If indices has 2 elements [i, j], we want data[i].items

        for (let i = 0; i < indices.length - 1; i++) {
            current = current[indices[i]].items;
            if (!current) return null;
        }
        return current;
    };

    const handleStructureMove = (pathIndices, direction) => {
        if (!pathIndices || pathIndices.length === 0) return;

        const newMenu = JSON.parse(JSON.stringify(menuData));
        const targetIndex = pathIndices[pathIndices.length - 1];
        const parentArray = getNestedArray(newMenu, pathIndices);

        if (!parentArray) return;

        const newIndex = direction === 'up' ? targetIndex - 1 : targetIndex + 1;

        // Bounds check
        if (newIndex < 0 || newIndex >= parentArray.length) return;

        // Swap
        [parentArray[targetIndex], parentArray[newIndex]] = [parentArray[newIndex], parentArray[targetIndex]];

        saveMenu(newMenu);
    };

    const handleStructureDelete = (pathIndices) => {
        if (!confirm("האם להסיר פריט זה מהתפריט?")) return;

        const newMenu = JSON.parse(JSON.stringify(menuData));
        const targetIndex = pathIndices[pathIndices.length - 1];
        const parentArray = getNestedArray(newMenu, pathIndices);

        if (!parentArray) return;

        // Remove
        parentArray.splice(targetIndex, 1);
        saveMenu(newMenu);
    };

    const handleAddToMenu = (page) => {
        // Adds a loose page to the TOP LEVEL menu
        const newMenu = JSON.parse(JSON.stringify(menuData));
        newMenu.push({
            name: page.title, // 'name' for sub-items style, 'title' for root? Format inconsistent in legacy JSON?
            title: page.title, // Standardize on title if possible, but legacy uses 'name' for subs
            path: `/page/${page.slug}`,
            items: []
        });
        saveMenu(newMenu);
        // Toast
        const event = new CustomEvent('show-toast', { detail: { message: 'העמוד נוסף לתפריט הראשי' } });
        window.dispatchEvent(event);
    };


    // Filter pages that are NOT in the menu structure
    const getLinkedSlugs = (items) => {
        let slugs = [];
        if (!items) return [];
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
    // Filter out pages that are already linked, but ALLOW 'home' to be edited via the list if not linked?
    // Actually, we want to allow selecting ANY page to edit content, even if it's in the menu.
    // The 'LoosePageItem' list is specifically for pages NOT in the menu. 
    // If 'Home' is not in the recursive menu structure, it should appear here.
    // We remove the hardcoded exclusion of 'home'.
    const loosePages = pages.filter(p => !linkedSlugs.includes(p.slug));

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

    // --- Menu Node Editing Handlers ---
    const handleUpdateMenuItem = (indices, updates) => {
        const newMenu = JSON.parse(JSON.stringify(menuData));
        const parentArray = getNestedArray(newMenu, indices);
        const targetIndex = indices[indices.length - 1];

        if (parentArray && parentArray[targetIndex]) {
            parentArray[targetIndex] = { ...parentArray[targetIndex], ...updates };
            saveMenu(newMenu);

            // If currently selected, update form
            if (selectedPage?.pathIndices?.join(',') === indices.join(',')) {
                setEditForm(prev => ({ ...prev, ...updates }));
            }
        }
    };

    const handleSaveMenuNode = () => {
        handleUpdateMenuItem(editForm.pathIndices, {
            title: editForm.title,
            name: editForm.title, // Sync name/title
            isVisible: editForm.isVisible
        });
        const event = new CustomEvent('show-toast', { detail: { message: 'הגדרות תפריט נשמרו' } });
        window.dispatchEvent(event);
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
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => setIsEditingStructure(!isEditingStructure)}
                            className={`p-2 rounded-lg transition-colors ${isEditingStructure ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            title="ערוך מבנה תפריטי"
                        >
                            <Move size={18} />
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                            title="צור עמוד חדש"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
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
                        {/* Recursive Menu Tree with Context Data */}
                        {menuData && menuData.map((item, index) => (
                            <MenuItem
                                key={index}
                                item={item}
                                onSelect={handleSelect}
                                selectedPage={selectedPage}
                                allPages={pages}
                                onToggleVisibility={handleSidebarToggle}
                                onUpdateMenuItem={handleUpdateMenuItem}
                                isEditingStructure={isEditingStructure}
                                onMove={handleStructureMove}
                                onDelete={handleStructureDelete}
                                pathIndices={[index]}
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
                                        isEditingStructure={isEditingStructure}
                                        onAddToMenu={handleAddToMenu}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-gray-100/50 rounded-2xl border border-gray-200 overflow-hidden relative" key={selectedPage?.slug || selectedPage?.pathIndices?.join('-') || 'empty'}>
                {!selectedPage ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Layout size={40} className="opacity-20" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-500 mb-2">עורך ה-CMS החדש</h2>
                        <p className="max-w-md text-center text-sm">בחר עמוד מהרשימה או צור עמוד חדש כדי להתחיל.</p>
                    </div>
                ) : selectedPage.type === 'menu-node' ? (
                    // --- MENU NODE EDITOR ---
                    <div className="flex-1 flex flex-col bg-white">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">עריכת פריט תפריט</h2>
                            <p className="text-gray-500">עריכת כותרת והגדרות עבור תיקייה או קישור בתפריט</p>
                        </div>

                        <div className="p-8 max-w-2xl">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">כותרת בתפריט</label>
                                    <input
                                        type="text"
                                        value={editForm.title || ''}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">נראות בתפריט</label>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <button
                                            onClick={() => setEditForm({ ...editForm, isVisible: !editForm.isVisible })}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${editForm.isVisible ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${editForm.isVisible ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">
                                            {editForm.isVisible ? 'הפריט מוצג בתפריט' : 'הפריט מוסתר מהתפריט'}
                                        </span>
                                    </div>
                                </div>

                                {editForm.hasChildren && (
                                    <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                                        <FolderOpen size={16} />
                                        פריט זה מכיל תתי-תפריטים. הגדרות אלו משפיעות על מיכל התפריט עצמו.
                                    </div>
                                )}

                                <div className="pt-6 border-t border-gray-100 flex gap-3">
                                    <button
                                        onClick={handleSaveMenuNode}
                                        className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 flex items-center gap-2"
                                    >
                                        <Save size={18} /> שמור שינויים
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- PAGE EDITOR (Existing) ---
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

                                {/* Design Guide Tooltip */}
                                <div className="mr-auto relative group">
                                    <button className="flex items-center gap-1 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                        <HelpCircle size={14} /> איך לעצב דף?
                                    </button>
                                    <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-2xl border border-blue-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] text-right" dir="rtl">
                                        <h4 className="font-bold text-blue-800 mb-2 border-b border-blue-50 pb-1 text-sm">מדריך עיצוב מהיר</h4>
                                        <ul className="space-y-2 text-xs text-gray-600">
                                            <li className="flex gap-2">
                                                <span className="font-bold text-blue-500">◻️</span>
                                                <span><strong>כפתור:</strong> מוסיף כפתור פעולה מעוצב. ניתן לשנות את הטקסט והקישור בעורך.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="font-bold text-blue-500"></span>
                                                <span><strong>2 עמודות:</strong> יוצר מבנה של שני טורים. מומלץ להשוואות או פירוט שירותים.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="font-bold text-blue-500">🖼️</span>
                                                <span><strong>באנר כהה:</strong> קטע מודגש עם רקע כהה. מתאים לכותרות פרקים חשובים.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="font-bold text-blue-500">➖</span>
                                                <span><strong>קו מפריד:</strong> יוצר הפרדה ויזואלית נקייה בין חלקי הדף.</span>
                                            </li>
                                        </ul>
                                        <div className="mt-3 pt-2 border-t border-gray-50 text-[10px] text-gray-400 italic">
                                            טיפ: ניתן לערוך כל אלמנט ישירות בתיבת הטקסט לאחר ההוספה.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Split View Container */}
                        <div className="flex-1 flex overflow-hidden relative bg-gray-100">
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
