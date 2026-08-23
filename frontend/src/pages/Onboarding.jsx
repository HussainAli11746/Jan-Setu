import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, MapPin, Briefcase, DollarSign, CheckCircle2, Loader2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { value: 'en', label: 'English', native: 'English', desc: 'Default' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी', desc: 'राष्ट्रभाषा / Northern India' },
  { value: 'bn', label: 'Bengali', native: 'বাংলা', desc: 'Eastern India' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்', desc: 'Southern India' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు', desc: 'Southern India' },
];

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu',
  'Telangana','Uttar Pradesh','Uttarakhand','West Bengal',
];

const I18N_ONBOARDING = {
  hi: {
    quickSetup: (name) => `नमस्ते ${name || ''}! त्वरित प्रोफ़ाइल सेटअप`,
    subTitle: 'अपनी स्थिति बताएं ताकि हम आपके लिए सही सरकारी योजनाएँ ढूंढ सकें',
    stepOf: (cur, tot) => `चरण ${cur} / ${tot}`,
    percentComplete: (pct) => `${pct}% पूर्ण`,
    back: '← पिछला',
    skip: 'अभी छोड़ें',
    stateQuestion: 'आप किस राज्य में रहते हैं?',
    statePlaceholder: 'अपना राज्य चुनें…',
    finishBtn: 'सेटअप पूरा करें और होम पेज पर जाएं',
    savingBtn: 'प्रोफ़ाइल सहेजी जा रही है...',
    stateError: 'कृपया अपना राज्य चुनें',
    successToast: 'प्रोफ़ाइल सफलतापूर्वक सहेज ली गई! जन-सेतु में आपका स्वागत है 🎉',
    fields: [
      {
        id: 'ageCategory',
        label: 'आपकी आयु वर्ग क्या है?',
        icon: User,
        options: [
          { value: '18-25', label: '18 – 25 वर्ष', desc: 'युवा' },
          { value: '26-40', label: '26 – 40 वर्ष', desc: 'कार्यशील आयु' },
          { value: '41-60', label: '41 – 60 वर्ष', desc: 'मध्यम आयु' },
          { value: '60+', label: '60+ वर्ष', desc: 'वरिष्ठ नागरिक' },
        ],
      },
      {
        id: 'gender',
        label: 'आपका लिंग क्या है?',
        icon: User,
        options: [
          { value: 'male', label: 'पुरुष' },
          { value: 'female', label: 'महिला' },
          { value: 'other', label: 'अन्य / बताना नहीं चाहते' },
        ],
      },
      {
        id: 'incomeBracket',
        label: 'वार्षिक पारिवारिक आय लगभग कितनी है?',
        icon: DollarSign,
        options: [
          { value: '<1L', label: '₹1 लाख से कम', desc: 'बीपीएल / अल्प आय' },
          { value: '1-3L', label: '₹1 – 3 लाख', desc: 'निम्न मध्यम वर्ग' },
          { value: '3-8L', label: '₹3 – 8 लाख', desc: 'मध्यम वर्ग' },
          { value: '8L+', label: '₹8 लाख से अधिक', desc: 'उच्च आय वर्ग' },
        ],
      },
      {
        id: 'occupation',
        label: 'आपका मुख्य व्यवसाय / काम क्या है?',
        icon: Briefcase,
        options: [
          { value: 'Farmer', label: 'किसान / कृषि कार्य' },
          { value: 'Student', label: 'छात्र / विद्यार्थी' },
          { value: 'Salaried', label: 'वेतनभोगी कर्मचारी' },
          { value: 'Self-Employed', label: 'स्वरोजगार / व्यापारी / दुकानदार / वेंडर' },
          { value: 'Daily Wage Worker', label: 'दैनिक मजदूर / निर्माण श्रमिक' },
          { value: 'Unemployed', label: 'बेरोजगार / नौकरी की तलाश में' },
          { value: 'Homemaker', label: 'गृहिणी' },
        ],
      },
      {
        id: 'employmentStatus',
        label: 'रोजगार का प्रकार क्या है?',
        icon: Briefcase,
        options: [
          { value: 'government', label: 'सरकारी नौकरी' },
          { value: 'private', label: 'निजी कंपनी / प्राइवेट जॉब' },
          { value: 'self', label: 'स्वयं का व्यवसाय / दुकान' },
          { value: 'none', label: 'वर्तमान में कार्यरत नहीं' },
        ],
      },
    ],
  },
  bn: {
    quickSetup: (name) => `নমস্কার ${name || ''}! দ্রুত প্রোফাইল সেটআপ`,
    subTitle: 'আপনার বিবরণ দিন যাতে আমরা সঠিক সরকারি প্রকল্প খুঁজে দিতে পারি',
    stepOf: (cur, tot) => `ধাপ ${cur} / ${tot}`,
    percentComplete: (pct) => `${pct}% সম্পন্ন`,
    back: '← পূর্ববর্তী',
    skip: 'আপাতত এড়িয়ে যান',
    stateQuestion: 'আপনি কোন রাজ্যে বসবাস করেন?',
    statePlaceholder: 'আপনার রাজ্য নির্বাচন করুন…',
    finishBtn: 'সম্পূর্ণ করুন ও হোমে যান',
    savingBtn: 'প্রোফাইল সেভ হচ্ছে...',
    stateError: 'অনুগ্রহ করে আপনার রাজ্য নির্বাচন করুন',
    successToast: 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে! জন-সেতুতে স্বাগতম 🎉',
    fields: [
      {
        id: 'ageCategory',
        label: 'আপনার বয়স সীমা কত?',
        icon: User,
        options: [
          { value: '18-25', label: '১৮ – ২৫ বছর', desc: 'তরুণ' },
          { value: '26-40', label: '২৬ – ৪০ বছর', desc: 'কর্মক্ষম' },
          { value: '41-60', label: '৪১ – ৬০ বছর', desc: 'মধ্যবয়সী' },
          { value: '60+', label: '৬০+ বছর', desc: 'প্রবীণ নাগরিক' },
        ],
      },
      {
        id: 'gender',
        label: 'আপনার লিঙ্গ নির্বাচন করুন',
        icon: User,
        options: [
          { value: 'male', label: 'পুরুষ' },
          { value: 'female', label: 'মহিলা' },
          { value: 'other', label: 'অন্যান্য' },
        ],
      },
      {
        id: 'incomeBracket',
        label: 'বার্ষিক পারিবারিক আয় কত?',
        icon: DollarSign,
        options: [
          { value: '<1L', label: '১ লাখ টাকার কম', desc: 'বিপিএল' },
          { value: '1-3L', label: '১ – ৩ লাখ টাকা', desc: 'নিম্ন মধ্যবিত্ত' },
          { value: '3-8L', label: '৩ – ৮ লাখ টাকা', desc: 'মধ্যবিত্ত' },
          { value: '8L+', label: '৮ লাখ টাকার বেশি', desc: 'উচ্চ আয়' },
        ],
      },
      {
        id: 'occupation',
        label: 'আপনার মূল পেশা কি?',
        icon: Briefcase,
        options: [
          { value: 'Farmer', label: 'কৃষক / কৃষি কাজ' },
          { value: 'Student', label: 'ছাত্র / ছাত্রী' },
          { value: 'Salaried', label: 'চাকরিজীবী' },
          { value: 'Self-Employed', label: 'ব্যবসা / স্বনিযুক্ত' },
          { value: 'Daily Wage Worker', label: 'দিনমজুর / শ্রমিক' },
          { value: 'Unemployed', label: 'বেকার / চাকরি প্রার্থী' },
        ],
      },
      {
        id: 'employmentStatus',
        label: 'কর্মসংস্থানের অবস্থা',
        icon: Briefcase,
        options: [
          { value: 'government', label: 'সরকারি চাকরি' },
          { value: 'private', label: 'বেসরকারি চাকরি' },
          { value: 'self', label: 'নিজের ব্যবসা' },
          { value: 'none', label: 'কর্মহীন' },
        ],
      },
    ],
  },
  ta: {
    quickSetup: (name) => `வணக்கம் ${name || ''}! விரைவு விவர அமைப்பு`,
    subTitle: 'சரியான அரசு திட்டங்களை கண்டறிய உங்கள் விவரங்களை பகிருங்கள்',
    stepOf: (cur, tot) => `படி ${cur} / ${tot}`,
    percentComplete: (pct) => `${pct}% முடிந்தது`,
    back: '← பின்செல்',
    skip: 'தவிர்க்கவும்',
    stateQuestion: 'நீங்கள் எந்த மாநிலத்தில் வசிக்கிறீர்கள்?',
    statePlaceholder: 'உங்கள் மாநிலத்தை தேர்ந்தெடுக்கவும்…',
    finishBtn: 'முடிக்கவும்',
    savingBtn: 'சேமிக்கப்படுகிறது...',
    stateError: 'உங்கள் மாநிலத்தை தேர்வு செய்க',
    successToast: 'விவரங்கள் சேமிக்கப்பட்டன! ஜன-சேதுவிற்கு நல்வரவு 🎉',
    fields: [
      {
        id: 'ageCategory',
        label: 'உங்கள் வயது வரம்பு என்ன?',
        icon: User,
        options: [
          { value: '18-25', label: '18 – 25 வயது', desc: 'இளைஞர்' },
          { value: '26-40', label: '26 – 40 வயது', desc: 'பணியாற்றும் வயது' },
          { value: '41-60', label: '41 – 60 வயது', desc: 'நடுத்தர வயது' },
          { value: '60+', label: '60+ வயது', desc: 'மூத்த குடிமக்கள்' },
        ],
      },
      {
        id: 'gender',
        label: 'பாலினம்',
        icon: User,
        options: [
          { value: 'male', label: 'ஆண்' },
          { value: 'female', label: 'பெண்' },
          { value: 'other', label: 'மற்றவை' },
        ],
      },
      {
        id: 'incomeBracket',
        label: 'ஆண்டு குடும்ப வருமானம் எவ்வளவு?',
        icon: DollarSign,
        options: [
          { value: '<1L', label: '₹1 லட்சத்திற்கு கீழ்', desc: 'குறைந்த வருமானம்' },
          { value: '1-3L', label: '₹1 – 3 லட்சம்', desc: 'நடுத்தர வருமானம்' },
          { value: '3-8L', label: '₹3 – 8 லட்சம்', desc: 'மத்திய வருமானம்' },
          { value: '8L+', label: '₹8 லட்சத்திற்கு மேல்', desc: 'அதிக வருமானம்' },
        ],
      },
      {
        id: 'occupation',
        label: 'உங்கள் முதன்மை தொழில் என்ன?',
        icon: Briefcase,
        options: [
          { value: 'Farmer', label: 'விவசாயி' },
          { value: 'Student', label: 'மாணவர்' },
          { value: 'Salaried', label: 'மாத சம்பளம்' },
          { value: 'Self-Employed', label: 'சுயதொழில் / வியாபாரம்' },
          { value: 'Daily Wage Worker', label: 'தினக்கூலி' },
          { value: 'Unemployed', label: 'வேலையில்லாதவர்' },
        ],
      },
      {
        id: 'employmentStatus',
        label: 'வேலைவாய்ப்பு நிலை',
        icon: Briefcase,
        options: [
          { value: 'government', label: 'அரசு பணி' },
          { value: 'private', label: 'தனியார் பணி' },
          { value: 'self', label: 'சொந்த தொழில்' },
          { value: 'none', label: 'வேலை இல்லை' },
        ],
      },
    ],
  },
  te: {
    quickSetup: (name) => `నమస్తే ${name || ''}! ప్రొఫైల్ సెటప్`,
    subTitle: 'సరైన సంక్షేమ పథకాలను కనుగొనడానికి మీ వివరాలను తెలియజేయండి',
    stepOf: (cur, tot) => `దశ ${cur} / ${tot}`,
    percentComplete: (pct) => `${pct}% పూర్తయింది`,
    back: '← వెనుకకు',
    skip: 'దాటవేయండి',
    stateQuestion: 'మీరు ఏ రాష్ట్రంలో నివసిస్తున్నారు?',
    statePlaceholder: 'మీ రాష్ట్రాన్ని ఎంచుకోండి…',
    finishBtn: 'పూర్తి చేసి హోమ్‌కు వెళ్లండి',
    savingBtn: 'సేవ్ చేయబడుతోంది...',
    stateError: 'దయచేసి మీ రాష్ట్రాన్ని ఎంచుకోండి',
    successToast: 'వివరాలు విజయవంతంగా సేవ్ చేయబడ్డాయి! 🎉',
    fields: [
      {
        id: 'ageCategory',
        label: 'మీ వయస్సు వర్గం ఏమిటి?',
        icon: User,
        options: [
          { value: '18-25', label: '18 – 25 సంవత్సరాలు', desc: 'యువత' },
          { value: '26-40', label: '26 – 40 సంవత్సరాలు', desc: 'ఉద్యోగ వయస్సు' },
          { value: '41-60', label: '41 – 60 సంవత్సరాలు', desc: 'మధ్య వయస్సు' },
          { value: '60+', label: '60+ సంవత్సరాలు', desc: 'సీనియర్ సిటిజన్' },
        ],
      },
      {
        id: 'gender',
        label: 'లింగం',
        icon: User,
        options: [
          { value: 'male', label: 'పురుషుడు' },
          { value: 'female', label: 'స్త్రీ' },
          { value: 'other', label: 'ఇతర' },
        ],
      },
      {
        id: 'incomeBracket',
        label: 'వార్షిక కుటుంబ ఆదాయం ఎంత?',
        icon: DollarSign,
        options: [
          { value: '<1L', label: '₹1 లక్ష కంటే తక్కువ', desc: 'తక్కువ ఆదాయం' },
          { value: '1-3L', label: '₹1 – 3 లక్షలు', desc: 'దిగువ మధ్యతరగతి' },
          { value: '3-8L', label: '₹3 – 8 లక్షలు', desc: 'మధ్యతరగతి' },
          { value: '8L+', label: '₹8 లక్షల కంటే ఎక్కువ', desc: 'ఎక్కువ ఆదాయం' },
        ],
      },
      {
        id: 'occupation',
        label: 'మీ ప్రాథమిక వృత్తి ఏమిటి?',
        icon: Briefcase,
        options: [
          { value: 'Farmer', label: 'రైతు / వ్యవసాయం' },
          { value: 'Student', label: 'విద్యార్థి' },
          { value: 'Salaried', label: 'ఉద్యోగి' },
          { value: 'Self-Employed', label: 'స్వయం ఉపాధి / వ్యాపారం' },
          { value: 'Daily Wage Worker', label: 'దినసరి కూలీ' },
          { value: 'Unemployed', label: 'నిరుద్యోగి' },
        ],
      },
      {
        id: 'employmentStatus',
        label: 'ఉపాధి రకం',
        icon: Briefcase,
        options: [
          { value: 'government', label: 'ప్రభుత్వ ఉద్యోగం' },
          { value: 'private', label: 'ప్రైవేట్ ఉద్యోగం' },
          { value: 'self', label: 'సొంత వ్యాపారం' },
          { value: 'none', label: 'ఉద్యోగం లేదు' },
        ],
      },
    ],
  },
  en: {
    quickSetup: (name) => `Quick setup, ${name || ''}!`,
    subTitle: 'Help us personalise your scheme recommendations',
    stepOf: (cur, tot) => `Step ${cur} of ${tot}`,
    percentComplete: (pct) => `${pct}% complete`,
    back: '← Back',
    skip: 'Skip for now',
    stateQuestion: 'Which state do you live in?',
    statePlaceholder: 'Select your state…',
    finishBtn: 'Complete & Go to Home',
    savingBtn: 'Saving profile...',
    stateError: 'Please select your state',
    successToast: 'Profile saved! Welcome to JanSetu 🎉',
    fields: [
      {
        id: 'ageCategory',
        label: 'Age Category',
        icon: User,
        options: [
          { value: '18-25', label: '18 – 25 years', desc: 'Young adult' },
          { value: '26-40', label: '26 – 40 years', desc: 'Working age' },
          { value: '41-60', label: '41 – 60 years', desc: 'Mid-career' },
          { value: '60+', label: '60+ years', desc: 'Senior citizen' },
        ],
      },
      {
        id: 'gender',
        label: 'Gender',
        icon: User,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other / Prefer not to say' },
        ],
      },
      {
        id: 'incomeBracket',
        label: 'Annual Family Income',
        icon: DollarSign,
        options: [
          { value: '<1L', label: 'Below ₹1 Lakh', desc: 'BPL / Low income' },
          { value: '1-3L', label: '₹1 – 3 Lakh', desc: 'Lower middle' },
          { value: '3-8L', label: '₹3 – 8 Lakh', desc: 'Middle income' },
          { value: '8L+', label: 'Above ₹8 Lakh', desc: 'Higher income' },
        ],
      },
      {
        id: 'occupation',
        label: 'Primary Occupation',
        icon: Briefcase,
        options: [
          { value: 'Farmer', label: 'Farmer / Agricultural worker' },
          { value: 'Student', label: 'Student' },
          { value: 'Salaried', label: 'Salaried employee' },
          { value: 'Self-Employed', label: 'Self-employed / Business / Vendor' },
          { value: 'Daily Wage Worker', label: 'Daily wage / Labour' },
          { value: 'Unemployed', label: 'Unemployed / Job seeker' },
        ],
      },
      {
        id: 'employmentStatus',
        label: 'Employment Status',
        icon: Briefcase,
        options: [
          { value: 'government', label: 'Government employee' },
          { value: 'private', label: 'Private sector' },
          { value: 'self', label: 'Self / Business owner' },
          { value: 'none', label: 'Not currently employed' },
        ],
      },
    ],
  },
};

