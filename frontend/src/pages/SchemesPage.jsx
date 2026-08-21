import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Tractor, Home as HomeIcon, Heart, Briefcase,
  GraduationCap, Zap, Shield, TrendingUp, Sparkles, Search,
  Loader2, ExternalLink, Filter, ChevronDown, CheckCircle2
} from 'lucide-react';
import { fetchBrowseSchemes } from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const SCHEMES_PAGE_I18N = {
  hi: {
    badge: 'राष्ट्रीय योजना निर्देशिका',
    title: 'सरकारी योजनाएं खोजें एवं देखें',
    subtitle: 'केंद्रीय एवं राज्य मंत्रालयों के सभी कल्याणकारी कार्यक्रम, सब्सिडी और छात्रवृत्तियों का अन्वेषण करें।',
    searchPlaceholder: 'योजना के नाम या कीवर्ड से खोजें…',
    allSchemes: 'सभी योजनाएँ',
    agriculture: 'कृषि एवं किसान कल्याण',
    education: 'शिक्षा एवं छात्रवृत्ति',
    housing: 'आवास एवं पुनर्वास',
    health: 'स्वास्थ्य एवं आयुष्मान',
    business: 'व्यवसाय एवं ऋण',
    skill: 'कौशल एवं रोजगार',
    social: 'सामाजिक सुरक्षा एवं पेंशन',
    loading: 'योजना सूची लोड हो रही है...',
    emptyTitle: 'कोई योजना नहीं मिली',
    emptySubtitle: 'कृपया अन्य कीवर्ड या श्रेणी चुनकर पुनः प्रयास करें।',
    resetFilters: 'फ़िल्टर रीसेट करें',
    keyBenefit: 'प्रमुख लाभ / अनुदान',
    detailsBtn: 'विवरण देखें',
    applyBtn: 'आवेदन करें',
    loadMoreBtn: 'और योजनाएँ लोड करें',
    loadingMore: 'और योजनाएँ लोड हो रही हैं...',
    allViewed: (total) => `आपने इस श्रेणी में सभी ${total} उपलब्ध योजनाएँ देख ली हैं।`,
    showingCount: (current, total) => `कुल ${total} में से ${current} योजनाएँ प्रदर्शित`,
  },
  bn: {
    badge: 'জাতীয় প্রকল্প ডিরেক্টরি',
    title: 'সরকারি প্রকল্পসমূহ ব্রাউজ করুন',
    subtitle: 'কেন্দ্রীয় ও রাজ্য মন্ত্রণালয়ের সকল কল্যাণমূলক কর্মসূচি ও বৃত্তির সন্ধান করুন।',
    searchPlaceholder: 'প্রকল্পের নাম বা কীওয়ার্ড দিয়ে অনুসন্ধান করুন…',
    allSchemes: 'সমস্ত প্রকল্প',
    agriculture: 'কৃষি ও কৃষক কল্যাণ',
    education: 'শিক্ষা ও বৃত্তি',
    housing: 'আবাসন ও গৃহায়ন',
    health: 'স্বাস্থ্য ও বীমা',
    business: 'ব্যবসা ও ঋণ',
    skill: 'দক্ষতা ও কর্মসংস্থান',
    social: 'সামাজিক নিরাপত্তা ও পেনশন',
    loading: 'প্রকল্পের তালিকা লোড হচ্ছে...',
    emptyTitle: 'কোনো প্রকল্প পাওয়া যায়নি',
    emptySubtitle: 'অন্য কীওয়ার্ড বা বিভাগ নির্বাচন করে পুনরায় চেষ্টা করুন।',
    resetFilters: 'ফিল্টার রিসেট করুন',
    keyBenefit: 'মূল সুবিধা / অনুদান',
    detailsBtn: 'বিস্তারিত',
    applyBtn: 'আবেদন করুন',
    loadMoreBtn: 'আরও প্রকল্প লোড করুন',
    loadingMore: 'লোড হচ্ছে...',
    allViewed: (total) => `আপনি এই বিভাগে সমস্ত ${total}টি উপলব্ধ প্রকল্প দেখেছেন।`,
    showingCount: (current, total) => `মোট ${total}টির মধ্যে ${current}টি প্রকল্প দেখানো হচ্ছে`,
  },
  ta: {
    badge: 'தேசிய நலத்திட்ட அடைவு',
    title: 'அரசு திட்டங்களை உலாவுங்கள்',
    subtitle: 'அனைத்து மத்திய மற்றும் மாநில நலத்திட்டங்கள், மானியங்கள் மற்றும் உதவித்தொகைகள்.',
    searchPlaceholder: 'திட்டத்தின் பெயர் மூலம் தேடுங்கள்…',
    allSchemes: 'அனைத்து திட்டங்கள்',
    agriculture: 'விவசாயம் & உழவர் நலம்',
    education: 'கல்வி & உதவித்தொகை',
    housing: 'வீட்டு வசதி',
    health: 'சுகாதாரம் & காப்பீடு',
    business: 'வணிகம் & குறுங்கடன்கள்',
    skill: 'திறன் & வேலைவாய்ப்பு',
    social: 'சமூக பாதுகாப்பு & ஓய்வூதியம்',
    loading: 'திட்டங்கள் ஏற்றப்படுகின்றன...',
    emptyTitle: 'திட்டங்கள் எதுவும் கிடைக்கவில்லை',
    emptySubtitle: 'வேறு தேடல் சொல்லைப் பயன்படுத்தி முயற்சிக்கவும்.',
    resetFilters: 'வடிகட்டிகளை மீட்டமை',
    keyBenefit: 'முக்கிய நன்மை / உதவி',
    detailsBtn: 'விவரங்கள்',
    applyBtn: 'விண்ணப்பிக்கவும்',
    loadMoreBtn: 'மேலும் திட்டங்களை ஏற்றவும்',
    loadingMore: 'ஏற்றப்படுகிறது...',
    allViewed: (total) => `இந்த பிரிவில் உள்ள அனைத்து ${total} திட்டங்களையும் பார்த்துவிட்டீர்கள்.`,
    showingCount: (current, total) => `மொத்தம் ${total} திட்டங்களில் ${current} காட்டப்படுகின்றன`,
  },
  te: {
    badge: 'జాతీయ పథకాల డైరెక్టరీ',
    title: 'ప్రభుత్వ పథకాలను బ్రౌజ్ చేయండి',
    subtitle: 'అన్ని కేంద్ర మరియు రాష్ట్ర మంత్రిత్వ శాఖల సంక్షేమ పథకాలు, సబ్సిడీలు మరియు స్కాలర్‌షిప్‌లు.',
    searchPlaceholder: 'పథకం పేరు లేదా కీవర్డ్ ద్వారా వెతకండి…',
    allSchemes: 'అన్ని పథకాలు',
    agriculture: 'వ్యవసాయం & రైతుల సంక్షేమం',
    education: 'విద్య & స్కాలర్‌షిప్‌లు',
    housing: 'గృహ నిర్మాణం',
    health: 'ఆరోగ్యం & బీమా',
    business: 'వ్యాపారం & సూక్ష్మ రుణాలు',
    skill: 'నైపుణ్యం & ఉపాధి',
    social: 'సామాజిక భద్రత & పెన్షన్',
    loading: 'పథకాల జాబితా లోడ్ అవుతోంది...',
    emptyTitle: 'పథకాలు ఏవీ కనుగొనబడలేదు',
    emptySubtitle: 'దయచేసి వేరే పదం లేదా వర్గాన్ని ఎంచుకుని మళ్లీ ప్రయత్నించండి.',
    resetFilters: 'ఫిల్టర్‌లను రీసెట్ చేయండి',
    keyBenefit: 'ముఖ్య ప్రయోజనం / సబ్సిడీ',
    detailsBtn: 'వివరాలు',
    applyBtn: 'దరఖాస్తు చేసుకోండి',
    loadMoreBtn: 'మరిన్ని పథకాలను లోడ్ చేయండి',
    loadingMore: 'లోడ్ అవుతోంది...',
    allViewed: (total) => `మీరు ఈ వర్గంలో అందుబాటులో ఉన్న అన్ని ${total} పథకాలను చూసారు.`,
    showingCount: (current, total) => `మొత్తం ${total} లో ${current} పథకాలు చూపబడుతున్నాయి`,
  },
  en: {
    badge: 'National Scheme Directory',
    title: 'Browse Government Schemes',
    subtitle: 'Explore welfare programs, subsidies, and scholarships across all central & state ministries.',
    searchPlaceholder: 'Search by scheme name or keyword…',
    allSchemes: 'All Schemes',
    agriculture: 'Agriculture',
    education: 'Education',
    housing: 'Housing',
    health: 'Health',
    business: 'Business & Micro-Loans',
    skill: 'Skill & Employment',
    social: 'Social Security',
    loading: 'Loading scheme catalog...',
    emptyTitle: 'No schemes found',
    emptySubtitle: 'Try searching with another keyword or select a different category.',
    resetFilters: 'Reset Filters',
    keyBenefit: 'Key Benefit / Subsidy',
    detailsBtn: 'Details',
    applyBtn: 'Apply',
    loadMoreBtn: 'Load More Schemes',
    loadingMore: 'Loading More Schemes...',
    allViewed: (total) => `You've viewed all ${total} available schemes in this category.`,
    showingCount: (current, total) => `Showing ${current} of ${total} total schemes`,
  },
};

