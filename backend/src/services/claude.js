import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

let geminiModel;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// ── Off-topic detection ──────────────────────────────────────────────────────
const RELEVANT_KEYWORDS = [
  // Occupations & situations
  'farmer','kisan','kheti','krishi','agriculture','farming','crop',
  'student','padhai','vidhyarthi','college','school','studying',
  'vendor','thela','hawker','rehri','shopkeeper','dukan',
  'laborer','majdoor','daily wage','shramik','worker','construction',
  'unemployed','berozgar','housing','house','awas','makan','shelter',
  // Schemes & government
  'scheme','yojana','pm kisan','pmfby','pmay','svanidhi','mgnregs',
  'scholarship','subsidy','benefit','government','sarkaar',
  'welfare','social','assistance','eligibility','apply','application',
  'sarkar','pradhan mantri','mukhyamantri','ration','bpl','apl',
  // Profile fields
  'income','aay','annual','salary','land','zameen','acres','bigha',
  'caste','jati','sc','st','obc','general','rajya','district',
  'rural','urban','pucca','kutcha','family','parivar','members',
  'occupation','job','kaam','rozgar','pension','widow','divyang',
  // Platform greetings/intent
  'namaste','namaskar','help','madad','jan setu','jansetu',
  'scheme','yojana','form','document','aadhaar','ration card',
];

// Phrases that are clearly off-topic — checked BEFORE keyword matching
const OFF_TOPIC_PATTERNS = [
  /mother.*name|father.*name|brother.*name|sister.*name/i,
  /\b(cricket|football|movie|film|song|music|actor|actress|celebrity)\b/i,
  /\b(recipe|cook|food|restaurant|hotel)\b/i,
  /\b(weather|temperature|rain|today.*news)\b/i,
  /\b(joke|funny|laugh|comedy)\b/i,
  /\b(girlfriend|boyfriend|love|marriage|wedding)\b/i,
  /\b(stock|crypto|bitcoin|share market|trading)\b/i,
  /\b(game|gaming|pubg|fortnite|chess)\b/i,
  /\b(password|hack|login.*issue|email.*problem)\b/i,
];

/**
 * Returns true when the message appears to be about government welfare,
 * schemes, the user's profile, or general platform interaction.
 *
 * Single-token replies (e.g. "Bihar", "OBC", "5000", "yes", "6lpa")
 * are always treated as valid profile answers and bypass all checks.
 * Multi-word messages are checked against off-topic patterns first,
 * then must contain at least one relevant keyword.
 */
const isRelevantMessage = (message = '') => {
  const lower = message.toLowerCase().trim();

  // Single-token replies: no spaces → always a profile answer
  // e.g. "Bihar", "OBC", "5000", "6lpa", "yes", "no", "rural", "SC"
  if (/^\S+$/.test(lower)) return true;

  // Explicitly off-topic patterns → reject immediately
  if (OFF_TOPIC_PATTERNS.some((p) => p.test(lower))) return false;

  // Multi-word message: must contain at least one relevant keyword
  return RELEVANT_KEYWORDS.some((kw) => lower.includes(kw));
};

/** Polite off-topic response in the user's language. */
const getOffTopicReply = (language = 'en') => {
  const msgs = {
    hi: 'कृपया Jan-Setu से संबंधित प्रश्न पूछें। मैं केवल सरकारी योजनाओं और आपकी पात्रता में सहायता कर सकता हूं।',
    bn: 'অনুগ্রহ করে Jan-Setu সম্পর্কিত প্রশ্ন করুন। আমি শুধুমাত্র সরকারি প্রকল্প এবং আপনার যোগ্যতা বিষয়ে সাহায্য করতে পারি।',
    ta: 'Jan-Setu தொடர்பான கேள்விகளை மட்டுமே கேளுங்கள். அரசு திட்டங்கள் மற்றும் தகுதி குறித்து மட்டுமே உதவ முடியும்.',
    te: 'దయచేసి Jan-Setu సంబంధిత ప్రశ్నలు మాత్రమే అడగండి. ప్రభుత్వ పథకాలు మరియు అర్హత విషయంలో మాత్రమే సహాయం చేయగలను.',
    en: 'Please ask questions related to Jan-Setu and government welfare schemes only. I can only help with scheme eligibility and your profile.',
  };
  return msgs[language] || msgs['en'];
};

