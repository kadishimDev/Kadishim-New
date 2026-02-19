import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Heart, Shield, BookOpen, Star, ArrowLeft, ChevronDown, CheckCircle } from 'lucide-react';
import MemorialServiceGenerator from '../components/TehillimGenerator';
import ContactForm from '../components/ContactForm';
import MemorialScroll from '../components/MemorialScrollNew'; // Cache Bypass
import ScrollReveal from '../components/ScrollReveal';

const Home = ({ pages }) => {
    const { t, language } = useLanguage();
    // Find Home Page Data
    const homePage = pages?.find(p => p.slug === 'home');

    // Helper to render content with shortcodes (Shared logic)
    const renderContent = (htmlContent) => {
        if (!htmlContent) return null;

        // Check for [form] shortcode
        if (htmlContent.includes('[form]')) {
            const parts = htmlContent.split('[form]');
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: parts[0] }} />
                    <ContactForm />
                    {parts[1] && <div dangerouslySetInnerHTML={{ __html: parts[1] }} />}
                </div>
            );
        }

        return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    };


    const services = [
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: t('services.kaddish_title'),
            desc: t('services.kaddish_desc')
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: t('services.memorial_title'),
            desc: t('services.memorial_desc')
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: t('services.tikun_title'),
            desc: t('services.tikun_desc')
        },
        {
            icon: <Star className="w-8 h-8" />,
            title: t('services.general_title'),
            desc: t('services.general_desc')
        }
    ];

    return (
        <div className="font-sans text-dark bg-white relative">


            {/* Hero Section - Soul Candle / Flame Theme */}
            <header className="relative min-h-screen flex flex-col justify-start pt-28 md:pt-40 overflow-hidden bg-[#0a0500]">

                {/* Parallax Background - User Video Loop */}
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-50"
                    >
                        <source src="/assets/background_candle.mp4" type="video/mp4" />
                    </video>
                    {/* Dark Overlay Mask */}
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center text-white flex flex-col items-center gap-5 md:gap-6 pb-20 md:pb-0">

                    {/* 1. Soul Candle GIF - Reduced size on mobile */}
                    <div className="mb-2 md:mb-4 animate-fade-in-up">
                        <img
                            src="/assets/ner.gif"
                            alt="נר נשמה"
                            className="w-24 h-24 md:w-32 md:h-32 object-contain"
                        />
                    </div>

                    {/* 2. Primary Button: Request Kaddish */}
                    <div className="animate-fade-in-up animation-delay-200 w-full flex justify-center">
                        <Link
                            to="/request"
                            className="inline-flex items-center justify-center px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-orange-700 to-red-800 text-white rounded-full font-bold text-lg md:text-xl hover:from-orange-600 hover:to-red-700 hover:scale-105 transition-all shadow-[0_0_25px_rgba(234,88,12,0.5)] border border-orange-500/30"
                        >
                            {t('hero.cta')}
                        </Link>
                    </div>

                    {/* 3. Title: Kadishim (Modern & Shimmering) */}
                    <div className="relative mt-2 group">
                        <h1 className="font-display text-5xl md:text-8xl font-black leading-tight drop-shadow-2xl tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-100 via-orange-400 to-orange-100 bg-[length:200%_auto] animate-shimmer relative z-10 block pb-2">
                                {t('hero.title')}
                            </span>
                        </h1>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full opacity-50 z-0 scale-150 animate-pulse-slow"></div>
                    </div>

                    {/* 4. Description Text (Glass Card + Highlights) - RESTORED FULL TEXT */}
                    <div className="relative max-w-3xl mx-auto mt-6 mb-8 md:mb-12 px-4 animate-fade-in-up animation-delay-600">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
                            {/* Decorative Glow */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>

                            <div className="space-y-4 md:space-y-6 text-center relative z-10 text-justify-center">
                                <p className="text-base md:text-xl text-gray-100 font-light leading-relaxed">
                                    {t('hero.desc_p1_start')} <strong className="font-bold text-orange-200">{t('hero.desc_p1_highlight1')}</strong> {t('hero.desc_p1_middle')} <span className="font-medium text-orange-100 border-b border-orange-500/30 pb-0.5">{t('hero.desc_p1_highlight2')}</span>{t('hero.desc_p1_end')}
                                </p>
                                <p className="text-base md:text-lg text-gray-200 font-light leading-relaxed">
                                    {t('hero.desc_p2_start')} <span className="text-white font-medium">{t('hero.desc_p2_highlight')}</span> {t('hero.desc_p2_end')}
                                </p>
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                                        {t('hero.desc_banner_start')} <Link to="/generators" className="text-orange-300 hover:text-white font-bold transition-colors underline decoration-dotted decoration-orange-500/50">{t('hero.desc_banner_link')}</Link> {t('hero.desc_banner_end')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Scroll Down Arrow (Prominent & Animated) */}
                    <div className="mt-4 md:mt-8 animate-fade-in-up animation-delay-800 flex justify-center pb-8">
                        <a
                            href="#tehillim-generator"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('tehillim-generator')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="group flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                            aria-label="גלול ליצירת תפילה"
                        >
                            <span className="text-orange-200/80 text-sm font-medium tracking-wide group-hover:text-white transition-colors">
                                {t('hero.scroll_button')}
                            </span>
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-[0_0_20px_rgba(251,146,60,0.2)] group-hover:bg-orange-500 group-hover:border-orange-400 group-hover:shadow-[0_0_30px_rgba(251,146,60,0.6)] transition-all duration-300 animate-bounce">
                                <ChevronDown className="w-8 h-8 text-orange-100 group-hover:text-white" />
                            </div>
                        </a>
                    </div>
                </div>
            </header>

            <style jsx>{`
                .fire-text {
                    text-shadow: 0 0 20px rgba(255, 100, 0, 0.5);
                }
            `}</style>

            {/* Memorial Scroll Widget - MOVED DOWN to avoid overlap */}
            <div className="relative z-30 mt-4 md:mt-2 mb-8 container mx-auto px-0 md:px-6">
                <MemorialScroll />
            </div>

            {/* Services Grid - White Background */}
            <section className="py-24 bg-gradient-to-b from-white to-orange-50/30 relative z-20 container mx-auto px-6">
                <ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-8 rounded-3xl shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group cursor-default relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-200 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm rotate-3 group-hover:rotate-6">
                                    {service.icon}
                                </div>
                                <h3 className="font-display text-2xl font-bold mb-3 text-dark group-hover:text-primary transition-colors">{service.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-base font-light">
                                    {service.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* About Section - Extended Content (ID=about) */}
            <section id="about" className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-6xl">
                    <ScrollReveal>
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl border border-gray-100 overflow-hidden relative">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 opacity-50"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">

                                {/* Text Column (Right in RTL) */}
                                <div className="order-2 md:order-1">
                                    <div className="mb-8">
                                        <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm mb-4 block">{t('about.label')}</span>
                                        <h2 className="font-display text-4xl md:text-5xl font-black text-dark leading-tight">
                                            {t('about.title_prefix')} <span className="text-transparent bg-clip-text bg-gradient-to-tl from-orange-600 to-orange-400">{t('about.title_org')}</span>
                                        </h2>
                                        <p className="text-xl text-gray-400 mt-4 font-serif italic">{t('about.subtitle')}</p>
                                    </div>

                                    <div className="prose prose-lg max-w-none text-gray-600 leading-8 text-justify font-light">
                                        <p className="mb-6">
                                            {t('about.p1_start')} <strong>{t('about.p1_org')}</strong> {t('about.p1_mid')} <strong>{t('about.p1_rabbi')}</strong>{t('about.p1_end')}
                                        </p>

                                        <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border border-orange-100 my-8 shadow-sm">
                                            <h4 className="flex items-center gap-3 text-xl font-bold text-dark mb-3">
                                                <div className="p-2 bg-orange-100 rounded-lg text-primary">
                                                    <Shield className="w-6 h-6" />
                                                </div>
                                                {t('about.feature_title')}
                                            </h4>
                                            <p className="text-base text-gray-600">
                                                {t('about.feature_desc')}
                                            </p>
                                        </div>

                                        <p className="mb-6">
                                            {t('about.p2')}
                                        </p>
                                    </div>

                                    <div className="mt-10">
                                        <Link to="/generators" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 ease-out bg-dark rounded-full hover:bg-gray-800 hover:shadow-lg hover:px-10 group">
                                            {t('about.btn')}
                                            <ArrowLeft className={`mr-2 w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform ${language !== 'he' ? 'rotate-180' : ''}`} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Image Column (Left in RTL) */}
                                <div className="order-1 md:order-2 flex justify-center md:justify-end">
                                    <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700 border-8 border-white group">
                                        <img
                                            src="./assets/rabbi_moshe.jpg"
                                            alt="הרב משה בן-טוב זצוקל"
                                            className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-8 right-8 text-white text-right transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="font-display font-bold text-2xl mb-1">{t('about.image_caption')}</p>
                                            <p className="text-sm opacity-80 font-serif italic">{t('about.image_sub')}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* NEW: Memorial Service Generator Section */}
            <section id="tehillim-generator" className="py-12 bg-gray-50">
                <div className="container mx-auto px-4 text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('generator_intro.title')}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg text-justify-center">
                        {t('generator_intro.desc')}
                    </p>
                </div>
                <div className="container mx-auto px-4">
                    <MemorialServiceGenerator />
                </div>
            </section>

            {/* CTA Section - Light background to verify separation from Footer */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('home_cta.title')}</h2>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        {t('home_cta.desc')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/page/contact" className="px-10 py-4 bg-primary text-dark rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all">
                            {t('home_cta.donate_btn')}
                        </Link>
                        <Link to="/request" className="px-10 py-4 bg-gray-100 text-dark border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-200 transition-all">
                            {t('home_cta.request_btn')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
