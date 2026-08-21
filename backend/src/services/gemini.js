import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

let geminiModel;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

const LANGUAGE_NAMES = {
  hi: 'Hindi (हिंदी)',
  bn: 'Bengali (বাংলা)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)',
  en: 'English',
};

// Off-topic guard
const OFF_TOPIC_PATTERNS = [
  /\b(cricket|football|movie|film|song|music|actor|actress|celebrity)\b/i,
  /\b(recipe|cook|restaurant|hotel)\b/i,
  /\b(weather|temperature|rain)\b/i,
  /\b(joke|funny|comedy)\b/i,
  /\b(girlfriend|boyfriend|love|marriage|wedding)\b/i,
  /\b(stock|crypto|bitcoin|share market|trading)\b/i,
  /\b(game|gaming|pubg|fortnite)\b/i,
];

const isOffTopic = (msg) => OFF_TOPIC_PATTERNS.some((p) => p.test(msg));

/** Polite off-topic response in the target language. */
const getOffTopicReply = (language = 'en') => {
  const msgs = {
    hi: 'कृपया जन-सेतु और सरकारी कल्याणकारी योजनाओं से संबंधित प्रश्न ही पूछें। मैं केवल योजनाओं की पात्रता और सहायता में मदद कर सकता हूं।',
    bn: 'অনুগ্রহ করে জন-সেতু এবং সরকারি কল্যাণমূলক প্রকল্প সম্পর্কিত প্রশ্ন করুন। আমি শুধুমাত্র সরকারি প্রকল্পের যোগ্যতায় সাহায্য করতে পারি।',
    ta: 'தயவுசெய்து அரசு நலத்திட்டங்கள் தொடர்பான கேள்விகளை மட்டும் கேளுங்கள். திட்டங்களின் தகுதி குறித்து மட்டுமே உதவ முடியும்.',
    te: 'దయచేసి ప్రభుత్వ సంక్షేమ పథకాలకు సంబంధించిన ప్రశ్నలు మాత్రమే అడగండి. పథకాల అర్హత విషయంలో మాత్రమే నేను సహాయం చేయగలను.',
    en: 'I can only help with Indian government welfare schemes and eligibility. Please ask about schemes related to agriculture, education, housing, employment, or social welfare.',
  };
  return msgs[language] || msgs['en'];
};

/**
 * Calls Gemini to suggest 5-6 relevant Indian government schemes based on
 * the user's message, profile, and selected language.
 */
export const suggestSchemes = async (userMessage, profile = {}, language = 'en') => {
  const targetLanguageName = LANGUAGE_NAMES[language] || LANGUAGE_NAMES['en'];

  // Off-topic guard
  if (isOffTopic(userMessage)) {
    return {
      reply: getOffTopicReply(language),
      schemes: [],
    };
  }

  const profileSummary = Object.entries(profile)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ') || 'not provided';

  const prompt = `You are JanSetu AI, an empathetic Indian government civic welfare scheme assistant.

TARGET OUTPUT LANGUAGE: ${targetLanguageName} (Language code: ${language})
CRITICAL INSTRUCTION: You MUST write your response entirely in ${targetLanguageName}. All textual fields inside the JSON ("reply", "name", "shortName", "ministry", "description", "benefit", "eligibility" items, and "requiredDocs" items) MUST be written in ${targetLanguageName} script and vocabulary. The JSON keys themselves must remain in English.

User's demographic profile: ${profileSummary}
User's query: "${userMessage}"

Based on the user's query and profile, suggest AT LEAST 5 TO 6 relevant Indian central or state government schemes (provide between 5 and 6 well-matched schemes).

IMPORTANT: Respond ONLY with a valid JSON object in EXACTLY this format, without any markdown backticks or commentary:
{
  "reply": "A helpful 1-2 sentence response acknowledging the query in ${targetLanguageName}",
  "schemes": [
    {
      "id": "unique_scheme_id_lowercase_underscore",
      "name": "Full Scheme Name in ${targetLanguageName}",
      "shortName": "Short name / Acronym",
      "ministry": "Ministry or department name in ${targetLanguageName}",
      "category": "agriculture|education|housing|health|employment|business|social|skill",
      "description": "2-3 sentence summary in ${targetLanguageName}",
      "benefit": "Key benefit amount or assistance in ${targetLanguageName}",
      "eligibility": ["Eligibility point 1 in ${targetLanguageName}", "Eligibility point 2 in ${targetLanguageName}", "Eligibility point 3 in ${targetLanguageName}"],
      "requiredDocs": ["Document 1 in ${targetLanguageName} (e.g. आधार कार्ड / Aadhaar)", "Document 2 in ${targetLanguageName}"],
      "applyUrl": "https://official-government-portal.gov.in"
    }
  ]
}`;

  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.schemes) parsed.schemes = [];
        if (parsed.schemes.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Gemini API error, using fallback:', err.message);
    }
  }

  // Fallback: return static schemes (at least 5-6 schemes)
  return getLocalizedFallbackSchemes(userMessage, language);
};

