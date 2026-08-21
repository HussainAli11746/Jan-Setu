import React from 'react';
import { Sparkles, PlusCircle, Compass, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SchemeCard from './SchemeCard';

export default function SchemeSlider({ schemes = [], onAskMore, queryText = '' }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language || 'en';

  const labels = {
    hi: {
      countLabel: (n) => `${n} योजनाएं उपलब्ध`,
      cardTitle: 'और योजनाएं देखना चाहते हैं?',
      cardSubtitle: 'जन-सेतु AI आपकी प्रोफ़ाइल के लिए अतिरिक्त योजनाएं खोज सकता है।',
      showMoreBtn: 'और योजनाएं खोजें',
      browseAllDir: 'सभी योजनाएं देखें',
    },
    bn: {
      countLabel: (n) => `${n}টি প্রকল্প পাওয়া গেছে`,
      cardTitle: 'আরও প্রকল্প দেখতে চান?',
      cardSubtitle: 'জন-সেতু AI আপনার জন্য অতিরিক্ত কল্যাণমূলক প্রকল্প খুঁজতে পারে।',
      showMoreBtn: 'আরও খুঁজুন',
      browseAllDir: 'সমস্ত প্রকল্প',
    },
    ta: {
      countLabel: (n) => `${n} திட்டங்கள் உள்ளன`,
      cardTitle: 'கூடுதல் திட்டங்கள் தேவையா?',
      cardSubtitle: 'ஜன-சேது AI உங்களுக்காக மேலும் பல நலத்திட்டங்களை கண்டறியும்.',
      showMoreBtn: 'மேலும் திட்டங்கள்',
      browseAllDir: 'அனைத்து திட்டங்கள்',
    },
    te: {
      countLabel: (n) => `${n} పథకాలు అందుబాటులో ఉన్నాయి`,
      cardTitle: 'మరిన్ని పథకాలు కావాలా?',
      cardSubtitle: 'జన-సేతు AI మీ కోసం అదనపు సంక్షేమ పథకాలను కనుగొనగలదు.',
      showMoreBtn: 'మరిన్ని కనుగొనండి',
      browseAllDir: 'అన్ని పథకాలు',
    },
    en: {
      countLabel: (n) => `${n} Schemes Available`,
      cardTitle: 'Looking for more options?',
      cardSubtitle: 'JanSetu AI can discover additional schemes matching your profile.',
      showMoreBtn: 'Show More Schemes',
      browseAllDir: 'Browse Directory',
    },
  };

  const t = labels[currentLang] || labels['en'];

  if (!schemes || schemes.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3 my-1.5">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
          {t.countLabel(schemes.length)}
        </span>
      </div>

      {/* Pure Grid Layout (2 columns on sm/desktop, 1 column on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {schemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}

        {/* Clean, Premium "Show More Schemes" Action Bar at Bottom */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3.5 hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/70 text-orange-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight">
                {t.cardTitle}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                {t.cardSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onAskMore) onAskMore();
                else navigate('/schemes');
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#0A1633] hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>{t.showMoreBtn}</span>
              <PlusCircle className="w-3.5 h-3.5 text-orange-400" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/schemes')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{t.browseAllDir}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
