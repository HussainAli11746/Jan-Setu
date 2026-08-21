import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

let geminiModel;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIzaSy')) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (err) {
    console.warn('Gemini model init failed:', err.message);
  }
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
CRITICAL INSTRUCTION 1: You MUST write your response entirely in ${targetLanguageName}. All textual fields inside the JSON ("reply", "name", "shortName", "ministry", "description", "benefit", "eligibility" items, and "requiredDocs" items) MUST be written in ${targetLanguageName} script and vocabulary. The JSON keys themselves must remain in English.

CRITICAL INSTRUCTION 2 (DOMAIN RELEVANCE):
If the user asks about a specific topic (such as "housing", "education", "health", "agriculture", "business loans", or "employment"), ALL 5 to 6 suggested schemes MUST STRICTLY belong to that exact domain. Do NOT mix unrelated schemes (e.g. do not include health or business schemes if the user asks for housing).

User's demographic profile: ${profileSummary}
User's query: "${userMessage}"

Suggest 5 to 6 highly relevant Indian central or state government schemes matching the exact subject matter of the user query.

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
        if (parsed.schemes && parsed.schemes.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Gemini API query error, using domain-matched fallback:', err.message);
    }
  }

  // Fallback: return strict domain-matched schemes (5-6 schemes)
  return getLocalizedFallbackSchemes(userMessage, language);
};