// Convert written numbers to digits
const wordToNumber = (text) => {
  const map = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'che': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10
  };
  return text.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|paanch|che|saat|aath|nau|das)\b/gi, (m) => map[m.toLowerCase()] || m);
};

// Deterministic entity extractor for Indian demographic & welfare attributes
export const parseTextEntities = (text = '', lastAskedField = null) => {
  const normalized = wordToNumber(text);
  const lower = normalized.toLowerCase().trim();
  const extracted = {};

  // 1. Occupation & Livelihood / Situation
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
    extracted.income_annual = val;
    extracted.annualIncome = `₹${val.toLocaleString('en-IN')}`;
  } else if (incomeKMatch) {
    const val = parseFloat(incomeKMatch[1]) * 1000;
    extracted.income_annual = val;
    extracted.annualIncome = `₹${val.toLocaleString('en-IN')}`;
  } else if (incomeNumMatch) {
    const raw = parseInt(incomeNumMatch[1].replace(/,/g, ''), 10);
    extracted.income_annual = raw;
    extracted.annualIncome = `₹${raw.toLocaleString('en-IN')}`;
  } else if (lastAskedField === 'income_annual' || lastAskedField === 'annualIncome') {
    const standaloneNumMatch = lower.match(/^(\d+(?:\.\d+)?)$/);
    if (standaloneNumMatch) {
      const num = parseFloat(standaloneNumMatch[1]);
      const val = num < 100 ? num * 100000 : num;
      extracted.income_annual = val;
      extracted.annualIncome = `₹${val.toLocaleString('en-IN')}`;
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
      extracted.state = s;
      extracted.location = s;
      break;
    }
  }
  if (!extracted.state && (lastAskedField === 'state' || lastAskedField === 'location') && lower.length > 2) {
    extracted.state = text.trim();
    extracted.location = text.trim();
  }

  // 4. Land Ownership
  const landMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:acre|acres|bigha|bighas|hectare|hectares)\b/i);
  if (landMatch) {
    extracted.land_ownership = `${landMatch[1]} acres`;
    extracted.landOwnership = `${landMatch[1]} acres`;
    extracted.has_land = true;
  } else if (/no land|landless|zero land|bhoomiheen|none|no|0/i.test(lower) && (lastAskedField === 'land_ownership' || /land|bhoomi/i.test(lower))) {
    extracted.land_ownership = 'None';
    extracted.landOwnership = 'None';
    extracted.has_land = false;
  } else if (lastAskedField === 'land_ownership') {
    const standaloneNum = lower.match(/^(\d+(?:\.\d+)?)$/);
    if (standaloneNum) {
      extracted.land_ownership = `${standaloneNum[1]} acres`;
      extracted.landOwnership = `${standaloneNum[1]} acres`;
      extracted.has_land = true;
    }
  }

  // 5. Family Members
  const famMatch = lower.match(/(\d+)\s*(?:members?|family members?|people|sadasya|family of (\d+))/i);
  if (famMatch) {
    const count = famMatch[1] || famMatch[2];
    extracted.family_size = parseInt(count, 10);
    extracted.familyMembers = `${count}`;
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

  // 7. Residence Type (Rural / Urban)
  if (/rural|gramin|village|gaon|panchayat/i.test(lower)) {
    extracted.residence_type = 'rural';
  } else if (/urban|city|shehar|town|municipal/i.test(lower)) {
    extracted.residence_type = 'urban';
  } else if (lastAskedField === 'residence_type') {
    extracted.residence_type = /rural|village|gaon/i.test(lower) ? 'rural' : 'urban';
  }

  // 8. Housing Type
  if (/kutcha|kachha|temporary house|no house|homeless|tin roof|slum/i.test(lower)) {
    extracted.has_pucca_house = false;
  } else if (/pucca|pakka|permanent house/i.test(lower)) {
    extracted.has_pucca_house = true;
  } else if (lastAskedField === 'has_pucca_house') {
    extracted.has_pucca_house = /yes|pucca|pakka/i.test(lower);
  }

  return extracted;
};

