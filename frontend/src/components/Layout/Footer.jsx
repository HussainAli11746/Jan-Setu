import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-white dark:bg-[#0B0F19] border-t border-slate-200/80 dark:border-slate-800 py-6 mt-auto transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Copyright & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#0F172A] dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center text-white font-bold text-[10px]">
            <span className="text-orange-500 font-extrabold">J</span>
            <span className="text-white font-extrabold">S</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('nav.copyright', '© 2026 JanSetu AI. Empowering citizen access to governance.')}
          </p>
        </div>

        {/* Center: Legal Links */}
        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Link to="/about" className="hover:text-slate-800 dark:hover:text-white transition-colors">
            {t('nav.privacy', 'Privacy Policy')}
          </Link>
          <Link to="/about" className="hover:text-slate-800 dark:hover:text-white transition-colors">
            {t('nav.terms', 'Terms of Service')}
          </Link>
        </div>

        {/* Right: Security Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('nav.secure_platform', 'Secure Civic Platform')}</span>
        </div>

      </div>
    </footer>
  );
}
