import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI:', err.message);
  }
}

const getGeminiModel = () => {
  if (!genAI) return null;
  // Use gemini-2.5-flash which is the active supported model for this API key
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });
};

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
  // Sports & games
  /\b(cricket|football|soccer|hockey|tennis|badminton|kabaddi|basketball|volleyball|chess)\b/i,
  /\b(icc|bcci|ipl|fifa|olympics|world cup|t20|odi|test match|premier league|champions league)\b/i,
  /\b(player|batsman|bowler|wicket|goal|match|tournament|medal|trophy|squad|team india)\b/i,
  /\b(game|gaming|pubg|fortnite|minecraft|valorant|free fire|esports)\b/i,
  /\b(score|scorecard|points table|standings|fixture|schedule|series)\b/i,

  // Entertainment & celebrities
  /\b(movie|film|cinema|bollywood|hollywood|web series|ott|netflix|amazon prime|hotstar)\b/i,
  /\b(song|music|album|singer|actor|actress|celebrity|hero|heroine|director|producer)\b/i,
  /\b(tv show|reality show|bigg boss|kbc|dance|comedy)\b/i,

  // General knowledge & trivia
  /\b(who won|who is the|who are the|who became|which team|which country|which player)\b/i,
  /\b(capital of|population of|history of|distance between|how far|what is the speed)\b/i,
  /\b(president of|prime minister of|king of|queen of|ceo of|founder of)\b/i,

  // News & politics (non-scheme)
  /\b(news|latest news|current affairs|breaking news|today news)\b/i,
  /\b(election|vote|party|bjp|congress|aap|parliament|lok sabha|rajya sabha)\b/i,

  // Food & lifestyle
  /\b(recipe|cook|restaurant|hotel|food|dish|cuisine|biryani|pizza|burger)\b/i,
  /\b(fashion|clothes|shopping|brand|sale|discount|flipkart|amazon|meesho)\b/i,

  // Finance (non-government)
  /\b(stock|crypto|bitcoin|share market|trading|nifty|sensex|mutual fund|sip)\b/i,

  // Weather & geography
  /\b(weather|temperature|rain|forecast|climate|monsoon|flood|earthquake)\b/i,

  // Relationships & personal
  /\b(girlfriend|boyfriend|love|marriage|wedding|divorce|breakup|dating)\b/i,
  /\b(joke|funny|comedy|meme|roast|troll)\b/i,
];

const isOffTopic = (msg) => OFF_TOPIC_PATTERNS.some((p) => p.test(msg));

const getOffTopicReply = (language = 'en') => {
  const msgs = {
    hi: 'कृपया जन-सेतु और सरकारी कल्याणकारी योजनाओं से संबंधित प्रश्न ही पूछें। मैं केवल योजनाओं की पात्रता और सहायता में मदद कर सकता हूं।',
    bn: 'অনুগ্রহ করে জন-সেতু এবং সরকারি কল্যাণমূলক প্রকল্প সম্পর্কিত প্রশ্ন করুন। আমি শুধুমাত্র সরকারি প্রকল্পের যোগ্যতায় সাহায্য করতে পারি।',
    ta: 'தயவுசெய்து அரசு நலத்திட்டங்கள் தொடர்பான கேள்விகளை மட்டும் கேளுங்கள். திட்டங்களின் தகுதி குறித்து மட்டுமே உதவ முடியும்.',
    te: 'దయచేసి ప్రభుత్వ సంక్షేమ పథకాలకు సంబంధించిన ప్రశ్నలు మాత్రమే అడగండి. పథకాల అర్హత విషయంలో మాత్రమే నేను సహాయం చేయగలను.',
    en: 'I can only help with Indian government welfare schemes and eligibility. Please ask about schemes related to agriculture, education, housing, employment, internships, or social welfare.',
  };
  return msgs[language] || msgs['en'];
};

/**
 * Calls Gemini directly with the user prompt, profile, language, and conversation history.
 */
