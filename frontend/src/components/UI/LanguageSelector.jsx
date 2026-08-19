import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'EN', full: 'English' },
  { code: 'hi', name: 'हि', full: 'हिन्दी' },
  { code: 'bn', name: 'বা', full: 'বাংলা' },
  { code: 'ta', name: 'த', full: 'தமிழ்' },
  { code: 'te', name: 'తె', full: 'తెలుగు' },
];

const LanguageSelector = ({ compact = false }) => {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={e => i18n.changeLanguage(e.target.value)}
        className="appearance-none bg-transparent text-xs font-semibold outline-none cursor-pointer pr-4 pl-0 py-1 rounded transition-colors hover:text-warm-900"
        style={{ color: '#57534E' }}
        title="Change language"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{compact ? l.name : l.full}</option>
        ))}
      </select>
      {/* Custom dropdown chevron */}
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
        width="10" height="10" viewBox="0 0 10 10" fill="none"
      >
        <path d="M2 3.5L5 6.5L8 3.5" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default LanguageSelector;
