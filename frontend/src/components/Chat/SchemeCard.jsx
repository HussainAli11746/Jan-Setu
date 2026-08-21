import React, { useState } from 'react';
import { ExternalLink, BookOpen, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DeepDiveModal from './DeepDiveModal';

const CATEGORY_COLORS = {
  agriculture: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  education:   { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  housing:     { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  health:      { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     dot: 'bg-red-500' },
  employment:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  business:    { bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    dot: 'bg-cyan-500' },
  social:      { bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700',    dot: 'bg-pink-500' },
  skill:       { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
};

export default function SchemeCard({ scheme }) {
  const [showModal, setShowModal] = useState(false);
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const colors = CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS.social;

  const btnDeepDive = lang === 'hi' ? 'विस्तार से जानें' : lang === 'bn' ? 'বিস্তারিত দেখুন' : lang === 'ta' ? 'விவரங்கள்' : lang === 'te' ? 'పూర్తి వివరాలు' : 'Deep Dive';
  const btnApply = lang === 'hi' ? 'आवेदन करें' : lang === 'bn' ? 'আবেদন করুন' : lang === 'ta' ? 'விண்ணப்பிக்க' : lang === 'te' ? 'దరఖాస్తు చేసుకోండి' : 'Apply Now';

  return (
    <>
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 flex flex-col gap-3 hover:shadow-md transition-all group`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className={`w-2 h-2 rounded-full ${colors.dot} mt-1.5 shrink-0`} />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">{scheme.name}</h4>
              {scheme.ministry && (
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{scheme.ministry}</p>
              )}
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {scheme.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{scheme.description}</p>

        {/* Benefit badge */}
        {scheme.benefit && (
          <div className="flex items-center gap-1.5">
            <Tag className={`w-3 h-3 ${colors.text}`} />
            <span className={`text-xs font-bold ${colors.text}`}>{scheme.benefit}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer hover:bg-slate-50"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{btnDeepDive}</span>
          </button>
          <a
            href={scheme.applyUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{btnApply}</span>
          </a>
        </div>
      </div>

      {showModal && (
        <DeepDiveModal scheme={scheme} onClose={() => setShowModal(false)} colors={colors} />
      )}
    </>
  );
}