// Dynamic Scheme-Dependent Scheme Catalog Rules
export const SCHEMES_SCHEMA = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    isRelevant: (p) => p.occupation === 'Farmer',
    requiredFields: ['income_annual', 'state', 'has_land'],
    optionalFields: ['family_size']
  },
  {
    id: 'pmfby',
    name: 'PMFBY (Crop Insurance)',
    isRelevant: (p) => p.occupation === 'Farmer',
    requiredFields: ['has_land', 'state'],
    optionalFields: ['crop_type']
  },
  {
    id: 'nsp_postmatric_sc',
    name: 'Post Matric Scholarship',
    isRelevant: (p) => p.occupation === 'Student' || p.currently_studying,
    requiredFields: ['income_annual', 'state', 'caste'],
    optionalFields: ['education_level']
  },
  {
    id: 'pmayg',
    name: 'PMAY-G (Housing)',
    isRelevant: (p) => p.seeking_housing || p.has_pucca_house === false || (p.occupation === 'Daily Wage Worker' && !p.has_pucca_house),
    requiredFields: ['has_pucca_house', 'residence_type', 'income_annual', 'state'],
    optionalFields: ['family_size']
  },
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    isRelevant: (p) => p.occupation === 'Street Vendor',
    requiredFields: ['income_annual', 'state'],
    optionalFields: ['vending_certificate']
  },
  {
    id: 'mgnregs',
    name: 'MGNREGS',
    isRelevant: (p) => p.occupation === 'Daily Wage Worker' || p.occupation === 'Unemployed',
    requiredFields: ['residence_type', 'state'],
    optionalFields: ['income_annual']
  }
];

// Dynamically determine candidate schemes and their missing required attributes
export const getDynamicMissingAttributes = (profile = {}) => {
  // If no occupation or general situation is provided yet
  if (!profile.occupation && !profile.seeking_housing) {
    return {
      relevantSchemes: [],
      missingRequired: ['occupation'],
      missingOptional: []
    };
  }

  // 1. Find all candidate schemes relevant to the user's situation
  const relevantSchemes = SCHEMES_SCHEMA.filter(s => s.isRelevant(profile));

  // If user provided an occupation that doesn't trigger specific schemes yet, use baseline requirements
  if (relevantSchemes.length === 0) {
    const baselineMissing = [];
    if (profile.income_annual === undefined && !profile.annualIncome) baselineMissing.push('income_annual');
    if (!profile.state && !profile.location) baselineMissing.push('state');
    return {
      relevantSchemes: [],
      missingRequired: baselineMissing,
      missingOptional: []
    };
  }

  // 2. Collect only the required attributes across the relevant candidate schemes
  const requiredSet = new Set();
  const optionalSet = new Set();

  for (const scheme of relevantSchemes) {
    for (const req of scheme.requiredFields) requiredSet.add(req);
    for (const opt of scheme.optionalFields || []) optionalSet.add(opt);
  }

  // 3. Filter out attributes already provided in profile
  const missingRequired = [];
  for (const field of requiredSet) {
    if (field === 'income_annual' && profile.income_annual === undefined && !profile.annualIncome) {
      missingRequired.push('income_annual');
    } else if (field === 'state' && !profile.state && !profile.location) {
      missingRequired.push('state');
    } else if (field === 'has_land' && profile.has_land === undefined && !profile.landOwnership) {
      missingRequired.push('land_ownership');
    } else if (field === 'caste' && !profile.caste && !profile.category) {
      missingRequired.push('caste');
    } else if (field === 'has_pucca_house' && profile.has_pucca_house === undefined) {
      missingRequired.push('has_pucca_house');
    } else if (field === 'residence_type' && !profile.residence_type) {
      missingRequired.push('residence_type');
    }
  }

  return {
    relevantSchemes: relevantSchemes.map(s => s.name),
    missingRequired,
    missingOptional: Array.from(optionalSet)
  };
};

