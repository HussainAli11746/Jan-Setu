import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Sparkles, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WALL_I18N = {
  hi: {
    badge: 'AI-संचालित योजना सहायक',
    title1: 'अपनी योजना यात्रा शुरू करने',
    title2: 'के लिए पंजीकरण करें',
    subtitle: 'जन-सेतु AI चैटबॉट तक पहुँचने और अपनी पात्रता के अनुसार सरकारी योजनाएँ खोजने के लिए मुफ़्त खाता बनाएँ।',
    feat1: 'AI-संचालित स्मार्ट मिलान',
    feat2: 'सुरक्षित एवं निजी',
    feat3: '500+ योजनाएं',
    createBtn: 'निःशुल्क खाता बनाएं',
    hasAccount: 'क्या आपके पास पहले से खाता है?',
    signInLink: 'साइन इन करें',
    backHome: '← होम पर वापस जाएं',
    chatSampleUser: 'मुझे अपनी बेटी की उच्च शिक्षा के लिए योजनाएं चाहिए',
    chatSampleBot: '4 योजनाएं मिलीं: सुकन्या समृद्धि, सीबीएसई मेरिट, पोस्ट मैट्रिक...',
  },
  bn: {
    badge: 'AI-চালিত প্রকল্প সহকারী',
    title1: 'আপনার প্রকল্প যাত্রা শুরু করতে',
    title2: 'নিবন্ধন করুন',
    subtitle: 'জন-সেতু AI চ্যাটবট অ্যাক্সেস করতে এবং আপনার যোগ্য সরকারি প্রকল্পগুলি আবিষ্কার করতে একটি বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।',
    feat1: 'AI-চালিত ম্যাচিং',
    feat2: 'নিরাপদ ও ব্যক্তিগত',
    feat3: '৫০০+ প্রকল্প',
    createBtn: 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন',
    hasAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    signInLink: 'সাইন ইন করুন',
    backHome: '← হোমে ফিরে যান',
    chatSampleUser: 'আমি আমার মেয়ের শিক্ষার জন্য প্রকল্প খুঁজছি',
    chatSampleBot: '৪টি প্রকল্প পাওয়া গেছে: সুকন্যা সমৃদ্ধি, এনএসপি স্কলারশিপ...',
  },
  ta: {
    badge: 'AI-இயங்கும் திட்ட உதவியாளர்',
    title1: 'உங்கள் திட்ட பயணத்தைத் தொடங்க',
    title2: 'பதிவு செய்க',
    subtitle: 'ஜன-சேது AI உதவியாளரை அணுக இலவச கணக்கை உருவாக்கி உங்களுக்குரிய திட்டங்களைக் கண்டறியவும்.',
    feat1: 'AI ஸ்மார்ட் மேட்சிங்',
    feat2: 'பாதுகாப்பானது',
    feat3: '500+ திட்டங்கள்',
    createBtn: 'இலவச கணக்கை உருவாக்கவும்',
    hasAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    signInLink: 'உள்நுழைக',
    backHome: '← முகப்புக்குத் திரும்பு',
    chatSampleUser: 'மகளின் கல்விக்கான திட்டங்கள் தேவை',
    chatSampleBot: '4 திட்டங்கள் கிடைத்துள்ளன: சுகன்யா சம்ரிதி, உதவித்தொகை...',
  },
  te: {
    badge: 'AI-ఆధారిత పథకాల అసిస్టెంట్',
    title1: 'మీ పథకాల ప్రయాణాన్ని ప్రారంభించడానికి',
    title2: 'నమోదు చేయండి',
    subtitle: 'జన-సేతు AI చాట్‌బాట్‌ను యాక్సెస్ చేయడానికి ఉచిత ఖాతాను సృష్టించండి.',
    feat1: 'AI స్మార్ట్ మ్యాచింగ్',
    feat2: 'సురక్షితం & గోప్యమైనది',
    feat3: '500+ పథకాలు',
    createBtn: 'ఉచిత ఖాతాను సృష్టించండి',
    hasAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    signInLink: 'సైన్ ఇన్ చేయండి',
    backHome: '← హోమ్‌కి తిరిగి వెళ్లండి',
    chatSampleUser: 'నా కుమార్తె చదువు కోసం పథకాలు కావాలి',
    chatSampleBot: '4 పథకాలు లభించాయి: సుకన్య సమృద్ధి, స్కాలర్‌షిప్...',
  },
  en: {
    badge: 'AI-Powered Scheme Assistant',
    title1: 'Register to start your',
    title2: 'scheme journey',
    subtitle: "Create a free account to access JanSetu's AI chatbot and discover government schemes you're eligible for.",
    feat1: 'AI-Powered matching',
    feat2: 'Secure & private',
    feat3: '500+ schemes',
    createBtn: 'Create free account',
    hasAccount: 'Already have an account?',
    signInLink: 'Sign In',
    backHome: '← Back to home',
    chatSampleUser: 'I want education-related schemes for my daughter',
    chatSampleBot: 'Found 4 schemes: Sukanya Samriddhi, NSP Scholarship, CBSE Merit Award...',
  },
};

export default function RegisterWall() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language || 'en';
  const t = WALL_I18N[currentLang] || WALL_I18N['en'];

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-4 py-12 transition-colors duration-200">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-50/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0A1633] flex items-center justify-center shadow-xl border border-transparent">
            <span className="text-orange-400 font-extrabold text-xl">J</span>
            <span className="text-white font-extrabold text-xl">S</span>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE]/80 border border-[#DDD6FE] text-[#6D28D9] text-xs font-semibold mb-5">
          <Sparkles className="w-3 h-3" />
          <span>{t.badge}</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-[#0B132B] tracking-tight mb-3">
          {t.title1}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
            {t.title2}
          </span>
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {t.subtitle}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {[
            { icon: Zap, text: t.feat1 },
            { icon: ShieldCheck, text: t.feat2 },
            { icon: Users, text: t.feat3 },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
              <Icon className="w-3 h-3 text-orange-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 flex flex-col gap-4">
          {/* Chat preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left">
            <div className="flex items-start gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#0A1633] flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none px-3 py-2 text-xs text-slate-700">
                {t.chatSampleUser}
              </div>
            </div>
            <div className="flex items-start gap-2.5 justify-end">
              <div className="bg-orange-50 border border-orange-200/60 rounded-xl rounded-tr-none px-3 py-2 text-xs text-orange-800 max-w-[240px]">
                {t.chatSampleBot}
              </div>
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          <button
            id="register-wall-cta"
            onClick={() => navigate('/register')}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-orange-500/25 transition-all cursor-pointer"
          >
            <span>{t.createBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center text-sm text-slate-500">
            {t.hasAccount}{' '}
            <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
              {t.signInLink}
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
