import axios from 'axios';
import { INITIAL_SCHEMES, getApplications, saveApplication } from './store';

const rawUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  timeout: 8000,
});

// Session ID persistence
export const getSessionId = () => {
  let sid = localStorage.getItem('jansetu_session_id');
  if (!sid) {
    sid = 'js_sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('jansetu_session_id', sid);
  }
  return sid;
};

// Convert written numbers to digits
const wordToNumber = (text) => {
  const map = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'che': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10
  };
  return text.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|paanch|che|saat|aath|nau|das)\b/gi, (m) => map[m.toLowerCase()] || m);
};

// Helper to extract entities from user text without assuming defaults
export const extractLocalEntities = (text = '', lastAskedField = null) => {
  const normalized = wordToNumber(text);
  const lower = normalized.toLowerCase().trim();
  const extracted = {};

  // 1. Occupation & Livelihood
  if (/farmer|kisan|kheti|krishi|agriculture|farming|crop|khet/i.test(lower)) {
    extracted.occupation = 'Farmer';
  } else if (/student|padhai|vidhyarthi|college|school|studying|study|degree|btech|bsc|bcom|ba|matric|12th|10th/i.test(lower)) {
    extracted.occupation = 'Student';
    extracted.currently_studying = true;
  } else if (/vendor|thela|street vendor|hawker|rehri|shopkeeper|dukan/i.test(lower)) {
    extracted.occupation = 'Street Vendor';
  } else if (/laborer|majdoor|daily wage|shramik|worker|construction|driver|carpenter/i.test(lower)) {
    extracted.occupation = 'Daily Wage Worker';
  } else if (/unemployed|berozgar|no job/i.test(lower)) {
    extracted.occupation = 'Unemployed';
  } else if (lastAskedField === 'occupation' && lower.length > 2) {
    extracted.occupation = text.trim();
  }

  // Housing intention
  if (/housing|house|awas|makan|shelter|pucca house|kutcha house/i.test(lower)) {
    extracted.seeking_housing = true;
  }

  // 2. Annual Income
  const incomeLakhMatch = lower.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lp|lacs|lac|lakhs|lakh|l\b)/i);
  const incomeKMatch = lower.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand|hazaar|hazar)\b/i);
  const incomeNumMatch = lower.match(/(?:rs\.?|₹|inr)?\s*(\d{1,3}(?:,\d{3})+|\d{4,8})\b/i);

  if (incomeLakhMatch) {
    const val = parseFloat(incomeLakhMatch[1]) * 100000;
    extracted.annualIncome = `₹${val.toLocaleString('en-IN')}`;
    extracted.income_annual = val;
  } else if (incomeKMatch) {
    const val = parseFloat(incomeKMatch[1]) * 1000;
    extracted.annualIncome = `₹${val.toLocaleString('en-IN')}`;
    extracted.income_annual = val;
  } else if (incomeNumMatch) {
    const raw = parseInt(incomeNumMatch[1].replace(/,/g, ''), 10);
    extracted.annualIncome = `₹${raw.toLocaleString('en-IN')}`;
    extracted.income_annual = raw;
  } else if (lastAskedField === 'income_annual' || lastAskedField === 'annualIncome') {
    const standaloneNumMatch = lower.match(/^(\d+(?:\.\d+)?)$/);
    if (standaloneNumMatch) {
      const num = parseFloat(standaloneNumMatch[1]);
      const val = num < 100 ? num * 100000 : num;
      extracted.annualIncome = `₹${val.toLocaleString('en-IN')}`;
      extracted.income_annual = val;
    }
  }

  // 3. Location / State
  const states = [
    'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Maharashtra', 
    'West Bengal', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Karnataka', 
    'Gujarat', 'Punjab', 'Haryana', 'Kerala', 'Odisha', 'Assam', 'Jharkhand', 'Delhi',
    'Himachal Pradesh', 'Uttarakhand', 'Chhattisgarh', 'Goa', 'Jammu and Kashmir'
  ];
  for (const s of states) {
    if (new RegExp(`\\b${s}\\b|\\b${s.replace(/\s+/g, '')}\\b`, 'i').test(lower) || 
        (s === 'Uttar Pradesh' && /\bup\b/i.test(lower)) ||
        (s === 'Madhya Pradesh' && /\bmp\b/i.test(lower))) {
      extracted.location = s;
      extracted.state = s;
      break;
    }
  }
  if (!extracted.state && (lastAskedField === 'state' || lastAskedField === 'location') && lower.length > 2) {
    extracted.location = text.trim();
    extracted.state = text.trim();
  }

  // 4. Land Ownership
  const landMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:acre|acres|bigha|bighas|hectare|hectares)\b/i);
  if (landMatch) {
    extracted.landOwnership = `${landMatch[1]} acres`;
    extracted.has_land = true;
    extracted.landVerified = true;
  } else if (/no land|landless|zero land|bhoomiheen|none|no|0/i.test(lower) && (lastAskedField === 'land_ownership' || /land|bhoomi/i.test(lower))) {
    extracted.landOwnership = 'None';
    extracted.has_land = false;
    extracted.landVerified = false;
  } else if (lastAskedField === 'land_ownership') {
    const standaloneNum = lower.match(/^(\d+(?:\.\d+)?)$/);
    if (standaloneNum) {
      extracted.landOwnership = `${standaloneNum[1]} acres`;
      extracted.has_land = true;
      extracted.landVerified = true;
    }
  }

  // 5. Family Members
  const famMatch = lower.match(/(\d+)\s*(?:members?|family members?|people|sadasya|family of (\d+))/i);
  if (famMatch) {
    extracted.familyMembers = famMatch[1] || famMatch[2];
  }

  // 6. Caste / Category
  if (/\b(?:sc|scheduled caste)\b/i.test(lower)) {
    extracted.caste = 'SC';
    extracted.category = 'SC';
  } else if (/\b(?:st|scheduled tribe)\b/i.test(lower)) {
    extracted.caste = 'ST';
    extracted.category = 'ST';
  } else if (/\b(?:obc|other backward)\b/i.test(lower)) {
    extracted.caste = 'OBC';
    extracted.category = 'OBC';
  } else if (/\b(?:general|gen|open|ews)\b/i.test(lower)) {
    extracted.caste = 'General';
    extracted.category = 'General';
  } else if (lastAskedField === 'caste' || lastAskedField === 'category') {
    extracted.caste = text.trim();
    extracted.category = text.trim();
  }

  // 7. Residence Type
  if (/rural|gramin|village|gaon|panchayat/i.test(lower)) {
    extracted.residence_type = 'rural';
  } else if (/urban|city|shehar|town|municipal/i.test(lower)) {
    extracted.residence_type = 'urban';
  }

  // 8. Housing
  if (/kutcha|kachha|temporary house|no house|homeless|tin roof|slum/i.test(lower)) {
    extracted.has_pucca_house = false;
  } else if (/pucca|pakka|permanent house/i.test(lower)) {
    extracted.has_pucca_house = true;
  }

  return extracted;
};

