import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import ContactActions from './components/ContactActions';
import { Analytics } from './services/analytics';

// Initial Data
import initialPagesData from './data/pages_db.json';

const Layout = ({ children, pages }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  React.useEffect(() => {
    Analytics.trackPage(location.pathname);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {!isAdmin && <Navbar pages={pages} />}
      {/* Increased padding to prevent Navbar overlap (header is tall) */}
      <main className={`flex-grow`} style={{ paddingTop: !isAdmin && !isHome ? '160px' : '0' }}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <ContactActions />}
    </div>
  );
};

const App = () => {
  const [pages, setPages] = useState(initialPagesData);

  return (
    <Router>
      <ScrollToTop />
      <Layout pages={pages}>
        <Routes>
          <Route path="/" element={<Home pages={pages} />} />
          <Route path="/request" element={<RequestKaddish />} />
          <Route path="/kaddish-library" element={<KaddishLibrary />} />
          <Route path="/generators" element={<Generators />} />
          <Route path="/admin" element={<Admin pages={pages} setPages={setPages} />} />
          <Route path="/page/:slug" element={<ContentPage pages={pages} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
