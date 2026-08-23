import React, { useEffect } from 'react';
import { Globe, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LanguageChangeModal({ isOpen, onClose, onConfirm, targetLanguage }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !targetLanguage) return null;

  const content = {
    hi: {
      title: 'क्या आप भाषा बदलना चाहते हैं?',
      desc: (target) => `वेबसाइट, मेनू, प्रोफ़ाइल और AI सहायक की भाषा बदलकर "${target}" कर दी जाएगी।`,
      cancel: 'रद्द करें',
      confirm: 'हाँ, भाषा बदलें',
    },
    bn: {
      title: 'আপনি কি ভাষা পরিবর্তন করতে চান?',
      desc: (target) => `ওয়েবসাইট, মেনু, প্রোফাইল এবং AI সহকারীর ভাষা পরিবর্তিত হয়ে "${target}" হবে।`,
      cancel: 'বাতিল',
      confirm: 'হ্যাঁ, পরিবর্তন করুন',
    },
    ta: {
      title: 'மொழியை மாற்ற விரும்புகிறீர்களா?',
      desc: (target) => `வலைத்தளம், மெனுக்கள், சுயவிவரம் மற்றும் AI உதவியாளர் "${target}" மொழிக்கு மாற்றப்படும்.`,
      cancel: 'ரத்து செய்',
      confirm: 'ஆம், மாற்றுக',
    },
    te: {
      title: 'మీరు భాషను మార్చాలనుకుంటున్నారా?',
      desc: (target) => `వెబ్‌సైట్, మెనూలు, ప్రొఫైల్ మరియు AI అసిస్టెంట్ "${target}" భాషలోకి మార్చబడతాయి.`,
      cancel: 'రద్దు చేయి',
      confirm: 'అవును, మార్చండి',
    },
    en: {
      title: 'Change platform language?',
      desc: (target) => `The entire platform, navigation, profile, and AI assistant will switch to "${target}".`,
      cancel: 'Cancel',
      confirm: 'Confirm Language',
    },
  };

  const text = content[currentLang] || content['en'];
  const targetNative = targetLanguage.native || targetLanguage.label || targetLanguage.code;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 sm:p-7 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center">
        {/* Globe Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-4">
          <Globe className="w-6 h-6" />
        </div>

        {/* Title & Desc */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {text.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          {text.desc(targetNative)}
        </p>

        {/* Target Language Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 mb-6 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Language</p>
            <p className="text-sm font-extrabold text-[#0B132B] dark:text-white">{targetNative} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({targetLanguage.label})</span></p>
          </div>
          <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
            <Check className="w-4 h-4" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {text.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0A1633] dark:bg-orange-600 hover:bg-slate-900 dark:hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            {text.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
