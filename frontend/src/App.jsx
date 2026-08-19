import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Assistant from './pages/Assistant';
import SchemesPage from './pages/SchemesPage';
import SchemeDetails from './pages/SchemeDetails';
import ApplyPage from './pages/ApplyPage';
import MyApplications from './pages/MyApplications';
import ApplicationStatus from './pages/ApplicationStatus';
import About from './pages/About';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/schemes/:id" element={<SchemeDetails />} />
          <Route path="/apply/:schemeId" element={<ApplyPage />} />
          <Route path="/applications" element={<MyApplications />} />
          <Route path="/track/:applicationId" element={<ApplicationStatus />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#0F172A',
            color: '#FAFAF8',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '10px 18px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          },
          success: { iconTheme: { primary: '#0A6B3C', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

export default App;
