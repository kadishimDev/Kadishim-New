import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RequestKaddish from './pages/RequestKaddish';
import Generators from './pages/Generators';
import Admin from './pages/Admin';
import ContentPage from './pages/ContentPage';
import ErrorBoundary from './components/ErrorBoundary';

import ScrollToTop from './components/ScrollToTop';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isAdmin && <Navbar />}
      {/* Remove pt-24 on Home to allow Hero to sit behind transparent Navbar */}
      <main className={`flex-grow ${!isAdmin && !isHome ? 'pt-24' : ''}`}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<RequestKaddish />} />
          <Route path="/generators" element={<Generators />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/page/:slug" element={<ContentPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
