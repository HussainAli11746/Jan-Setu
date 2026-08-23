import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mic, ArrowRight, ShieldCheck, Cpu, MessageSquare, Tractor, Home as HomeIcon, Store, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [situationText, setSituationText] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const currentLang = (i18n.language || 'en').slice(0, 2);

  const localizedBrowse = {
    hi: 'मैन्युअल रूप से योजनाएं देखें',
    bn: 'ম্যানুয়ালি প্রকল্প খুঁজুন',
    ta: 'திட்டங்களை உலாவவும்',
    te: 'పథకాలను మాన్యువల్‌గా చూడండి',
    en: 'Browse Schemes manually',
  };

  const localizedStart = {
    hi: isAuthenticated ? 'जन-सेतु सहायक खोलें' : 'जन-सेतु के साथ शुरू करें',
    bn: isAuthenticated ? 'জন-সেতু সহকারী খুলুন' : 'জন-সেতুর সাথে শুরু করুন',
    ta: isAuthenticated ? 'ஜன-சேது உதவியாளர்' : 'ஜன-சேது உடன் தொடங்குக',
    te: isAuthenticated ? 'జన-సేతు అసిస్టెంట్' : 'జన-సేతుతో ప్రారంభించండి',
    en: isAuthenticated ? 'Open JanSetu Assistant' : 'Start with JanSetu',
  };

  const localizedHeroBtn = {
    hi: isAuthenticated ? 'AI सहायक खोलें' : 'निःशुल्क शुरू करें',
    bn: isAuthenticated ? 'AI সহকারী খুলুন' : 'বিনামূল্যে শুরু করুন',
    ta: isAuthenticated ? 'AI உதவியாளர்' : 'இலவசமாக தொடங்குக',
    te: isAuthenticated ? 'AI అసిస్టెంట్' : 'ఉచితంగా ప్రారంభించండి',
    en: isAuthenticated ? 'Open Assistant' : 'Get Started Free',
  };

  const browseManualText = localizedBrowse[currentLang] || localizedBrowse['en'];
  const startBtnText = localizedStart[currentLang] || localizedStart['en'];
  const heroBtnText = localizedHeroBtn[currentLang] || localizedHeroBtn['en'];

  const goToAssistant = (query) => {
    const textToSend = typeof query === 'string' ? query : situationText;
    if (textToSend && textToSend.trim()) {
      navigate('/assistant', { state: { initialQuery: textToSend.trim() } });
    } else {
      navigate('/assistant');
    }
  };

  const handleStart = (e) => {
    e?.preventDefault();
    goToAssistant();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA] dark:bg-[#0B0F19] transition-colors duration-200">
      
      {/* 1. Hero Section */}
      <section className="pt-16 pb-14 px-4 text-center max-w-4xl mx-auto flex flex-col items-center">
        
        {/* AI Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE]/80 dark:bg-purple-950/40 border border-[#DDD6FE] dark:border-purple-800/40 text-[#6D28D9] dark:text-purple-300 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
          <span>{t('home.ai_badge', 'AI-Powered Citizen Assistant')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-5">
          {t('home.hero_title_1', 'Find Government Schemes')}{' '}
          <span className="bg-gradient-to-r from-[#F97316] via-orange-500 to-[#EA580C] bg-clip-text text-transparent">
            {t('home.hero_title_2', 'Built For You.')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
          {t('home.hero_subtitle', 'Describe your situation in your own words. JanSetu matches you with eligible welfare programs and guides your application step-by-step.')}
        </p>

        {/* Quick Search / Voice Input Bar */}
        <div className="w-full max-w-xl bg-white dark:bg-[#131B2E] p-2 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-lg flex flex-col sm:flex-row items-center gap-2 mb-4">
          <div className="flex items-center gap-3 px-3 py-2 w-full">
            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={situationText}
              onChange={(e) => setSituationText(e.target.value)}
              placeholder={t('home.input_placeholder', 'Describe your situation (e.g. farmer with 2 acres...)')}
              className="w-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStart(e);
              }}
            />
          </div>

          <button
            onClick={() => {
              goToAssistant();
            }}
            className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-xs sm:text-[13px] px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>{heroBtnText}</span>
          </button>
        </div>

        {/* Hero Secondary Actions */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/schemes')}
            className="px-5 py-2.5 bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{browseManualText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Audio Waveform Animation Indicator */}
        <div className="flex items-center gap-1.5 h-6">
          <div className="w-1 bg-slate-300 dark:bg-slate-700 rounded-full wave-bar"></div>
          <div className="w-1 bg-slate-400 dark:bg-slate-600 rounded-full wave-bar"></div>
          <div className="w-1 bg-[#1E293B] dark:bg-orange-500 rounded-full wave-bar"></div>
          <div className="w-1 bg-slate-400 dark:bg-slate-600 rounded-full wave-bar"></div>
          <div className="w-1 bg-slate-300 dark:bg-slate-700 rounded-full wave-bar"></div>
        </div>
      </section>

      {/* 2. Value Props Section */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <p className="text-center text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-8">
          {t('home.tagline', 'Simple. Accessible. Private.')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Voice First */}
          <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 border border-transparent dark:border-purple-800/40">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{t('home.voice_first_title', 'Voice First')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {t('home.voice_first_desc', 'Speak naturally in your preferred language. We understand the context.')}
            </p>
          </div>

          {/* Card 2: Smart Matching */}
          <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 border border-transparent dark:border-blue-800/40">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{t('home.smart_matching_title', 'Smart Matching')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {t('home.smart_matching_desc', 'Find government schemes relevant to your unique situation automatically.')}
            </p>
          </div>

          {/* Card 3: Privacy First */}
          <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 border border-transparent dark:border-emerald-800/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{t('home.privacy_first_title', 'Privacy First')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {t('home.privacy_first_desc', 'Your government documents are processed securely and are not retained.')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. How JanSetu Works */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Process</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{t('home.how_it_works', 'How JanSetu Works')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('home.how_it_works_sub', 'Four simple steps to access the benefits you deserve.')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 shadow-2xs">
                01
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{t('home.step1_title', 'Tell Us')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {t('home.step1_desc', 'Share your situation using voice or text.')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 shadow-2xs">
                02
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{t('home.step2_title', 'Find Matches')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {t('home.step2_desc', 'JanSetu identifies relevant welfare schemes.')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 shadow-2xs">
                03
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{t('home.step3_title', 'Apply')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {t('home.step3_desc', 'Verify your information and prepare your application.')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 shadow-2xs">
                04
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{t('home.step4_title', 'Track')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {t('home.step4_desc', 'Track your application from submission to approval.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Schemes Preview Grid */}
      <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('home.schemes_simplified', 'Government schemes, simplified.')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('home.schemes_simplified_sub', 'Explore some of the most accessed programs below, or ask JanSetu to find the right one for you.')}</p>
          </div>
          <Link to="/schemes" className="text-xs font-bold text-slate-800 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition-colors">
            <span>{t('home.view_all_schemes', 'View all schemes')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Scheme 1 */}
          <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3.5 border border-transparent dark:border-emerald-800/40">
                <Tractor className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">PM-KISAN</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                Pradhan Mantri Kisan Samman Nidhi provides income support to all landholding farmers' families in the...
              </p>
            </div>
            <Link to="/schemes/pmkisan" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1">
              <span>{t('home.learn_more', 'Learn more')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Scheme 2 */}
          <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3.5 border border-transparent dark:border-blue-800/40">
                <HomeIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">PMAY-G</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                Pradhan Mantri Awas Yojana - Gramin aims to provide pucca houses with basic amenities to houseless...
              </p>
            </div>
            <Link to="/schemes/pmayg" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1">
              <span>{t('home.learn_more', 'Learn more')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Scheme 3 */}
          <div className="bg-white dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5 border border-transparent dark:border-amber-800/40">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">PM SVANidhi</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                A special micro-credit facility for street vendors to resume their livelihoods adversely affected by...
              </p>
            </div>
            <Link to="/schemes/svanidhi" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1">
              <span>{t('home.learn_more', 'Learn more')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. Dark Navy Bottom CTA Banner */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 w-full mb-8">
        <div className="bg-[#050C28] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden flex flex-col items-center justify-center shadow-xl">
          
          {/* Subtle concentric circles backdrop */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <div className="w-[450px] h-[450px] rounded-full border border-white"></div>
            <div className="w-[300px] h-[300px] rounded-full border border-white absolute"></div>
            <div className="w-[150px] h-[150px] rounded-full border border-white absolute"></div>
          </div>

          {/* Logo Badge */}
          <div className="w-12 h-12 rounded-xl bg-[#0E1B48] border border-blue-900/60 flex items-center justify-center text-white font-bold text-sm mb-5 shadow-inner">
            <span className="text-orange-500 font-extrabold text-base">J</span>
            <span className="text-white font-extrabold text-base">S</span>
          </div>

          <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight mb-3 z-10">
            {t('home.cta_title', 'Not sure which scheme is right for you?')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-8 leading-relaxed z-10">
            {t('home.cta_desc', "Just tell JanSetu your situation. We'll securely match you with the right programs and guide you through the application.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10">
            <button
              onClick={goToAssistant}
              className="w-full sm:w-auto bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-[13px] px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>{startBtnText}</span>
            </button>
            <button
              onClick={() => navigate('/schemes')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-[13px] px-6 py-3.5 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <span>{browseManualText}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
