import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterWall from './pages/RegisterWall';
import Onboarding from './pages/Onboarding';
import Assistant from './pages/Assistant';
import SchemesPage from './pages/SchemesPage';
import SchemeDetails from './pages/SchemeDetails';
import ApplyPage from './pages/ApplyPage';
import MyApplications from './pages/MyApplications';
import ApplicationStatus from './pages/ApplicationStatus';
import Profile from './pages/Profile';
import About from './pages/About';

// Hide navbar/footer on standalone flow pages
const AUTH_PAGES = ['/onboarding', '/register-wall'];

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/register-wall" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function OnboardingRoute({ children }) {
  const { isAuthenticated, isOnboarded, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/register-wall" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  return children;
}

function AppShell() {
  const location = useLocation();
  const isAuthPage = AUTH_PAGES.some(p => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-wall" element={<RegisterWall />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/schemes/:id" element={<SchemeDetails />} />
          <Route path="/about" element={<About />} />

          {/* Protected routes */}
          <Route path="/onboarding" element={
            <ProtectedRoute><Onboarding /></ProtectedRoute>
          } />
          <Route path="/assistant" element={
            <OnboardingRoute><Assistant /></OnboardingRoute>
          } />
          <Route path="/profile" element={
            <OnboardingRoute><Profile /></OnboardingRoute>
          } />
          <Route path="/applications" element={
            <OnboardingRoute><MyApplications /></OnboardingRoute>
          } />
          <Route path="/apply/:schemeId" element={
            <ProtectedRoute><ApplyPage /></ProtectedRoute>
          } />
          <Route path="/track/:id" element={
            <ProtectedRoute><ApplicationStatus /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