const CATEGORY_COLORS = {
  agriculture: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-t-emerald-600', icon: 'bg-emerald-100 text-emerald-700' },
  education: { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-t-blue-600', icon: 'bg-blue-100 text-blue-700' },
  housing: { badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-t-amber-600', icon: 'bg-amber-100 text-amber-700' },
  health: { badge: 'bg-rose-50 text-rose-700 border-rose-200', border: 'border-t-rose-600', icon: 'bg-rose-100 text-rose-700' },
  business: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', border: 'border-t-indigo-600', icon: 'bg-indigo-100 text-indigo-700' },
  skill: { badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-t-purple-600', icon: 'bg-purple-100 text-purple-700' },
  social: { badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', border: 'border-t-cyan-600', icon: 'bg-cyan-100 text-cyan-700' },
  employment: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-t-emerald-600', icon: 'bg-emerald-100 text-emerald-700' },
};

function getCategoryIcon(cat) {
  switch (cat?.toLowerCase()) {
    case 'agriculture': return <Tractor className="w-4 h-4" />;
    case 'education': return <GraduationCap className="w-4 h-4" />;
    case 'housing': return <HomeIcon className="w-4 h-4" />;
    case 'health': return <Heart className="w-4 h-4" />;
    case 'business': return <Briefcase className="w-4 h-4" />;
    case 'skill': return <Zap className="w-4 h-4" />;
    case 'employment': return <TrendingUp className="w-4 h-4" />;
    case 'social': return <Shield className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
}

export default function SchemesPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = (i18n.language || 'en').slice(0, 2);
  const tPage = SCHEMES_PAGE_I18N[currentLang] || SCHEMES_PAGE_I18N['en'];

  const categories = [
    { id: 'all', label: tPage.allSchemes, icon: Sparkles },
    { id: 'agriculture', label: tPage.agriculture, icon: Tractor },
    { id: 'education', label: tPage.education, icon: GraduationCap },
    { id: 'housing', label: tPage.housing, icon: HomeIcon },
    { id: 'health', label: tPage.health, icon: Heart },
    { id: 'business', label: tPage.business, icon: Briefcase },
    { id: 'skill', label: tPage.skill, icon: Zap },
    { id: 'social', label: tPage.social, icon: Shield },
  ];

  const [schemes, setSchemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load first page of schemes when category or search changes
  const loadInitialSchemes = useCallback(async (cat, search) => {
    setInitialLoading(true);
    setPage(1);
    try {
      const data = await fetchBrowseSchemes({ page: 1, limit: 6, category: cat, search });
      setSchemes(data.schemes || []);
      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schemes');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialSchemes(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, loadInitialSchemes]);

  // Load More Handler: appends next batch of schemes
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await fetchBrowseSchemes({
        page: nextPage,
        limit: 6,
        category: selectedCategory,
        search: searchQuery,
      });

      setSchemes((prev) => [...prev, ...(data.schemes || [])]);
      setPage(nextPage);
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load more schemes');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tPage.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B] tracking-tight">
              {tPage.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {tPage.subtitle}
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tPage.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs shrink-0 ${
                  isSelected
                    ? 'bg-[#0A1633] text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {initialLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-xs text-slate-500 font-semibold">{tPage.loading}</span>
          </div>
        ) : schemes.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs max-w-md mx-auto my-8">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">{tPage.emptyTitle}</h3>
            <p className="text-xs text-slate-500 mb-4">{tPage.emptySubtitle}</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {tPage.resetFilters}
            </button>
          </div>
        ) : (
          /* Schemes Cards Grid */
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme) => {
                const catStyle = CATEGORY_COLORS[scheme.category?.toLowerCase()] || CATEGORY_COLORS.social;

                return (
                  <div
                    key={scheme.id}
                    className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 ${catStyle.border} border-t-4`}
                  >
                    <div>
                      {/* Top Bar: Icon + Category Badge */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${catStyle.icon}`}>
                          {getCategoryIcon(scheme.category)}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${catStyle.badge}`}>
                          {scheme.category || 'WELFARE'}
                        </span>
                      </div>

                      {/* Ministry */}
                      {scheme.ministry && (
                        <p className="text-[11px] font-semibold text-slate-400 mb-1 line-clamp-1">
                          {scheme.ministry}
                        </p>
                      )}

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                        {scheme.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                        {scheme.benefit_description || scheme.description}
                      </p>

                      {/* Key Benefit Box */}
                      {scheme.benefit_amount && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {tPage.keyBenefit}
                          </span>
                          <p className="text-xs sm:text-sm font-extrabold text-[#0B132B] mt-0.5">
                            {scheme.benefit_amount}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions: View Scheme & Apply */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{tPage.detailsBtn}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {scheme.apply_url && (
                        <a
                          href={scheme.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>{tPage.applyBtn}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button Section */}
            <div className="flex flex-col items-center justify-center gap-3 pt-4 pb-8">
              {hasMore ? (
                <button
                  id="schemes-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-[#0A1633] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                      <span>{tPage.loadingMore}</span>
                    </>
                  ) : (
                    <>
                      <span>{tPage.loadMoreBtn}</span>
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    </>
                  )}
                </button>
              ) : (
                schemes.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200 text-xs font-semibold text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tPage.allViewed(total)}</span>
                  </div>
                )
              )}

              {total > 0 && (
                <p className="text-[11px] text-slate-400 font-medium">
                  {tPage.showingCount(schemes.length, total)}
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