export const extractUserProfile = async (message, language = 'en', conversationHistory = [], lastAskedField = null) => {
  const parsed = parseTextEntities(message, lastAskedField);

  if (geminiModel) {
    const prompt = `You are JanSetu AI. Extract ONLY the attributes EXPLICITLY mentioned in the user message.
Last asked field: "${lastAskedField || 'none'}".
User Message: "${message}"

Do NOT assume or invent missing values.
Return valid JSON with only explicitly mentioned keys from:
{ occupation, income_annual, state, land_ownership, family_size, caste, has_pucca_house, residence_type }`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const llmParsed = JSON.parse(jsonMatch[0]);
        return { ...parsed, ...llmParsed };
      }
    } catch (error) {
      console.warn("Gemini API fallback to rule parser:", error.message);
    }
  }

  return parsed;
};

export const generateResponse = async (userMessage, profile, schemes, language = 'en', step = 1, lastAskedField = null) => {
  // ── Off-topic guard ─────────────────────────────────────────────────────────
  if (!isRelevantMessage(userMessage)) {
    return {
      reply: getOffTopicReply(language),
      nextField: lastAskedField,
      missingFields: [],
      relevantSchemes: [],
      isComplete: false
    };
  }

  const { relevantSchemes, missingRequired } = getDynamicMissingAttributes(profile);

  // If Gemini model is available
  if (geminiModel) {
    const prompt = `You are JanSetu AI, an empathetic Indian civic assistant.
Language: ${language}.
Current Verified Profile: ${JSON.stringify(profile)}.
Identified Relevant Scheme Programs: ${JSON.stringify(relevantSchemes)}.
Missing REQUIRED criteria for these schemes: ${JSON.stringify(missingRequired)}.
Last asked field: "${lastAskedField || 'none'}".
User Message: "${userMessage}".

Instructions:
1. If missing REQUIRED criteria exist, ask ONLY for the first missing criterion: "${missingRequired[0]}".
2. Do NOT ask about criteria irrelevant to the identified schemes (e.g. do NOT ask farmers about caste, do NOT ask students about land).
3. If missing REQUIRED criteria is empty, confirm that you have collected the necessary details for their relevant schemes and invite them to review their information.
4. If the user's message is completely unrelated to government schemes or welfare, politely say: "Please ask questions related to Jan-Setu and government welfare schemes."
Keep response brief, natural, and helpful in ${language}.`;

    try {
      const result = await geminiModel.generateContent(prompt);
      return {
        reply: result.response.text(),
        nextField: missingRequired[0] || null,
        missingFields: missingRequired,
        relevantSchemes,
        isComplete: missingRequired.length === 0
      };
    } catch (error) {
      console.warn("Gemini API generateResponse fallback:", error.message);
    }
  }

  const isHi = language === 'hi';
  const isBn = language === 'bn';
  const isTa = language === 'ta';
  const isTe = language === 'te';

  if (missingRequired.length > 0) {
    const nextField = missingRequired[0];

    if (nextField === 'occupation') {
      const reply = isHi ? "नमस्ते! आप क्या काम करते हैं? (उदा. किसान, छात्र, छोटा व्यापारी, दैनिक मजदूर, या आवास सहायता की तलाश)"
        : isBn ? "নমস্কার! আপনার পেশা বা বর্তমান পরিস্থিতি কি? (যেমন কৃষক, ছাত্র, ক্ষুদ্র ব্যবসায়ী)"
        : isTa ? "வணக்கம்! உங்கள் தொழில் அல்லது தேவை என்ன? (விவசாயி, மாணவர், வியாபாரி)"
        : isTe ? "నమస్తే! మీ వృత్తి లేదా అవసరం ఏమిటి? (రైతు, విద్యార్థి, వ్యాపారి)"
        : "Hello! What is your primary occupation or situation? (e.g., Farmer, Student, Street Vendor, Housing assistance)";
      return { reply, nextField: 'occupation', missingFields: missingRequired, isComplete: false };
    }

    if (nextField === 'income_annual') {
      const reply = isHi ? "आपकी वार्षिक पारिवारिक आय (Annual Income) लगभग कितनी है? (उदा. ₹2,00,000 या 6 लाख)"
        : isBn ? "আপনার বার্ষিক पारिवारिक आय কত?"
        : isTa ? "உங்கள் ஆண்டு வருமானம் எவ்வளவு?"
        : isTe ? "మీ వార్షిక కుటుంబ ఆదాయం ఎంత?"
        : "What is your approximate annual family income? (e.g., ₹2,00,000 or 6 LPA)";
      return { reply, nextField: 'income_annual', missingFields: missingRequired, isComplete: false };
    }

    if (nextField === 'state') {
      const reply = isHi ? "आप किस राज्य (State) में रहते हैं? (उदा. राजस्थान, उत्तर प्रदेश, बिहार)"
        : isBn ? "আপনি কোন রাজ্যে বসবাস করেন?"
        : isTa ? "நீங்கள் எந்த மாநிலத்தில் வசிக்கிறீர்கள்?"
        : isTe ? "మీరు ఏ రాష్ట్రంలో నివసిస్తున్నారు?"
        : "Which state do you currently reside in?";
      return { reply, nextField: 'state', missingFields: missingRequired, isComplete: false };
    }

    if (nextField === 'land_ownership') {
      const reply = isHi ? "कृषि योजनाओं की पात्रता के लिए, आपके पास कितनी कृषि भूमि (Land) है? (उदा. 2 एकड़, 5 बीघा, या भूमिहीन)"
        : isBn ? "কৃষি প্রকল্পের জন্য, আপনার কতটুকু জমি রয়েছে? (যেমন ২ একর, বা নেই)"
        : isTa ? "விவசாயத் திட்டங்களுக்காக, உங்களுக்கு எவ்வளவு நிலம் உள்ளது? (எ.கா. 2 ஏக்கர்)"
        : isTe ? "వ్యవసాయ పథకాల కోసం, మీకు ఎంత భూమి ఉంది? (ఉదా. 2 ఎకరాలు)"
        : "For agriculture scheme eligibility, how much cultivable land do you own? (e.g., 2 acres, 5 bigha, or none)";
      return { reply, nextField: 'land_ownership', missingFields: missingRequired, isComplete: false };
    }

    if (nextField === 'caste') {
      const reply = isHi ? "छात्रवृत्ति एवं शैक्षणिक योजनाओं के लिए, आपकी सामाजिक श्रेणी (Category) क्या है? (SC, ST, OBC, General)"
        : "For educational scholarship eligibility, what is your social category? (SC, ST, OBC, or General)";
      return { reply, nextField: 'caste', missingFields: missingRequired, isComplete: false };
    }

    if (nextField === 'has_pucca_house') {
      const reply = isHi ? "आवास सहायता के लिए, क्या आपके पास पहले से पक्का मकान है या कच्चा मकान है?"
        : "For housing assistance, do you currently own a pucca (permanent) house or a kutcha dwelling?";
      return { reply, nextField: 'has_pucca_house', missingFields: missingRequired, isComplete: false };
    }

    if (nextField === 'residence_type') {
      const reply = isHi ? "आप ग्रामीण (Rural) क्षेत्र में रहते हैं या शहरी (Urban) क्षेत्र में?"
        : "Do you live in a rural area or an urban area?";
      return { reply, nextField: 'residence_type', missingFields: missingRequired, isComplete: false };
    }
  }

  // All required fields for relevant schemes collected!
  const completeReply = isHi
    ? "मैंने आपकी प्रासंगिक योजनाओं के लिए सभी आवश्यक जानकारी दर्ज कर ली है। आप आगे बात कर सकते हैं या अपनी जानकारी की समीक्षा कर सकते हैं।"
    : isBn
    ? "আমি আপনার প্রাসঙ্গিক প্রকল্পের সমস্ত প্রয়োজনীয় তথ্য পেয়েছি। আপনি পর্যালোচনা করতে পারেন।"
    : isTa
    ? "உங்கள் திட்டங்களுக்குத் தேவையான அனைத்து தகவல்களும் கிடைத்துள்ளன. விவரங்களை மதிப்பாய்வு செய்யலாம்."
    : isTe
    ? "మీ పథకాలకు అవసరమైన మొత్తం సమాచారం లభించింది. మీరు సమీక్షించవచ్చు."
    : "I have everything I need based on your details. You can continue chatting or review your information.";

  return {
    reply: completeReply,
    nextField: null,
    missingFields: [],
    relevantSchemes,
    isComplete: true
  };
};