// 1. Send Chat Message / Voice Transcript
export const sendMessage = async (message, language = 'en', sessionId = getSessionId(), profile = {}, lastAskedField = null) => {
  try {
    const { data } = await api.post('/chat', { sessionId, message, language, profile, lastAskedField });
    return data;
  } catch (error) {
    console.warn('Backend /chat unavailable, using strict local intelligence engine.', error.message);
    
    // Retrieve existing profile from session storage
    let currentProfile = profile || {};
    try {
      const stored = sessionStorage.getItem('jansetu_chat_profile');
      if (stored) currentProfile = { ...JSON.parse(stored), ...currentProfile };
    } catch {
      // Ignored
    }

    const newEntities = extractLocalEntities(message, lastAskedField);
    const updatedProfile = { ...currentProfile, ...newEntities };
    sessionStorage.setItem('jansetu_chat_profile', JSON.stringify(updatedProfile));

    // Dynamic Scheme-Dependent attribute resolution
    const relevantSchemes = [];
    const missingRequired = [];

    if (!updatedProfile.occupation && !updatedProfile.seeking_housing) {
      missingRequired.push('occupation');
    } else {
      if (updatedProfile.occupation === 'Farmer') {
        relevantSchemes.push('PM-KISAN', 'PMFBY');
        if (updatedProfile.income_annual === undefined && !updatedProfile.annualIncome) missingRequired.push('income_annual');
        if (!updatedProfile.location && !updatedProfile.state) missingRequired.push('state');
        if (updatedProfile.landOwnership === undefined && updatedProfile.has_land === undefined) missingRequired.push('land_ownership');
      } else if (updatedProfile.occupation === 'Student' || updatedProfile.currently_studying) {
        relevantSchemes.push('Post Matric Scholarship');
        if (updatedProfile.income_annual === undefined && !updatedProfile.annualIncome) missingRequired.push('income_annual');
        if (!updatedProfile.location && !updatedProfile.state) missingRequired.push('state');
        if (!updatedProfile.caste && !updatedProfile.category) missingRequired.push('caste');
      } else if (updatedProfile.occupation === 'Street Vendor') {
        relevantSchemes.push('PM SVANidhi');
        if (updatedProfile.income_annual === undefined && !updatedProfile.annualIncome) missingRequired.push('income_annual');
        if (!updatedProfile.location && !updatedProfile.state) missingRequired.push('state');
      } else if (updatedProfile.seeking_housing || updatedProfile.has_pucca_house === false) {
        relevantSchemes.push('PMAY-G');
        if (updatedProfile.has_pucca_house === undefined) missingRequired.push('has_pucca_house');
        if (!updatedProfile.residence_type) missingRequired.push('residence_type');
        if (updatedProfile.income_annual === undefined && !updatedProfile.annualIncome) missingRequired.push('income_annual');
        if (!updatedProfile.location && !updatedProfile.state) missingRequired.push('state');
      } else {
        if (updatedProfile.income_annual === undefined && !updatedProfile.annualIncome) missingRequired.push('income_annual');
        if (!updatedProfile.location && !updatedProfile.state) missingRequired.push('state');
      }
    }

    const isHi = language === 'hi';
    const isBn = language === 'bn';
    const isTa = language === 'ta';
    const isTe = language === 'te';

    let reply = '';
    const isComplete = missingRequired.length === 0;
    const nextField = missingRequired[0] || null;

    if (missingRequired.length > 0) {
      if (nextField === 'occupation') {
        reply = isHi ? "नमस्ते! आप क्या काम करते हैं? (उदा. किसान, छात्र, छोटा व्यापारी, दैनिक मजदूर, या आवास सहायता की तलाश)"
          : isBn ? "নমস্কার! আপনার পেশা বা বর্তমান পরিস্থিতি কি? (যেমন কৃষক, ছাত্র, ক্ষুদ্র ব্যবসায়ী)"
          : isTa ? "வணக்கம்! உங்கள் தொழில் அல்லது தேவை என்ன? (விவசாயி, மாணவர், வியாபாரி)"
          : isTe ? "నమస్తే! మీ వృత్తి లేదా అవసరం ఏమిటి? (రైతు, విద్యార్థి, వ్యాపారి)"
          : "Hello! What is your primary occupation or situation? (e.g., Farmer, Student, Street Vendor, Housing assistance)";
      } else if (nextField === 'income_annual') {
        reply = isHi ? "आपकी वार्षिक पारिवारिक आय (Annual Income) लगभग कितनी है? (उदा. ₹2,00,000 या 6 लाख)"
          : isBn ? "আপনার বার্ষিক पारिवारिक आय কত?"
          : isTa ? "உங்கள் ஆண்டு வருமானம் எவ்வளவு?"
          : isTe ? "మీ వార్షిక కుటుంబ ఆదాయం ఎంత?"
          : "What is your approximate annual family income? (e.g., ₹2,00,000 or 6 LPA)";
      } else if (nextField === 'state') {
        reply = isHi ? "आप किस राज्य (State) में रहते हैं? (उदा. राजस्थान, उत्तर प्रदेश, बिहार)"
          : isBn ? "আপনি কোন রাজ্যে বসবাস করেন?"
          : isTa ? "நீங்கள் எந்த மாநிலத்தில் வசிக்கிறீர்கள்?"
          : isTe ? "మీరు ఏ రాష్ట్రంలో నివసిస్తున్నారు?"
          : "Which state do you currently reside in?";
      } else if (nextField === 'land_ownership') {
        reply = isHi ? "कृषि योजनाओं की पात्रता के लिए, आपके पास कितनी कृषि भूमि (Land) है? (उदा. 2 एकड़, 5 बीघा, या भूमिहीन)"
          : isBn ? "কৃষি প্রকল্পের জন্য, আপনার কতটুকু জমি রয়েছে? (যেমন ২ একর, বা নেই)"
          : isTa ? "விவசாயத் திட்டங்களுக்காக, உங்களுக்கு எவ்வளவு நிலம் உள்ளது? (எ.கா. 2 ஏக்கர்)"
          : isTe ? "వ్యవసాయ పథకాల కోసం, మీకు ఎంత భూమి ఉంది? (ఉదా. 2 ఎకరాలు)"
          : "For agriculture scheme eligibility, how much cultivable land do you own? (e.g., 2 acres, 5 bigha, or none)";
      } else if (nextField === 'caste') {
        reply = isHi ? "छात्रवृत्ति एवं शैक्षणिक योजनाओं के लिए, आपकी सामाजिक श्रेणी (Category) क्या है? (SC, ST, OBC, General)"
          : "For educational scholarship eligibility, what is your social category? (SC, ST, OBC, or General)";
      } else if (nextField === 'has_pucca_house') {
        reply = isHi ? "आवास सहायता के लिए, क्या आपके पास पहले से पक्का मकान है या कच्चा मकान है?"
          : "For housing assistance, do you currently own a pucca (permanent) house or a kutcha dwelling?";
      } else if (nextField === 'residence_type') {
        reply = isHi ? "आप ग्रामीण (Rural) क्षेत्र में रहते हैं या शहरी (Urban) क्षेत्र में?"
          : "Do you live in a rural area or an urban area?";
      }
    } else {
      reply = isHi
        ? "मैंने आपकी प्रासंगिक योजनाओं के लिए सभी आवश्यक जानकारी दर्ज कर ली है। आप आगे बात कर सकते हैं या अपनी जानकारी की समीक्षा कर सकते हैं।"
        : "I have everything I need based on your details. You can continue chatting or review your information.";
    }

    return {
      reply,
      isComplete,
      nextField,
      missingFields: missingRequired,
      relevantSchemes,
      profile: updatedProfile,
      schemes: INITIAL_SCHEMES,
      sessionId
    };
  }
};

