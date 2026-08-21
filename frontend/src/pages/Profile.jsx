import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, MapPin, CheckCircle2, Shield, Calendar, Key, Globe,
  Briefcase, DollarSign, Award, Bookmark, FileText, PieChart,
  Edit3, Check, Loader2, LogOut, ArrowRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getApplications } from '../services/store';
import SignOutModal from '../components/Common/SignOutModal';
import LanguageChangeModal from '../components/Common/LanguageChangeModal';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const PROFILE_I18N = {
  hi: {
    matchedSchemes: 'मैच की गई योजनाएँ',
    savedSchemes: 'सहेजी गई योजनाएँ',
    totalApplications: 'कुल आवेदन',
    profileCompleteness: 'प्रोफ़ाइल पूर्णता',
    activeStatus: 'सक्रिय',
    verifiedCitizen: 'सत्यापित नागरिक',
    tabOverview: 'प्रोफ़ाइल अवलोकन',
    tabAccount: 'खाता विवरण',
    tabPreferences: 'प्राथमिकताएँ एवं भाषा',
    tabDemographic: 'जनसांख्यिकीय प्रोफ़ाइल',
    signOut: 'लॉग आउट',
    secAccountTitle: 'बुनियादी खाता जानकारी',
    fullNameLabel: 'पूरा नाम',
    emailLabel: 'ईमेल पता',
    memberSinceLabel: 'सदस्यता आरंभ',
    memberSinceVal: 'जनवरी 2024',
    securityLabel: 'सुरक्षा',
    changePasswordBtn: 'पासवर्ड बदलें',
    secPrefTitle: 'प्राथमिकताएँ एवं भाषा',
    secPrefDesc: 'जन-सेतु और AI सहायक के साथ अपनी बातचीत के लिए पसंदीदा भाषा चुनें।',
    prefLangLabel: 'पसंदीदा भाषा',
    secDemoTitle: 'नागरिक जनसांख्यिकीय प्रोफ़ाइल',
    secDemoDesc: 'यह जानकारी आपकी सरकारी योजनाओं की पात्रता तय करने के लिए उपयोग की जाती है।',
    ageLabel: 'आयु वर्ग',
    genderLabel: 'लिंग',
    stateLabel: 'आवासीय राज्य',
    incomeLabel: 'वार्षिक पारिवारिक आय',
    occupationLabel: 'मुख्य व्यवसाय / कार्य',
    employmentLabel: 'रोजगार की स्थिति',
    saveBtn: 'प्रोफ़ाइल सहेजें',
    savingBtn: 'सहेजी जा रही है...',
    saveSuccess: 'प्रोफ़ाइल सफलतापूर्वक सहेज ली गई! ✨',
    pwdResetSent: 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है',
    ageOptions: [
      { value: '18-25', label: '18 – 25 वर्ष (युवा)' },
      { value: '26-40', label: '26 – 40 वर्ष (कार्यशील)' },
      { value: '41-60', label: '41 – 60 वर्ष (मध्यम)' },
      { value: '60+', label: '60+ वर्ष (वरिष्ठ नागरिक)' },
    ],
    genderOptions: [
      { value: 'male', label: 'पुरुष' },
      { value: 'female', label: 'महिला' },
      { value: 'other', label: 'अन्य / बताना नहीं चाहते' },
    ],
    incomeOptions: [
      { value: '<1L', label: '₹1 लाख से कम (बीपीएल)' },
      { value: '1-3L', label: '₹1 लाख – ₹3 लाख' },
      { value: '3-8L', label: '₹3 लाख – ₹8 लाख' },
      { value: '8L+', label: '₹8 लाख से अधिक' },
    ],
    occOptions: [
      { value: 'Farmer', label: 'किसान / कृषि कार्य' },
      { value: 'Student', label: 'छात्र / विद्यार्थी' },
      { value: 'Salaried', label: 'वेतनभोगी कर्मचारी' },
      { value: 'Self-Employed', label: 'स्वरोजगार / व्यापारी / दुकानदार' },
      { value: 'Daily Wage Worker', label: 'दैनिक मजदूर / श्रमिक' },
      { value: 'Unemployed', label: 'बेरोजगार / नौकरी की तलाश' },
      { value: 'Homemaker', label: 'गृहिणी' },
    ],
    empOptions: [
      { value: 'government', label: 'सरकारी नौकरी' },
      { value: 'private', label: 'निजी कंपनी / प्राइवेट' },
      { value: 'self', label: 'स्वरोजगार / अपना व्यवसाय' },
      { value: 'none', label: 'कार्यरत नहीं' },
    ],
  },
  bn: {
    matchedSchemes: 'মেলানো প্রকল্প',
    savedSchemes: 'সংরক্ষিত প্রকল্প',
    totalApplications: 'মোট আবেদন',
    profileCompleteness: 'প্রোফাইল সম্পূর্ণতা',
    activeStatus: 'সক্রিয়',
    verifiedCitizen: 'যাচাইকৃত নাগরিক',
    tabOverview: 'প্রোফাইল ওভারভিউ',
    tabAccount: 'অ্যাকাউন্ট তথ্য',
    tabPreferences: 'পছন্দ ও ভাষা',
    tabDemographic: 'নাগরিক প্রোফাইল',
    signOut: 'সাইন আউট',
    secAccountTitle: 'মৌলিক অ্যাকাউন্ট তথ্য',
    fullNameLabel: 'পুরো নাম',
    emailLabel: 'ইমেল ঠিকানা',
    memberSinceLabel: 'সদস্যপদ শুরু',
    memberSinceVal: 'জানুয়ারি ২০২৪',
    securityLabel: 'নিরাপত্তা',
    changePasswordBtn: 'পাসওয়ার্ড পরিবর্তন',
    secPrefTitle: 'পছন্দ ও ভাষা',
    secPrefDesc: 'জন-সেতু এবং AI সহকারীর সাথে কথা বলার জন্য পছন্দের ভাষা বেছে নিন।',
    prefLangLabel: 'পছন্দের ভাষা',
    secDemoTitle: 'নাগরিক জনসংখ্যার প্রোফাইল',
    secDemoDesc: 'সরকারি প্রকল্পে আপনার যোগ্যতা মেলাতে এই তথ্য ব্যবহৃত হয়।',
    ageLabel: 'বয়স সীমা',
    genderLabel: 'লিঙ্গ',
    stateLabel: 'বসবাসের রাজ্য',
    incomeLabel: 'বার্ষিক পারিবারিক আয়',
    occupationLabel: 'মূল পেশা',
    employmentLabel: 'কর্মসংস্থানের অবস্থা',
    saveBtn: 'প্রোফাইল সেভ করুন',
    savingBtn: 'সংরক্ষণ হচ্ছে...',
    saveSuccess: 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে! ✨',
    pwdResetSent: 'পাসওয়ার্ড রিসেট লিঙ্ক ইমেলে পাঠানো হয়েছে',
    ageOptions: [
      { value: '18-25', label: '১৮ – ২৫ বছর' },
      { value: '26-40', label: '২৬ – ৪০ বছর' },
      { value: '41-60', label: '৪১ – ৬০ বছর' },
      { value: '60+', label: '৬০+ বছর' },
    ],
    genderOptions: [
      { value: 'male', label: 'পুরুষ' },
      { value: 'female', label: 'মহিলা' },
      { value: 'other', label: 'অন্যান্য' },
    ],
    incomeOptions: [
      { value: '<1L', label: '১ লাখের নিচে' },
      { value: '1-3L', label: '১ – ৩ লাখ টাকা' },
      { value: '3-8L', label: '৩ – ৮ লাখ টাকা' },
      { value: '8L+', label: '৮ লাখের বেশি' },
    ],
    occOptions: [
      { value: 'Farmer', label: 'কৃষক / কৃষি কাজ' },
      { value: 'Student', label: 'ছাত্র / ছাত্রী' },
      { value: 'Salaried', label: 'চাকরিজীবী' },
      { value: 'Self-Employed', label: 'ব্যবসা / স্বনিযুক্ত' },
      { value: 'Daily Wage Worker', label: 'দিনমজুর / শ্রমিক' },
      { value: 'Unemployed', label: 'বেকার' },
    ],
    empOptions: [
      { value: 'government', label: 'সরকারি চাকরি' },
      { value: 'private', label: 'বেসরকারি চাকরি' },
      { value: 'self', label: 'স্বনিয়োজিত' },
      { value: 'none', label: 'কর্মহীন' },
    ],
  },
  ta: {
    matchedSchemes: 'பொருத்தப்பட்ட திட்டங்கள்',
    savedSchemes: 'சேமிக்கப்பட்ட திட்டங்கள்',
    totalApplications: 'மொத்த விண்ணப்பங்கள்',
    profileCompleteness: 'விவர அமைப்பு நிலை',
    activeStatus: 'செயலில்',
    verifiedCitizen: 'சரிபார்க்கப்பட்ட குடிமகன்',
    tabOverview: 'விவரக் கண்ணோட்டம்',
    tabAccount: 'கணக்கு தகவல்',
    tabPreferences: 'விருப்பங்கள் & மொழி',
    tabDemographic: 'மக்கள் தொகை விவரம்',
    signOut: 'வெளியேறு',
    secAccountTitle: 'அடிப்படைக் கணக்கு தகவல்',
    fullNameLabel: 'முழுப் பெயர்',
    emailLabel: 'மின்னஞ்சல் முகவரி',
    memberSinceLabel: 'சேர்ந்த நாள்',
    memberSinceVal: 'ஜனவரி 2024',
    securityLabel: 'பாதுகாப்பு',
    changePasswordBtn: 'கடவுச்சொல்லை மாற்றுக',
    secPrefTitle: 'விருப்பங்கள் & மொழி',
    secPrefDesc: 'ஜன-சேது தளம் மற்றும் AI உதவியாளருக்கான மொழியைத் தேர்ந்தெடுக்கவும்.',
    prefLangLabel: 'விருப்பமான மொழி',
    secDemoTitle: 'குடிமக்கள் மக்கள்தொகை விவரம்',
    secDemoDesc: 'அரசு நலத்திட்ட தகுதியை சரிபார்க்க இந்த விவரங்கள் பயன்படுகின்றன.',
    ageLabel: 'வயது வரம்பு',
    genderLabel: 'பாலினம்',
    stateLabel: 'வசிக்கும் மாநிலம்',
    incomeLabel: 'ஆண்டு குடும்ப வருமானம்',
    occupationLabel: 'முதன்மை தொழில்',
    employmentLabel: 'வேலைவாய்ப்பு நிலை',
    saveBtn: 'விவரங்களை சேமிக்கவும்',
    savingBtn: 'சேமிக்கப்படுகிறது...',
    saveSuccess: 'விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன! ✨',
    pwdResetSent: 'கடவுச்சொல் மீட்டமைப்பு இணைப்பு மின்னஞ்சலுக்கு அனுப்பப்பட்டது',
    ageOptions: [
      { value: '18-25', label: '18 – 25 வயது' },
      { value: '26-40', label: '26 – 40 வயது' },
      { value: '41-60', label: '41 – 60 வயது' },
      { value: '60+', label: '60+ வயது' },
    ],
    genderOptions: [
      { value: 'male', label: 'ஆண்' },
      { value: 'female', label: 'பெண்' },
      { value: 'other', label: 'மற்றவை' },
    ],
    incomeOptions: [
      { value: '<1L', label: '₹1 லட்சத்திற்கு கீழ்' },
      { value: '1-3L', label: '₹1 – 3 லட்சம்' },
      { value: '3-8L', label: '₹3 – 8 லட்சம்' },
      { value: '8L+', label: '₹8 லட்சத்திற்கு மேல்' },
    ],
    occOptions: [
      { value: 'Farmer', label: 'விவசாயி' },
      { value: 'Student', label: 'மாணவர்' },
      { value: 'Salaried', label: 'மாத சம்பளம்' },
      { value: 'Self-Employed', label: 'சுயதொழில் / வியாபாரம்' },
      { value: 'Daily Wage Worker', label: 'தினக்கூலி' },
      { value: 'Unemployed', label: 'வேலையில்லாதவர்' },
    ],
    empOptions: [
      { value: 'government', label: 'அரசு பணி' },
      { value: 'private', label: 'தனியார் பணி' },
      { value: 'self', label: 'சுயதொழில்' },
      { value: 'none', label: 'வேலை இல்லை' },
    ],
  },
  te: {
    matchedSchemes: 'సరిపోలిన పథకాలు',
    savedSchemes: 'సేవ్ చేసిన పథకాలు',
    totalApplications: 'మొత్తం దరఖాస్తులు',
    profileCompleteness: 'ప్రొఫైల్ పూర్తి',
    activeStatus: 'క్రియాశీలం',
    verifiedCitizen: 'ధృవీకరించబడిన పౌరుడు',
    tabOverview: 'ప్రొఫైల్ అవలోకనం',
    tabAccount: 'ఖాతా వివరాలు',
    tabPreferences: 'ప్రాధాన్యతలు & భాష',
    tabDemographic: 'జనాభా ప్రొఫైల్',
    signOut: 'లాగ్ అవుట్',
    secAccountTitle: 'ప్రాథమిక ఖాతా సమాచారం',
    fullNameLabel: 'పూర్తి పేరు',
    emailLabel: 'ఇమెయిల్ చిరునామా',
    memberSinceLabel: 'చేరిన తేదీ',
    memberSinceVal: 'జనవరి 2024',
    securityLabel: 'భద్రత',
    changePasswordBtn: 'పాస్‌వర్డ్ మార్చండి',
    secPrefTitle: 'ప్రాధాన్యతలు & భాష',
    secPrefDesc: 'జన-సేతు AI అసిస్టెంట్‌తో మాట్లాడటానికి మీ భాషను ఎంచుకోండి.',
    prefLangLabel: 'ఇష్టపడే భాష',
    secDemoTitle: 'పౌరుల జనాభా ప్రొఫైల్',
    secDemoDesc: 'ప్రభుత్వ సంక్షేమ పథకాల అర్హతను సరిపోల్చడానికి ఈ సమాచారం ఉపయోగించబడుతుంది.',
    ageLabel: 'వయస్సు వర్గం',
    genderLabel: 'లింగం',
    stateLabel: 'నివాస రాష్ట్రం',
    incomeLabel: 'వార్షిక కుటుంబ ఆదాయం',
    occupationLabel: 'ప్రాథమిక వృత్తి',
    employmentLabel: 'ఉపాధి స్థితి',
    saveBtn: 'ప్రొఫైల్ సేవ్ చేయండి',
    savingBtn: 'సేవ్ చేయబడుతోంది...',
    saveSuccess: 'ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది! ✨',
    pwdResetSent: 'పాస్‌వర్డ్ రీసెట్ లింక్ ఇమెయిల్‌కు పంపబడింది',
    ageOptions: [
      { value: '18-25', label: '18 – 25 సంవత్సరాలు' },
      { value: '26-40', label: '26 – 40 సంవత్సరాలు' },
      { value: '41-60', label: '41 – 60 సంవత్సరాలు' },
      { value: '60+', label: '60+ సంవత్సరాలు' },
    ],
    genderOptions: [
      { value: 'male', label: 'పురుషుడు' },
      { value: 'female', label: 'స్త్రీ' },
      { value: 'other', label: 'ఇతర' },
    ],
    incomeOptions: [
      { value: '<1L', label: '₹1 లక్ష కంటే తక్కువ' },
      { value: '1-3L', label: '₹1 – 3 లక్షలు' },
      { value: '3-8L', label: '₹3 – 8 లక్షలు' },
      { value: '8L+', label: '₹8 లక్షల కంటే ఎక్కువ' },
    ],
    occOptions: [
      { value: 'Farmer', label: 'రైతు / వ్యవసాయం' },
      { value: 'Student', label: 'విద్యార్థి' },
      { value: 'Salaried', label: 'ఉద్యోగి' },
      { value: 'Self-Employed', label: 'వ్యాపారం / స్వయం ఉపాధి' },
      { value: 'Daily Wage Worker', label: 'దినసరి కూలీ' },
      { value: 'Unemployed', label: 'నిరుద్యోగి' },
    ],
    empOptions: [
      { value: 'government', label: 'ప్రభుత్వ ఉద్యోగం' },
      { value: 'private', label: 'ప్రైవేట్ ఉద్యోగం' },
      { value: 'self', label: 'స్వయం ఉపాధి' },
      { value: 'none', label: 'ఉద్యోగం లేదు' },
    ],
  },
  en: {
    matchedSchemes: 'Matched Schemes',
    savedSchemes: 'Saved Schemes',
    totalApplications: 'Total Applications',
    profileCompleteness: 'Profile Completeness',
    activeStatus: 'Active',
    verifiedCitizen: 'Verified Citizen',
    tabOverview: 'Profile Overview',
    tabAccount: 'Basic Account Info',
    tabPreferences: 'Preferences & Localization',
    tabDemographic: 'Demographic Profile',
    signOut: 'Sign Out',
    secAccountTitle: 'Basic Account Info',
    fullNameLabel: 'Full Name',
    emailLabel: 'Email Address',
    memberSinceLabel: 'Member Since',
    memberSinceVal: 'January 2024',
    securityLabel: 'Security',
    changePasswordBtn: 'Change Password',
    secPrefTitle: 'Preferences & Localization',
    secPrefDesc: 'Choose the language you want to interact with on the JanSetu platform and AI assistant.',
    prefLangLabel: 'Preferred Language',
    secDemoTitle: 'Citizen Demographic Profile',
    secDemoDesc: 'This profile information is used to match and verify government scheme eligibility.',
    ageLabel: 'Age Category',
    genderLabel: 'Gender',
    stateLabel: 'Residential State',
    incomeLabel: 'Annual Family Income Bracket',
    occupationLabel: 'Primary Occupation',
    employmentLabel: 'Employment Status',
    saveBtn: 'Save Profile',
    savingBtn: 'Saving Profile...',
    saveSuccess: 'Profile updated successfully! ✨',
    pwdResetSent: 'Password reset verification email sent to your email',
    ageOptions: [
      { value: '18-25', label: '18 – 25 Years' },
      { value: '26-40', label: '26 – 40 Years' },
      { value: '41-60', label: '41 – 60 Years' },
      { value: '60+', label: '60+ Years' },
    ],
    genderOptions: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other / Prefer not to say' },
    ],
    incomeOptions: [
      { value: '<1L', label: 'Below ₹1 Lakh' },
      { value: '1-3L', label: '₹1 Lakh – ₹3 Lakhs' },
      { value: '3-8L', label: '₹3 Lakhs – ₹8 Lakhs' },
      { value: '8L+', label: 'Above ₹8 Lakhs' },
    ],
    occOptions: [
      { value: 'Farmer', label: 'Farmer / Agriculture' },
      { value: 'Student', label: 'Student' },
      { value: 'Salaried', label: 'Salaried Employee' },
      { value: 'Self-Employed', label: 'Small Business / Vendor' },
      { value: 'Daily Wage Worker', label: 'Daily Wage Worker' },
      { value: 'Unemployed', label: 'Unemployed / Job Seeker' },
      { value: 'Homemaker', label: 'Homemaker' },
    ],
    empOptions: [
      { value: 'government', label: 'Government Employee' },
      { value: 'private', label: 'Private Sector' },
      { value: 'self', label: 'Self-Employed' },
      { value: 'none', label: 'Not Employed' },
    ],
  },
};

