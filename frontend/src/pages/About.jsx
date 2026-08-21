import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Search, MessageSquare, ShieldCheck, Cpu, ArrowRight, Sparkles, Building, Landmark, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n.language || 'en').slice(0, 2);

  const localizedBrowse = {
    hi: 'मैन्युअल रूप से योजनाएं देखें',
    bn: 'ম্যানুয়ালি প্রকল্প খুঁজুন',
    ta: 'திட்டங்களை உலாவவும்',
    te: 'పథకాలను మాన్యువల్‌గా చూడండి',
    en: 'Browse Schemes manually',
  };

  const localizedVoice = {
    hi: 'वॉइस सहायक आज़माएं',
    bn: 'ভয়েস সহকারী চেষ্টা করুন',
    ta: 'குரல் உதவியாளர்',
    te: 'వాయిస్ అసిస్టెంట్‌ని ప్రయత్నించండి',
    en: 'Try Voice Assistant',
  };

  const browseManualText = localizedBrowse[currentLang] || localizedBrowse['en'];
  const tryVoiceText = localizedVoice[currentLang] || localizedVoice['en'];

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-5 pt-4">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
            <Building className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('about.badge', 'Empowering Citizens')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2] max-w-2xl">
            {t('about.hero_title', 'Your Guide to Government')} <br />
            <span className="text-[#0E2060]">{t('about.hero_highlight', 'Welfare Schemes')}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed font-normal">
            {t('about.hero_sub', 'JanSetu AI bridges the gap between Indian citizens and government welfare schemes by making discovery and application simple, accessible, and voice-first.')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/assistant')}
              className="bg-[#0A1633] hover:bg-slate-900 text-white text-xs font-bold px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>{tryVoiceText}</span>
            </button>

            <button
              onClick={() => navigate('/schemes')}
              className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-6 py-3.5 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <span>{browseManualText}</span>
            </button>
          </div>

        </div>

        {/* Built for Everyone Section */}
        <div className="flex flex-col gap-8 text-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{t('about.built_everyone', 'Built for Everyone')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('about.built_sub', 'Three core principles that drive the JanSetu experience.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Card 1: Voice First */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-72">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0A1633] flex items-center justify-center text-white mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">{t('home.voice_first_title', 'Voice First')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.voice_first_desc', 'Interact naturally using voice or text. Speak in your preferred language, and the AI translates and understands your needs instantly.')}
                </p>
              </div>

              {/* Mini Graphic indicator */}
              <div className="flex items-end gap-1.5 h-6 opacity-40">
                <div className="w-4 h-2 bg-slate-300 rounded-xs"></div>
                <div className="w-4 h-3 bg-slate-400 rounded-xs"></div>
                <div className="w-4 h-5 bg-slate-500 rounded-xs"></div>
                <div className="w-4 h-3 bg-slate-400 rounded-xs"></div>
                <div className="w-4 h-4 bg-slate-300 rounded-xs"></div>
              </div>
            </div>

            {/* Card 2: Smart Matching */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-72">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center text-white mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">{t('home.smart_matching_title', 'Smart Matching')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.smart_matching_desc', 'AI understands your unique situation, analyzes eligibility criteria, and instantly identifies the most relevant welfare schemes for you.')}
                </p>
              </div>

              {/* Mini Progress graphic */}
              <div className="w-full">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-[#EA580C] rounded-full"></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-medium mt-1">
                  <span>Matching Profile</span>
                  <span>75%</span>
                </div>
              </div>
            </div>

            {/* Card 3: Privacy First */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-72">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-white mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">{t('home.privacy_first_title', 'Privacy First')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('home.privacy_first_desc', 'Your trust is our priority. Government documents are processed securely for verification and are never retained on our servers.')}
                </p>
              </div>

              {/* Mini Shield graphic */}
              <div className="flex justify-start text-slate-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

          </div>
        </div>

        {/* How JanSetu Works (Card Container) */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xs">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Process</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{t('home.how_it_works', 'How JanSetu Works')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('home.how_it_works_sub', 'Four simple steps to access the benefits you deserve.')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 mb-3 shadow-2xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-slate-900 mb-1">{t('home.step1_title', 'Tell Us')}</h5>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('home.step1_desc', 'Share your details naturally via voice or text chat.')}
              </p>
              <span className="mt-2 w-4 h-4 rounded-full bg-[#0A1633] text-white text-[9px] font-bold flex items-center justify-center">1</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 mb-3 shadow-2xs">
                <Search className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-slate-900 mb-1">{t('home.step2_title', 'Find Matches')}</h5>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('home.step2_desc', 'AI scans thousands of schemes to find your exact matches.')}
              </p>
              <span className="mt-2 w-4 h-4 rounded-full bg-[#EA580C] text-white text-[9px] font-bold flex items-center justify-center">2</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 mb-3 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-slate-900 mb-1">{t('home.step3_title', 'Apply')}</h5>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('home.step3_desc', 'Complete the application with guided, step-by-step assistance.')}
              </p>
              <span className="mt-2 w-4 h-4 rounded-full bg-blue-900 text-white text-[9px] font-bold flex items-center justify-center">3</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 mb-3 shadow-2xs">
                <Cpu className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-slate-900 mb-1">{t('home.step4_title', 'Track')}</h5>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('home.step4_desc', 'Monitor application status with real-time updates.')}
              </p>
              <span className="mt-2 w-4 h-4 rounded-full bg-emerald-800 text-white text-[9px] font-bold flex items-center justify-center">4</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