const getLocalizedFallbackSchemes = (message, language = 'en') => {
  const lower = message.toLowerCase();
  const isHi = language === 'hi';
  const isBn = language === 'bn';
  const isTa = language === 'ta';
  const isTe = language === 'te';

  let schemes = [];
  let topicLabel = '';

  // 1. HOUSING & SHELTER SCHEMES (Strictly housing only)
  if (/housing|house|home|awas|makan|shelter|pucca|kutcha|dwelling|मकान|घर|आवास|গৃহ|আবাসন|வீடு|வீட்டு|గృహ|ఇల్లు/i.test(lower)) {
    topicLabel = isHi ? 'आवास और मकान निर्माण' : isBn ? 'আবাসন ও গৃহায়ন' : isTa ? 'வீட்டு வசதி' : isTe ? 'గృహ నిర్మాణం' : 'Housing and Home Assistance';
    schemes = [
      {
        id: 'pmayg',
        name: isHi ? 'प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)' : 'PM Awas Yojana - Gramin (PMAY-G)',
        shortName: 'PMAY-G',
        ministry: isHi ? 'ग्रामीण विकास मंत्रालय' : 'Ministry of Rural Development',
        category: 'housing',
        description: isHi ? 'ग्रामीण क्षेत्रों में कच्चे या जर्जर मकानों में रहने वाले परिवारों को पक्का मकान बनाने हेतु वित्तीय सहायता।' : 'Financial assistance to homeless and kutcha house dwellers in rural areas to construct a permanent pucca house.',
        benefit: isHi ? '₹1.20 लाख से ₹1.30 लाख अनुदान + ₹12,000 शौचालय अनुदान' : '₹1.20L to ₹1.30L direct grant + ₹12,000 toilet grant',
        eligibility: isHi ? ['SECC 2011 में कच्चा मकान सूची', 'परिवार में कोई पक्का मकान नहीं'] : ['Living in kutcha house', 'No pucca house in India', 'SECC 2011 eligible'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जॉब कार्ड (MGNREGA)', 'बैंक खाता पासबुक', 'जमीन का पट्टा/प्रमाण'] : ['Aadhaar Card', 'Job Card', 'Bank Passbook', 'Land proof'],
        applyUrl: 'https://pmayg.nic.in',
      },
      {
        id: 'pmayu',
        name: isHi ? 'प्रधानमंत्री आवास योजना - शहरी (PMAY-U)' : 'PM Awas Yojana - Urban (PMAY-U)',
        shortName: 'PMAY-U',
        ministry: isHi ? 'आवासन और शहरी कार्य मंत्रालय' : 'Ministry of Housing & Urban Affairs',
        category: 'housing',
        description: isHi ? 'शहरी गरीबों, EWS और LIG परिवारों के लिए किफायती पक्के मकान और होम लोन पर ब्याज सब्सिडी।' : 'Affordable housing scheme with credit-linked interest subsidy on home loans for urban families.',
        benefit: isHi ? 'गृह ऋण पर ₹2.67 लाख तक ब्याज सब्सिडी (CLSS)' : 'Up to ₹2.67 Lakh interest subsidy on home loans',
        eligibility: isHi ? ['शहरी निवासी', 'वार्षिक पारिवारिक आय < ₹6 लाख (EWS/LIG)', 'पूरे भारत में पक्का मकान नहीं'] : ['Urban resident', 'Family income < ₹6L for EWS/LIG', 'No permanent house in India'],
        requiredDocs: isHi ? ['आधार कार्ड', 'आय प्रमाण पत्र', 'शहरी निवास प्रमाण पत्र', 'बैंक विवरण'] : ['Aadhaar Card', 'Income Certificate', 'Urban Residence proof', 'Bank Statement'],
        applyUrl: 'https://pmaymis.gov.in',
      },
      {
        id: 'pmay_clss',
        name: isHi ? 'क्रेडिट लिंक्ड सब्सिडी स्कीम (CLSS)' : 'Credit Linked Subsidy Scheme (CLSS)',
        shortName: 'CLSS',
        ministry: isHi ? 'आवासन और शहरी कार्य मंत्रालय' : 'Ministry of Housing & Urban Affairs',
        category: 'housing',
        description: isHi ? 'नया मकान खरीदने अथवा निर्माण हेतु बैंक ऋण पर 6.5% तक अग्रिम ब्याज सब्सिडी।' : 'Upfront interest subsidy of up to 6.5% on housing loans for acquisition and construction of house.',
        benefit: isHi ? 'होम लोन ब्याज पर 6.5% की भारी छूट' : '6.5% interest subsidy on housing loans up to 20 years',
        eligibility: isHi ? ['प्रथम बार मकान खरीददार', 'महिला सह-स्वामित्व आवश्यक'] : ['First-time home buyer', 'Female ownership mandatory'],
        requiredDocs: isHi ? ['आधार कार्ड', 'पैन कार्ड', 'सैलरी स्लिप / आईटीआर', 'प्रॉपर्टी दस्तावेज'] : ['Aadhaar', 'PAN Card', 'Income proof', 'Property documents'],
        applyUrl: 'https://pmaymis.gov.in',
      },
      {
        id: 'arhc_housing',
        name: isHi ? 'किफायती किराया आवास परिसर (ARHCs)' : 'Affordable Rental Housing Complexes (ARHCs)',
        shortName: 'ARHC',
        ministry: isHi ? 'आवासन और शहरी कार्य मंत्रालय' : 'Ministry of Housing & Urban Affairs',
        category: 'housing',
        description: isHi ? 'शहरी प्रवासियों और श्रमिकों के लिए कार्यस्थल के समीप न्यूनतम किराए पर पक्के आवास।' : 'Affordable rental housing for urban migrants and poor near their workplaces.',
        benefit: isHi ? 'अत्यंत रियायती दर पर रहने योग्य पक्का कमरा/फ्लैट' : 'Dignified rental housing with basic civic infrastructure at low rent',
        eligibility: isHi ? ['शहरी प्रवासी कामगार', 'स्ट्रीट वेंडर', 'औद्योगिक श्रमिक'] : ['Urban migrant worker', 'Street vendor', 'Industrial worker'],
        requiredDocs: isHi ? ['आधार कार्ड', 'कार्यस्थल / रोजगार प्रमाण पत्र', 'पहचान पत्र'] : ['Aadhaar Card', 'Workplace ID / Employment proof'],
        applyUrl: 'https://arhc.mohua.gov.in',
      },
      {
        id: 'sbm_ihhl_toilet',
        name: isHi ? 'स्वच्छ भारत ग्रामीण आवास स्वच्छता अनुदान (IHHL)' : 'Swachh Bharat Individual Household Latrine Grant',
        shortName: 'SBM-IHHL',
        ministry: isHi ? 'जल शक्ति मंत्रालय' : 'Ministry of Jal Shakti',
        category: 'housing',
        description: isHi ? 'मकान के साथ व्यक्तिगत घरेलू शौचालय निर्माण हेतु सीधी वित्तीय सहायता।' : 'Direct financial incentive to construct individual household latrine attached to residential houses.',
        benefit: isHi ? '₹12,000 की सीधी प्रोत्साहन सहायता राशि' : '₹12,000 direct cash assistance for toilet construction',
        eligibility: isHi ? ['ग्रामीण परिवार जिनके घर में शौचालय नहीं है'] : ['Rural households without an existing toilet'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक खाता संख्या', 'मकान का फोटो'] : ['Aadhaar Card', 'Bank Account', 'House Photo'],
        applyUrl: 'https://sbm.gov.in',
      },
      {
        id: 'dda_state_housing',
        name: isHi ? 'राज्य आवास बोर्ड किफायती भूखंड व आवास योजना' : 'State Housing Board Affordable EWS Housing',
        shortName: 'EWS Housing',
        ministry: isHi ? 'राज्य आवास एवं नगर विकास विभाग' : 'State Urban Development Department',
        category: 'housing',
        description: isHi ? 'निम्न आय वर्ग के नागरिकों के लिए लॉटरी आधारित रियायती आवासीय फ्लैट और भूखंड आवंटन।' : 'Allotment of subsidized residential plots and flats on lottery basis for economically weaker sections.',
        benefit: isHi ? 'बाजार मूल्य से 40% तक कम कीमत पर पक्का फ्लैट' : 'Subsidized residential allotment at below-market rates',
        eligibility: isHi ? ['राज्य का मूल निवासी', 'पारिवारिक वार्षिक आय < ₹3 लाख'] : ['State domicile resident', 'Annual family income < ₹3 Lakh'],
        requiredDocs: isHi ? ['मूल निवास प्रमाण पत्र', 'आय प्रमाण पत्र', 'आधार कार्ड'] : ['Domicile Certificate', 'Income Certificate', 'Aadhaar Card'],
        applyUrl: 'https://mohua.gov.in',
      }
    ];
  }

  // 2. EDUCATION & SCHOLARSHIPS (Strictly education only)
  else if (/educat|school|college|student|scholar|fee|admission|study|matric|degree|शिक्षा|छात्र|पढ़ाई|छात्रवृत्ति|স্কলারশিপ|கல்வி|చదువు/i.test(lower)) {
    topicLabel = isHi ? 'शिक्षा और छात्रवृत्ति' : isBn ? 'শিক্ষা ও বৃত্তি' : isTa ? 'கல்வி மற்றும் உதவித்தொகை' : isTe ? 'విద్య మరియు స్కాలర్‌షిప్‌లు' : 'Education and Scholarships';
    schemes = [
      {
        id: 'nsp_postmatric_sc',
        name: isHi ? 'अनुसूचित जाति के छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति' : 'Post Matric Scholarship for SC Students',
        shortName: 'NSP-SC',
        ministry: isHi ? 'सामाजिक न्याय और अधिकारिता मंत्रालय' : 'Ministry of Social Justice',
        category: 'education',
        description: isHi ? 'मैट्रिकोत्तर शिक्षा प्राप्त कर रहे अनुसूचित जाति के छात्रों के लिए वित्तीय छात्रवृत्ति।' : 'Financial scholarship for Scheduled Caste students pursuing post-matric education.',
        benefit: isHi ? 'पूर्ण शिक्षण शुल्क प्रतिपूर्ति + निर्वाह भत्ता' : 'Full tuition + maintenance allowance',
        eligibility: isHi ? ['SC श्रेणी', 'मैट्रिकोत्तर छात्र', 'पारिवारिक वार्षिक आय < ₹2.5 लाख'] : ['SC category', 'Post-matric student', 'Family income < ₹2.5L'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जाति प्रमाण पत्र', 'आय प्रमाण पत्र', 'अंकतालिका'] : ['Aadhaar', 'Caste Certificate', 'Income Certificate', 'Marksheet'],
        applyUrl: 'https://scholarships.gov.in',
      },
      {
        id: 'nmmss',
        name: isHi ? 'राष्ट्रीय मीन्स-कम-मेरिट छात्रवृत्ति योजना' : 'National Means-cum-Merit Scholarship',
        shortName: 'NMMSS',
        ministry: isHi ? 'शिक्षा मंत्रालय' : 'Ministry of Education',
        category: 'education',
        description: isHi ? 'आर्थिक रूप से कमजोर मेधावी छात्रों के लिए कक्षा 9 से 12 तक छात्रवृत्ति।' : 'Scholarship for meritorious students from economically weaker sections.',
        benefit: isHi ? '₹12,000 प्रति वर्ष (कक्षा 9 से 12 तक)' : '₹12,000 / year (Class 9 to 12)',
        eligibility: isHi ? ['कक्षा 8 उत्तीर्ण', 'पारिवारिक आय < ₹3.5 लाख'] : ['Class 8 passed', 'Family income < ₹3.5L'],
        requiredDocs: isHi ? ['आधार कार्ड', 'आय प्रमाण पत्र', 'अंकतालिका'] : ['Aadhaar', 'Income Certificate', 'Marksheet'],
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
        requiredDocs: isHi ? ['आधार कार्ड', 'एकल संतान शपथ पत्र', '10वीं अंकतालिका'] : ['Aadhaar', 'Affidavit', '10th Marksheet'],
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
        id: 'pragati_scholarship',
        name: isHi ? 'एआईसीटीई प्रगति तकनीकी शिक्षा छात्रवृत्ति' : 'AICTE Pragati Scholarship for Girls',
        shortName: 'Pragati',
        ministry: isHi ? 'अखिल भारतीय तकनीकी शिक्षा परिषद' : 'AICTE / Ministry of Education',
        category: 'education',
        description: isHi ? 'तकनीकी डिग्री व डिप्लोमा कोर्स करने वाली बालिकाओं के लिए वित्तीय सहायता।' : 'Technical degree/diploma scholarship for girl students.',
        benefit: isHi ? '₹50,000 प्रति वर्ष कॉलेज की अवधि तक' : '₹50,000 / year for tuition and hostel',
        eligibility: isHi ? ['AICTE मान्यता प्राप्त कॉलेज में छात्रा', 'पारिवारिक आय < ₹8 लाख'] : ['Female student in AICTE college', 'Income < ₹8L'],
        requiredDocs: isHi ? ['आधार कार्ड', 'कॉलेज आवंटन पत्र', 'आय प्रमाण पत्र'] : ['Aadhaar', 'College Allotment letter', 'Income proof'],
        applyUrl: 'https://www.aicte-india.org',
      },
      {
        id: 'ishan_uday',
        name: isHi ? 'ईशान उदय विशेष छात्रवृत्ति योजना' : 'Ishan Uday Special Scholarship',
        shortName: 'Ishan Uday',
        ministry: isHi ? 'विश्वविद्यालय अनुदान आयोग (UGC)' : 'University Grants Commission',
        category: 'education',
        description: isHi ? 'पूर्वोत्तर क्षेत्र और सामान्य यूजी पाठ्यक्रमों के विद्यार्थियों के लिए छात्रवृत्ति।' : 'Special scholarship scheme for North-Eastern Region college students.',
        benefit: isHi ? '₹5,400 से ₹7,800 प्रति माह' : '₹5,400 to ₹7,800 / month',
        eligibility: isHi ? ['प्रथम वर्ष यूजी छात्र', 'आय < ₹4.5 लाख'] : ['First-year UG student', 'Income < ₹4.5L'],
        requiredDocs: isHi ? ['आधार कार्ड', 'मूल निवास प्रमाण पत्र', '12वीं अंकतालिका'] : ['Aadhaar', 'Domicile proof', '12th Marksheet'],
        applyUrl: 'https://scholarships.gov.in',
      }
    ];
  }

  // 3. AGRICULTURE & FARMING SCHEMES (Strictly agriculture only)
  else if (/farm|kisan|agricultur|crop|land|irrigation|fertilizer|seed|tractor|किसान|खेती|फसल|सिंचाई|কৃষি|விவசாயம்|వ్యవసాయం/i.test(lower)) {
    topicLabel = isHi ? 'कृषि और किसान कल्याण' : isBn ? 'কৃষি ও কৃষক কল্যাণ' : isTa ? 'விவசாயம் & உழவர் நலம்' : isTe ? 'వ్యవసాయం & రైతుల సంక్షేమం' : 'Agriculture and Farming';
    schemes = [
      {
        id: 'pmkisan',
        name: isHi ? 'प्रधानमंत्री किसान सम्मान निधि' : 'PM Kisan Samman Nidhi',
        shortName: 'PM-KISAN',
        ministry: isHi ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture',
        category: 'agriculture',
        description: isHi ? 'भूमिधारक किसान परिवारों को ₹6,000/वर्ष की प्रत्यक्ष आय सहायता 3 किश्तों में।' : 'Direct income support of ₹6,000/year to landholding farmer families.',
        benefit: isHi ? '₹6,000 प्रति वर्ष (₹2,000 की 3 किश्तें)' : '₹6,000 / year in 3 installments',
        eligibility: isHi ? ['भूमिधारक किसान परिवार', 'आयकर दाता नहीं'] : ['Landholding farmer family', 'Not an income tax payer'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जमीन खसरा/खतौनी', 'बैंक खाता (DBT)'] : ['Aadhaar Card', 'Land Records', 'Bank Account (DBT)'],
        applyUrl: 'https://pmkisan.gov.in',
      },
      {
        id: 'pmfby',
        name: isHi ? 'प्रधानमंत्री फसल बीमा योजना' : 'PM Fasal Bima Yojana',
        shortName: 'PMFBY',
        ministry: isHi ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture',
        category: 'agriculture',
        description: isHi ? 'प्राकृतिक आपदाओं और कीटों से फसल खराब होने पर व्यापक फसल बीमा सुरक्षा।' : 'Comprehensive crop insurance against natural calamities, pests & diseases.',
        benefit: isHi ? 'खरीफ फसलों हेतु मात्र 2% प्रीमियम' : '2% premium for Kharif crops, 1.5% for Rabi',
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
        description: isHi ? 'खाद, बीज और कृषि इनपुट हेतु 4% रियायती ब्याज दर पर बैंक ऋण सुविधा।' : 'Subsidized institutional credit for agriculture inputs at 4% interest.',
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
        description: isHi ? 'ड्रिप एवं स्प्रिंकलर सूक्ष्म सिंचाई लगवाने हेतु 55% तक सरकारी सब्सिडी।' : 'Micro-irrigation subsidy for efficient farm water management.',
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
        benefit: isHi ? 'मुफ्त मिट्टी परीक्षण व वैज्ञानिक सलाह' : 'Free soil analysis and advisory',
        eligibility: isHi ? ['सभी भारतीय किसान'] : ['All Indian farmers'],
        requiredDocs: isHi ? ['आधार कार्ड', 'खेत की मिट्टी का नमूना'] : ['Aadhaar Card', 'Soil sample'],
        applyUrl: 'https://soilhealth.dac.gov.in',
      }
    ];
  }

  // 4. HEALTH & MEDICAL SCHEMES (Strictly health only)
  else if (/health|medical|doctor|hospital|ayushman|swasthya|treatment|disease|इलाज|स्वास्थ्य|अस्पताल|दवा|বীমা|மருத்துவம்|వైద్యం/i.test(lower)) {
    topicLabel = isHi ? 'स्वास्थ्य और चिकित्सा' : isBn ? 'স্বাস্থ্য ও চিকিৎসা' : isTa ? 'சுகாதாரம் & மருத்துவம்' : isTe ? 'ఆరోగ్యం & వైద్యం' : 'Health and Medical Insurance';
    schemes = [
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
        id: 'pmsby',
        name: isHi ? 'प्रधानमंत्री सुरक्षा बीमा योजना' : 'PM Suraksha Bima Yojana',
        shortName: 'PMSBY',
        ministry: isHi ? 'वित्त मंत्रालय' : 'Ministry of Finance',
        category: 'health',
        description: isHi ? 'मात्र ₹20/वर्ष में ₹2 लाख का दुर्घटना मृत्यु एवं दिव्यांगता बीमा कवर।' : '₹2 Lakh accident insurance coverage for death or disability at ₹20/year.',
        benefit: isHi ? '₹2 लाख का दुर्घटना बीमा कवर' : '₹2 Lakh accidental death cover',
        eligibility: isHi ? ['आयु 18-70 वर्ष', 'बैंक बचत खाता'] : ['Age 18-70', 'Savings bank account'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक खाता'] : ['Aadhaar Card', 'Bank Account'],
        applyUrl: 'https://financialservices.gov.in',
      },
      {
        id: 'pmjay_senior',
        name: isHi ? 'आयुष्मान भारत 70+ वरिष्ठ नागरिक योजना' : 'AB PM-JAY Senior Citizens (70+)',
        shortName: 'PM-JAY 70+',
        ministry: isHi ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' : 'Ministry of Health & Family Welfare',
        category: 'health',
        description: isHi ? '70 वर्ष या अधिक आयु के सभी वरिष्ठ नागरिकों को आय सीमा के बिना ₹5 लाख का मुफ्त स्वास्थ्य कवर।' : 'Universal ₹5 Lakh healthcare coverage for all senior citizens aged 70 and above.',
        benefit: isHi ? '₹5 लाख अतिरिक्त स्वास्थ्य कवर (बिना आय सीमा)' : '₹5 Lakh free health cover for all seniors aged 70+',
        eligibility: isHi ? ['आयु 70 वर्ष या अधिक', 'भारतीय नागरिक'] : ['Age 70 years or above', 'Indian citizen'],
        requiredDocs: isHi ? ['आधार कार्ड (आयु प्रमाण)'] : ['Aadhaar Card'],
        applyUrl: 'https://pmjay.gov.in',
      },
      {
        id: 'jan_aushadhi',
        name: isHi ? 'प्रधानमंत्री जन औषधि योजना' : 'PM Bhartiya Janaushadhi Pariyojana',
        shortName: 'PMBJP',
        ministry: isHi ? 'रसायन एवं उर्वरक मंत्रालय' : 'Ministry of Chemicals & Fertilizers',
        category: 'health',
        description: isHi ? 'जन औषधि केंद्रों पर 50% से 90% तक सस्ती गुणवत्तापूर्ण जेनेरिक दवाइयाँ उपलब्ध कराना।' : 'High quality generic medicines made available at 50% to 90% lesser price than branded medicines.',
        benefit: isHi ? 'ब्रांडेड दवाओं की तुलना में 50-90% सस्ती दवाइयां' : '50% - 90% savings on all generic medicines',
        eligibility: isHi ? ['सभी नागरिक'] : ['All citizens'],
        requiredDocs: isHi ? ['डॉक्टर का पर्चा'] : ["Doctor's prescription"],
        applyUrl: 'https://janaushadhi.gov.in',
      },
      {
        id: 'pmmvy',
        name: isHi ? 'प्रधानमंत्री मातृ वंदना योजना' : 'PM Matru Vandana Yojana',
        shortName: 'PMMVY',
        ministry: isHi ? 'महिला एवं बाल विकास मंत्रालय' : 'Ministry of Women and Child Development',
        category: 'health',
        description: isHi ? 'गर्भवती और स्तनपान कराने वाली माताओं के स्वास्थ्य व पोषण हेतु ₹5,000 की नकद सहायता।' : 'Maternity cash incentive of ₹5,000 to pregnant women for healthy nutrition and wage compensation.',
        benefit: isHi ? '₹5,000 की नकद मातृत्व सहायता' : '₹5,000 direct cash benefit in DBT installments',
        eligibility: isHi ? ['गर्भवती महिला', 'सरकारी कर्मचारी नहीं'] : ['Pregnant woman', 'Not a government employee'],
        requiredDocs: isHi ? ['आधार कार्ड', 'एमसीपी कार्ड (Mother-Child Card)', 'बैंक खाता'] : ['Aadhaar', 'MCP Card', 'Bank passbook'],
        applyUrl: 'https://pmmvy.wcd.gov.in',
      },
      {
        id: 'pmndp_dialysis',
        name: isHi ? 'प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम' : 'Pradhan Mantri National Dialysis Programme',
        shortName: 'PMNDP',
        ministry: isHi ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' : 'Ministry of Health & Family Welfare',
        category: 'health',
        description: isHi ? 'जिला अस्पतालों में बीपीएल और गरीब मरीजों के लिए 100% मुफ्त डायलिसिस सेवाएं।' : '100% free life-saving dialysis services for BPL and poor patients in district hospitals.',
        benefit: isHi ? '100% मुफ्त डायलिसिस सुविधा' : 'Free dialysis treatment at district hospitals',
        eligibility: isHi ? ['किडनी रोगी', 'बीपीएल / कम आय वाले मरीज'] : ['Renal patients', 'BPL / Low-income'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बीपीएल / आय प्रमाण पत्र', 'चिकित्सा रिपोर्ट'] : ['Aadhaar', 'BPL Card', 'Medical Report'],
        applyUrl: 'https://nhm.gov.in',
      }
    ];
  }

  // 5. BUSINESS, LOANS & LIVELIHOOD (Strictly business only)
  else if (/loan|business|vendor|shop|mudra|svanidhi|credit|msme|startup|व्यापार|दुकान|ऋण|लोन|ব্যবসা|வணிகம்|వ్యాపారం/i.test(lower)) {
    topicLabel = isHi ? 'व्यवसाय और स्वरोजगार ऋण' : isBn ? 'ব্যবসা ও ঋণ' : isTa ? 'வணிகம் & கடன்கள்' : isTe ? 'వ్యాపారం & రుణాలు' : 'Business and Micro-Credit';
    schemes = [
      {
        id: 'svanidhi',
        name: isHi ? 'पीएम स्वनिधि योजना' : 'PM SVANidhi',
        shortName: 'SVANidhi',
        ministry: isHi ? 'आवासन और शहरी कार्य मंत्रालय' : 'Ministry of Housing & Urban Affairs',
        category: 'business',
        description: isHi ? 'स्ट्रीट वेंडरों और छोटे दुकानदारों के लिए 7% ब्याज सब्सिडी वाला कार्यशील पूंजी ऋण।' : 'Working capital micro-loans with 7% interest subsidy for street vendors.',
        benefit: isHi ? '₹50,000 तक बिना गारंटी ऋण' : 'Collateral-free loan up to ₹50,000',
        eligibility: isHi ? ['शहरी स्ट्रीट वेंडर', 'नगर निकाय वेंडिंग प्रमाणपत्र'] : ['Street vendor in urban area'],
        requiredDocs: isHi ? ['आधार कार्ड', 'वेंडिंग प्रमाणपत्र', 'बैंक खाता'] : ['Aadhaar Card', 'Vending Certificate', 'Bank Account'],
        applyUrl: 'https://pmsvanidhi.mohua.gov.in',
      },
      {
        id: 'mudra',
        name: isHi ? 'प्रधानमंत्री मुद्रा योजना (PMMY)' : 'Pradhan Mantri MUDRA Yojana',
        shortName: 'PMMY',
        ministry: isHi ? 'वित्त मंत्रालय' : 'Ministry of Finance',
        category: 'business',
        description: isHi ? 'छोटे व्यवसाय, दुकान, सेवा और विनिर्माण उद्यमों के लिए ₹10 लाख तक का बिना गारंटी ऋण।' : 'Collateral-free business loans up to ₹10 Lakh for micro and small enterprises.',
        benefit: isHi ? '₹50,000 से ₹10 लाख तक मुद्रा ऋण (शिशु, किशोर, तरुण)' : 'Loans from ₹50,000 up to ₹10 Lakh without collateral',
        eligibility: isHi ? ['गैर-कॉर्पोरेट, गैर-कृषि लघु व्यवसाय उद्यमी'] : ['Non-corporate, non-farm small business entrepreneurs'],
        requiredDocs: isHi ? ['आधार कार्ड', 'पैन कार्ड', 'व्यवसाय का प्रमाण', 'बैंक स्टेटमेंट'] : ['Aadhaar', 'PAN Card', 'Business proof', 'Bank Statement'],
        applyUrl: 'https://www.mudra.org.in',
      },
      {
        id: 'pm_vishwakarma',
        name: isHi ? 'पीएम विश्वकर्मा योजना' : 'PM Vishwakarma Scheme',
        shortName: 'PM-Vishwakarma',
        ministry: isHi ? 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय' : 'Ministry of MSME',
        category: 'business',
        description: isHi ? 'पारंपरिक कारीगरों को ₹15,000 का टूलकिट अनुदान और 5% रियायती ब्याज पर ₹3 लाख ऋण।' : 'Collateral-free enterprise credit up to ₹3 Lakh at 5% interest + ₹15,000 modern toolkit incentive.',
        benefit: isHi ? '₹15,000 टूलकिट + ₹3 लाख तक ऋण 5% ब्याज पर' : '₹15,000 Toolkit + Loan up to ₹3 Lakh at 5%',
        eligibility: isHi ? ['पारंपरिक 18 ट्रेड के कारीगर (बढ़ई, लोहार, दर्जी, मोची आदि)'] : ['Traditional artisan/craftsperson in designated 18 trades'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक पासबुक', 'शिल्पकार पहचान प्रमाण'] : ['Aadhaar', 'Bank passbook', 'Skill self-declaration'],
        applyUrl: 'https://pmvishwakarma.gov.in',
      },
      {
        id: 'standup_india',
        name: isHi ? 'स्टैंड-अप इंडिया योजना' : 'Stand-Up India Scheme',
        shortName: 'StandUp India',
        ministry: isHi ? 'वित्त मंत्रालय' : 'Ministry of Finance',
        category: 'business',
        description: isHi ? 'अनुसूचित जाति/जनजाति और महिला उद्यमियों को नया उद्यम शुरू करने हेतु ₹10 लाख से ₹1 करोड़ ऋण।' : 'Bank loans from ₹10 Lakh to ₹1 Crore to SC, ST, and Women entrepreneurs for greenfield enterprises.',
        benefit: isHi ? '₹10 लाख से ₹1 करोड़ तक का बैंक ऋण' : 'Bank loans between ₹10 Lakh and ₹1 Crore',
        eligibility: isHi ? ['SC / ST अथवा महिला उद्यमी', 'आयु 18+'] : ['SC/ST and/or woman entrepreneur', 'Age 18+'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जाति प्रमाण पत्र (यदि लागू)', 'प्रोजेक्ट रिपोर्ट'] : ['Aadhaar', 'Caste Certificate', 'Project Report'],
        applyUrl: 'https://www.standupmitra.in',
      },
      {
        id: 'pmegp',
        name: isHi ? 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)' : 'Prime Minister Employment Generation Programme',
        shortName: 'PMEGP',
        ministry: isHi ? 'एमएसएमई मंत्रालय' : 'Ministry of MSME',
        category: 'business',
        description: isHi ? 'नया व्यवसाय/उद्योग लगाने के लिए ₹50 लाख तक ऋण और 35% तक सरकारी सब्सिडी।' : 'Credit-linked subsidy scheme offering up to 35% government subsidy on project cost up to ₹50 Lakh.',
        benefit: isHi ? 'प्रोजेक्ट लागत पर 15% से 35% तक सरकारी सब्सिडी' : 'Up to 35% government subsidy on project cost',
        eligibility: isHi ? ['न्यूनतम 8वीं पास', 'आयु 18 वर्ष से अधिक'] : ['8th pass minimum', 'Age 18+'],
        requiredDocs: isHi ? ['आधार कार्ड', 'शैक्षणिक प्रमाण पत्र', 'DPR (प्रोजेक्ट रिपोर्ट)'] : ['Aadhaar', 'Education proof', 'Project DPR'],
        applyUrl: 'https://www.kviconline.gov.in',
      },
      {
        id: 'pmjdy',
        name: isHi ? 'प्रधानमंत्री जन धन योजना (व्यापारिक ओवरड्राफ्ट)' : 'PM Jan Dhan Yojana (Overdraft Facility)',
        shortName: 'PMJDY',
        ministry: isHi ? 'वित्त मंत्रालय' : 'Ministry of Finance',
        category: 'business',
        description: isHi ? 'छोटे व्यापारियों व दैनिक लेन-देन हेतु खाते पर ₹10,000 की तत्काल ओवरड्राफ्ट सुविधा।' : 'Zero-balance account with ₹10,000 instant overdraft credit facility for small traders.',
        benefit: isHi ? '₹10,000 तक का तत्काल ओवरड्राफ्ट ऋण' : '₹10,000 instant overdraft credit facility',
        eligibility: isHi ? ['सक्रिय जन धन खाताधारक', '6 माह का संतोषजनक खाता संचालन'] : ['Active Jan Dhan account for 6+ months'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जन धन बैंक पासबुक'] : ['Aadhaar Card', 'Bank Passbook'],
        applyUrl: 'https://pmjdy.gov.in',
      }
    ];
  }

  // 6. DEFAULT GENERAL MIX (Only if query is broad or general like "help me")
  else {
    topicLabel = isHi ? 'प्रमुख कल्याणकारी योजनाएं' : isBn ? 'প্রধান সরকারি প্রকল্প' : isTa ? 'முக்கிய அரசு திட்டங்கள்' : isTe ? 'ముఖ్యమైన ప్రభుత్వ పథకాలు' : 'Government Welfare Schemes';
    schemes = [
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
        id: 'pmkisan',
        name: isHi ? 'प्रधानमंत्री किसान सम्मान निधि' : 'PM Kisan Samman Nidhi',
        shortName: 'PM-KISAN',
        ministry: isHi ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture',
        category: 'agriculture',
        description: isHi ? 'भूमिधारक किसान परिवारों को ₹6,000/वर्ष की प्रत्यक्ष आय सहायता 3 किश्तों में।' : 'Direct income support of ₹6,000/year to landholding farmer families.',
        benefit: isHi ? '₹6,000 प्रति वर्ष' : '₹6,000 / year in 3 installments',
        eligibility: isHi ? ['भूमिधारक किसान परिवार'] : ['Landholding farmer family'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जमीन खसरा/खतौनी', 'बैंक खाता (DBT)'] : ['Aadhaar Card', 'Land Records', 'Bank Account'],
        applyUrl: 'https://pmkisan.gov.in',
      },
      {
        id: 'pmayg',
        name: isHi ? 'प्रधानमंत्री आवास योजना - ग्रामीण' : 'PM Awas Yojana - Gramin',
        shortName: 'PMAY-G',
        ministry: isHi ? 'ग्रामीण विकास मंत्रालय' : 'Ministry of Rural Development',
        category: 'housing',
        description: isHi ? 'कच्चे मकान या बेघर परिवारों को पक्का मकान निर्माण हेतु वित्तीय सहायता।' : 'Financial assistance to build a permanent pucca house in rural areas.',
        benefit: isHi ? '₹1.30 लाख अनुदान + ₹12,000 शौचालय सहायता' : 'Up to ₹1.30 Lakh direct grant for house construction',
        eligibility: isHi ? ['कच्चे मकान में रहने वाले ग्रामीण परिवार'] : ['Living in kutcha house in rural panchayat'],
        requiredDocs: isHi ? ['आधार कार्ड', 'जॉब कार्ड', 'बैंक पासबुक'] : ['Aadhaar Card', 'Job Card', 'Bank Passbook'],
        applyUrl: 'https://pmayg.nic.in',
      },
      {
        id: 'svanidhi',
        name: isHi ? 'पीएम स्वनिधि योजना' : 'PM SVANidhi',
        shortName: 'SVANidhi',
        ministry: isHi ? 'आवासन और शहरी कार्य मंत्रालय' : 'Ministry of Housing & Urban Affairs',
        category: 'business',
        description: isHi ? 'स्ट्रीट वेंडरों और छोटे दुकानदारों के लिए 7% ब्याज सब्सिडी वाला कार्यशील पूंजी ऋण।' : 'Working capital micro-loans with 7% interest subsidy for street vendors.',
        benefit: isHi ? '₹50,000 तक बिना गारंटी ऋण' : 'Collateral-free loan up to ₹50,000',
        eligibility: isHi ? ['शहरी स्ट्रीट वेंडर'] : ['Street vendor in urban area'],
        requiredDocs: isHi ? ['आधार कार्ड', 'वेंडिंग प्रमाणपत्र', 'बैंक खाता'] : ['Aadhaar Card', 'Vending Certificate', 'Bank Account'],
        applyUrl: 'https://pmsvanidhi.mohua.gov.in',
      },
      {
        id: 'pmkvy',
        name: isHi ? 'प्रधानमंत्री कौशल विकास योजना' : 'PM Kaushal Vikas Yojana',
        shortName: 'PMKVY',
        ministry: isHi ? 'कौशल विकास एवं उद्यमिता मंत्रालय' : 'Ministry of Skill Development',
        category: 'skill',
        description: isHi ? 'युवाओं के लिए उद्योग-उन्मुख मुफ्त कौशल प्रशिक्षण और प्रमाणन।' : 'Free skill training and certification for youth.',
        benefit: isHi ? 'मुफ्त प्रशिक्षण + ₹8,000 मौद्रिक पुरस्कार' : 'Free training + ₹8,000 reward',
        eligibility: isHi ? ['आयु 15-45 वर्ष', 'भारतीय नागरिक'] : ['Age 15-45', 'Indian citizen'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक खाता', 'शिक्षा प्रमाण पत्र'] : ['Aadhaar Card', 'Bank Account', 'Education Certificate'],
        applyUrl: 'https://pmkvyofficial.org',
      },
      {
        id: 'apy',
        name: isHi ? 'अटल पेंशन योजना' : 'Atal Pension Yojana',
        shortName: 'APY',
        ministry: isHi ? 'वित्त मंत्रालय' : 'Ministry of Finance',
        category: 'social',
        description: isHi ? 'असंगठित क्षेत्र के कामगारों के लिए 60 वर्ष बाद आजीवन मासिक गारंटीड पेंशन।' : 'Guaranteed monthly pension after age 60 for unorganized sector workers.',
        benefit: isHi ? '₹1,000 से ₹5,000 प्रति माह गारंटीड पेंशन' : '₹1,000 - ₹5,000 / month pension',
        eligibility: isHi ? ['आयु 18-40 वर्ष', 'बैंक बचत खाता'] : ['Age 18-40', 'Savings bank account'],
        requiredDocs: isHi ? ['आधार कार्ड', 'सक्रिय बैंक खाता'] : ['Aadhaar Card', 'Active Bank Account'],
        applyUrl: 'https://www.npscra.nsdl.co.in',
      }
    ];
  }

  const replyText = isHi
    ? `यहाँ आपकी खोज (${topicLabel}) के आधार पर 6 प्रमुख सरकारी योजनाएँ दी गई हैं:`
    : isBn
    ? `আপনার অনুসন্ধানের (${topicLabel}) ভিত্তিতে ৬টি গুরুত্বপূর্ণ সরকারি প্রকল্প দেওয়া হলো:`
    : isTa
    ? `உங்கள் (${topicLabel}) கேள்விக்கு தொடர்புடைய 6 முக்கிய அரசு திட்டங்கள்:`
    : isTe
    ? `మీ (${topicLabel}) ప్రశ్నకు సంబంధించిన 6 ముఖ్యమైన పథకాలు:`
    : `Here are 6 government schemes specifically matching your inquiry for ${topicLabel}:`;

  return {
    reply: replyText,
    schemes: schemes.slice(0, 6),
  };
};
