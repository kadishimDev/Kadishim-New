import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RequestKaddish from './pages/RequestKaddish';
import Admin from './pages/Admin';
import ContentPage from './pages/ContentPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/request" element={<RequestKaddish />} />
            <Route path="/admin" element={<Admin />} />

            {/* Dynamic Content Routes - Up to 3 levels deep */}
            <Route path="/:category/:slug" element={<ContentPage />} />
            <Route path="/:category/:subcategory/:slug" element={<ContentPage />} />

            {/* Fallback for simple legacy paths */}
            <Route path="/about" element={<ContentPage />} />
            <Route path="/contact" element={<ContentPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
