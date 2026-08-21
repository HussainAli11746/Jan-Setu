import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle2, FileText, AlertCircle, Bookmark, BookmarkCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function DeepDiveModal({ scheme, onClose, colors }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('jansetu_saved_schemes') || '[]');
      return saved.some((s) => s.id === scheme.id || s === scheme.id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const labels = {
    about: lang === 'hi' ? 'योजना का विवरण' : lang === 'bn' ? 'প্রকল্প সম্পর্কে' : lang === 'ta' ? 'திட்டம் பற்றி' : lang === 'te' ? 'పథకం గురించి' : 'About this scheme',
    eligibility: lang === 'hi' ? 'पात्रता मापदंड' : lang === 'bn' ? 'যোগ্যতার মানদণ্ড' : lang === 'ta' ? 'தகுதி வரம்புகள்' : lang === 'te' ? 'అర్హత ప్రమాణాలు' : 'Eligibility Criteria',
    documents: lang === 'hi' ? 'आवश्यक दस्तावेज' : lang === 'bn' ? 'প্রয়োজনীয় ডকুমেন্টস' : lang === 'ta' ? 'தேவையான ஆவணங்கள்' : lang === 'te' ? 'அవసరమైన పత్రాలు' : 'Required Documents',
    disclaimer: lang === 'hi' ? 'पात्रता राज्य नीतियों और योजना उपलब्धता के अनुसार भिन्न हो सकती है। आवेदन करने से पहले आधिकारिक पोर्टल पर वर्तमान मानदंडों की पुष्टि करें।' : 'Eligibility may vary based on state policies and scheme availability. Visit the official portal to verify current criteria before applying.',
    close: lang === 'hi' ? 'बंद करें' : lang === 'bn' ? 'বন্ধ করুন' : lang === 'ta' ? 'மூடு' : lang === 'te' ? 'మూసివేయి' : 'Close',
    apply: lang === 'hi' ? 'आधिकारिक पोर्टल' : lang === 'bn' ? 'অফিসিয়াল পোর্টাল' : lang === 'ta' ? 'அதிகாரப்பூர்வ தளம்' : lang === 'te' ? 'అధికారిక పోర్టల్' : 'Apply on Official Site',
    saveScheme: lang === 'hi' ? 'योजना सहेजें' : lang === 'bn' ? 'সংরক্ষণ করুন' : lang === 'ta' ? 'சேமிக்கவும்' : lang === 'te' ? 'సేవ్ చేయండి' : 'Save Scheme',
    saved: lang === 'hi' ? 'सहेजा गया ✓' : lang === 'bn' ? 'সংরক্ষিত ✓' : lang === 'ta' ? 'சேமிக்கப்பட்டது ✓' : lang === 'te' ? 'సేవ్ చేయబడింది ✓' : 'Saved ✓',
    savedToast: lang === 'hi' ? 'योजना आपके बुकमार्क में सहेजी गई!' : 'Scheme saved to your bookmarks!',
    unsavedToast: lang === 'hi' ? 'योजना बुकमार्क से हटाई गई' : 'Scheme removed from bookmarks',
    keyBenefit: lang === 'hi' ? 'मुख्य लाभ' : 'Key Benefit',
  };

  const handleToggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('jansetu_saved_schemes') || '[]');
      let updated;
      if (isSaved) {
        updated = saved.filter((s) => (typeof s === 'object' ? s.id !== scheme.id : s !== scheme.id));
        setIsSaved(false);
        toast(labels.unsavedToast, { icon: '🗑️' });
      } else {
        updated = [...saved, { id: scheme.id, name: scheme.name, category: scheme.category, benefit: scheme.benefit, savedAt: new Date().toISOString() }];
        setIsSaved(true);
        toast.success(labels.savedToast);
      }
      localStorage.setItem('jansetu_saved_schemes', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving scheme:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className={`${colors.bg} border-b ${colors.border} px-6 py-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text} mb-1 block`}>
                {scheme.category}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{scheme.name}</h2>
              {scheme.ministry && (
                <p className="text-xs text-slate-500 mt-0.5">{scheme.ministry}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleSave}
                title={isSaved ? labels.saved : labels.saveScheme}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-xs'
                    : 'bg-white/90 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {scheme.benefit && (
            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${colors.text} bg-white border ${colors.border}`}>
              {labels.keyBenefit}: {scheme.benefit}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[58vh] overflow-y-auto flex flex-col gap-5">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{labels.about}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{scheme.description}</p>
          </div>

          {/* Eligibility criteria */}
          {scheme.eligibility && scheme.eligibility.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {labels.eligibility}
              </h3>
              <ul className="flex flex-col gap-2">
                {scheme.eligibility.map((criterion, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-emerald-600">{i + 1}</span>
                    </div>
                    <span className="leading-relaxed">{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required documents */}
          {scheme.requiredDocs && scheme.requiredDocs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                {labels.documents}
              </h3>
              <div className="flex flex-wrap gap-2">
                {scheme.requiredDocs.map((doc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700"
                  >
                    <FileText className="w-3 h-3" />
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200/60 rounded-xl p-3.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              {labels.disclaimer}
            </p>
          </div>
        </div>

        {/* Footer with Close, Save Scheme, and Apply Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            {labels.close}
          </button>

          {/* Save Scheme Button */}
          <button
            type="button"
            onClick={handleToggleSave}
            className={`flex-1 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSaved
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>{labels.saved}</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>{labels.saveScheme}</span>
              </>
            )}
          </button>

          {/* Apply on Official Site */}
          <a
            href={scheme.applyUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 hover:shadow-orange-500/25 hover:shadow-md transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{labels.apply}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
