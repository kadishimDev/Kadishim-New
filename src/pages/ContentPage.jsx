import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronLeft } from 'lucide-react';
import pagesData from '../data/pages_db.json';
import ContactForm from '../components/ContactForm';

const ContentPage = () => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load page from local JSON DB
        // Decode slug to handle Hebrew characters in URL
        const decodedSlug = decodeURIComponent(slug);
        const page = pagesData.find(p => p.slug === decodedSlug);

        // Simulate network delay for smooth transition
        setTimeout(() => {
            if (page) {
                setPageData(page);
            } else {
                setPageData({ title: '404', content: '<p class="text-center text-xl">הדף שאליו ניסית להגיע אינו קיים במערכת.</p>' });
            }
            setLoading(false);
        }, 300);

    }, [slug]);

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 pt-24 max-w-4xl">
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
            </main>

            <Footer />
        </div>
    );
};

export default ContentPage;
