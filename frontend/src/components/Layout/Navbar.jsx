import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ChevronDown, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
  ];

  const currentLang = languages.find(l => (i18n.language || 'en').startsWith(l.code)) || languages[0];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setLangDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-orange-500 font-extrabold">J</span>
            <span className="text-white font-extrabold">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[#0F172A] leading-none tracking-tight">JanSetu</span>
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">AI Assistant</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 sm:gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-[13px] font-semibold transition-colors pb-1 ${
                isActive ? 'text-[#0F172A] border-b-2 border-[#0F172A]' : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            {t('nav.home', 'Home')}
          </NavLink>

          <NavLink
            to="/applications"
            className={({ isActive }) =>
              `text-[13px] font-semibold transition-colors pb-1 ${
                isActive ? 'text-[#0F172A] border-b-2 border-[#0F172A]' : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            {t('nav.applications', 'My Applications')}
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-[13px] font-semibold transition-colors pb-1 ${
                isActive ? 'text-[#0F172A] border-b-2 border-[#0F172A]' : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            {t('nav.about', 'About')}
          </NavLink>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 px-2.5 py-1.5 rounded-md transition-all hover:bg-slate-200/80 cursor-pointer"
              aria-expanded={langDropdownOpen}
            >
              <span>{currentLang.label.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      currentLang.code === lang.code
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLang.code === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#0A1A3A] flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-slate-800 transition-colors">
            <User className="w-4 h-4" />
          </div>
        </nav>
      </div>
    </header>
  );
}
