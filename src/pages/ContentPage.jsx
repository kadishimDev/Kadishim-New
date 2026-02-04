import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronLeft } from 'lucide-react';

const ContentPage = () => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch from API based on slug
        // Simulation:
        const mockPages = [
            { id: 1, title: 'אודות הארגון', slug: 'about', content: '<p>ארגון קדישים נוסד בשנת...</p>' },
            { id: 2, title: 'תקנון', slug: 'terms', content: '<p>תנאי השימוש באתר...</p>' },
            { id: 3, title: 'צור קשר', slug: 'contact', content: '<p>ניתן ליצור קשר בטלפון...</p>' }
        ];

        const page = mockPages.find(p => p.slug === slug);

        // Simulating network delay
        setTimeout(() => {
            setPageData(page || { title: '404', content: 'הדף לא נמצא' });
            setLoading(false);
        }, 500);

    }, [slug]);

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

                        <div
                            className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: pageData.content }}
                        ></div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default ContentPage;