const getLocalizedFallbackSchemes = (message, language = 'en') => {
  const lower = message.toLowerCase();
  const isHi = language === 'hi';
  const isBn = language === 'bn';
  const isTa = language === 'ta';
  const isTe = language === 'te';

  const schemes = [];

  if (/educat|school|college|student|scholar|शिक्षा|छात्र|पढ़ाई|পড়াশোনা|கல்வி|చదువు/i.test(lower)) {
    schemes.push(
      {
        id: 'nsp_postmatric_sc',
        name: isHi ? 'अनुसूचित जाति के छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति' : 'Post Matric Scholarship for SC Students',
        shortName: 'NSP-SC',
        ministry: isHi ? 'सामाजिक न्याय और अधिकारिता मंत्रालय' : 'Ministry of Social Justice',
        category: 'education',
        description: isHi ? 'मैट्रिकोत्तर शिक्षा प्राप्त कर रहे अनुसूचित जाति के छात्रों के लिए वित्तीय छात्रवृत्ति।' : 'Financial scholarship for Scheduled Caste students pursuing post-matric education.',
        benefit: isHi ? 'पूर्ण शिक्षण शुल्क + मासिक भत्ता' : 'Full tuition + maintenance allowance',
        eligibility: isHi ? ['SC श्रेणी', 'मैट्रिकोत्तर छात्र', 'पारिवारिक वार्षिक आय < ₹2.5 लाख'] : ['SC category', 'Post-matric student', 'Family annual income < ₹2.5 Lakh'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जाति प्रमाण पत्र', 'आय प्रमाण पत्र', 'अंकतालिका'] : ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Marksheet'],
        applyUrl: 'https://scholarships.gov.in',
      },
      {
        id: 'pmkvy',
        name: isHi ? 'प्रधानमंत्री कौशल विकास योजना 4.0' : 'PM Kaushal Vikas Yojana 4.0',
        shortName: 'PMKVY',
        ministry: isHi ? 'कौशल विकास एवं उद्यमिता मंत्रालय' : 'Ministry of Skill Development',
        category: 'skill',
        description: isHi ? 'युवाओं के लिए उद्योग-उन्मुख मुफ्त कौशल प्रशिक्षण और प्रमाणन।' : 'Free skill training and certification for youth.',
        benefit: isHi ? 'मुफ्त प्रशिक्षण + ₹8,000 मौद्रिक पुरस्कार' : 'Free training + ₹8,000 reward',
        eligibility: isHi ? ['आयु 15-45 वर्ष', 'भारतीय नागरिक', 'बेरोजगार या स्कूल ड्रॉपआउट'] : ['Age 15-45', 'Indian citizen', 'Unemployed or school dropout'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक खाता', 'शिक्षा प्रमाण पत्र'] : ['Aadhaar Card', 'Bank Account', 'Education Certificate'],
        applyUrl: 'https://pmkvyofficial.org',
      },
      {
        id: 'nmmss',
        name: isHi ? 'राष्ट्रीय मीन्स-कम-मेरिट छात्रवृत्ति योजना' : 'National Means-cum-Merit Scholarship',
        shortName: 'NMMSS',
        ministry: isHi ? 'शिक्षा मंत्रालय' : 'Ministry of Education',
        category: 'education',
        description: isHi ? 'आर्थिक रूप से कमजोर मेधावी छात्रों के लिए कक्षा 9 से 12 तक छात्रवृत्ति।' : 'Scholarship for meritorious students from economically weaker sections.',
        benefit: isHi ? '₹12,000 प्रति वर्ष' : '₹12,000 / year',
        eligibility: isHi ? ['कक्षा 8 उत्तीर्ण', 'पारिवारिक आय < ₹3.5 लाख'] : ['Class 8 passed', 'Family income < ₹3.5 Lakh'],
        requiredDocs: isHi ? ['आधार कार्ड', 'आय प्रमाण पत्र', 'अंकतालिका'] : ['Aadhaar Card', 'Income Certificate', 'Marksheet'],
        applyUrl: 'https://scholarships.gov.in',
      },
      {
        id: 'cbse_single_girl',
        name: isHi ? 'सीबीएसई एकल बालिका संतान छात्रवृत्ति' : 'CBSE Single Girl Child Scholarship',
        shortName: 'CBSE-SGC',
        ministry: isHi ? 'शिक्षा मंत्रालय' : 'Department of School Education',
        category: 'education',
        description: isHi ? 'माता-पिता की एकमात्र बालिका संतान के लिए 11वीं और 12वीं में छात्रवृत्ति।' : 'Scholarship for single girl child pursuing Class 11 and 12.',
        benefit: isHi ? '₹500 प्रति माह 2 वर्ष तक' : '₹500 / month for 2 years',
        eligibility: isHi ? ['एकमात्र कन्या संतान', '10वीं में 60%+ अंक'] : ['Single girl child', '60%+ marks in 10th'],
        requiredDocs: isHi ? ['आधार कार्ड', 'एकल संतान शपथ पत्र', '10वीं अंकतालिका'] : ['Aadhaar Card', 'Affidavit', '10th Marksheet'],
        applyUrl: 'https://cbse.gov.in',
      },
      {
        id: 'pm_usp',
        name: isHi ? 'पीएम उच्चतर शिक्षा प्रोत्साहन छात्रवृत्ति' : 'PM Higher Education Scholarship',
        shortName: 'PM-USP',
        ministry: isHi ? 'उच्च शिक्षा विभाग' : 'Department of Higher Education',
        category: 'education',
        description: isHi ? 'कॉलेज और विश्वविद्यालय स्तर के मेधावी छात्रों के लिए छात्रवृत्ति सहायता।' : 'Financial assistance for college and university students.',
        benefit: isHi ? '₹12,000 से ₹20,000 प्रति वर्ष' : '₹12,000 - ₹20,000 / year',
        eligibility: isHi ? ['12वीं में शीर्ष 20 प्रतिशत', 'आय < ₹4.5 लाख'] : ['Top 20th percentile in 12th', 'Income < ₹4.5L'],
        requiredDocs: isHi ? ['आधार कार्ड', 'कॉलेज प्रवेश रसीद', 'आय प्रमाण पत्र'] : ['Aadhaar', 'College ID', 'Income Certificate'],
        applyUrl: 'https://scholarships.gov.in',
      },
      {
        id: 'pm_vishwakarma',
        name: isHi ? 'पीएम विश्वकर्मा योजना (कौशल विकास)' : 'PM Vishwakarma Scheme',
        shortName: 'PM-Vishwakarma',
        ministry: isHi ? 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय' : 'Ministry of MSME',
        category: 'skill',
        description: isHi ? 'पारंपरिक कारीगरों और शिल्पकारों के लिए कौशल संवर्धन व टूलकिट प्रोत्साहन।' : 'Skill upgrade and toolkit grant for traditional artisans.',
        benefit: isHi ? '₹15,000 टूलकिट अनुदान + ₹3 लाख तक ऋण' : '₹15,000 Toolkit + Loan up to ₹3 Lakh',
        eligibility: isHi ? ['पारंपरिक 18 ट्रेड कारीगर', 'न्यूनतम आयु 18 वर्ष'] : ['Traditional craftsperson', 'Age 18+'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक पासबुक', 'शिल्पकार पहचान'] : ['Aadhaar', 'Bank Passbook'],
        applyUrl: 'https://pmvishwakarma.gov.in',
      }
    );
  } else if (/farm|kisan|agricultur|crop|land|किसान|खेती|कृষি|விவசாயம்|వ్యవసాయం/i.test(lower)) {
    schemes.push(
      {
        id: 'pmkisan',
        name: isHi ? 'प्रधानमंत्री किसान सम्मान निधि' : 'PM Kisan Samman Nidhi',
        shortName: 'PM-KISAN',
        ministry: isHi ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture',
        category: 'agriculture',
        description: isHi ? 'भूमिधारक किसान परिवारों को ₹6,000/वर्ष की प्रत्यक्ष आय सहायता 3 किश्तों में।' : 'Direct income support of ₹6,000/year to landholding farmer families.',
        benefit: isHi ? '₹6,000 प्रति वर्ष (₹2,000 की 3 किश्तें)' : '₹6,000 / year in 3 installments',
        eligibility: isHi ? ['भूमिधारक किसान परिवार', 'आयकर दाता नहीं', 'सरकारी कर्मचारी नहीं'] : ['Landholding farmer family', 'Not an income tax payer'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जमीन के कागजात (खसरा/खतौनी)', 'बैंक खाता (DBT)'] : ['Aadhaar Card', 'Land Records', 'Bank Account (DBT)'],
        applyUrl: 'https://pmkisan.gov.in',
      },
      {
        id: 'pmfby',
        name: isHi ? 'प्रधानमंत्री फसल बीमा योजना' : 'PM Fasal Bima Yojana',
        shortName: 'PMFBY',
        ministry: isHi ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture',
        category: 'agriculture',
        description: isHi ? 'प्राकृतिक आपदाओं और कीटों से फसल खराब होने पर व्यापक फसल बीमा।' : 'Comprehensive crop insurance scheme for farmers.',
        benefit: isHi ? 'खरीफ फसलों हेतु मात्र 2% प्रीमियम' : '2% premium for Kharif crops',
        eligibility: isHi ? ['किसान अथवा बटाईदार', 'कृषि भूमि पर बुवाई'] : ['Landholding or tenant farmer', 'Cultivating crops'],
        requiredDocs: isHi ? ['आधार कार्ड', 'भूमि रिकॉर्ड', 'बैंक पासबुक', 'बुवाई प्रमाण पत्र'] : ['Aadhaar Card', 'Land Records', 'Bank Account'],
        applyUrl: 'https://pmfby.gov.in',
      },
      {
        id: 'kcc',
        name: isHi ? 'किसान क्रेडिट कार्ड योजना' : 'Kisan Credit Card (KCC)',
        shortName: 'KCC',
        ministry: isHi ? 'कृषि मंत्रालय एवं नाबार्ड' : 'Ministry of Agriculture & NABARD',
        category: 'agriculture',
        description: isHi ? 'किसानों को खाद, बीज और कृषि उपकरणों के लिए रियायती ब्याज दर पर ऋण।' : 'Subsidized agricultural credit for farming inputs.',
        benefit: isHi ? '₹3 लाख तक ऋण 4% रियायती ब्याज पर' : 'Credit up to ₹3 Lakh at 4% interest',
        eligibility: isHi ? ['व्यक्तिगत/संयुक्त किसान', 'पट्टेदार व बटाईदार'] : ['Individual/joint farmer', 'Tenant farmer'],
        requiredDocs: isHi ? ['आधार कार्ड', 'भूमि खतौनी', 'पासपोर्ट फोटो'] : ['Aadhaar', 'Land Record', 'Photo'],
        applyUrl: 'https://www.nabard.org',
      },
      {
        id: 'pmksy',
        name: isHi ? 'प्रधानमंत्री कृषि सिंचाई योजना' : 'PM Krishi Sinchayee Yojana',
        shortName: 'PMKSY',
        ministry: isHi ? 'जल शक्ति एवं कृषि मंत्रालय' : 'Ministry of Jal Shakti',
        category: 'agriculture',
        description: isHi ? 'ड्रिप एवं स्प्रिंकलर सिंचाई उपकरण लगवाने हेतु भारी सरकारी सब्सिडी।' : 'Micro-irrigation subsidy for efficient water management.',
        benefit: isHi ? 'सूक्ष्म सिंचाई पर 55% तक सब्सिडी' : 'Up to 55% Micro-Irrigation Subsidy',
        eligibility: isHi ? ['खेती योग्य भूमि के स्वामी किसान'] : ['Farmers with cultivable land'],
        requiredDocs: isHi ? ['आधार कार्ड', 'भूमि कागजात', 'बैंक खाता'] : ['Aadhaar', 'Land documents', 'Bank passbook'],
        applyUrl: 'https://pmksy.gov.in',
      },
      {
        id: 'pm_kusum',
        name: isHi ? 'पीएम कुसुम सौर पंप योजना' : 'PM-KUSUM Solar Pump Scheme',
        shortName: 'PM-KUSUM',
        ministry: isHi ? 'नवीन एवं नवीकरणीय ऊर्जा मंत्रालय' : 'Ministry of New & Renewable Energy',
        category: 'agriculture',
        description: isHi ? 'खेतों में सोलर सिंचाई पंप लगवाने के लिए 60% सरकारी अनुदान।' : 'Solar water pump subsidy for agricultural irrigation.',
        benefit: isHi ? 'सोलर पंप पर 60% सब्सिडी + 30% बैंक ऋण' : '60% Solar Pump Subsidy',
        eligibility: isHi ? ['कृषि भूमि के स्वामी किसान'] : ['Farmers with agricultural land'],
        requiredDocs: isHi ? ['आधार कार्ड', 'भूमि खसरा', 'बैंक खाता'] : ['Aadhaar Card', 'Land ownership proof'],
        applyUrl: 'https://pmkusum.mnre.gov.in',
      },
      {
        id: 'soil_health_card',
        name: isHi ? 'मृदा स्वास्थ्य कार्ड योजना' : 'Soil Health Card Scheme',
        shortName: 'SHC',
        ministry: isHi ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture',
        category: 'agriculture',
        description: isHi ? 'मिट्टी के पोषक तत्वों की मुफ्त जांच और उचित उर्वरक सुझाव पत्रक।' : 'Free soil testing and customized fertilizer recommendations.',
        benefit: isHi ? 'मुफ्त मिट्टी परीक्षण व सलाह' : 'Free soil analysis and advisory',
        eligibility: isHi ? ['सभी भारतीय किसान'] : ['All Indian farmers'],
        requiredDocs: isHi ? ['आधार कार्ड', 'खेत की मिट्टी का नमूना'] : ['Aadhaar Card', 'Soil sample'],
        applyUrl: 'https://soilhealth.dac.gov.in',
      }
    );
  } else {
    // General / Social / Housing / Health Mix
    schemes.push(
      {
        id: 'pmjay',
        name: isHi ? 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना' : 'Ayushman Bharat PM-JAY',
        shortName: 'AB PM-JAY',
        ministry: isHi ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' : 'Ministry of Health & Family Welfare',
        category: 'health',
        description: isHi ? 'अस्पताल में भर्ती होने पर प्रति परिवार प्रति वर्ष ₹5 लाख का कैशलेस स्वास्थ्य बीमा।' : 'Free cashless healthcare coverage up to ₹5 Lakh per family per year.',
        benefit: isHi ? '₹5 लाख / परिवार / वर्ष मुफ्त इलाज' : '₹5 Lakh / family / year free coverage',
        eligibility: isHi ? ['SECC 2011 सूची में पात्र', 'बीपीएल / वंचित परिवार'] : ['SECC 2011 eligible', 'Low income household'],
        requiredDocs: isHi ? ['आधार कार्ड', 'राशन कार्ड'] : ['Aadhaar Card', 'Ration Card'],
        applyUrl: 'https://pmjay.gov.in',
      },
      {
        id: 'pmayg',
        name: isHi ? 'प्रधानमंत्री आवास योजना - ग्रामीण / शहरी' : 'PM Awas Yojana (PMAY)',
        shortName: 'PMAY',
        ministry: isHi ? 'ग्रामीण विकास एवं आवासन मंत्रालय' : 'Ministry of Housing & Urban Affairs',
        category: 'housing',
        description: isHi ? 'कच्चे मकान या बेघर परिवारों को पक्का मकान निर्माण हेतु सीधी वित्तीय सहायता।' : 'Financial assistance to build a permanent pucca house.',
        benefit: isHi ? '₹1.30 लाख अनुदान / ₹2.67 लाख ब्याज सब्सिडी' : 'Up to ₹1.3 Lakh grant / ₹2.67L interest subsidy',
        eligibility: isHi ? ['कच्चे मकान में रहने वाले', 'कोई पक्का मकान नहीं'] : ['No pucca house anywhere in India'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक पासबुक', 'जमीन/प्लॉट प्रमाण'] : ['Aadhaar Card', 'Bank Passbook', 'Land proof'],
        applyUrl: 'https://pmayg.nic.in',
      },
      {
        id: 'svanidhi',
        name: isHi ? 'पीएम स्वनिधि योजना' : 'PM SVANidhi',
        shortName: 'SVANidhi',
        ministry: isHi ? 'आवासन और शहरी कार्य मंत्रालय' : 'Ministry of Housing & Urban Affairs',
        category: 'business',
        description: isHi ? 'स्ट्रीट वेंडरों और छोटे दुकानदारों के लिए ब्याज सब्सिडी वाला कार्यशील पूंजी ऋण।' : 'Working capital loan facility for street vendors.',
        benefit: isHi ? '₹50,000 तक बिना गारंटी ऋण 7% ब्याज सब्सिडी के साथ' : 'Collateral-free loan up to ₹50,000',
        eligibility: isHi ? ['शहरी स्ट्रीट वेंडर', 'नगर निकाय वेंडिंग प्रमाणपत्र'] : ['Street vendor in urban area'],
        requiredDocs: isHi ? ['आधार कार्ड', 'वेंडिंग प्रमाणपत्र', 'बैंक खाता'] : ['Aadhaar Card', 'Vending Certificate', 'Bank Account'],
        applyUrl: 'https://pmsvanidhi.mohua.gov.in',
      },
      {
        id: 'pmjdy',
        name: isHi ? 'प्रधानमंत्री जन धन योजना' : 'PM Jan Dhan Yojana',
        shortName: 'PMJDY',
        ministry: isHi ? 'वित्त मंत्रालय' : 'Ministry of Finance',
        category: 'social',
        description: isHi ? 'जीरो-बैलेंस बैंक खाता, ₹2 लाख रुपे दुर्घटना बीमा और ₹10,000 ओवरड्राफ्ट।' : 'Zero-balance bank account with accident insurance and overdraft facility.',
        benefit: isHi ? '₹2 लाख दुर्घटना बीमा + ओवरड्राफ्ट' : '₹2 Lakh accident cover + overdraft',
        eligibility: isHi ? ['भारतीय नागरिक', 'आयु 10 वर्ष से अधिक'] : ['Indian citizen', 'Age above 10'],
        requiredDocs: isHi ? ['आधार कार्ड', 'पासपोर्ट फोटो'] : ['Aadhaar Card', 'Passport Photo'],
        applyUrl: 'https://pmjdy.gov.in',
      },
      {
        id: 'apy',
        name: isHi ? 'अटल पेंशन योजना' : 'Atal Pension Yojana',
        shortName: 'APY',
        ministry: isHi ? 'वित्त मंत्रालय' : 'Ministry of Finance',
        category: 'social',
        description: isHi ? 'असंगठित क्षेत्र के कामगारों के लिए 60 वर्ष बाद आजीवन मासिक गारंटीड पेंशन।' : 'Guaranteed monthly pension after age 60 for unorganized sector workers.',
        benefit: isHi ? '₹1,000 से ₹5,000 प्रति माह गारंटीड पेंशन' : '₹1,000 - ₹5,000 / month pension',
        eligibility: isHi ? ['आयु 18-40 वर्ष', 'बैंक बचत खाताधारक'] : ['Age 18-40', 'Savings bank account'],
        requiredDocs: isHi ? ['आधार कार्ड', 'सक्रिय बैंक खाता'] : ['Aadhaar Card', 'Active Bank Account'],
        applyUrl: 'https://www.npscra.nsdl.co.in',
      },
      {
        id: 'mgnregs',
        name: isHi ? 'महात्मा गांधी नरेगा (MGNREGS)' : 'Mahatma Gandhi NREGS',
        shortName: 'MGNREGS',
        ministry: isHi ? 'ग्रामीण विकास मंत्रालय' : 'Ministry of Rural Development',
        category: 'employment',
        description: isHi ? 'ग्रामीण परिवारों के वयस्क सदस्यों को वर्ष में 100 दिन का कानूनी रोजगार गारंटी।' : '100 days guaranteed wage employment per year for rural adults.',
        benefit: isHi ? '100 दिन का गारंटीड मानदेय रोजगार' : '100 days guaranteed wage employment',
        eligibility: isHi ? ['ग्रामीण क्षेत्र के वयस्क नागरिक'] : ['Rural adult resident'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जॉब कार्ड आवेदन', 'बैंक खाता'] : ['Aadhaar Card', 'Job card application'],
        applyUrl: 'https://nrega.nic.in',
      }
    );
  }

  const replyText = isHi
    ? 'यहाँ आपकी खोज और प्रोफ़ाइल के आधार पर प्रमुख सरकारी योजनाएँ दी गई हैं:'
    : isBn
    ? 'আপনার তথ্যের ভিত্তিতে গুরুত্বপূর্ণ সরকারি প্রকল্পসমূহ দেওয়া হলো:'
    : isTa
    ? 'உங்கள் கேள்விக்கு தொடர்புடைய முக்கிய அரசு நலத்திட்டங்கள் கீழே கொடுக்கப்பட்டுள்ளன:'
    : isTe
    ? 'మీ ప్రశ్నకు సంబంధించిన ముఖ్యమైన ప్రభుత్వ సంక్షేమ పథకాలు ఇక్కడ ఉన్నాయి:'
    : 'Here are the government welfare schemes matching your profile and query:';

  return {
    reply: replyText,
    schemes: schemes.slice(0, 6),
  };
};