export default function Profile() {
  const { user, saveProfile, updateLanguage, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const userProfile = user?.profile || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(null);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [ageCategory, setAgeCategory] = useState(userProfile.ageCategory || '26-40');
  const [gender, setGender] = useState(userProfile.gender || 'male');
  const [state, setState] = useState(userProfile.state || 'Rajasthan');
  const [incomeBracket, setIncomeBracket] = useState(userProfile.incomeBracket || '1-3L');
  const [occupation, setOccupation] = useState(userProfile.occupation || 'Self-Employed');
  const [employmentStatus, setEmploymentStatus] = useState(userProfile.employmentStatus || 'self');
  const [selectedLang, setSelectedLang] = useState(i18n.language || user?.language || 'en');

  // Keep selectedLang synced if i18n changes externally
  useEffect(() => {
    setSelectedLang(i18n.language || 'en');
  }, [i18n.language]);

  // Dynamic Dictionary based on active selected language
  const tProfile = PROFILE_I18N[selectedLang] || PROFILE_I18N['en'];

  // Dynamic Applications count from local store
  const [appCount, setAppCount] = useState(1);

  useEffect(() => {
    try {
      const apps = getApplications();
      if (apps && apps.length > 0) setAppCount(apps.length);
    } catch {
      // fallback
    }
  }, []);

  // Compute profile completeness
  const computeCompleteness = () => {
    const fields = [name, ageCategory, gender, state, incomeBracket, occupation, employmentStatus];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = computeCompleteness();

  const handleLanguageClick = (lang) => {
    if (lang.code === selectedLang) return;
    setPendingLanguage(lang);
  };

  const handleConfirmLanguageChange = async () => {
    if (!pendingLanguage) return;
    const targetCode = pendingLanguage.code;
    const nativeName = pendingLanguage.native || pendingLanguage.label;
    setPendingLanguage(null);
    setSelectedLang(targetCode);

    if (updateLanguage) {
      await updateLanguage(targetCode);
    } else {
      i18n.changeLanguage(targetCode);
      localStorage.setItem('i18nextLng', targetCode);
    }

    toast.success(targetCode === 'hi' ? `भाषा बदलकर ${nativeName} कर दी गई!` : `Language changed to ${nativeName}!`);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await saveProfile({
        name,
        ageCategory,
        gender,
        state,
        incomeBracket,
        occupation,
        employmentStatus,
        language: selectedLang,
      });
      toast.success(tProfile.saveSuccess);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    toast.success(tProfile.pwdResetSent, { icon: '📧' });
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* 1. Top Stat Cards (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Matched Schemes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {tProfile.matchedSchemes}
              </p>
              <h3 className="text-2xl font-extrabold text-[#0B132B] mt-1">12</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Saved Schemes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {tProfile.savedSchemes}
              </p>
              <h3 className="text-2xl font-extrabold text-[#0B132B] mt-1">3</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>

          {/* Total Applications */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {tProfile.totalApplications}
              </p>
              <h3 className="text-2xl font-extrabold text-[#0B132B] mt-1">{appCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {tProfile.profileCompleteness}
              </p>
              <PieChart className="w-4 h-4 text-[#1E3A8A]" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-extrabold text-[#0B132B]">{completeness}%</span>
                <span className="text-[10px] font-bold text-emerald-600">{tProfile.activeStatus}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-900 to-[#0A1633] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Profile Grid (Sidebar + Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: User Summary & Navigation */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Profile Identity Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0E1B48] to-[#0A1128] text-white flex items-center justify-center text-2xl font-black shadow-md mb-4 ring-4 ring-slate-100">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{name || 'JanSetu Citizen'}</h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{state ? `${state}, India` : 'India'}</span>
              </p>
              
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{tProfile.verifiedCitizen}</span>
              </div>
            </div>

            {/* Navigation Tabs Card */}
            <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-2xs flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#EEF2F6] text-[#0A1128]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>{tProfile.tabOverview}</span>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'account'
                    ? 'bg-[#EEF2F6] text-[#0A1128]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Key className="w-4 h-4 text-slate-500" />
                <span>{tProfile.tabAccount}</span>
              </button>

              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'preferences'
                    ? 'bg-[#EEF2F6] text-[#0A1128]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span>{tProfile.tabPreferences}</span>
              </button>

              <button
                onClick={() => setActiveTab('demographic')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'demographic'
                    ? 'bg-[#EEF2F6] text-[#0A1128]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>{tProfile.tabDemographic}</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => setShowSignOutModal(true)}
                className="w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>{tProfile.signOut}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Editable Profile Sections */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Section 1: Basic Account Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-900">{tProfile.secAccountTitle}</h3>
                <Edit3 className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {tProfile.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 focus:bg-white transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {tProfile.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs sm:text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {tProfile.memberSinceLabel}
                  </label>
                  <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{tProfile.memberSinceVal}</span>
                  </div>
                </div>

                {/* Change Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {tProfile.securityLabel}
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    <span>{tProfile.changePasswordBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Preferences & Localization */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">{tProfile.secPrefTitle}</h3>
              <p className="text-xs text-slate-500 mb-5">
                {tProfile.secPrefDesc}
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  {tProfile.prefLangLabel}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageClick(lang)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-50 border-2 border-blue-900 text-blue-900 shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.native}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: Citizen Demographic Profile */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{tProfile.secDemoTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tProfile.secDemoDesc}
                  </p>
                </div>
                <Edit3 className="w-4 h-4 text-slate-400" />
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                  {/* Age Category */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {tProfile.ageLabel}
                    </label>
                    <select
                      value={ageCategory}
                      onChange={(e) => setAgeCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 focus:bg-white transition-all cursor-pointer"
                    >
                      {tProfile.ageOptions.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {tProfile.genderLabel}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 focus:bg-white transition-all cursor-pointer"
                    >
                      {tProfile.genderOptions.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Residential State */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {tProfile.stateLabel}
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 focus:bg-white transition-all cursor-pointer"
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Annual Family Income Bracket */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {tProfile.incomeLabel}
                    </label>
                    <select
                      value={incomeBracket}
                      onChange={(e) => setIncomeBracket(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 focus:bg-white transition-all cursor-pointer"
                    >
                      {tProfile.incomeOptions.map((inc) => (
                        <option key={inc.value} value={inc.value}>{inc.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Occupation */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {tProfile.occupationLabel}
                    </label>
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 focus:bg-white transition-all cursor-pointer"
                    >
                      {tProfile.occOptions.map((occ) => (
                        <option key={occ.value} value={occ.value}>{occ.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Status */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {tProfile.employmentLabel}
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 focus:bg-white transition-all cursor-pointer"
                    >
                      {tProfile.empOptions.map((emp) => (
                        <option key={emp.value} value={emp.value}>{emp.label}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Save Profile Button */}
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>{tProfile.savingBtn}</span></>
                    ) : (
                      <span>{tProfile.saveBtn}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>

      {/* Confirmation Modal for Language Change */}
      <LanguageChangeModal
        isOpen={!!pendingLanguage}
        targetLanguage={pendingLanguage}
        onClose={() => setPendingLanguage(null)}
        onConfirm={handleConfirmLanguageChange}
      />

      {/* Confirmation Modal for Sign Out */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          setShowSignOutModal(false);
          logout();
          navigate('/');
        }}
      />
    </div>
  );
}
