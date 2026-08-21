import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mic, ArrowRight, ShieldCheck, Cpu, MessageSquare, Tractor, Home as HomeIcon, Store, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t } = useTranslation();
  const [situationText, setSituationText] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const goToAssistant = () => {
    navigate(isAuthenticated ? '/assistant' : '/register-wall');
  };

  const handleStart = (e) => {
    e?.preventDefault();
    goToAssistant();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">
      
      {/* 1. Hero Section */}
      <section className="pt-16 pb-14 px-4 text-center max-w-4xl mx-auto flex flex-col items-center">
        
        {/* AI Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE]/80 border border-[#DDD6FE] text-[#6D28D9] text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>{t('home.ai_badge', 'AI-Powered Civic Assistant')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-extrabold text-[#0B132B] tracking-tight leading-[1.15] max-w-3xl mb-5">
          {t('home.hero_title_1', 'Find government schemes')} <br className="hidden sm:block" />
          <span className="text-[#0B132B]">{t('home.hero_title_2', 'made for you.')}</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mb-9 leading-relaxed font-normal">
          {t('home.hero_subtitle', 'Tell us about your situation in your own words. JanSetu finds schemes you may be eligible for and helps you apply seamlessly.')}
        </p>

        {/* Hero Search Box with Orange Action */}
        <div
          onClick={goToAssistant}
          className="w-full max-w-2xl bg-white rounded-2xl p-2 sm:p-2.5 shadow-lg border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 mb-6 transition-all hover:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 cursor-pointer"
        >
          <div className="flex items-center gap-3 w-full px-3 py-1 cursor-pointer">
            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              readOnly
              onClick={goToAssistant}
              placeholder={t('home.input_placeholder', 'Describe your situation...')}
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden cursor-pointer"
            />
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToAssistant();
            }}
            className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-xs sm:text-[13px] px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>{t('home.btn_story', isAuthenticated ? 'Open Assistant' : 'Get Started Free')}</span>
          </button>
        </div>

        {/* Hero Secondary Actions */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/schemes')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t('home.browse_manual', 'Browse Schemes manually')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Audio Waveform Animation Indicator */}
        <div className="flex items-center gap-1.5 h-6">
          <div className="w-1 bg-slate-300 rounded-full wave-bar"></div>
          <div className="w-1 bg-slate-400 rounded-full wave-bar"></div>
          <div className="w-1 bg-[#1E293B] rounded-full wave-bar"></div>
          <div className="w-1 bg-slate-400 rounded-full wave-bar"></div>
          <div className="w-1 bg-slate-300 rounded-full wave-bar"></div>
        </div>
      </section>

      {/* 2. Value Props Section */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <p className="text-center text-xs font-semibold tracking-wider text-slate-500 mb-8">
          {t('home.tagline', 'Simple. Accessible. Private.')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Voice First */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t('home.voice_first_title', 'Voice First')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              {t('home.voice_first_desc', 'Speak naturally in your preferred language. We understand the context.')}
            </p>
          </div>

          {/* Card 2: Smart Matching */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t('home.smart_matching_title', 'Smart Matching')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              {t('home.smart_matching_desc', 'Find government schemes relevant to your unique situation automatically.')}
            </p>
          </div>

          {/* Card 3: Privacy First */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t('home.privacy_first_title', 'Privacy First')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              {t('home.privacy_first_desc', 'Your government documents are processed securely and are not retained.')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. How JanSetu Works */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xs">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Process</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{t('home.how_it_works', 'How JanSetu Works')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('home.how_it_works_sub', 'Four simple steps to access the benefits you deserve.')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-700 mb-3 shadow-2xs">
                01
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{t('home.step1_title', 'Tell Us')}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('home.step1_desc', 'Share your situation using voice or text.')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-700 mb-3 shadow-2xs">
                02
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{t('home.step2_title', 'Find Matches')}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('home.step2_desc', 'JanSetu identifies relevant welfare schemes.')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-700 mb-3 shadow-2xs">
                03
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{t('home.step3_title', 'Apply')}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t('home.step3_desc', 'Verify your information and prepare your application.')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-700 mb-3 shadow-2xs">
                04
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{t('home.step4_title', 'Track')}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
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
            <h3 className="text-base font-bold text-slate-900">{t('home.schemes_simplified', 'Government schemes, simplified.')}</h3>
            <p className="text-xs text-slate-500">{t('home.schemes_simplified_sub', 'Explore some of the most accessed programs below, or ask JanSetu to find the right one for you.')}</p>
          </div>
          <Link to="/schemes" className="text-xs font-bold text-slate-800 hover:text-orange-600 flex items-center gap-1 transition-colors">
            <span>{t('home.view_all_schemes', 'View all schemes')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Scheme 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5">
                <Tractor className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">PM-KISAN</h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                Pradhan Mantri Kisan Samman Nidhi provides income support to all landholding farmers' families in the...
              </p>
            </div>
            <Link to="/schemes/pmkisan" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              <span>{t('home.learn_more', 'Learn more')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Scheme 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5">
                <HomeIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">PMAY-G</h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                Pradhan Mantri Awas Yojana - Gramin aims to provide pucca houses with basic amenities to houseless...
              </p>
            </div>
            <Link to="/schemes/pmayg" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              <span>{t('home.learn_more', 'Learn more')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Scheme 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">PM SVANidhi</h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                A special micro-credit facility for street vendors to resume their livelihoods adversely affected by...
              </p>
            </div>
            <Link to="/schemes/svanidhi" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
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
              <span>{t('home.start_with_jansetu', isAuthenticated ? 'Open JanSetu Assistant' : 'Start with JanSetu')}</span>
            </button>
            <button
              onClick={() => navigate('/schemes')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-[13px] px-6 py-3.5 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <span>{t('home.browse_manual', 'Browse Schemes manually')}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
