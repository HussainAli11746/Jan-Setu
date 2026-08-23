import React, { useState } from 'react';
import { ExternalLink, BookOpen, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import DeepDiveModal from './DeepDiveModal';
import toast from 'react-hot-toast';
import { notifyExtension } from '../../services/copilotHandshake';

const CATEGORY_COLORS = {
  agriculture: { bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', border: 'border-emerald-200/80 dark:border-emerald-800/50', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-300/50 dark:border-emerald-700/50', dot: 'bg-emerald-500' },
  education:   { bg: 'bg-blue-50/70 dark:bg-blue-950/30',    border: 'border-blue-200/80 dark:border-blue-800/50',    text: 'text-blue-700 dark:text-blue-400',    badge: 'bg-blue-100/70 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300/50 dark:border-blue-700/50',       dot: 'bg-blue-500' },
  housing:     { bg: 'bg-amber-50/70 dark:bg-amber-950/30',   border: 'border-amber-200/80 dark:border-amber-800/50',   text: 'text-amber-700 dark:text-amber-400',   badge: 'bg-amber-100/70 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300/50 dark:border-amber-700/50',    dot: 'bg-amber-500' },
  health:      { bg: 'bg-red-50/70 dark:bg-red-950/30',     border: 'border-red-200/80 dark:border-red-800/50',     text: 'text-red-700 dark:text-red-400',     badge: 'bg-red-100/70 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300/50 dark:border-red-700/50',          dot: 'bg-red-500' },
  employment:  { bg: 'bg-purple-50/70 dark:bg-purple-950/30',  border: 'border-purple-200/80 dark:border-purple-800/50',  text: 'text-purple-700 dark:text-purple-400',  badge: 'bg-purple-100/70 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-300/50 dark:border-purple-700/50', dot: 'bg-purple-500' },
  business:    { bg: 'bg-cyan-50/70 dark:bg-cyan-950/30',    border: 'border-cyan-200/80 dark:border-cyan-800/50',    text: 'text-cyan-700 dark:text-cyan-400',    badge: 'bg-cyan-100/70 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border-cyan-300/50 dark:border-cyan-700/50',       dot: 'bg-cyan-500' },
  social:      { bg: 'bg-pink-50/70 dark:bg-pink-950/30',    border: 'border-pink-200/80 dark:border-pink-800/50',    text: 'text-pink-700 dark:text-pink-400',    badge: 'bg-pink-100/70 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border-pink-300/50 dark:border-pink-700/50',       dot: 'bg-pink-500' },
  skill:       { bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',  border: 'border-indigo-200/80 dark:border-indigo-800/50',  text: 'text-indigo-700 dark:text-indigo-400',  badge: 'bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-300/50 dark:border-indigo-700/50', dot: 'bg-indigo-500' },
};

export default function SchemeCard({ scheme }) {
  const [showModal, setShowModal] = useState(false);
  const { t, i18n } = useTranslation();
  const { isSchemeSaved, saveScheme, removeSavedScheme, token } = useAuth();
  const lang = (i18n.language || 'en').slice(0, 2);
  const colors = CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS.social;

  const isSaved = isSchemeSaved(scheme.id);

  const fallbackDeepDive = {
    hi: 'विस्तार से जानें',
    bn: 'বিস্তারিত দেখুন',
    ta: 'விவரங்கள்',
    te: 'పూర్తి వివరాలు',
    en: 'Deep Dive',
  };

  const fallbackApply = {
    hi: 'आवेदन करें',
    bn: 'আবেদন করুন',
    ta: 'விண்ணப்பிக்க',
    te: 'దరఖాస్తు చేసుకోండి',
    en: 'Apply Now',
  };

  const fallbackSave = {
    hi: 'योजना सहेजें',
    bn: 'সংরক্ষণ করুন',
    ta: 'சேமிக்கவும்',
    te: 'సేవ్ చేయండి',
    en: 'Save Scheme',
  };

  const fallbackSaved = {
    hi: 'सहेजा गया',
    bn: 'সংরক্ষিত',
    ta: 'சேமிக்கப்பட்டது',
    te: 'సేవ్ చేయబడింది',
    en: 'Saved',
  };

  const btnDeepDive = t('schemes.deep_dive', fallbackDeepDive[lang] || fallbackDeepDive['en']);
  const btnApply = t('schemes.apply_now', fallbackApply[lang] || fallbackApply['en']);
  const btnSave = t('schemes.save_scheme', fallbackSave[lang] || fallbackSave['en']);
  const btnSaved = t('schemes.saved', fallbackSaved[lang] || fallbackSaved['en']);

  const handleToggleSave = (e) => {
    e.stopPropagation();
    if (isSaved) {
      removeSavedScheme(scheme.id);
      const unsavedMsg = lang === 'hi' ? 'योजना सहेजी गई सूची से हटा दी गई' : lang === 'bn' ? 'প্রকল্প বুকমার্ক থেকে সরানো হয়েছে' : lang === 'ta' ? 'திட்டம் நீக்கப்பட்டது' : lang === 'te' ? 'పథకం తొలగించబడింది' : 'Scheme removed from bookmarks';
      toast(unsavedMsg);
    } else {
      saveScheme(scheme);
      const savedMsg = lang === 'hi' ? 'योजना सफलतापूर्वक सहेज ली गई!' : lang === 'bn' ? 'প্রকল্প সংরক্ষিত হয়েছে!' : lang === 'ta' ? 'திட்டம் சேமிக்கப்பட்டது!' : lang === 'te' ? 'పథకం సేవ్ చేయబడింది!' : 'Scheme saved to your bookmarks!';
      toast.success(savedMsg);
    }
  };

  return (
    <>
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 sm:p-4.5 flex flex-col justify-between gap-3 hover:shadow-md transition-all group overflow-hidden w-full`}>
        
        {/* Top Header Row */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full ${colors.dot} mt-1.5 shrink-0`} />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                  {scheme.name}
                </h4>
                {scheme.ministry && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{scheme.ministry}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Category Pill */}
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${colors.badge}`}>
                {scheme.category}
              </span>

              {/* Bookmark Icon Button */}
              <button
                type="button"
                onClick={handleToggleSave}
                title={isSaved ? btnSaved : btnSave}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mt-0.5">
            {scheme.description}
          </p>

          {/* Benefit Box */}
          {scheme.benefit && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              <Tag className={`w-3.5 h-3.5 ${colors.text} shrink-0 mt-0.5`} />
              <span className={`text-[11px] font-bold ${colors.text} leading-relaxed`}>
                {scheme.benefit}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 w-full">
          {/* Deep Dive Action */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="truncate">{btnDeepDive}</span>
          </button>

          {/* Apply Now Action */}
          <a
            href={
              scheme.id === 'pm-poshan' || scheme.id === 'pmposhan'
                ? 'https://pmposhan.education.gov.in/index.html'
                : (scheme.applyUrl || scheme.apply_url || `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.name)}`)
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              notifyExtension(scheme.id, token, lang);
            }}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-orange-500/20"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{btnApply}</span>
          </a>
        </div>

      </div>

      {/* Deep Dive Modal */}
      {showModal && (
        <DeepDiveModal scheme={scheme} onClose={() => setShowModal(false)} colors={colors} />
      )}
    </>
  );
}
