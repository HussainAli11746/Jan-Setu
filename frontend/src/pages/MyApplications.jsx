import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Rocket, Construction,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  BellRing,
  ExternalLink,
  Layers,
  Inbox,
  CheckCircle2,
  Compass,
  Zap,
} from 'lucide-react';
import { fetchUserApplications } from '../services/api';
import { useTranslation } from 'react-i18next';

const APPS_I18N = {
  hi: {
    badge: 'विकासशील सुविधा',
    title: 'आवेदन ट्रैकर',
    futureNoticeTag: 'आगामी सुविधा (Coming Soon)',
    futureNoticeTitle: 'एकीकृत सरकारी आवेदन ट्रैकिंग सुविधा प्रगति पर है',
    futureNoticeDesc:
      'विभिन्न सरकारी पोर्टलों से सीधे आवेदन जमा करना और डिजिलॉकर (DigiLocker) के माध्यम से रीयल-टाइम स्थिति ट्रैक करने की सुविधा अभी विकास के अधीन है। वर्तमान में आप सीधे आधिकारिक सरकारी पोर्टलों पर आवेदन कर सकते हैं और जन-सेतु एक्सटेंशन द्वारा लाइव सहायता प्राप्त कर सकते हैं।',
    roadmap1Title: 'डिजिलॉकर दस्तावेज़ ऑटो-फ़िल',
    roadmap1Desc: 'सरकारी फॉर्मों में आधार और आय प्रमाण पत्र स्वचालित रूप से भरे जाएंगे।',
    roadmap2Title: 'प्रत्यक्ष लाभ (DBT) स्टेटस सिंक',
    roadmap2Desc: 'आपके बैंक खाते में भेजी जाने वाली सरकारी किस्तों का लाइव स्टेटस।',
    roadmap3Title: 'व्हाट्सएप एवं SMS अलर्ट',
    roadmap3Desc: 'आवेदन स्वीकृत होते ही तुरंत मोबाइल पर सूचना प्राप्त होगी।',
    browseSchemesBtn: 'योजनाएं खोजें और आवेदन करें',
    askAiBtn: 'AI सहायक से पूछें',
    sampleTitle: 'भविष्य में इस प्रकार दिखेगा आपका डैशबोर्ड:',
    demoTag: 'पूर्वावलोकन (Preview)',
    approved: 'स्वीकृत',
    pendingVerification: 'सत्यापन लंबित',
    underReview: 'विभागीय समीक्षाधीन',
    lastUpdated: 'अंतिम अपडेट',
    viewStatus: 'स्थिति देखें',
    loading: 'आवेदन लोड हो रहे हैं...',
  },
  bn: {
    badge: 'আসন্ন বৈশিষ্ট্য',
    title: 'আবেদন ট্র্যাকার',
    futureNoticeTag: 'আসন্ন বৈশিষ্ট্য (Coming Soon)',
    futureNoticeTitle: 'একত্রিত সরকারি আবেদন ট্র্যাকিং সিস্টেম তৈরি হচ্ছে',
    futureNoticeDesc:
      'বিভিন্ন সরকারি পোর্টাল থেকে সরাসরি আবেদন এবং ডিজিডিজিটাল লকারের মাধ্যমে রিয়েল-টাইম স্ট্যাটাস দেখার সুবিধা শীঘ্রই আসছে। বর্তমানে আপনি সরাসরি সরকারি পোর্টালে আবেদন করতে পারেন এবং জনসেতু এক্সটেনশন দিয়ে এআই গাইড ব্যবহার করতে পারেন।',
    roadmap1Title: 'ডিজিলকার অটো-ফিল',
    roadmap1Desc: 'সরকারি ফর্মে আধার ও আয়ের নথি স্বয়ংক্রিয়ভাবে যুক্ত হবে।',
    roadmap2Title: 'ডিবিটি (DBT) স্ট্যাটাস ট্র্যাকিং',
    roadmap2Desc: 'ব্যাংক অ্যাকাউন্টে টাকা পাঠানোর সরাসরি স্ট্যাটাস দেখা যাবে।',
    roadmap3Title: 'এসএমএস ও হোয়াটসঅ্যাপ নোটিফিকেশন',
    roadmap3Desc: 'আবেদন অনুমোদিত হলে তৎক্ষণাৎ মোবাইলে বার্তা পাবেন।',
    browseSchemesBtn: 'প্রকল্প দেখুন ও আবেদন করুন',
    askAiBtn: 'AI সহকারীকে জিজ্ঞাসা করুন',
    sampleTitle: 'ভবিষ্যতে আপনার ড্যাশবোর্ড যেভাবে দেখাবে:',
    demoTag: 'প্রিভিউ (Preview)',
    approved: 'অনুমোদিত',
    pendingVerification: 'যাচাইকরণ বাকি',
    underReview: 'পর্যালোচনাধীন',
    lastUpdated: 'সর্বশেষ আপডেট',
    viewStatus: 'স্ট্যাটাস দেখুন',
    loading: 'আবেদন লোড হচ্ছে...',
  },
  ta: {
    badge: 'வரவிருக்கும் அம்சம்',
    title: 'விண்ணப்ப கண்காணிப்பு',
    futureNoticeTag: 'வரவிருக்கும் வசதி (Coming Soon)',
    futureNoticeTitle: 'ஒருங்கிணைந்த அரசு விண்ணப்ப கண்காணிப்பு வசதி தயாராகிறது',
    futureNoticeDesc:
      'பல்வேறு அரசு இணையதளங்களின் விண்ணப்ப நிலையை ஒரே இடத்தில் கண்டறியும் முறை தற்போது உருவாக்கப்பட்டு வருகிறது. தற்போது நீங்கள் அதிகாரப்பூர்வ அரசு இணையதளங்களில் நேரடியாக விண்ணப்பித்து ஜன-சேது வழிகாட்டியைப் பயன்படுத்தலாம்.',
    roadmap1Title: 'டிஜிலாக்கர் ஆவண தானியங்கி நிரப்புதல்',
    roadmap1Desc: 'படிவங்களில் தேவையான ஆவணங்கள் தானாகவே இணைக்கப்படும்.',
    roadmap2Title: 'நேரடி பலன் (DBT) கண்காணிப்பு',
    roadmap2Desc: 'வங்கி கணக்கில் செலுத்தப்படும் தொகையின் நேரடி நிலவரம்.',
    roadmap3Title: 'வாட்ஸ்அப் & எஸ்எம்எஸ் எச்சரிக்கைகள்',
    roadmap3Desc: 'விண்ணப்பம் ஏற்கப்பட்டவுடன் உடனுக்குடன் செய்தி வரும்.',
    browseSchemesBtn: 'திட்டங்களை காண்க',
    askAiBtn: 'AI உதவியாளரிடம் கேளுங்கள்',
    sampleTitle: 'எதிர்காலத்தில் உங்கள் டேஷ்போர்டு இவ்வாறு தோன்றும்:',
    demoTag: 'முன்னோட்டம் (Preview)',
    approved: 'ஏற்கப்பட்டது',
    pendingVerification: 'சரிபார்ப்பு நிலுவையில்',
    underReview: 'ஆய்வில் உள்ளது',
    lastUpdated: 'கடைசி புதுப்பிப்பு',
    viewStatus: 'நிலையைக் காண்க',
    loading: 'ஏற்றப்படுகிறது...',
  },
  te: {
    badge: 'రాబోయే ఫీచర్',
    title: 'దరఖాస్తు ట్రాకర్',
    futureNoticeTag: 'రాబోయే ఫీచర్ (Coming Soon)',
    futureNoticeTitle: 'సమగ్ర ప్రభుత్వ దరఖాస్తు ట్రాకింగ్ వ్యవస్థ త్వరలో అందుబాటులోకి రానుంది',
    futureNoticeDesc:
      'వివిధ ప్రభుత్వ పోర్టల్‌ల నుండి ఒకే చోట దరఖాస్తుల స్థితిని ట్రాక్ చేసే వ్యవస్థ ప్రస్తుతం నిర్మాణంలో ఉంది. ప్రస్తుతం మీరు నేరుగా అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లలో దరఖాస్తు చేసుకోవచ్చు మరియు జన-సేతు AI గైడ్ సహాయం పొందవచ్చు.',
    roadmap1Title: 'డిజిలాకర్ డాక్యుమెంట్ ఆటో-ఫిల్',
    roadmap1Desc: 'దరఖాస్తు ఫారమ్‌లలో అవసరమైన పత్రాలు ఆటోమేటిక్‌గా జతచేయబడతాయి.',
    roadmap2Title: 'ప్రత్యక్ష బదిలీ (DBT) స్థితి ట్రాకింగ్',
    roadmap2Desc: 'బ్యాంక్ ఖాతాలో జమ అయ్యే సహాయ నిధుల ప్రత్యక్ష స్థితి.',
    roadmap3Title: 'వాట్సాప్ & SMS నోటిఫికేషన్లు',
    roadmap3Desc: 'దరఖాస్తు ఆమోదం పొందగానే వెంటనే మొబైల్‌కి సమాచారం అందుతుంది.',
    browseSchemesBtn: 'పథకాలను బ్రౌజ్ చేయండి',
    askAiBtn: 'AI అసిస్టెంట్‌ని అడగండి',
    sampleTitle: 'భవిష్యత్తులో మీ డాష్‌బోర్డ్ ఇలా కనిపిస్తుంది:',
    demoTag: 'ప్రివ్యూ (Preview)',
    approved: 'ఆమోదించబడింది',
    pendingVerification: 'ధృవీకరణ పెండింగ్‌లో ఉంది',
    underReview: 'సమీక్షలో ఉంది',
    lastUpdated: 'చివరి నవీకరణ',
    viewStatus: 'స్థితిని చూడండి',
    loading: 'దరఖాస్తులు లోడ్ అవుతున్నాయి...',
  },
  en: {
    badge: 'FEATURE IN DEVELOPMENT',
    title: 'Applications Tracker',
    futureNoticeTag: 'UPCOMING FEATURE · UNDER ACTIVE DEVELOPMENT',
    futureNoticeTitle: 'Unified Government Application Status Hub (Coming Soon)',
    futureNoticeDesc:
      'Direct cross-portal tracking, automated DigiLocker document synchronization, and centralized government scheme submissions are currently being integrated. In the meantime, you can apply directly on official government portals with live step-by-step assistance from the JanSetu Chrome Extension!',
    roadmap1Title: 'DigiLocker Form Auto-Fill',
    roadmap1Desc: 'Verified Aadhaar, Income & Caste certificates linked automatically.',
    roadmap2Title: 'Real-Time DBT Status Webhooks',
    roadmap2Desc: 'Live tracking of direct bank transfer installments from PFMS & state treasuries.',
    roadmap3Title: 'Instant WhatsApp & SMS Alerts',
    roadmap3Desc: 'Get notified immediately as your application clears departmental stages.',
    browseSchemesBtn: 'Browse Schemes & Apply',
    askAiBtn: 'Ask AI Assistant',
    sampleTitle: 'Preview: How your unified applications hub will look:',
    demoTag: 'Interactive Prototype',
    approved: 'Approved',
    pendingVerification: 'Pending Verification',
    underReview: 'Under Department Review',
    lastUpdated: 'Last updated',
    viewStatus: 'View Status',
    loading: 'Loading applications...',
  },
};