export default function Onboarding() {
  const { user, saveProfile } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0 = Language, 1..N = Fields, Last = State
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [answers, setAnswers] = useState({ language: i18n.language || 'en' });
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const activeDict = I18N_ONBOARDING[selectedLang] || I18N_ONBOARDING['en'];
  const FIELDS = activeDict.fields;

  // Steps sequence: Step 0: Language, Steps 1..FIELDS.length: Fields, Step (FIELDS.length+1): State
  const totalSteps = 1 + FIELDS.length + 1; // Language + Fields + State
  const isLanguageStep = step === 0;
  const isStateStep = step === totalSteps - 1;
  const currentField = !isLanguageStep && !isStateStep ? FIELDS[step - 1] : null;
  const progress = Math.round(((step) / totalSteps) * 100);

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setSelectedLang(langCode);
    setAnswers(prev => ({ ...prev, language: langCode }));
    setTimeout(() => setStep(1), 220);
  };

  const handleOption = (value) => {
    setAnswers(prev => ({ ...prev, [currentField.id]: value }));
    setTimeout(() => setStep(step + 1), 220);
  };

  const handleFinish = async () => {
    if (!state) return toast.error(activeDict.stateError);
    setLoading(true);
    try {
      await saveProfile({
        ...answers,
        state,
        language: selectedLang,
      });
      toast.success(activeDict.successToast);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0B0F19] flex items-center justify-center px-4 py-12 transition-colors duration-200">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-50/60 dark:bg-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-50/40 dark:bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#0A1633] dark:bg-slate-800 flex items-center justify-center shadow-lg mx-auto mb-3 border border-transparent dark:border-slate-700">
            <span className="text-orange-400 font-extrabold text-xl">J</span>
            <span className="text-white font-extrabold text-xl">S</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#0B132B] dark:text-white">
            {isLanguageStep ? 'Choose your language / अपनी भाषा चुनें' : activeDict.quickSetup(firstName)}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isLanguageStep ? 'The entire platform and form will be in your chosen language' : activeDict.subTitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isLanguageStep ? 'Step 1 of ' + totalSteps : activeDict.stepOf(step + 1, totalSteps)}
            </span>
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              {activeDict.percentComplete(progress)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl shadow-xl dark:shadow-none border border-slate-200/80 dark:border-slate-700 p-8 min-h-[350px]">
          {isLanguageStep ? (
            /* Step 0: Language Selection */
            <div key="language-step" className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center border border-transparent dark:border-orange-800/40">
                  <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Select Preferred Language / भाषा चुनें</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {LANGUAGES.map((lang) => {
                  const selected = selectedLang === lang.value;
                  return (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageSelect(lang.value)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-between group ${
                        selected
                          ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-400 dark:border-orange-600 text-orange-900 dark:text-orange-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-slate-900 dark:text-white">{lang.native}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">({lang.label})</span>
                      </div>
                      {selected ? (
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-400 shrink-0 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : !isStateStep ? (
            /* Demographic field steps in the selected language */
            <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center border border-transparent dark:border-orange-800/40">
                  {React.createElement(currentField.icon, { className: 'w-4 h-4 text-orange-600 dark:text-orange-400' })}
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentField.label}</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {currentField.options.map((opt) => {
                  const selected = answers[currentField.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleOption(opt.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-between group ${
                        selected
                          ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-400 dark:border-orange-600 text-orange-800 dark:text-orange-200'
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{opt.label}</span>
                        {opt.desc && <span className="text-xs text-slate-400 dark:text-slate-400 ml-2">· {opt.desc}</span>}
                      </div>
                      {selected ? (
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-400 shrink-0 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* State picker step in selected language */
            <div key="state-step" className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center border border-transparent dark:border-orange-800/40">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeDict.stateQuestion}</h2>
              </div>
              <select
                id="onboarding-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all mb-6"
              >
                <option value="" className="dark:bg-slate-800 dark:text-slate-300">{activeDict.statePlaceholder}</option>
                {STATES.map((s) => (
                  <option key={s} value={s} className="dark:bg-slate-800 dark:text-slate-100">{s}</option>
                ))}
              </select>

              <button
                id="onboarding-finish"
                onClick={handleFinish}
                disabled={!state || loading}
                className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>{activeDict.savingBtn}</span></>
                ) : (
                  <><span>{activeDict.finishBtn}</span><ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Back and Skip controls */}
        <div className="flex justify-between items-center mt-4">
          {step > 0 ? (
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
            >
              {activeDict.back}
            </button>
          ) : <div />}
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors underline underline-offset-2"
          >
            {activeDict.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
