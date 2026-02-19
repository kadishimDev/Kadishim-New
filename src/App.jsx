import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RequestKaddish from './pages/RequestKaddish';
import KaddishLibrary from './components/KaddishLibrary'; // New Component
import Generators from './pages/Generators';
import Admin from './pages/Admin';
import ContentPage from './pages/ContentPage';
import ErrorBoundary from './components/ErrorBoundary';

import ScrollToTop from './components/ScrollToTop';
import GoogleTranslate from './components/GoogleTranslate';
// import DebugGoogleTranslate from './components/DebugGoogleTranslate';
import ContactActions from './components/ContactActions';
import { Analytics } from './services/analytics';
import AccessibilityWidget from './components/AccessibilityWidget';
import { PrivacyPolicy, TermsOfService, AccessibilityStatement } from './pages/LegalPages';

// Initial Data
import initialPagesData from './data/pages_db.json';

import { useSettings, SettingsProvider } from './context/SettingsContext';
import { DataProvider, useData } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';

const Layout = ({ children, pages }) => {
  const location = useLocation();
  const { settings } = useSettings();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  // Analytics Injection
  React.useEffect(() => {
    Analytics.trackPage(location.pathname);

    // Inject Custom Head Scripts
    if (settings?.analytics?.customHeadScripts) {
      // Implementation note: In a real app this might need a safer injection method or a dedicated component
      // keeping it simple for now, but usually we'd append to document.head
    }
  }, [location, settings]);

  // Maintenance Mode Check
  if (settings?.features?.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border-t-4 border-blue-600">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">האתר בשיפוצים</h1>
          <p className="text-gray-600 text-lg mb-6">
            אנו מבצעים כרגע עבודות תחזוקה באתר לשיפור השירות.
            <br />
            נחזור לפעילות בהקדם!
          </p>
          <p className="text-sm text-gray-400">צוות קדישים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Accessibility: Skip to Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[10000] bg-white text-primary px-6 py-4 shadow-2xl rounded-xl font-bold border-2 border-primary transition-all"
      >
        דילוג לתוכן המרכזי
      </a>

      {/* Holiday/Emergency Banner */}
      {settings?.features?.showHolidayBanner && !isAdmin && (
        <div className="bg-orange-600 text-white text-center py-2 px-4 shadow-md z-50 relative animate-fadeIn">
          <p className="font-medium text-sm md:text-base">
            {settings.features.holidayBannerText}
          </p>
        </div>
      )}

      {!isAdmin && <Navbar pages={pages} />}
      {!isAdmin && <AccessibilityWidget />}
      {/* Increased padding to prevent Navbar overlap (header is tall) */}
      <main id="main-content" className={`flex-grow`} style={{ paddingTop: !isAdmin && !isHome ? '165px' : '0' }}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <ContactActions />}
    </div>
  );
};



const AppInner = () => {
  const { pages } = useData();
  const location = useLocation();

  return (
    <Layout pages={pages}>
      <Routes>
        <Route path="/" element={<Home pages={pages} />} />
        <Route path="/request" element={<RequestKaddish />} />
        <Route path="/kaddish-library" element={<KaddishLibrary />} />
        <Route path="/generators" element={<Generators />} />
        {/* Admin now uses DataContext internally, no need to pass props */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/page/:slug" element={<ContentPage pages={pages} />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/accessibility" element={<AccessibilityStatement />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <GoogleTranslate />
        <DataProvider>
          <Router>
            <ScrollToTop />
            <AppInner />
          </Router>
        </DataProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;
