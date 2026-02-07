import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ContactForm from '../components/ContactForm';

const ContentPage = ({ pages = [] }) => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Handle Live Preview Mode
        if (slug === 'preview') {
            setLoading(false);
            setPageData({
                title: 'תצוגה מקדימה',
                content: '<div class="text-center p-10 text-gray-400">המתן לטעינת תוכן מהעורך...</div>'
            });

            const handleMessage = (event) => {
                if (event.data?.type === 'PREVIEW_UPDATE') {
                    setPageData(event.data.payload);
                }
            };

            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }

        // Standard Page Load using props
        // If pages is empty, we might be waiting for initial load, but for now we assume it's passed.
        // If pages is empty array (initial state), we might not find the page yet.

        const decodedSlug = decodeURIComponent(slug);

        // We use the passed pages prop instead of importing json directly
        const page = pages.find(p => p.slug === decodedSlug);

        // Simulate network delay for smooth transition (optional, maybe reduce it)
        setTimeout(() => {
            if (page) {
                // Check visibility for non-admin users (simulated by not having admin prop? actually assume public view)
                // However, we might want to allow viewing hidden pages via direct link? 
                // Creating a new page sets isVisible=true by default.
                // For now, render it even if hidden, so user can test it. Link won't be in menu.
                setPageData(page);
            } else {
                setPageData({ title: '404', content: '<p class="text-center text-xl">הדף שאליו ניסית להגיע אינו קיים במערכת.</p>' });
            }
            setLoading(false);
        }, 100);

    }, [slug, pages]);

    // Helper to parse content and inject components
    const renderContent = (htmlContent) => {
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

                    <ContactForm />

                    {parts[1] && (
                        <div
                            className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans mt-8"
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
        <div className="container mx-auto px-4 py-12 pt-0 max-w-4xl">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 animate-fade-in-up">
                    <div className="mb-8 border-b border-gray-100 pb-6 flex justify-between items-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 border-r-4 border-primary pr-4">
                            {pageData.title}
                        </h1>

                        <Link to="/" className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1 font-bold text-sm bg-gray-50 px-3 py-2 rounded-lg">
                            חזרה לדף הבית <ChevronLeft size={16} />
                        </Link>
                    </div>

                    {renderContent(pageData.content)}
                </div>
            )}
        </div>
    );
};

export default ContentPage;
