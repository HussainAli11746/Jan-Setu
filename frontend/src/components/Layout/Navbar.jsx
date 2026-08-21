import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown, User, LogOut, MessageSquare, FileText,
  Sparkles, CheckCircle2, Shield, Settings, Compass, Globe, Bookmark
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SignOutModal from '../Common/SignOutModal';
import LanguageChangeModal from '../Common/LanguageChangeModal';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout, updateLanguage, savedSchemes = [] } = useAuth();
  const navigate = useNavigate();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(null);

  const langRef = useRef(null);
  const profileRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  const currentLangCode = i18n.language || 'en';
  const currentLang = languages.find(l => currentLangCode.startsWith(l.code)) || languages[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectLanguage = (lang) => {
    setLangDropdownOpen(false);
    if (lang.code === currentLangCode) return;
    setPendingLanguage(lang);
  };

  const handleConfirmLanguageChange = async () => {
    if (!pendingLanguage) return;
    const targetCode = pendingLanguage.code;
    setPendingLanguage(null);
    if (updateLanguage) {
      await updateLanguage(targetCode);
    } else {
      i18n.changeLanguage(targetCode);
      localStorage.setItem('i18nextLng', targetCode);
    }
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    setProfileDropdownOpen(false);
    logout();
    navigate('/');
  };

  // Localized navigation labels
  const navLabels = {
    hi: {
      home: 'होम',
      applications: 'मेरे आवेदन',
      about: 'परिचय',
      assistant: 'सहायक',
      myProfile: 'मेरा प्रोफाइल',
      savedSchemes: 'सहेजी गई योजनाएँ',
      browseSchemes: 'योजनाएँ देखें',
      verifiedCitizen: 'सत्यापित नागरिक',
      signIn: 'साइन इन',
      register: 'रजिस्टर',
      signOut: 'लॉग आउट',
    },
    bn: {
      home: 'হোম',
      applications: 'আমার আবেদন',
      about: 'সম্পর্কে',
      assistant: 'সহকারী',
      myProfile: 'আমার প্রোফাইল',
      savedSchemes: 'সংরক্ষিত প্রকল্প',
      browseSchemes: 'প্রকল্প ব্রাউজ করুন',
      verifiedCitizen: 'যাচাইকৃত নাগরিক',
      signIn: 'সাইন ইন',
      register: 'নিবন্ধন',
      signOut: 'সাইন আউট',
    },
    ta: {
      home: 'முகப்பு',
      applications: 'விண்ணப்பங்கள்',
      about: 'பற்றி',
      assistant: 'உதவியாளர்',
      myProfile: 'சுயவிவரம்',
      savedSchemes: 'சேமிக்கப்பட்ட திட்டங்கள்',
      browseSchemes: 'திட்டங்கள்',
      verifiedCitizen: 'சரிபார்க்கப்பட்ட குடிமகன்',
      signIn: 'உள்நுழைக',
      register: 'பதிவு செய்க',
      signOut: 'வெளியேறு',
    },
    te: {
      home: 'హోమ్',
      applications: 'నా దరఖాస్తులు',
      about: 'గురించి',
      assistant: 'అసిస్టెంట్',
      myProfile: 'నా ప్రొఫైల్',
      savedSchemes: 'సేవ్ చేసిన పథకాలు',
      browseSchemes: 'పథకాలు బ్రౌజ్ చేయండి',
      verifiedCitizen: 'ధృవీకరించబడిన పౌరుడు',
      signIn: 'సైన్ ఇన్',
      register: 'నమోదు చేయండి',
      signOut: 'లాగ్ అవుట్',
    },
    en: {
      home: 'Home',
      applications: 'My Applications',
      about: 'About',
      assistant: 'Assistant',
      myProfile: 'My Profile',
      savedSchemes: 'Saved Schemes',
      browseSchemes: 'Browse Schemes',
      verifiedCitizen: 'Verified Citizen',
      signIn: 'Sign In',
      register: 'Register',
      signOut: 'Sign Out',
    },
  };

  const nav = navLabels[currentLangCode] || navLabels['en'];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 transition-all">
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
          <nav className="flex items-center gap-3 sm:gap-7">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-[13px] font-semibold transition-colors pb-1 ${
                  isActive ? 'text-[#0F172A] border-b-2 border-[#0F172A]' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {nav.home}
            </NavLink>

            <NavLink
              to="/applications"
              className={({ isActive }) =>
                `text-[13px] font-semibold transition-colors pb-1 ${
                  isActive ? 'text-[#0F172A] border-b-2 border-[#0F172A]' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {nav.applications}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-[13px] font-semibold transition-colors pb-1 ${
                  isActive ? 'text-[#0F172A] border-b-2 border-[#0F172A]' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {nav.about}
            </NavLink>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 px-2.5 py-1.5 rounded-md transition-all hover:bg-slate-200/80 cursor-pointer"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>{currentLang.native}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Select Language
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        currentLang.code === lang.code
                          ? 'bg-orange-50 text-orange-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{lang.native}</span>
                        <span className="text-[10px] text-slate-400">{lang.label}</span>
                      </div>
                      {currentLang.code === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Saved Schemes (Shifted to right of navbar) */}
                <Link
                  to="/profile?tab=saved"
                  title={nav.savedSchemes || 'Saved Schemes'}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline">{nav.savedSchemes || 'Saved Schemes'}</span>
                  {savedSchemes.length > 0 && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 leading-none">
                      {savedSchemes.length}
                    </span>
                  )}
                </Link>

                {/* Assistant CTA */}
                <Link
                  to="/assistant"
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] px-3 py-1.5 rounded-lg hover:from-[#EA580C] hover:to-[#C2410C] transition-all shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{nav.assistant}</span>
                </Link>

                {/* Profile Avatar with Pop-up Menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-9 h-9 rounded-full bg-[#0A1633] hover:bg-slate-900 flex items-center justify-center text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer ring-2 ring-transparent hover:ring-orange-400"
                    title={user?.name || nav.myProfile}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </button>

                  {/* Profile Popup Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      {/* Identity Card in Menu */}
                      <div className="px-3 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0E1B48] to-[#0A1128] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {user?.name || 'Citizen'}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{nav.verifiedCitizen}</span>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-1.5 flex flex-col gap-0.5">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{nav.myProfile}</span>
                        </Link>

                        <Link
                          to="/profile?tab=saved"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          <span>{nav.savedSchemes || 'Saved Schemes'}</span>
                        </Link>

                        <Link
                          to="/applications"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>{nav.applications}</span>
                        </Link>

                        <Link
                          to="/assistant"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          <span>{nav.assistant}</span>
                        </Link>

                        <Link
                          to="/schemes"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <Compass className="w-4 h-4 text-slate-400" />
                          <span>{nav.browseSchemes}</span>
                        </Link>
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setShowSignOutModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>{nav.signOut}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-[13px] font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {nav.signIn}
                </Link>
                <Link
                  to="/register"
                  className="text-[12px] font-bold text-white bg-[#0F172A] hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {nav.register}
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Confirmation Modal for Language Change */}
      <LanguageChangeModal
        isOpen={!!pendingLanguage}
        targetLanguage={pendingLanguage}
        onClose={() => setPendingLanguage(null)}
        onConfirm={handleConfirmLanguageChange}
      />

      {/* Confirmation Modal for Sign Out */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
}
