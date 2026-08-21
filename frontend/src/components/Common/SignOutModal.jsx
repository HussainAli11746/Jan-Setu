import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = {
    hi: {
      title: 'क्या आप लॉग आउट करना चाहते हैं?',
      desc: 'लॉग आउट करने के बाद आपको अपनी सहेजी गई योजनाओं और प्रोफाइल तक पहुँचने के लिए दोबारा साइन इन करना होगा।',
      cancel: 'रद्द करें',
      confirm: 'हाँ, लॉग आउट करें',
    },
    bn: {
      title: 'আপনি কি সাইন আউট করতে চান?',
      desc: 'সাইন আউট করার পর আপনার সংরক্ষিত প্রকল্প এবং প্রোফাইল অ্যাক্সেস করার জন্য আপনাকে পুনরায় সাইন ইন করতে হবে।',
      cancel: 'বাতিল',
      confirm: 'হ্যাঁ, সাইন আউট করুন',
    },
    ta: {
      title: 'நீங்கள் வெளியேற விரும்புகிறீர்களா?',
      desc: 'வெளியேறிய பிறகு உங்கள் சேமிக்கப்பட்ட திட்டங்கள் மற்றும் சுயவிவரத்தை அணுக மீண்டும் உள்நுழைய வேண்டும்.',
      cancel: 'ரத்து செய்',
      confirm: 'ஆம், வெளியேறு',
    },
    te: {
      title: 'మీరు లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
      desc: 'లాగ్ అవుట్ చేసిన తర్వాత మీ సేవ్ చేసిన పథకాలు మరియు ప్రొఫైల్‌ను యాక్సెస్ చేయడానికి మీరు మళ్లీ సైన్ ఇన్ చేయాలి.',
      cancel: 'రద్దు చేయి',
      confirm: 'అవును, లాగ్ అవుట్ చేయి',
    },
    en: {
      title: 'Sign out of JanSetu?',
      desc: 'Are you sure you want to sign out? You will need to sign back in to access your profile, applications, and saved schemes.',
      cancel: 'Cancel',
      confirm: 'Sign Out',
    },
  };

  const text = content[lang] || content['en'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
          <LogOut className="w-5 h-5" />
        </div>

        {/* Title & Desc */}
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {text.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          {text.desc}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {text.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            {text.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
