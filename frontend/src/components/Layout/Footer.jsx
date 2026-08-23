import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Copyright & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#0F172A] flex items-center justify-center text-white font-bold text-[10px]">
            <span className="text-orange-500">J</span>
            <span className="text-white">S</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {t('nav.copyright', '© 2026 JanSetu AI. Empowering citizen access to governance.')}
          </p>
        </div>

        {/* Center: Legal Links */}
        <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
          <Link to="/about" className="hover:text-slate-800 transition-colors">
            {t('nav.privacy', 'Privacy Policy')}
          </Link>
          <Link to="/about" className="hover:text-slate-800 transition-colors">
            {t('nav.terms', 'Terms of Service')}
          </Link>
        </div>

        {/* Right: Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/90 rounded-full text-xs font-semibold text-slate-600 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('nav.secure_platform', 'Secure Civic Platform')}</span>
        </div>

      </div>
    </footer>
  );
}