const DEMO_APPLICATIONS = [
  {
    id: 'PMK-2026-98124',
    schemeName: 'PM-KISAN Samman Nidhi',
    category: 'agriculture',
    status: 'approved',
    progressPercent: 100,
    updatedAt: '2 days ago',
    benefit: '₹6,000 / year (Next installment: ₹2,000)',
    portal: 'pmkisan.gov.in',
  },
  {
    id: 'PMAY-G-882103',
    schemeName: 'Pradhan Mantri Awas Yojana (Gramin)',
    category: 'housing',
    status: 'under_review',
    progressPercent: 65,
    updatedAt: 'Yesterday',
    benefit: '₹1.20 Lakh Housing Grant',
    portal: 'pmayg.nic.in',
  },
  {
    id: 'NSP-CSSS-449102',
    schemeName: 'Central Sector Scholarship (CSSS)',
    category: 'education',
    status: 'pending_verification',
    progressPercent: 40,
    updatedAt: '3 hours ago',
    benefit: '₹20,000 / year college scholarship',
    portal: 'scholarships.gov.in',
  },
];

export default function MyApplications() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n.language || 'en').slice(0, 2);
  const t = APPS_I18N[currentLang] || APPS_I18N['en'];

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUserApplications();
        if (data && data.length > 0) {
          setApplications(data);
        } else {
          setApplications(DEMO_APPLICATIONS);
        }
      } catch (err) {
        console.error(err);
        setApplications(DEMO_APPLICATIONS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.approved}</span>
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.pendingVerification}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 text-[11px] font-bold px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800/40">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span>{t.underReview}</span>
          </span>
        );
    }
  };

  const getProgressBarColor = (status) => {
    if (status === 'approved') return 'bg-emerald-600';
    if (status === 'pending_verification') return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0B0F19] py-8 sm:py-12 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* ── Main Upcoming Feature Announcement Card ────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1633] via-[#0F234D] to-[#1E293B] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 dark:border-slate-700">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-5">
            {/* Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[11px] font-black uppercase tracking-wider">
                <Rocket className="w-3.5 h-3.5 text-orange-400" />
                {t.futureNoticeTag}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold border border-white/10">
                <Layers className="w-3.5 h-3.5 text-indigo-300" />
                <span>Roadmap 2026</span>
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3">
                {t.futureNoticeTitle}
              </h1>
              <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed max-w-3xl">
                {t.futureNoticeDesc}
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/30">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{t.roadmap1Title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{t.roadmap1Desc}</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{t.roadmap2Title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{t.roadmap2Desc}</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{t.roadmap3Title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{t.roadmap3Desc}</p>
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/schemes')}
                className="bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{t.browseSchemesBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/assistant')}
                className="bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>{t.askAiBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Prototype Preview Section ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t.sampleTitle}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-transparent dark:border-slate-700">
                {t.demoTag}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-[#131B2E] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md border border-transparent dark:border-slate-700">
                      {app.id}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                    {app.schemeName}
                  </h3>

                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-4">
                    {app.benefit}
                  </p>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                        app.status
                      )}`}
                      style={{ width: `${app.progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-4">
                    <span>{t.lastUpdated}: {app.updatedAt}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{app.progressPercent}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {app.portal}
                  </span>
                  <a
                    href={`https://${app.portal}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-900 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 flex items-center gap-1 transition-colors"
                  >
                    <span>{t.viewStatus}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
