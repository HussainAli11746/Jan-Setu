import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LanguageSelector from '../UI/LanguageSelector';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/track/demo-123', label: t('nav.track') },
    { path: '/about', label: t('nav.about') },
  ];

  return (
    <header className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid #E5E2DC' }}>
      {/* Tricolor accent bar */}
      <div className="tricolor-bar" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8601C 0%, #D04F0F 100%)' }}
            >
              JS
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-bold tracking-tight text-warm-900">JanSetu</span>
              <span className="block text-[10px] font-medium uppercase tracking-widest" style={{ color: '#A8A29E' }}>AI Assistant</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors pb-0.5 ${
                  location.pathname === link.path
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-warm-500 hover:text-warm-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ width: 1, height: 20, background: '#E5E2DC' }} />
            <LanguageSelector />
          </nav>

          {/* Mobile: language + menu */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSelector compact />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded text-warm-500 hover:text-warm-800 hover:bg-warm-100 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t" style={{ borderColor: '#E5E2DC', background: '#FAFAF8' }}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
