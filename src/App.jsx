import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RequestKaddish from './pages/RequestKaddish';
import Generators from './pages/Generators';
import Admin from './pages/Admin';
import ContentPage from './pages/ContentPage';
import ErrorBoundary from './components/ErrorBoundary';

import ScrollToTop from './components/ScrollToTop';

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/request" element={<RequestKaddish />} />
            <Route path="/generators" element={<Generators />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/page/:slug" element={<ContentPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