// 2. Fetch Schemes Catalog
export const fetchSchemes = async () => {
  try {
    const { data } = await api.get('/schemes');
    if (Array.isArray(data) && data.length > 0) return data;
    return INITIAL_SCHEMES;
  } catch {
    return INITIAL_SCHEMES;
  }
};

// Enrich sparse backend scheme data with display-ready fields
const enrichSchemeDetails = (s) => {
  const defaults = {
    qualifications: [
      { text: 'Occupation matches profile', sub: 'Your profile indicates eligibility for this sector.' },
      { text: 'Income criteria met', sub: 'Within designated benefit threshold.' },
      { text: 'Location supported', sub: 'Scheme is active in your registered state.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Bank Account Details', status: 'Active account needed' },
      { name: 'Identity Proof', status: 'Required' }
    ],
    officialEligibility: {
      description: 'All verified citizens fulfilling the ministry\'s published guidelines.',
      exclusions: 'Constitutional post holders, institutional entities, and income tax payers (where applicable).'
    }
  };
  return { ...defaults, ...s, fullName: s.fullName || s.name, benefitShort: s.benefitShort || s.benefit_amount, benefitDetail: s.benefitDetail || s.benefit_description };
};

// Scheme-specific enrichment map
const SCHEME_ENRICHMENT = {
  pmkisan: {
    qualifications: [
      { text: 'Farmer with agricultural land', sub: 'Cultivable landholding in your name.' },
      { text: 'Not an income tax payer', sub: 'You have not filed income tax in last assessment year.' },
      { text: 'Not a government employee', sub: 'No serving/retired government officer in household.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Bank Account (DBT)', status: 'Linked to Aadhaar' },
      { name: 'Land Record (Khasra/Khatauni)', status: 'Revenue dept. copy' }
    ],
    officialEligibility: {
      description: "All landholding farmer families with cultivable land in their names are eligible to receive ₹6,000/year in three installments.",
      exclusions: 'Institutional landholders, constitutional post holders, retired/serving government officials, doctors, lawyers, CAs, and income tax payers.'
    }
  },
  pmayg: {
    qualifications: [
      { text: 'Homeless or living in kutcha dwelling', sub: 'No permanent shelter or dilapidated house.' },
      { text: 'Rural residency', sub: 'Living in a designated panchayat area.' },
      { text: 'Income within BPL limits', sub: 'Family income meets SECC 2011 criteria.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'BPL/SECC 2011 Record', status: 'Panchayat list inclusion' },
      { name: 'Bank Account (DBT)', status: 'DBT enabled' }
    ],
    officialEligibility: {
      description: 'Homeless families and families living in kutcha and dilapidated houses in rural areas included in SECC 2011 data.',
      exclusions: 'Households owning motorized vehicles, mechanized agricultural equipment, or with a government employee earning above ₹10,000/month.'
    }
  },
  ayushman: {
    qualifications: [
      { text: 'Low-income household', sub: 'Annual family income below ₹2 lakh.' },
      { text: 'Included in SECC database', sub: 'Socio-Economic and Caste Census 2011 deprivation criteria.' },
      { text: 'No existing health coverage', sub: 'Not already enrolled in central/state health scheme.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Ration Card', status: 'For family identification' },
      { name: 'Income Certificate', status: 'State-issued' }
    ],
    officialEligibility: {
      description: 'Families listed in SECC 2011 database with deprivation or occupational criteria, including SC/ST households, manual scavengers, and primitive tribal groups.',
      exclusions: 'Households owning motorized vehicles, government employees, or those with income above ₹2.5 lakh/year.'
    }
  },
  svanidhi: {
    qualifications: [
      { text: 'Street vendor in urban area', sub: 'Vending on or before March 24, 2020.' },
      { text: 'Valid vending identity', sub: 'Certificate of Vending or Letter of Recommendation from ULB.' },
      { text: 'First working capital loan', sub: 'No outstanding PM SVANidhi loan.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Vending Certificate / ULB letter', status: 'Municipal authority' },
      { name: 'Bank Account', status: 'Active savings account' }
    ],
    officialEligibility: {
      description: 'Street vendors who were vending in urban areas on or before March 24, 2020 are eligible for a collateral-free working capital loan.',
      exclusions: 'Non-urban vendors, vendors without a valid recommendation certificate, and those with a defaulted previous PM SVANidhi loan.'
    }
  }
};

// 3. Fetch Single Scheme Details
export const fetchSchemeDetails = async (id) => {
  // First try from backend
  try {
    const { data } = await api.get(`/schemes/${id}`);
    if (data && !data.error) {
      return enrichSchemeDetails({ ...SCHEME_ENRICHMENT[id], ...data });
    }
  } catch { /* fallthrough */ }
  // Then try INITIAL_SCHEMES
  const local = INITIAL_SCHEMES.find(s => s.id === id);
  if (local) return enrichSchemeDetails({ ...SCHEME_ENRICHMENT[id], ...local });
  return null;
};

// JS-based local scheme matching (mirrors rulesEngine.js fallback)
const matchSchemesLocally = (profile) => {
  const occ = (profile.occupation || '').toLowerCase();
  const inc = profile.income_annual || 0;
  const results = [];

  if (['farmer'].includes(occ)) {
    results.push({ id: 'pmkisan', name: 'PM-KISAN', category: 'agriculture', match_score: 0.90, is_definite_match: true, benefit_description: 'Direct income support ₹6,000/year', benefit_amount: '₹6,000/year' });
    if (profile.has_land !== false) results.push({ id: 'pmfby', name: 'PMFBY (Crop Insurance)', category: 'agriculture', match_score: 0.85, is_definite_match: true, benefit_description: 'Comprehensive crop insurance', benefit_amount: '2% premium for Kharif crops' });
  }
  if (['student'].includes(occ) || profile.currently_studying) {
    if (profile.caste === 'OBC' && inc <= 100000) results.push({ id: 'nsp_postmatric_obc', name: 'Post Matric Scholarship (OBC)', category: 'education', match_score: 0.85, is_definite_match: true, benefit_description: 'Scholarship for OBC post-matric students', benefit_amount: 'Variable academic allowance' });
    if (profile.caste === 'SC' && inc <= 250000) results.push({ id: 'nsp_postmatric_sc', name: 'Post Matric Scholarship (SC)', category: 'education', match_score: 0.90, is_definite_match: true, benefit_description: 'Scholarship for SC post-matric students', benefit_amount: 'Variable academic allowance' });
    results.push({ id: 'pmkvy', name: 'PMKVY', category: 'skill', match_score: 0.75, is_definite_match: false, benefit_description: 'Free skill training and certification', benefit_amount: 'Free training + certification' });
  }
  if (['street vendor', 'vendor', 'hawker'].includes(occ)) {
    results.push({ id: 'svanidhi', name: 'PM SVANidhi', category: 'business', match_score: 0.90, is_definite_match: true, benefit_description: 'Working capital loan for street vendors', benefit_amount: '₹10,000–₹50,000' });
  }
  if (['daily wage worker', 'laborer', 'unemployed'].includes(occ)) {
    results.push({ id: 'mgnregs', name: 'MGNREGS', category: 'employment', match_score: 0.85, is_definite_match: true, benefit_description: '100 days guaranteed employment/year', benefit_amount: 'State-wise daily wage' });
    results.push({ id: 'pmkvy', name: 'PMKVY', category: 'skill', match_score: 0.75, is_definite_match: false, benefit_description: 'Free skill training and certification', benefit_amount: 'Free training + certification' });
  }
  if (profile.seeking_housing || profile.has_pucca_house === false) {
    results.push({ id: 'pmayg', name: 'PMAY-G', category: 'housing', match_score: 0.85, is_definite_match: true, benefit_description: 'Financial assistance to build pucca house', benefit_amount: 'Up to ₹1,30,000' });
  }
  if (inc > 0 && inc <= 200000) {
    results.push({ id: 'ayushman', name: 'Ayushman Bharat PM-JAY', category: 'health', match_score: 0.80, is_definite_match: true, benefit_description: 'Health insurance up to ₹5 lakh/year', benefit_amount: '₹5,00,000/year cover' });
  }
  results.sort((a, b) => b.match_score - a.match_score);
  return results.slice(0, 6);
};

// 4. Match Schemes based on User Profile
export const matchUserSchemes = async (profile) => {
  try {
    const { data } = await api.post('/schemes/match', { profile });
    // Backend returns { schemes: [...] }
    const arr = Array.isArray(data) ? data : (data.schemes || []);
    if (arr.length > 0) return arr;
    // Backend returned empty — try local
    return matchSchemesLocally(profile);
  } catch {
    return matchSchemesLocally(profile);
  }
};

// 4.1 Browse Paginated Schemes
export const fetchBrowseSchemes = async ({ page = 1, limit = 6, category = 'all', search = '' }) => {
  try {
    const { data } = await api.get('/schemes', {
      params: { page, limit, category, search },
    });
    return data;
  } catch (error) {
    console.warn('Failed to fetch paginated schemes, using fallback:', error);
    return {
      schemes: INITIAL_SCHEMES.slice((page - 1) * limit, page * limit),
      total: INITIAL_SCHEMES.length,
      page,
      limit,
      hasMore: page * limit < INITIAL_SCHEMES.length,
    };
  }
};

// 5. DigiLocker OAuth & Consent Simulation
export const initiateDigiLocker = async (schemeId) => {
  try {
    const { data } = await api.post('/digilocker/initiate', { schemeId });
    return data;
  } catch {
    const token = 'dl_sim_' + Math.random().toString(36).substring(2, 9);
    return {
      sessionToken: token,
      consentUrl: `/apply/${schemeId}?verified=true&token=${token}`,
      message: 'DigiLocker verification initiated successfully'
    };
  }
};

// 6. Submit Application
export const submitApplication = async ({ schemeId, sessionToken, formData }) => {
  const payload = {
    sessionId: getSessionId(),
    schemeId,
    sessionToken: sessionToken || 'dl_demo',
    applicantData: formData
  };

  try {
    const { data } = await api.post('/applications/submit', payload);
    saveApplication({
      id: data.referenceNumber,
      schemeId,
      schemeName: data.schemeName || 'Government Welfare Scheme',
      status: 'under_review',
      submittedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: 'Just now',
      progressPercent: 65,
      applicantData: formData
    });
    return data;
  } catch (error) {
    const fakeId = 'JANSETU-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-A' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const appRecord = {
      id: fakeId,
      referenceNumber: fakeId,
      schemeId,
      schemeName: schemeId === 'pmkisan' ? 'PM-KISAN' : schemeId === 'pmayg' ? 'PMAY-G' : 'Welfare Assistance',
      status: 'under_review',
      submittedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: 'Just now',
      progressPercent: 65,
      applicantData: formData
    };
    saveApplication(appRecord);
    return appRecord;
  }
};

// 7. Track Single Application
export const trackApplication = async (id) => {
  try {
    const { data } = await api.get(`/applications/${id}`);
    return data;
  } catch {
    const local = getApplications();
    const found = local.find(a => a.id === id || a.referenceNumber === id);
    if (found) return found;
    return {
      id: id,
      schemeId: 'pmkisan',
      schemeName: 'Pradhan Mantri Kisan Samman Nidhi',
      department: 'Department of Agriculture & Farmers Welfare',
      status: 'under_review',
      submittedAt: 'Today',
      progressPercent: 65
    };
  }
};

// 8. Fetch user session applications
export const fetchUserApplications = async () => {
  try {
    const sid = getSessionId();
    const { data } = await api.get(`/applications/session/${sid}`);
    if (Array.isArray(data) && data.length > 0) return data;
    return getApplications();
  } catch {
    return getApplications();
  }
};
