import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, Mail, MapPin, CheckCircle2, Shield, Calendar, Key, Globe,
  Briefcase, DollarSign, Award, Bookmark, BookmarkCheck, FileText, PieChart,
  Edit3, Check, Loader2, LogOut, ArrowRight, Sparkles, Trash2, BookOpen, ExternalLink, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getApplications } from '../services/store';
import SignOutModal from '../components/Common/SignOutModal';
import LanguageChangeModal from '../components/Common/LanguageChangeModal';
import DeepDiveModal from '../components/Chat/DeepDiveModal';
import toast from 'react-hot-toast';
import { notifyExtension } from '../services/copilotHandshake';

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
    tabMatched: 'मैच की गई योजनाएँ',
    tabSaved: 'सहेजी गई योजनाएँ',
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
    secSavedTitle: 'सहेजी गई सरकारी योजनाएँ',
    secSavedDesc: 'त्वरित पहुँच और आवेदन के लिए आपके द्वारा बुकमार्क की गई योजनाएँ।',
    secMatchedTitle: 'आपकी प्रोफ़ाइल से मेल खाती योजनाएँ',
    secMatchedDesc: 'आपकी जनसांख्यिकीय जानकारी (राज्य, आय वर्ग, व्यवसाय) के आधार पर अनुशंसित योजनाएँ।',
    noSavedTitle: 'अभी तक कोई सहेजी गई योजना नहीं है',
    noSavedDesc: 'आप AI सहायक से बातचीत करते समय या योजना निर्देशिका ब्राउज़ करते समय योजनाओं को बुकमार्क कर सकते हैं।',
    exploreSchemesBtn: 'योजना निर्देशिका देखें',
    askAiBtn: 'AI सहायक से पूछें',
    removeSchemeBtn: 'हटाएं',
    deepDiveBtn: 'विस्तार से जानें',
    applyNowBtn: 'आवेदन करें',
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
    tabMatched: 'মেলানো প্রকল্পসমূহ',
    tabSaved: 'সংরক্ষিত প্রকল্পসমূহ',
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
    secSavedTitle: 'সংরক্ষিত সরকারি প্রকল্পসমূহ',
    secSavedDesc: 'দ্রুত অ্যাক্সেস ও আবেদনের জন্য বুকমার্ক করা প্রকল্পসমূহ।',
    secMatchedTitle: 'আপনার প্রোফাইলের সাথে মানানসই প্রকল্পসমূহ',
    secMatchedDesc: 'আপনার জনসংখ্যার প্রোফাইলের উপর ভিত্তি করে সুপারিশকৃত সরকারি প্রকল্পসমূহ।',
    noSavedTitle: 'এখনও কোনো সংরক্ষিত প্রকল্প নেই',
    noSavedDesc: 'AI সহকারী বা প্রকল্প ডিরেক্টরি থেকে বুকমার্ক করে এখানে সংরক্ষণ করুন।',
    exploreSchemesBtn: 'প্রকল্প ডিরেক্টরি দেখুন',
    askAiBtn: 'AI সহকারীকে জিজ্ঞাসা করুন',
    removeSchemeBtn: 'মুছুন',
    deepDiveBtn: 'বিস্তারিত দেখুন',
    applyNowBtn: 'আবেদন করুন',
    ageLabel: 'বয়স সীমা',
    genderLabel: 'লিঙ্গ',
    stateLabel: 'বসবাসের রাজ্য',
    incomeLabel: 'বার্ষিক পারিবারিক আয়',
    occupationLabel: 'মূল পেশা',
    employmentLabel: 'কর্মসংস্থানের অবস্থা',
    saveBtn: 'প্রোফাইল সেভ করুন',
    savingBtn: 'সংরক্ষণ হচ্ছে...',
    saveSuccess: 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে! ✨',
    pwdResetSent: 'পাসওয়ার্ড রিসেট ইমেল পাঠানো হয়েছে',
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
      { value: '1-3L', label: '১ – ৩ লাখ' },
      { value: '3-8L', label: '৩ – ৮ লাখ' },
      { value: '8L+', label: '৮ লাখের বেশি' },
    ],
    occOptions: [
      { value: 'Farmer', label: 'কৃষক' },
      { value: 'Student', label: 'শিক্ষার্থী' },
      { value: 'Salaried', label: 'চাকরিজীবী' },
      { value: 'Self-Employed', label: 'ব্যবসায়ী' },
      { value: 'Daily Wage Worker', label: 'দিনমজুর' },
      { value: 'Unemployed', label: 'বেকার' },
      { value: 'Homemaker', label: 'গৃহিণী' },
    ],
    empOptions: [
      { value: 'government', label: 'সরকারি চাকরি' },
      { value: 'private', label: 'বেসরকারি চাকরি' },
      { value: 'self', label: 'স্ব-নিয়োজিত' },
      { value: 'none', label: 'বেকার' },
    ],
  },
  ta: {
    matchedSchemes: 'பொருந்திய திட்டங்கள்',
    savedSchemes: 'சேமிக்கப்பட்ட திட்டங்கள்',
    totalApplications: 'மொத்த விண்ணப்பங்கள்',
    profileCompleteness: 'சுயவிவர நிறைவு',
    activeStatus: 'செயலில்',
    verifiedCitizen: 'சரிபார்க்கப்பட்ட குடிமகன்',
    tabOverview: 'சுயவிவர மேலோட்டம்',
    tabMatched: 'பொருந்திய திட்டங்கள்',
    tabSaved: 'சேமிக்கப்பட்டவை',
    tabAccount: 'கணக்கு தகவல்',
    tabPreferences: 'விருப்பத்தேர்வுகள் & மொழி',
    tabDemographic: 'குடிமக்கள் சுயவிவரம்',
    signOut: 'வெளியேறு',
    secAccountTitle: 'அடிப்படை கணக்கு தகவல்',
    fullNameLabel: 'முழுப் பெயர்',
    emailLabel: 'மின்னஞ்சல் முகவரி',
    memberSinceLabel: 'உறுப்பினர் காலம்',
    memberSinceVal: 'ஜனவரி 2024',
    securityLabel: 'பாதுகாப்பு',
    changePasswordBtn: 'கடவுச்சொல் மாற்று',
    secPrefTitle: 'விருப்பத்தேர்வுகள் & மொழி',
    secPrefDesc: 'தளத்தில் பயன்படுத்த விரும்பும் மொழியைத் தேர்ந்தெடுக்கவும்.',
    prefLangLabel: 'விருப்ப மொழி',
    secDemoTitle: 'குடிமக்கள் விவரங்கள்',
    secDemoDesc: 'திட்ட தகுதியைத் தீர்மானிக்க இந்த விவரங்கள் பயன்படுகின்றன.',
    secSavedTitle: 'சேமிக்கப்பட்ட அரசு திட்டங்கள்',
    secSavedDesc: 'விரைவான பயன்பாட்டிற்காக சேமிக்கப்பட்ட திட்டங்கள்.',
    secMatchedTitle: 'உங்கள் சுயவிவரத்துடன் பொருந்தும் திட்டங்கள்',
    secMatchedDesc: 'உங்கள் சுயவிவரத் தரவுகளின் அடிப்படையில் பரிந்துரைக்கப்பட்ட திட்டங்கள்.',
    noSavedTitle: 'சேமிக்கப்பட்ட திட்டங்கள் எதுவும் இல்லை',
    noSavedDesc: 'AI உதவியாளரிடம் பேசும்போது அல்லது திட்டங்களை உலாவும் போது சேமிக்கலாம்.',
    exploreSchemesBtn: 'திட்டங்களை உலாவுக',
    askAiBtn: 'AI உதவியாளரிடம் கேளுங்கள்',
    removeSchemeBtn: 'நீக்கு',
    deepDiveBtn: 'விவரங்கள்',
    applyNowBtn: 'விண்ணப்பிக்க',
    ageLabel: 'வயது வரம்பு',
    genderLabel: 'பாலினம்',
    stateLabel: 'மாநிலம்',
    incomeLabel: 'வருமானம்',
    occupationLabel: 'தொழில்',
    employmentLabel: 'வேலை நிலை',
    saveBtn: 'சுயவிவரத்தை சேமி',
    savingBtn: 'சேமிக்கப்படுகிறது...',
    saveSuccess: 'சுயவிவரம் புதுப்பிக்கப்பட்டது! ✨',
    pwdResetSent: 'கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டது',
    ageOptions: [
      { value: '18-25', label: '18 – 25 ஆண்டுகள்' },
      { value: '26-40', label: '26 – 40 ஆண்டுகள்' },
      { value: '41-60', label: '41 – 60 ஆண்டுகள்' },
      { value: '60+', label: '60+ ஆண்டுகள்' },
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
      { value: 'Salaried', label: 'ஊழியர்' },
      { value: 'Self-Employed', label: 'சுயதொழில்' },
      { value: 'Daily Wage Worker', label: 'கூலித் தொழிலாளி' },
      { value: 'Unemployed', label: 'வேலையில்லாதவர்' },
      { value: 'Homemaker', label: 'இல்லத்தரசி' },
    ],
    empOptions: [
      { value: 'government', label: 'அரசு வேலை' },
      { value: 'private', label: 'தனியார் வேலை' },
      { value: 'self', label: 'சுயதொழில்' },
      { value: 'none', label: 'வேலையில்லை' },
    ],
  },
  te: {
    matchedSchemes: 'సరిపోలిన పథకాలు',
    savedSchemes: 'సేవ్ చేసిన పథకాలు',
    totalApplications: 'మొత్తం దరఖాస్తులు',
    profileCompleteness: 'ప్రొఫైల్ పూర్తిస్థాయి',
    activeStatus: 'యాక్టివ్',
    verifiedCitizen: 'ధృవీకరించబడిన పౌరుడు',
    tabOverview: 'ప్రొఫైల్ అవలోకనం',
    tabMatched: 'సరిపోలిన పథకాలు',
    tabSaved: 'సేవ్ చేసిన పథకాలు',
    tabAccount: 'ఖాతా సమాచారం',
    tabPreferences: 'ప్రాధాన్యతలు & భాష',
    tabDemographic: 'పౌరుల ప్రొఫైల్',
    signOut: 'లాగ్ అవుట్',
    secAccountTitle: 'ప్రాథమిక ఖాతా సమాచారం',
    fullNameLabel: 'పూర్తి పేరు',
    emailLabel: 'ఇమెయిల్ చిరునామా',
    memberSinceLabel: 'సభ్యత్వం ప్రారంభం',
    memberSinceVal: 'జనవరి 2024',
    securityLabel: 'భద్రత',
    changePasswordBtn: 'పాస్‌వర్డ్ మార్చండి',
    secPrefTitle: 'ప్రాధాన్యతలు & భాష',
    secPrefDesc: 'జన-సేతుతో సంభాషించడానికి ప్రాధాన్య భాషను ఎంచుకోండి.',
    prefLangLabel: 'ప్రాధాన్య భాష',
    secDemoTitle: 'పౌరుల జనాభా ప్రొఫైల్',
    secDemoDesc: 'పథకాల అర్హతను లెక్కించడానికి ఈ సమాచారం ఉపయోగపడుతుంది.',
    secSavedTitle: 'సేవ్ చేసిన ప్రభుత్వ పథకాలు',
    secSavedDesc: 'శీఘ్ర ప్రాప్యత కోసం మీరు బుక్‌మార్క్ చేసిన పథకాలు.',
    secMatchedTitle: 'మీ ప్రొఫైల్‌కు సరిపోలిన పథకాలు',
    secMatchedDesc: 'మీ ప్రొఫైల్ వివరాల ఆధారంగా ఎంపిక చేసిన ప్రభుత్వ పథకాలు.',
    noSavedTitle: 'ఇంకా సేవ్ చేసిన పథకాలు లేవు',
    noSavedDesc: 'AI అసిస్టెంట్ లేదా పథకాల డైరెక్టరీ నుండి పథకాలను ఇక్కడ బుక్‌మార్క్ చేయవచ్చు.',
    exploreSchemesBtn: 'పథకాలను బ్రౌజ్ చేయండి',
    askAiBtn: 'AI అసిస్టెంట్‌ని అడగండి',
    removeSchemeBtn: 'తొలగించు',
    deepDiveBtn: 'పూర్తి వివరాలు',
    applyNowBtn: 'దరఖాస్తు చేసుకోండి',
    ageLabel: 'వయస్సు వర్గం',
    genderLabel: 'లింగం',
    stateLabel: 'నివాస రాష్ట్రం',
    incomeLabel: 'వార్షిక కుటుంబ ఆదాయం',
    occupationLabel: 'ప్రధాన వృత్తి',
    employmentLabel: 'ఉద్యోగ స్థితి',
    saveBtn: 'ప్రొఫైల్‌ను సేవ్ చేయండి',
    savingBtn: 'సేవ్ అవుతోంది...',
    saveSuccess: 'ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది! ✨',
    pwdResetSent: 'పాస్‌వర్డ్ రీసెట్ లింక్ ఇమెయిల్‌కి పంపబడింది',
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
      { value: 'Homemaker', label: 'గృహిణి' },
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
    tabMatched: 'Matched Schemes',
    tabSaved: 'Saved Schemes',
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
    secSavedTitle: 'Bookmarked & Saved Schemes',
    secSavedDesc: 'Government schemes you have bookmarked for quick access and direct application.',
    secMatchedTitle: 'Schemes Matched to Your Profile',
    secMatchedDesc: 'Government schemes recommended based on your demographic profile (state, occupation, and income bracket).',
    noSavedTitle: 'No saved schemes yet',
    noSavedDesc: 'You can bookmark schemes while chatting with JanSetu AI assistant or browsing the schemes directory.',
    exploreSchemesBtn: 'Explore Schemes Directory',
    askAiBtn: 'Ask JanSetu AI',
    removeSchemeBtn: 'Remove',
    deepDiveBtn: 'Deep Dive',
    applyNowBtn: 'Apply Now',
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

const CATEGORY_COLORS = {
  agriculture: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  education:   { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  housing:     { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  health:      { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     dot: 'bg-red-500' },
  employment:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  business:    { bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    dot: 'bg-cyan-500' },
  social:      { bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700',    dot: 'bg-pink-500' },
  skill:       { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
};

const MATCHED_SCHEMES_LIST = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    benefit: '₹6,000 / year',
    description: 'Direct income support of ₹6,000 per year paid in three equal installments to eligible farmer families across India.',
    matchScore: '98% Match',
    matchReason: 'Matched with Farmer occupation & Land records in your state.',
    qualifications: [
      { text: 'Landholding farmer family', sub: 'Cultivable land holding in applicant or family name.' },
      { text: 'Active bank account', sub: 'Direct Benefit Transfer (DBT) enabled account.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Land Khatauni / Khasra', status: 'Required' },
      { name: 'Bank Passbook', status: 'Active' }
    ],
    officialEligibility: {
      description: 'All landholding farmers families, having cultivable landholding in their names are eligible.',
      exclusions: 'Institutional landholders, high-income taxpayers, and government pension holders.'
    },
    applyUrl: 'https://pmkisan.gov.in/'
  },
  {
    id: 'pmayg',
    name: 'PMAY-G',
    fullName: 'Pradhan Mantri Awas Yojana - Gramin',
    ministry: 'Ministry of Rural Development',
    category: 'housing',
    benefit: '₹1.20 Lakhs – ₹1.30 Lakhs',
    description: 'Financial housing grant to build a durable pucca house with basic amenities for rural families.',
    matchScore: '95% Match',
    matchReason: 'Matched based on income bracket & state residence.',
    qualifications: [
      { text: 'Rural household', sub: 'Residing in SECC / Rural Panchayat list.' },
      { text: 'Kutcha / temporary house', sub: 'No existing pucca dwelling registered in family.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Job Card / SECC ID', status: 'Panchayat record' },
      { name: 'Bank Passbook', status: 'Active' }
    ],
    officialEligibility: {
      description: 'Homeless families and households residing in kutcha or dilapidated houses in rural areas.',
      exclusions: 'Households owning motorized vehicles or earning above tax limits.'
    },
    applyUrl: 'https://pmayg.nic.in/'
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat (PM-JAY)',
    fullName: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    ministry: 'Ministry of Health and Family Welfare',
    category: 'health',
    benefit: '₹5.00 Lakhs / family / year',
    description: 'Free cashless health insurance coverage up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.',
    matchScore: '96% Match',
    matchReason: 'Matched with income eligibility and health insurance entitlement.',
    qualifications: [
      { text: 'Low-income family', sub: 'Identified under SECC 2011 or state health entitlement card.' },
      { text: 'Cashless hospital treatment', sub: 'Valid across empanelled government and private hospitals.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Ration Card / Ayushman Card', status: 'Required' }
    ],
    officialEligibility: {
      description: 'Bottom 40% vulnerable families identified based on occupational and deprivation criteria.',
      exclusions: 'Formal sector employees covered under ESI/CGHS.'
    },
    applyUrl: 'https://beneficiary.nha.gov.in'
  },
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    fullName: 'Prime Minister Street Vendor\'s AtmaNirbhar Nidhi',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'business',
    benefit: '₹10,000 – ₹50,000 Collateral Free',
    description: 'Special micro-credit facility offering collateral-free working capital loans with interest subsidy for small vendors and businesses.',
    matchScore: '92% Match',
    matchReason: 'Matched based on self-employed / small business occupation profile.',
    qualifications: [
      { text: 'Urban / Peri-urban vendor', sub: 'Vending certificate or recommendation letter from ULB.' },
      { text: 'Digital transaction incentive', sub: 'Cashback up to ₹1,200 per year on digital payments.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Vending Certificate', status: 'Municipal ID' }
    ],
    officialEligibility: {
      description: 'Street vendors engaged in vending in urban areas.',
      exclusions: 'Non-vendors or defaulted borrowers.'
    },
    applyUrl: 'https://pmsvanidhi.mohua.gov.in/'
  },
  {
    id: 'pmkvy',
    name: 'PMKVY 4.0',
    fullName: 'Pradhan Mantri Kaushal Vikas Yojana',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    category: 'skill',
    benefit: 'Free Training & Industry Certification',
    description: 'Flagship skill certification scheme providing industry-relevant skill training, stipends, and placement support.',
    matchScore: '90% Match',
    matchReason: 'Matched based on age category and skill enhancement profile.',
    qualifications: [
      { text: 'Indian Youth', sub: 'Seeking job-oriented technical or vocational skills.' },
      { text: 'Government Certification', sub: 'NCS registered certified skill badging.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Educational Certificate', status: '10th/12th/Diploma' }
    ],
    officialEligibility: {
      description: 'Any Indian national youth looking to upskill or re-skill in emerging industry sectors.',
      exclusions: 'Currently employed central government regular staff.'
    },
    applyUrl: 'https://www.skillindiadigital.gov.in'
  },
  {
    id: 'mgnregs',
    name: 'MGNREGS',
    fullName: 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
    ministry: 'Ministry of Rural Development',
    category: 'employment',
    benefit: '100 Days Guaranteed Paid Work',
    description: 'Guaranteed 100 days of wage employment per financial year to adult members of any rural household willing to do manual work.',
    matchScore: '91% Match',
    matchReason: 'Matched based on rural employment guarantee eligibility.',
    qualifications: [
      { text: 'Adult rural resident', sub: 'Willing to undertake unskilled manual work.' },
      { text: 'Direct Bank Transfer', sub: 'Wages transferred directly into worker bank account.' }
    ],
    requiredDocs: [
      { name: 'Job Card', status: 'Issued by Gram Panchayat' },
      { name: 'Aadhaar Card', status: 'Pre-verified' }
    ],
    officialEligibility: {
      description: 'All adult members of rural households willing to do unskilled manual work.',
      exclusions: 'Urban residents or salaried permanent employees.'
    },
    applyUrl: 'https://nrega.nic.in/'
  },
  {
    id: 'pm-mudra',
    name: 'Pradhan Mantri MUDRA Yojana',
    fullName: 'PMMY Shishu / Kishor / Tarun Micro Credit',
    ministry: 'Ministry of Finance',
    category: 'business',
    benefit: 'Up to ₹10.00 Lakhs Loan',
    description: 'Collateral-free business loans up to ₹10 Lakhs for non-corporate, non-farm small/micro enterprises.',
    matchScore: '89% Match',
    matchReason: 'Matched for small business entrepreneurship credit support.',
    qualifications: [
      { text: 'Non-farm business enterprise', sub: 'Manufacturing, trading, services or allied agriculture.' },
      { text: 'No collateral required', sub: 'Covered under CGFMU guarantee scheme.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar / PAN', status: 'Pre-verified' },
      { name: 'Business Proof / Plan', status: 'Required' }
    ],
    officialEligibility: {
      description: 'Any Indian citizen who has a business plan for a non-farm sector income generating activity.',
      exclusions: 'Corporate entities or large scale industries.'
    },
    applyUrl: 'https://www.udyamimitra.in'
  },
  {
    id: 'sukanya',
    name: 'Sukanya Samriddhi Yojana',
    fullName: 'Sukanya Samriddhi Account (SSA)',
    ministry: 'Ministry of Women and Child Development',
    category: 'social',
    benefit: '8.2% Interest + Tax Exemption',
    description: 'High-interest small deposit savings scheme aimed at securing the financial future and higher education of girl children.',
    matchScore: '88% Match',
    matchReason: 'Matched for family social savings and high yield returns.',
    qualifications: [
      { text: 'Girl Child below 10 years', sub: 'Account opened by parent or legal guardian.' },
      { text: 'EEE Tax Benefit', sub: 'Exempt on deposit, interest earned, and withdrawal.' }
    ],
    requiredDocs: [
      { name: 'Birth Certificate of Girl Child', status: 'Required' },
      { name: 'Guardian ID Proof', status: 'Aadhaar / PAN' }
    ],
    officialEligibility: {
      description: 'Parents or legal guardians of a girl child up to 10 years of age.',
      exclusions: 'Account opened after 10 years of age.'
    },
    applyUrl: 'https://www.myscheme.gov.in/schemes/ssy'
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana (APY)',
    fullName: 'Atal Pension Yojana',
    ministry: 'Ministry of Finance / PFRDA',
    category: 'social',
    benefit: '₹1,000 – ₹5,000 / month Pension',
    description: 'Government-guaranteed pension scheme for unorganized sector workers ensuring guaranteed monthly pension post age 60.',
    matchScore: '93% Match',
    matchReason: 'Matched with age category and unorganized sector pension eligibility.',
    qualifications: [
      { text: 'Age between 18 and 40 years', sub: 'Flexible monthly contribution based on joining age.' },
      { text: 'Guaranteed Pension by Govt', sub: 'Lifetime pension with nominee protection.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Savings Bank Account', status: 'Auto-debit enabled' }
    ],
    officialEligibility: {
      description: 'All unorganized sector workers aged between 18 and 40 years holding a savings bank account.',
      exclusions: 'Income tax payers.'
    },
    applyUrl: 'https://www.npscra.nsdl.co.in/scheme-details.php'
  },
  {
    id: 'postmatric_sch',
    name: 'Post-Matric Scholarship Scheme',
    fullName: 'Central Sector Post-Matric Scholarship',
    ministry: 'Ministry of Social Justice and Empowerment',
    category: 'education',
    benefit: 'Full Tuition Fee + Monthly Allowance',
    description: 'Financial assistance for post-secondary and higher education to meritorious students from eligible income backgrounds.',
    matchScore: '94% Match',
    matchReason: 'Matched based on student status & academic assistance criteria.',
    qualifications: [
      { text: 'Post-10th / Diploma / Degree', sub: 'Studying in recognized school, college, or university.' },
      { text: 'Direct Fee Reimbursement', sub: 'Credited to institution & student bank account.' }
    ],
    requiredDocs: [
      { name: 'Marksheet (10th/12th)', status: 'Verified' },
      { name: 'Income Certificate', status: 'Required' },
      { name: 'Fee Receipt & Bonafide', status: 'From College' }
    ],
    officialEligibility: {
      description: 'Students pursuing post-matriculation courses in recognized institutions whose family income is within eligibility caps.',
      exclusions: 'Students receiving other central scholarship benefits.'
    },
    applyUrl: 'https://scholarships.gov.in/'
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma',
    fullName: 'PM Vishwakarma Scheme for Traditional Artisans',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    category: 'skill',
    benefit: '₹3.00 Lakh Credit + Skill Toolkit',
    description: 'Holistic support including skill verification, free toolkit grant of ₹15,000, and subsidized collateral-free loans for traditional artisans and craftspeople.',
    matchScore: '91% Match',
    matchReason: 'Matched with artisan & skilled trade livelihood criteria.',
    qualifications: [
      { text: '18 Traditional Trades', sub: 'Carpenters, Blacksmiths, Potters, Tailors, Masons, etc.' },
      { text: 'Toolkit Incentive', sub: '₹15,000 e-voucher for modern tools.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Ration Card / Trade Proof', status: 'Required' }
    ],
    officialEligibility: {
      description: 'Artisans or craftspeople working with hands and tools in one of 18 family-based traditional trades.',
      exclusions: 'Government employees or previous loan defaulters.'
    },
    applyUrl: 'https://pmvishwakarma.gov.in/'
  },
  {
    id: 'pm-poshan',
    name: 'PM POSHAN Scheme',
    fullName: 'Pradhan Mantri Poshan Shakti Nirman',
    ministry: 'Ministry of Education',
    category: 'education',
    benefit: 'Nutritional Support & Meal Allowance',
    description: 'National initiative providing hot cooked meals to children in primary and upper-primary government schools.',
    matchScore: '87% Match',
    matchReason: 'Matched with family child welfare and education nutrition benefits.',
    qualifications: [
      { text: 'Government School Enrolment', sub: 'Enrolled in Class I to VIII.' },
      { text: 'Daily Hot Meal', sub: 'Balanced nutrition as per prescribed caloric norms.' }
    ],
    requiredDocs: [
      { name: 'School Enrolment Number', status: 'Pre-verified' }
    ],
    officialEligibility: {
      description: 'All children studying in Classes I–VIII in Government, Government-aided schools.',
      exclusions: 'Private non-aided fee-paying schools.'
    },
    applyUrl: 'https://pmposhan.education.gov.in/index.html'
  }
];

export default function Profile() {
  const {
    user,
    loading: authLoading,
    saveProfile,
    updateLanguage,
    logout,
    savedSchemes = [],
    matchedSchemes = [],
    matchingSchemesLoading = false,
    fetchMatchedSchemes,
    saveScheme,
    removeSavedScheme,
    isSchemeSaved,
    token,
  } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [loading, setLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [activeDeepDive, setActiveDeepDive] = useState(null);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [ageCategory, setAgeCategory] = useState(user?.profile?.ageCategory || '26-40');
  const [gender, setGender] = useState(user?.profile?.gender || 'male');
  const [state, setState] = useState(user?.profile?.state || 'Rajasthan');
  const [incomeBracket, setIncomeBracket] = useState(user?.profile?.incomeBracket || '1-3L');
  const [occupation, setOccupation] = useState(user?.profile?.occupation || 'Self-Employed');
  const [employmentStatus, setEmploymentStatus] = useState(user?.profile?.employmentStatus || 'self');
  const [selectedLang, setSelectedLang] = useState(i18n.language || user?.language || 'en');

  // Dynamic Matched Schemes list from AuthContext / Gemini (with fallback)
  const activeMatchedSchemes = (Array.isArray(matchedSchemes) && matchedSchemes.length > 0)
    ? matchedSchemes
    : MATCHED_SCHEMES_LIST;

  // Synchronize when user rehydrates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.profile) {
        if (user.profile.ageCategory) setAgeCategory(user.profile.ageCategory);
        if (user.profile.gender) setGender(user.profile.gender);
        if (user.profile.state) setState(user.profile.state);
        if (user.profile.incomeBracket) setIncomeBracket(user.profile.incomeBracket);
        if (user.profile.occupation) setOccupation(user.profile.occupation);
        if (user.profile.employmentStatus) setEmploymentStatus(user.profile.employmentStatus);
      }
    }
  }, [user]);

  // Keep selectedLang synced if i18n changes externally
  useEffect(() => {
    setSelectedLang(i18n.language || 'en');
  }, [i18n.language]);

  // If user is loaded but matchedSchemes is empty, fetch matched schemes
  useEffect(() => {
    if (user && user.profile && (!matchedSchemes || matchedSchemes.length === 0) && fetchMatchedSchemes) {
      fetchMatchedSchemes();
    }
  }, [user]);

  // Dynamic Dictionary based on active selected language
  const langCode = (selectedLang || i18n.language || 'en').slice(0, 2);
  const tProfile = PROFILE_I18N[langCode] || PROFILE_I18N['en'];

  // Dynamic Applications count from local store
  const [appCount, setAppCount] = useState(0);

  useEffect(() => {
    try {
      const apps = getApplications();
      setAppCount(Array.isArray(apps) ? apps.length : 0);
    } catch {
      setAppCount(0);
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
      const res = await saveProfile({
        name,
        ageCategory,
        gender,
        state,
        incomeBracket,
        occupation,
        employmentStatus,
        language: selectedLang,
      });
      const matchCount = res?.matchedSchemes?.length || activeMatchedSchemes.length;
      toast.success(
        selectedLang === 'hi'
          ? `प्रोफ़ाइल सहेजी गई और ${matchCount} योजनाएं AI द्वारा मैच की गईं! ✨`
          : `Profile saved & ${matchCount} personalized schemes matched with JanSetu AI! ✨`
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    toast.success(tProfile.pwdResetSent, { icon: '📧' });
  };

  const handleRemoveScheme = (schemeId) => {
    removeSavedScheme(schemeId);
    toast(selectedLang === 'hi' ? 'योजना सहेजी गई सूची से हटा दी गई' : 'Scheme removed from saved bookmarks', { icon: '🗑️' });
  };

  const handleToggleSaveMatched = (scheme) => {
    const isSaved = isSchemeSaved ? isSchemeSaved(scheme.id) : savedSchemes.some(s => s.id === scheme.id);
    if (isSaved) {
      removeSavedScheme(scheme.id);
      toast(selectedLang === 'hi' ? 'योजना सहेजी गई सूची से हटा दी गई' : 'Scheme removed from saved bookmarks', { icon: '🗑️' });
    } else {
      saveScheme(scheme);
      toast.success(selectedLang === 'hi' ? 'योजना आपके बुकमार्क में सहेजी गई!' : 'Scheme saved to your bookmarks! ✨');
    }
  };

  if (authLoading && !user) {
    return (
      <div className="flex-1 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-slate-500 font-semibold">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* 1. Top Stat Cards (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Matched Schemes (Clickable to view Matched Schemes tab) */}
          <button
            type="button"
            onClick={() => setActiveTab('matched')}
            className={`bg-white rounded-2xl p-5 border shadow-2xs flex items-center justify-between text-left transition-all cursor-pointer hover:shadow-md hover:border-blue-300 ${
              activeTab === 'matched' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80'
            }`}
          >
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {tProfile.matchedSchemes}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-extrabold text-[#0B132B]">{activeMatchedSchemes.length}</h3>
                {matchingSchemesLoading && (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </button>

          {/* Saved Schemes (Clickable to jump to Saved Schemes tab) */}
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`bg-white rounded-2xl p-5 border shadow-2xs flex items-center justify-between text-left transition-all cursor-pointer hover:shadow-md hover:border-amber-300 ${
              activeTab === 'saved' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80'
            }`}
          >
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {tProfile.savedSchemes}
              </p>
              <h3 className="text-2xl font-extrabold text-[#0B132B] mt-1">{savedSchemes.length}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
          </button>

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
                type="button"
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

              {/* Matched Schemes Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('matched')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'matched'
                    ? 'bg-[#EEF2F6] text-[#0A1128]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>{tProfile.tabMatched}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                  {matchingSchemesLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : activeMatchedSchemes.length}
                </span>
              </button>

              {/* Saved Schemes Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-[#EEF2F6] text-[#0A1128]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>{tProfile.tabSaved}</span>
                </div>
                {savedSchemes.length > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {savedSchemes.length}
                  </span>
                )}
              </button>

              <button
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className="w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>{tProfile.signOut}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Dynamic Tab View */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* TAB VIEW 1: MATCHED SCHEMES */}
            {activeTab === 'matched' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-extrabold text-slate-900">{tProfile.secMatchedTitle}</h3>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>{activeMatchedSchemes.length} Matched</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{tProfile.secMatchedDesc}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={matchingSchemesLoading}
                      onClick={() => fetchMatchedSchemes && fetchMatchedSchemes()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      {matchingSchemesLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{matchingSchemesLoading ? 'Matching with AI...' : 'Refresh AI Matches'}</span>
                    </button>

                    <Link
                      to="/schemes"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all w-fit cursor-pointer"
                    >
                      <span>{tProfile.exploreSchemesBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {matchingSchemesLoading && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-900">JanSetu AI is analyzing your updated demographic profile...</p>
                      <p className="text-[11px] text-blue-700">Matching active Central and State schemes based on your state, income, and occupation.</p>
                    </div>
                  </div>
                )}

                {/* Matched Schemes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeMatchedSchemes.map((scheme) => {
                    const colors = CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS.social;
                    const isSaved = isSchemeSaved ? isSchemeSaved(scheme.id) : savedSchemes.some(s => s.id === scheme.id);
                    return (
                      <div
                        key={scheme.id}
                        className={`rounded-2xl border ${colors.border} ${colors.bg} p-4.5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md transition-all`}
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border ${colors.border} ${colors.text} inline-block`}>
                                  {scheme.category}
                                </span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                                  <span>{scheme.matchScore}</span>
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                {scheme.name}
                              </h4>
                              {scheme.ministry && (
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{scheme.ministry}</p>
                              )}
                            </div>

                            {/* Bookmark Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSaveMatched(scheme);
                              }}
                              title={isSaved ? tProfile.removeSchemeBtn : 'Save Scheme'}
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                isSaved
                                  ? 'bg-amber-500 border-amber-600 text-white shadow-2xs'
                                  : 'bg-white/90 border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-300'
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Match Reason Tag */}
                          {scheme.matchReason && (
                            <p className="text-[11px] font-semibold text-blue-700 bg-blue-50/90 border border-blue-200/60 rounded-lg px-2.5 py-1 mb-2.5">
                              🎯 {scheme.matchReason}
                            </p>
                          )}

                          {/* Description */}
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                            {scheme.description}
                          </p>

                          {/* Benefit Badge */}
                          {scheme.benefit && (
                            <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-lg w-fit">
                              <Tag className={`w-3 h-3 ${colors.text}`} />
                              <span className={`text-[11px] font-bold ${colors.text}`}>{scheme.benefit}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDeepDive(scheme);
                            }}
                            className="flex-1 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                            <span>{tProfile.deepDiveBtn}</span>
                          </button>

                          <a
                            href={
                              scheme.id === 'pm-poshan' || scheme.id === 'pmposhan'
                                ? 'https://pmposhan.education.gov.in/index.html'
                                : (scheme.applyUrl && scheme.applyUrl !== '#' ? scheme.applyUrl : `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.name)}`)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              notifyExtension(scheme.id, token, (i18n.language || 'en').slice(0, 2));
                            }}
                            className="flex-1 px-3 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{tProfile.applyNowBtn}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB VIEW 2: SAVED SCHEMES */}
            {activeTab === 'saved' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-extrabold text-slate-900">{tProfile.secSavedTitle}</h3>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                        {savedSchemes.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{tProfile.secSavedDesc}</p>
                  </div>

                  <Link
                    to="/schemes"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all w-fit"
                  >
                    <span>{tProfile.exploreSchemesBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Saved Schemes List or Empty State */}
                {savedSchemes.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center mb-4 shadow-2xs">
                      <Bookmark className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{tProfile.noSavedTitle}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">{tProfile.noSavedDesc}</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/schemes')}
                        className="px-5 py-2.5 bg-[#0A1633] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {tProfile.exploreSchemesBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/assistant')}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        <span>{tProfile.askAiBtn}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedSchemes.map((scheme) => {
                      const colors = CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS.social;
                      return (
                        <div
                          key={scheme.id}
                          className={`rounded-2xl border ${colors.border} ${colors.bg} p-4.5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md transition-all`}
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border ${colors.border} ${colors.text} inline-block mb-1.5`}>
                                  {scheme.category}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                  {scheme.name}
                                </h4>
                                {scheme.ministry && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{scheme.ministry}</p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveScheme(scheme.id);
                                }}
                                title={tProfile.removeSchemeBtn}
                                className="w-7 h-7 rounded-lg bg-white/90 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                              {scheme.description}
                            </p>

                            {/* Benefit Badge */}
                            {scheme.benefit && (
                              <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-lg w-fit">
                                <Tag className={`w-3 h-3 ${colors.text}`} />
                                <span className={`text-[11px] font-bold ${colors.text}`}>{scheme.benefit}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDeepDive(scheme);
                              }}
                              className="flex-1 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                              <span>{tProfile.deepDiveBtn}</span>
                            </button>

                            <a
                              href={
                                scheme.id === 'pm-poshan' || scheme.id === 'pmposhan'
                                  ? 'https://pmposhan.education.gov.in/index.html'
                                  : (scheme.applyUrl && scheme.applyUrl !== '#' ? scheme.applyUrl : `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.name)}`)
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                notifyExtension(scheme.id, token, (i18n.language || 'en').slice(0, 2));
                              }}
                              className="flex-1 px-3 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{tProfile.applyNowBtn}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW 3: OVERVIEW / ACCOUNT / PREFERENCES / DEMOGRAPHIC */}
            {activeTab !== 'saved' && activeTab !== 'matched' && (
              <>
                {/* Section 1: Basic Account Info */}
                {(activeTab === 'overview' || activeTab === 'account') && (
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
                )}

                {/* Section 2: Preferences & Language */}
                {(activeTab === 'overview' || activeTab === 'preferences') && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900">{tProfile.secPrefTitle}</h3>
                      <Globe className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      {tProfile.secPrefDesc}
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                        {tProfile.prefLangLabel}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleLanguageClick(lang)}
                            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              selectedLang === lang.code
                                ? 'bg-gradient-to-br from-blue-950 to-[#0A1633] text-white border-blue-950 shadow-md ring-2 ring-blue-900/20'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-sm font-black">{lang.native}</span>
                            <span className={`text-[10px] font-semibold ${selectedLang === lang.code ? 'text-slate-300' : 'text-slate-400'}`}>
                              {lang.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Demographic Profile Form */}
                {(activeTab === 'overview' || activeTab === 'demographic') && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900">{tProfile.secDemoTitle}</h3>
                      <Briefcase className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      {tProfile.secDemoDesc}
                    </p>

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
                            {tProfile.ageOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                )}
              </>
            )}

          </div>

        </div>
      </div>

      {/* Deep Dive Modal when clicked from Saved Schemes */}
      {activeDeepDive && (
        <DeepDiveModal
          scheme={activeDeepDive}
          colors={CATEGORY_COLORS[activeDeepDive.category] || CATEGORY_COLORS.social}
          onClose={() => setActiveDeepDive(null)}
        />
      )}

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