export const suggestSchemes = async (userMessage, profile = {}, language = 'en', history = []) => {
  const targetLanguageName = LANGUAGE_NAMES[language] || LANGUAGE_NAMES['en'];

  // Off-topic guard
  if (isOffTopic(userMessage)) {
    return {
      reply: getOffTopicReply(language),
      schemes: [],
    };
  }

  // Format citizen demographic background
  const profileSummary = Object.entries(profile)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n') || '- Not specified';

  // Format recent conversation history
  const formattedHistory = (history || [])
    .slice(-6)
    .filter(h => h.text)
    .map(h => `${h.sender === 'user' ? 'Citizen' : 'JanSetu AI'}: "${h.text.replace(/\n/g, ' ')}"`)
    .join('\n') || 'None (First message in conversation)';

  const prompt = `You are JanSetu AI, an expert Indian government civic welfare assistant.

CITIZEN PROFILE:
${profileSummary}

CONVERSATION HISTORY:
${formattedHistory}

LATEST CITIZEN QUERY / PROMPT:
"${userMessage}"

TARGET LANGUAGE: ${targetLanguageName} (Code: ${language})

CRITICAL MANDATORY INSTRUCTIONS:
0. OFF-TOPIC REJECTION: If the user's query is NOT related to Indian government welfare schemes, subsidies, eligibility, documents, or application help — you MUST respond with ONLY this JSON: {"reply": "${getOffTopicReply(language)}", "schemes": []}. Do NOT answer questions about sports, cricket, entertainment, celebrities, news, politics, weather, recipes, shopping, general knowledge, trivia, or anything unrelated to government welfare.
1. OUTPUT MUST BE STRICTLY VALID JSON matching the schema below.
2. RELEVANCE: Search and return 5 to 6 Indian central/state government schemes or initiatives that DIRECTLY match what the user is asking in "${userMessage}".
   - If user asks for "internship" / "apprenticeship" / "skills", return Prime Minister's Internship Scheme (PMIS), NATS, NAPS, PMKVY 4.0, TULIP (The Urban Learning Internship Program), etc.
   - If user asks for "housing", return PMAY-G, PMAY-U, CLSS, ARHC, etc.
   - If user asks for "farming", return PM-KISAN, PMFBY, KCC, etc.
   - Do NOT return healthcare or unrelated schemes if the user asks for internships or housing!
3. LANGUAGE: All output text (including the conversational "reply", scheme "name", "ministry", "description", "benefit", "eligibility" points, and "requiredDocs" points) MUST be written in ${targetLanguageName}.

JSON SCHEMA TO RETURN:
{
  "reply": "Polite, helpful direct response to the user's question in ${targetLanguageName}",
  "schemes": [
    {
      "id": "scheme_id_lowercase",
      "name": "Full Official Name in ${targetLanguageName}",
      "shortName": "Acronym",
      "ministry": "Ministry / Department in ${targetLanguageName}",
      "category": "skill|education|employment|housing|agriculture|health|business|social",
      "description": "2-3 sentence overview in ${targetLanguageName}",
      "benefit": "Key financial assistance, stipend, or subsidy in ${targetLanguageName}",
      "eligibility": ["Eligibility point 1 in ${targetLanguageName}", "Eligibility point 2 in ${targetLanguageName}"],
      "requiredDocs": ["Document 1 in ${targetLanguageName}", "Document 2 in ${targetLanguageName}"],
      "applyUrl": "https://official-portal.gov.in"
    }
  ]
}`;


  const model = getGeminiModel();
  if (model) {
    try {
      console.log(`[Gemini API] Querying Gemini for prompt: "${userMessage}" in language: ${language}`);
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.schemes && parsed.schemes.length > 0) {
          console.log(`[Gemini API] Successfully returned ${parsed.schemes.length} schemes from live Gemini!`);
          return parsed;
        }
      }
    } catch (err) {
      console.error('[Gemini API Error] Falling back to domain catalog:', err.message);
    }
  } else {
    console.warn('[Gemini API] Model not initialized, using fallback catalog');
  }

  // Fallback domain-matched schemes
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

  // 1. INTERNSHIPS, SKILLS, APPRENTICESHIP & YOUTH TRAINING
  if (/intern|internship|apprentice|skill|training|kaushal|trainee|stipend|fellowship|योजना|इंटर्नशिप|प्रशिक्षु|कौशल|ইন্টার্নশিপ|பயிற்சி|ఇంటర్న్‌షిప్/i.test(lower)) {
    topicLabel = isHi ? 'इंटर्नशिप और कौशल प्रशिक्षण' : isBn ? 'ইন্টার্নশিপ ও দক্ষতা উন্নয়ন' : isTa ? 'இன்டர்ன்ஷிப் & திறன் பயிற்சி' : isTe ? 'ఇంటర్న్‌షిప్ & నైపుణ్య శిక్షణ' : 'Internships and Skill Apprenticeships';
    schemes = [
      {
        id: 'pm_internship_scheme',
        name: isHi ? 'प्रधानमंत्री इंटर्नशिप योजना (PMIS)' : "Prime Minister's Internship Scheme (PMIS)",
        shortName: 'PMIS',
        ministry: isHi ? 'कॉर्पोरेट कार्य मंत्रालय' : 'Ministry of Corporate Affairs',
        category: 'skill',
        description: isHi ? 'भारत की शीर्ष 500 कंपनियों में युवाओं को 12 महीने की वास्तविक व्यावसायिक इंटर्नशिप और मासिक वजीफा।' : '12-month internship opportunities in top 500 companies in India with monthly financial assistance and real industry exposure.',
        benefit: isHi ? '₹5,000 प्रति माह वजीफा (स्टाइपेंड) + ₹6,000 एकमुश्त अनुदान' : '₹5,000 / month stipend + ₹6,000 one-time grant',
        eligibility: isHi ? ['आयु 21-24 वर्ष', '10वीं/12वीं/आईटीआई/पॉलिटेक्निक/ग्रेजुएट', 'पारिवारिक आय < ₹8 लाख'] : ['Age 21-24 years', '10th/12th/ITI/Diploma/Graduate', 'Family income < ₹8L'],
        requiredDocs: isHi ? ['आधार कार्ड', 'शैक्षणिक मार्कशीट', 'बैंक खाता (DBT)'] : ['Aadhaar Card', 'Educational Certificates', 'Bank Account'],
        applyUrl: 'https://pminternship.mca.gov.in',
      },
      {
        id: 'nats_apprenticeship',
        name: isHi ? 'राष्ट्रीय शिक्षुता प्रशिक्षण योजना (NATS)' : 'National Apprenticeship Training Scheme (NATS)',
        shortName: 'NATS',
        ministry: isHi ? 'शिक्षा मंत्रालय' : 'Ministry of Education',
        category: 'skill',
        description: isHi ? 'डिप्लोमा और इंजीनियरिंग/ग्रेजुएट पास युवाओं के लिए प्रतिष्ठित उद्योगों में 1 वर्ष का व्यावहारिक प्रशिक्षण।' : '1-year on-the-job apprenticeship training for fresh engineering graduates, diploma holders, and general stream graduates.',
        benefit: isHi ? '₹8,000 से ₹9,000 प्रति माह सरकारी सहायता प्राप्त वजीफा' : 'Monthly stipend up to ₹9,000 with government DBT share',
        eligibility: isHi ? ['डिग्री अथवा डिप्लोमा धारक (अंतिम 3 वर्षों में उत्तीर्ण)'] : ['Degree/Diploma holder passed within last 3 years'],
        requiredDocs: isHi ? ['आधार कार्ड', 'डिग्री/डिप्लोमा प्रमाण पत्र', 'बैंक पासबुक'] : ['Aadhaar Card', 'Degree/Diploma Certificate', 'Bank Passbook'],
        applyUrl: 'https://nats.education.gov.in',
      },
      {
        id: 'naps_scheme',
        name: isHi ? 'राष्ट्रीय शिक्षुता संवर्धन योजना (NAPS)' : 'National Apprenticeship Promotion Scheme (NAPS)',
        shortName: 'NAPS',
        ministry: isHi ? 'कौशल विकास एवं उद्यमिता मंत्रालय' : 'Ministry of Skill Development & Entrepreneurship',
        category: 'skill',
        description: isHi ? 'आईटीआई और गैर-आईटीआई युवाओं को उद्योगों में शिक्षुता (Apprenticeship) के साथ मासिक वित्तीय सहयोग।' : 'Direct financial support to apprentices in manufacturing and service industries across India.',
        benefit: isHi ? 'वजीफे का 25% (₹1,500/माह तक) सीधा सरकारी भुगतान' : 'Government pays 25% of stipend (up to ₹1,500/month)',
        eligibility: isHi ? ['न्यूनतम आयु 14 वर्ष', '5वीं पास से आईटीआई/स्नातक'] : ['Minimum age 14 years', '5th pass to ITI/Graduate'],
        requiredDocs: isHi ? ['आधार कार्ड', 'अंकतालिका', 'पासपोर्ट फोटो'] : ['Aadhaar Card', 'Academic Marksheet', 'Photo'],
        applyUrl: 'https://www.apprenticeshipindia.gov.in',
      },
      {
        id: 'tulip_internship',
        name: isHi ? 'द अर्बन लर्निंग इंटर्नशिप प्रोग्राम (TULIP)' : 'The Urban Learning Internship Program (TULIP)',
        shortName: 'TULIP',
        ministry: isHi ? 'आवासन और शहरी कार्य मंत्रालय एवं AICTE' : 'Ministry of Housing & Urban Affairs & AICTE',
        category: 'skill',
        description: isHi ? 'स्मार्ट शहरों और नगर निगमों में स्नातक छात्रों के लिए शहरी विकास और प्रशासन इंटर्नशिप।' : 'Internship opportunities with Urban Local Bodies and Smart Cities for fresh graduates.',
        benefit: isHi ? 'मासिक वजीफा + भारत सरकार से इंटर्नशिप प्रमाण पत्र' : 'Monthly stipend + Official Government Internship Certificate',
        eligibility: isHi ? ['B.Tech / B.Arch / B.Plan / BA / B.Com / BSc स्नातक (18 माह के भीतर)'] : ['Fresh graduates within 18 months of graduation'],
        requiredDocs: isHi ? ['आधार कार्ड', 'कॉलेज डिग्री / प्रोविजनल', 'बायोडाटा (CV)'] : ['Aadhaar Card', 'College Degree', 'Resume/CV'],
        applyUrl: 'https://internship.aicte-india.org',
      },
      {
        id: 'pmkvy4',
        name: isHi ? 'प्रधानमंत्री कौशल विकास योजना 4.0 (PMKVY 4.0)' : 'PM Kaushal Vikas Yojana 4.0 (PMKVY 4.0)',
        shortName: 'PMKVY',
        ministry: isHi ? 'कौशल विकास एवं उद्यमिता मंत्रालय' : 'Ministry of Skill Development',
        category: 'skill',
        description: isHi ? 'एआई, कोडिंग, रोबोटिक्स, 3डी प्रिंटिंग व नए उद्योगों में मुफ्त अल्पकालिक कौशल प्रशिक्षण व प्लेसमेंट।' : 'Free industry 4.0 skill training in AI, robotics, drones, coding, and traditional trades with placement assistance.',
        benefit: isHi ? '100% मुफ्त प्रशिक्षण + राष्ट्रीय कौशल प्रमाण पत्र + ₹8,000 प्रोत्साहन' : '100% free training + Government certification + ₹8,000 reward',
        eligibility: isHi ? ['आयु 15-45 वर्ष', 'भारतीय नागरिक'] : ['Age 15-45', 'Indian citizen'],
        requiredDocs: isHi ? ['आधार कार्ड', 'बैंक खाता', 'शैक्षणिक दस्तावेज'] : ['Aadhaar Card', 'Bank Account', 'Education proof'],
        applyUrl: 'https://www.pmkvyofficial.org',
      },
      {
        id: 'ddu_gky',
        name: isHi ? 'दीन दयाल उपाध्याय ग्रामीण कौशल्य योजना (DDU-GKY)' : 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
        shortName: 'DDU-GKY',
        ministry: isHi ? 'ग्रामीण विकास मंत्रालय' : 'Ministry of Rural Development',
        category: 'skill',
        description: isHi ? 'ग्रामीण गरीब युवाओं के लिए आवासीय कौशल प्रशिक्षण और गारंटीड रोजगार इंटर्नशिप।' : 'Placement-linked residential skill development training for rural poor youth.',
        benefit: isHi ? 'मुफ्त भोजन, आवास, यूनिफॉर्म, टैबलेट + गारंटीड नौकरी' : 'Free boarding, lodging, uniform, tablet + Guaranteed job placement',
        eligibility: isHi ? ['ग्रामीण युवा', 'आयु 15-35 वर्ष (महिला/दिव्यांग 45 तक)', 'गरीब परिवार'] : ['Rural youth', 'Age 15-35', 'Poor household'],
        requiredDocs: isHi ? ['आधार कार्ड', 'राशन कार्ड / BPL प्रमाण', 'स्कूल अंकतालिका'] : ['Aadhaar', 'Ration Card / BPL proof', 'Marksheet'],
        applyUrl: 'https://ddugky.gov.in',
      }
    ];
  }

  // 2. HOUSING & SHELTER SCHEMES (Strictly housing only)
  else if (/housing|house|home|awas|makan|shelter|pucca|kutcha|dwelling|मकान|घर|आवास|गृह|আবাসন|வீடு|வீட்டு|గృహ|ఇల్లు/i.test(lower)) {
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

  // 3. EDUCATION & SCHOLARSHIPS (Strictly education only)
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

  // 4. AGRICULTURE & FARMING SCHEMES (Strictly agriculture only)
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

  // 5. HEALTH & MEDICAL SCHEMES (Strictly health only)
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

  // 6. BUSINESS, LOANS & LIVELIHOOD (Strictly business only)
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

  // 7. DEFAULT GENERAL MIX (Only if query is completely generic like "hello")
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

const OFFICIAL_URL_MAP = {
  pmkisan: 'https://pmkisan.gov.in',
  pmfby: 'https://pmfby.gov.in',
  kcc: 'https://www.myscheme.gov.in/schemes/kcc',
  pmksy: 'https://pmksy.gov.in',
  pmayg: 'https://pmayg.nic.in',
  pmayu: 'https://pmay-urban.gov.in',
  pmjay: 'https://beneficiary.nha.gov.in',
  ayushman: 'https://beneficiary.nha.gov.in',
  pmsby: 'https://www.jansuraksha.gov.in',
  pmjjby: 'https://www.jansuraksha.gov.in',
  svanidhi: 'https://pmsvanidhi.mohua.gov.in',
  mudra: 'https://www.udyamimitra.in',
  'pm-mudra': 'https://www.udyamimitra.in',
  standup_india: 'https://www.standupmitra.in',
  mgnregs: 'https://nrega.nic.in',
  pmkvy: 'https://www.skillindiadigital.gov.in',
  pm_vishwakarma: 'https://pmvishwakarma.gov.in',
  'pm-vishwakarma': 'https://pmvishwakarma.gov.in',
  pmjdy: 'https://pmjdy.gov.in',
  apy: 'https://www.npscra.nsdl.co.in/scheme-details.php',
  sukanya_samriddhi: 'https://www.myscheme.gov.in/schemes/ssy',
  sukanya: 'https://www.myscheme.gov.in/schemes/ssy',
  postmatric_sch: 'https://scholarships.gov.in',
  nsp_sc: 'https://scholarships.gov.in',
  nmmss: 'https://scholarships.gov.in',
  cbse_merit_single_girl: 'https://www.cbse.gov.in/cbsenew/scholar.html',
  'pm-poshan': 'https://pmposhan.education.gov.in/index.html',
  pmposhan: 'https://pmposhan.education.gov.in/index.html',
  pmmvy: 'https://pmmvy.wcd.gov.in',
  pmegp: 'https://www.kviconline.gov.in',
};

const enrichMatchedSchemeUrls = (scheme, profile) => {
  const normId = (scheme.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const applyUrl = OFFICIAL_URL_MAP[normId] || scheme.applyUrl || `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.name || '')}`;
  return {
    ...scheme,
    id: normId || 'scheme_' + Math.random().toString(36).substring(2, 7),
    applyUrl,
    category: (scheme.category || 'social').toLowerCase(),
    matchScore: scheme.matchScore || '92% Match',
  };
};

/**
 * AI-powered Welfare Scheme Matcher using Google Gemini 2.5 Flash.
 * Analyzes citizen demographic attributes (state, occupation, income, gender, age, employment)
 * and returns high-confidence matched government schemes with reasons, eligibility, and verified official apply links.
 */
export const matchProfileSchemesWithGemini = async (profile = {}, language = 'en') => {
  const targetLanguageName = LANGUAGE_NAMES[language] || LANGUAGE_NAMES['en'];

  const model = getGeminiModel();
  if (model) {
    try {
      const prompt = `You are JanSetu AI's core Citizen Eligibility Matching Engine.
Analyze the following verified Indian citizen demographic profile:

CITIZEN PROFILE:
- Age Group: ${profile.ageCategory || '26-40'}
- Gender: ${profile.gender || 'male'}
- State of Residence: ${profile.state || 'India'}
- Annual Family Income Bracket: ${profile.incomeBracket || '1-3L'}
- Primary Occupation / Livelihood: ${profile.occupation || 'Self-Employed'}
- Employment Status: ${profile.employmentStatus || 'self'}

TARGET LANGUAGE: ${targetLanguageName} (Code: ${language})

TASK:
Match and return 6 to 10 active Central and State Government Welfare Schemes specifically applicable and beneficial to this citizen's occupation, income bracket, residential state, age category, and gender.

CRITICAL REQUIREMENTS:
1. Every scheme MUST be an active flagship Indian government scheme (e.g. PM-KISAN, Ayushman Bharat PM-JAY, PMAY-G, PM SVANidhi, PMKVY 4.0, MGNREGS, PMMY Mudra, Stand-Up India, Post-Matric Scholarship, PM Vishwakarma, APY, Sukanya Samriddhi, PM POSHAN, etc.).
2. Tailor the schemes specifically:
   - If occupation is Farmer: include PM-KISAN, PMFBY, KCC, PMKSY, PMAY-G.
   - If occupation is Student: include Post-Matric Scholarship, PMKVY, NMMSS, PM Internship, Single Girl Child (if female).
   - If occupation is Self-Employed or Street Vendor: include PM SVANidhi, PMMY Mudra, PM Vishwakarma, Stand-Up India (if female/SC/ST).
   - If occupation is Daily Wage Worker / Unemployed: include MGNREGS, PMKVY, Ayushman Bharat, PMAY-G, APY.
   - If occupation is Homemaker: include Sukanya Samriddhi, PMMVY, Ayushman Bharat, APY.
   - If income is <1L or 1-3L: prioritize Ayushman Bharat (₹5 Lakh cover) and PMAY housing.
3. For each scheme, provide:
   - "id": lowercase unique slug string (e.g. "pmkisan", "pmjay", "pmayg", "svanidhi", "pmkvy", "mudra", "mgnregs", "postmatric_sch", "pm_vishwakarma", "apy", "sukanya", "pm-poshan")
   - "name": Scheme name (e.g. "PM-KISAN", "PMAY-G", "Ayushman Bharat", etc.)
   - "fullName": Full official name of the scheme
   - "ministry": Name of the responsible central/state ministry
   - "category": exactly one of ["agriculture", "education", "housing", "health", "business", "employment", "skill", "social"]
   - "benefit": concise key benefit (e.g. "₹6,000 / year", "₹5 Lakhs health cover", "Collateral-free loan up to ₹50,000")
   - "description": 2-3 sentence overview
   - "matchScore": Confidence string percentage (e.g. "98% Match", "95% Match", "92% Match", "89% Match")
   - "matchReason": Exactly 1 clear sentence explaining WHY this scheme matches this citizen's specific occupation, state, income, or gender
   - "qualifications": Array of 2-3 objects: [{"text": "Qualification point", "sub": "Details"}]
   - "requiredDocs": Array of 2-4 objects: [{"name": "Aadhaar Card", "status": "Pre-verified"}, {"name": "Income Certificate", "status": "Required"}]
   - "officialEligibility": {"description": "Brief description", "exclusions": "Key exclusions"}
   - "applyUrl": Direct official active Government of India portal URL

RETURN STRICTLY RAW VALID JSON ONLY with no markdown formatting:
{
  "schemes": [ ... ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.schemes) && parsed.schemes.length > 0) {
        return parsed.schemes.map(s => enrichMatchedSchemeUrls(s, profile));
      }
    } catch (err) {
      console.warn('Gemini scheme matching fallback invoked:', err.message);
    }
  }

  // Deterministic fallback matcher
  return getDeterministicMatchedSchemes(profile, language);
};

/**
 * Intelligent deterministic fallback rule engine for scheme matching
 */
const getDeterministicMatchedSchemes = (profile = {}, language = 'en') => {
  const occ = (profile.occupation || '').toLowerCase();
  const gender = (profile.gender || '').toLowerCase();
  const state = profile.state || 'India';
  const inc = profile.incomeBracket || '1-3L';
  const age = profile.ageCategory || '26-40';

  const isFarmer = occ.includes('farm') || occ.includes('kisan') || occ.includes('agri');
  const isStudent = occ.includes('student') || occ.includes('vidhyarthi') || occ.includes('study');
  const isVendorOrBusiness = occ.includes('vendor') || occ.includes('shop') || occ.includes('self') || occ.includes('business');
  const isWorkerOrUnemployed = occ.includes('wage') || occ.includes('labour') || occ.includes('worker') || occ.includes('unemployed');
  const isHomemaker = occ.includes('home') || occ.includes('housewife') || occ.includes('grihini');
  const isFemale = gender === 'female';
  const isLowIncome = inc === '<1L' || inc === '1-3L';

  const results = [];

  // 1. Occupation-specific flagship matches
  if (isFarmer) {
    results.push({
      id: 'pmkisan',
      name: 'PM-KISAN',
      fullName: 'Pradhan Mantri Kisan Samman Nidhi',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'agriculture',
      benefit: '₹6,000 / year',
      description: 'Direct income support of ₹6,000 per year paid in three equal installments to eligible farmer families across India.',
      matchScore: '98% Match',
      matchReason: `Matched with Farmer occupation & Land records in ${state}.`,
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
      applyUrl: OFFICIAL_URL_MAP.pmkisan,
    });

    results.push({
      id: 'pmfby',
      name: 'PM Fasal Bima Yojana',
      fullName: 'Pradhan Mantri Fasal Bima Yojana',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'agriculture',
      benefit: 'Comprehensive Crop Insurance (2% Kharif)',
      description: 'Financial support and comprehensive risk insurance against non-preventable natural crop damage.',
      matchScore: '95% Match',
      matchReason: `Matched for notified seasonal crops cultivated in ${state}.`,
      qualifications: [
        { text: 'Cultivating notified crops', sub: 'Owner or recorded tenant farmer.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Land Possession Certificate', status: 'Required' }
      ],
      officialEligibility: {
        description: 'All farmers growing notified crops in notified areas are eligible.',
        exclusions: 'Crops not covered under state seasonal notification.'
      },
      applyUrl: OFFICIAL_URL_MAP.pmfby,
    });

    results.push({
      id: 'kcc',
      name: 'Kisan Credit Card (KCC)',
      fullName: 'Kisan Credit Card Scheme',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'agriculture',
      benefit: 'Credit up to ₹3 Lakh at 4% Interest',
      description: 'Affordable institutional credit for farmers to purchase seeds, fertilizers, and agricultural inputs.',
      matchScore: '93% Match',
      matchReason: `Matched based on agricultural livelihood in ${state}.`,
      qualifications: [
        { text: 'Active farmer', sub: 'Owner cultivator, tenant farmer, or oral lessee.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Land Records', status: 'Required' }
      ],
      officialEligibility: {
        description: 'All farmers, individuals or joint borrowers who are owner cultivators.',
        exclusions: 'Defaulters of previous institutional farm loans.'
      },
      applyUrl: OFFICIAL_URL_MAP.kcc,
    });
  }

  if (isStudent) {
    results.push({
      id: 'postmatric_sch',
      name: 'Post-Matric Scholarship Scheme',
      fullName: 'Central Sector Post-Matric Scholarship',
      ministry: 'Ministry of Social Justice and Empowerment',
      category: 'education',
      benefit: 'Full Tuition Fee + Monthly Allowance',
      description: 'Direct scholarship and financial assistance for post-secondary and college education.',
      matchScore: '98% Match',
      matchReason: `Matched based on Student status & ${inc} annual family income bracket in ${state}.`,
      qualifications: [
        { text: 'Enrolled in recognized institution', sub: 'Pursuing post-matric / diploma / degree course.' },
        { text: 'Income criteria met', sub: `Family income within ${inc} cap.` }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Income Certificate', status: 'Required' },
        { name: 'College Admission / Fee Receipt', status: 'Required' }
      ],
      officialEligibility: {
        description: 'Students pursuing post-matriculation courses in recognized institutions.',
        exclusions: 'Students receiving multiple concurrent central scholarships.'
      },
      applyUrl: OFFICIAL_URL_MAP.postmatric_sch,
    });

    results.push({
      id: 'pmkvy',
      name: 'PMKVY 4.0 (Skill India)',
      fullName: 'Pradhan Mantri Kaushal Vikas Yojana',
      ministry: 'Ministry of Skill Development and Entrepreneurship',
      category: 'skill',
      benefit: 'Free Skill Training + Certification',
      description: 'Industry-aligned technical skill certification, stipend, and placement assistance.',
      matchScore: '94% Match',
      matchReason: `Matched for youth / student upskilling in ${state}.`,
      qualifications: [
        { text: 'Indian Youth', sub: 'Seeking job-oriented vocational skills.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: '10th / 12th Certificate', status: 'Required' }
      ],
      officialEligibility: {
        description: 'Any Indian youth looking to acquire employable industry skills.',
        exclusions: 'Currently employed regular central government staff.'
      },
      applyUrl: OFFICIAL_URL_MAP.pmkvy,
    });

    if (isFemale) {
      results.push({
        id: 'cbse_merit_single_girl',
        name: 'CBSE Single Girl Child Scholarship',
        fullName: 'CBSE Merit Scholarship for Single Girl Children',
        ministry: 'Department of School Education & Literacy',
        category: 'education',
        benefit: '₹500 / month scholarship',
        description: 'Merit scholarship supporting the higher secondary education of meritorious single girl children.',
        matchScore: '92% Match',
        matchReason: `Matched for Female student profile in ${state}.`,
        qualifications: [
          { text: 'Single girl child of parents', sub: 'Passed Class X with 60% or more marks.' }
        ],
        requiredDocs: [
          { name: 'Aadhaar Card', status: 'Pre-verified' },
          { name: 'Class X Marksheet', status: 'Required' },
          { name: 'Single Girl Child Affidavit', status: 'Required' }
        ],
        officialEligibility: {
          description: 'Single girl child who is the only child of her parents.',
          exclusions: 'Students with siblings.'
        },
        applyUrl: OFFICIAL_URL_MAP.cbse_merit_single_girl,
      });
    }
  }

  if (isVendorOrBusiness) {
    results.push({
      id: 'svanidhi',
      name: 'PM SVANidhi',
      fullName: 'Prime Minister Street Vendor\'s AtmaNirbhar Nidhi',
      ministry: 'Ministry of Housing and Urban Affairs',
      category: 'business',
      benefit: '₹10,000 – ₹50,000 Collateral Free',
      description: 'Special micro-credit facility offering collateral-free working capital loans with 7% interest subsidy for small vendors.',
      matchScore: '97% Match',
      matchReason: `Matched based on Self-Employed / Vendor livelihood in ${state}.`,
      qualifications: [
        { text: 'Urban / Peri-urban vendor', sub: 'Vending certificate or letter of recommendation from ULB.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Vending ID / ULB Certificate', status: 'Required' }
      ],
      officialEligibility: {
        description: 'Street vendors and small micro-entrepreneurs engaged in vending.',
        exclusions: 'Defaulters of previous non-repaid government credit.'
      },
      applyUrl: OFFICIAL_URL_MAP.svanidhi,
    });

    results.push({
      id: 'mudra',
      name: 'Pradhan Mantri MUDRA Yojana',
      fullName: 'PMMY Shishu / Kishor / Tarun Micro Credit',
      ministry: 'Ministry of Finance',
      category: 'business',
      benefit: 'Loans up to ₹10.00 Lakhs',
      description: 'Collateral-free business loans for non-corporate, non-farm small and micro enterprises.',
      matchScore: '94% Match',
      matchReason: `Matched for small business entrepreneurship credit support in ${state}.`,
      qualifications: [
        { text: 'Non-farm enterprise', sub: 'Trading, manufacturing, or service business.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar / PAN Card', status: 'Pre-verified' },
        { name: 'Business Registration / DPR', status: 'Required' }
      ],
      officialEligibility: {
        description: 'Any Indian citizen with a business plan for non-farm income generation.',
        exclusions: 'Large corporate entities.'
      },
      applyUrl: OFFICIAL_URL_MAP.mudra,
    });

    results.push({
      id: 'pm_vishwakarma',
      name: 'PM Vishwakarma Scheme',
      fullName: 'PM Vishwakarma Scheme for Traditional Artisans',
      ministry: 'Ministry of MSME',
      category: 'skill',
      benefit: '₹15,000 Toolkit + ₹3 Lakh Loan at 5%',
      description: 'Holistic support including skill verification, free modern toolkit grant, and subsidized collateral-free loans.',
      matchScore: '92% Match',
      matchReason: `Matched for artisan & skilled trade livelihood in ${state}.`,
      qualifications: [
        { text: 'Designated traditional trade', sub: 'Carpenters, blacksmiths, potters, tailors, etc.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Trade Proof / Self Declaration', status: 'Required' }
      ],
      officialEligibility: {
        description: 'Traditional artisans and craftspeople working with hands and tools.',
        exclusions: 'Government employees.'
      },
      applyUrl: OFFICIAL_URL_MAP.pm_vishwakarma,
    });
  }

  if (isWorkerOrUnemployed) {
    results.push({
      id: 'mgnregs',
      name: 'MGNREGS',
      fullName: 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
      ministry: 'Ministry of Rural Development',
      category: 'employment',
      benefit: '100 Days Guaranteed Wage Employment',
      description: 'Guaranteed 100 days of wage employment per financial year to adult members of rural households.',
      matchScore: '98% Match',
      matchReason: `Matched based on daily wage / rural employment support in ${state}.`,
      qualifications: [
        { text: 'Adult resident', sub: 'Willing to undertake unskilled manual work.' }
      ],
      requiredDocs: [
        { name: 'Job Card', status: 'Gram Panchayat issued' },
        { name: 'Aadhaar Card', status: 'Pre-verified' }
      ],
      officialEligibility: {
        description: 'All adult members of rural households willing to do manual work.',
        exclusions: 'Permanent salaried employees.'
      },
      applyUrl: OFFICIAL_URL_MAP.mgnregs,
    });

    results.push({
      id: 'pmkvy',
      name: 'PMKVY 4.0',
      fullName: 'Pradhan Mantri Kaushal Vikas Yojana',
      ministry: 'Ministry of Skill Development and Entrepreneurship',
      category: 'skill',
      benefit: 'Free Skill Training + ₹8,000 Reward',
      description: 'Short term industry certified skill development to transition into salaried employment.',
      matchScore: '93% Match',
      matchReason: `Matched for vocational re-skilling and job placement in ${state}.`,
      qualifications: [
        { text: 'Seeking employment', sub: 'Eligible for NSDC certified training.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Bank Passbook', status: 'Active' }
      ],
      officialEligibility: {
        description: 'Any unemployed or wage worker seeking career skills.',
        exclusions: 'None.'
      },
      applyUrl: OFFICIAL_URL_MAP.pmkvy,
    });
  }

  if (isFemale || isHomemaker) {
    results.push({
      id: 'sukanya',
      name: 'Sukanya Samriddhi Yojana',
      fullName: 'Sukanya Samriddhi Account (SSA)',
      ministry: 'Ministry of Women and Child Development',
      category: 'social',
      benefit: '8.2% Interest + Tax Exemption',
      description: 'High-interest small deposit savings scheme aimed at securing the financial future of girl children.',
      matchScore: '95% Match',
      matchReason: `Matched for family social savings and high yield returns for female citizens in ${state}.`,
      qualifications: [
        { text: 'Girl child up to 10 years', sub: 'Account opened by parent or legal guardian.' }
      ],
      requiredDocs: [
        { name: 'Birth Certificate of Girl Child', status: 'Required' },
        { name: 'Guardian Aadhaar / PAN', status: 'Pre-verified' }
      ],
      officialEligibility: {
        description: 'Parents or legal guardians of a girl child up to 10 years of age.',
        exclusions: 'Girl child above 10 years at account opening.'
      },
      applyUrl: OFFICIAL_URL_MAP.sukanya,
    });
  }

  // 2. Health & Housing matches for Low / Medium Income
  if (isLowIncome || results.length < 5) {
    results.push({
      id: 'ayushman',
      name: 'Ayushman Bharat (PM-JAY)',
      fullName: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
      ministry: 'Ministry of Health and Family Welfare',
      category: 'health',
      benefit: '₹5.00 Lakhs / family / year',
      description: 'Free cashless health insurance coverage up to ₹5 Lakhs per family per year for hospitalization.',
      matchScore: '96% Match',
      matchReason: `Matched based on ${inc} annual income bracket & state entitlement in ${state}.`,
      qualifications: [
        { text: 'Eligible income category', sub: 'Identified under SECC / low-income entitlement card.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Ration Card / Ayushman Card', status: 'Required' }
      ],
      officialEligibility: {
        description: 'Bottom 40% vulnerable and low income families across India.',
        exclusions: 'Formal sector workers covered under CGHS/ESI.'
      },
      applyUrl: OFFICIAL_URL_MAP.ayushman,
    });

    results.push({
      id: 'pmayg',
      name: 'PMAY-G / PMAY-U',
      fullName: 'Pradhan Mantri Awas Yojana',
      ministry: 'Ministry of Rural Development / MoHUA',
      category: 'housing',
      benefit: 'Up to ₹1.30 Lakhs – ₹2.67 Lakhs Grant',
      description: 'Financial housing grant to build a durable permanent pucca house with basic amenities.',
      matchScore: '93% Match',
      matchReason: `Matched based on income bracket (${inc}) and residential status in ${state}.`,
      qualifications: [
        { text: 'Kutcha / temporary house', sub: 'No existing permanent pucca house in family.' }
      ],
      requiredDocs: [
        { name: 'Aadhaar Card', status: 'Pre-verified' },
        { name: 'Job Card / SECC Record', status: 'Panchayat list' }
      ],
      officialEligibility: {
        description: 'Homeless families and households in kutcha or temporary houses.',
        exclusions: 'Families owning motorized vehicles or earning above tax limits.'
      },
      applyUrl: OFFICIAL_URL_MAP.pmayg,
    });
  }

  // 3. Social Security & Pension matches
  results.push({
    id: 'apy',
    name: 'Atal Pension Yojana (APY)',
    fullName: 'Atal Pension Yojana',
    ministry: 'Ministry of Finance / PFRDA',
    category: 'social',
    benefit: '₹1,000 – ₹5,000 / month Pension',
    description: 'Government-guaranteed pension scheme ensuring guaranteed monthly pension post age 60.',
    matchScore: '91% Match',
    matchReason: `Matched based on ${age} age category for retirement security in ${state}.`,
    qualifications: [
      { text: 'Age between 18 and 40 years', sub: 'Flexible auto-debit contribution.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Savings Bank Account', status: 'Auto-debit enabled' }
    ],
    officialEligibility: {
      description: 'All unorganized sector workers aged between 18 and 40 years.',
      exclusions: 'Income tax payers.'
    },
    applyUrl: OFFICIAL_URL_MAP.apy,
  });

  // 4. PM POSHAN / Education match
  results.push({
    id: 'pm-poshan',
    name: 'PM POSHAN Scheme',
    fullName: 'Pradhan Mantri Poshan Shakti Nirman',
    ministry: 'Ministry of Education',
    category: 'education',
    benefit: 'Nutritional Support & Meal Allowance',
    description: 'National initiative providing hot cooked meals to children in primary and upper-primary government schools.',
    matchScore: '88% Match',
    matchReason: `Matched for family child welfare and education nutrition benefits in ${state}.`,
    qualifications: [
      { text: 'Government School Enrolment', sub: 'Enrolled in Class I to VIII.' }
    ],
    requiredDocs: [
      { name: 'School Enrolment Number', status: 'Pre-verified' }
    ],
    officialEligibility: {
      description: 'All children studying in Classes I–VIII in Government and aided schools.',
      exclusions: 'Private non-aided fee-paying schools.'
    },
    applyUrl: OFFICIAL_URL_MAP['pm-poshan'],
  });

  return results.map(s => enrichMatchedSchemeUrls(s, profile));
};

