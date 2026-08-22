import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error("[copilotService] Failed to initialize GoogleGenerativeAI:", err.message);
  }
}

// Candidate vision models with auto-fallback
const VISION_MODELS = [
  "gemini-flash-latest",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-lite-latest",
];

const SCHEME_GROUNDING = {
  pmkisan: {
    name: "PM Kisan Samman Nidhi (PM-KISAN)",
    portal: "pmkisan.gov.in",
    docs: ["Aadhaar Card", "Land ownership record (Khasra/Khatauni)", "Bank account passbook", "Mobile number linked to Aadhaar"],
  },
  pmfby: {
    name: "PM Fasal Bima Yojana (PMFBY)",
    portal: "pmfby.gov.in",
    docs: ["Aadhaar Card", "Bank passbook", "Land records (Khasra)", "Sowing certificate", "Account number with IFSC"],
  },
  kcc: {
    name: "Kisan Credit Card (KCC)",
    portal: "myscheme.gov.in/schemes/kcc",
    docs: ["Aadhaar Card", "PAN Card", "Land ownership document", "Passport-size photograph", "Bank account details"],
  },
  pmksy: {
    name: "PM Krishi Sinchayee Yojana (PMKSY)",
    portal: "pmksy.gov.in",
    docs: ["Aadhaar Card", "Land ownership record", "Bank passbook", "Identity proof"],
  },
  pmayg: {
    name: "PM Awas Yojana - Gramin (PMAY-G)",
    portal: "pmayg.nic.in",
    docs: ["Aadhaar Card", "BPL/SECC 2011 data registration", "Bank passbook", "Mobile number linked to Aadhaar", "Caste certificate (if SC/ST)", "Photograph"],
  },
  pmayu: {
    name: "PM Awas Yojana - Urban (PMAY-U)",
    portal: "pmay-urban.gov.in",
    docs: ["Aadhaar Card", "Income certificate", "Property documents", "Bank passbook", "Photograph"],
  },
  pmjay: {
    name: "Ayushman Bharat PM-JAY",
    portal: "beneficiary.nha.gov.in",
    docs: ["Aadhaar Card or Ration Card", "Mobile number (for OTP)", "Family details as per SECC / Ration Card data"],
  },
  pmsby: {
    name: "PM Suraksha Bima Yojana (PMSBY)",
    portal: "jansuraksha.gov.in",
    docs: ["Aadhaar Card", "Bank account (linked to Aadhaar)", "Mobile number"],
  },
  nsp_sc: {
    name: "Post Matric Scholarship for SC Students (NSP)",
    portal: "scholarships.gov.in",
    docs: ["Aadhaar Card", "Caste certificate", "Income certificate", "Previous year mark sheet", "Bank passbook (student)", "Bonafide/admission letter"],
  },
  nmmss: {
    name: "National Means-cum-Merit Scholarship (NMMSS)",
    portal: "scholarships.gov.in",
    docs: ["Aadhaar Card", "School enrollment certificate", "Previous year mark sheet", "Income certificate", "Bank passbook"],
  },
  cbse_merit_single_girl: {
    name: "CBSE Single Girl Child Scholarship",
    portal: "cbse.gov.in",
    docs: ["Aadhaar Card", "CBSE Class X mark sheet", "Affidavit of being single girl child", "Bank passbook", "School principal certificate"],
  },
  "pm-poshan": {
    name: "PM POSHAN Scheme",
    portal: "pmposhan.education.gov.in",
    docs: ["School enrollment proof", "Aadhaar Card (child)", "School identity card"],
  },
  pmposhan: {
    name: "PM POSHAN Scheme",
    portal: "pmposhan.education.gov.in",
    docs: ["School enrollment proof", "Aadhaar Card (child)", "School identity card"],
  },
  svanidhi: {
    name: "PM SVANidhi",
    portal: "pmsvanidhi.mohua.gov.in",
    docs: ["Aadhaar Card", "Vendor certificate or letter of recommendation", "Bank account passbook", "Photograph", "Mobile number"],
  },
  mudra: {
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    portal: "udyamimitra.in",
    docs: ["Aadhaar Card", "PAN Card", "Business proof / GST registration", "Bank statement (6 months)", "Photograph"],
  },
  standup_india: {
    name: "Stand-Up India Scheme",
    portal: "standupmitra.in",
    docs: ["Aadhaar Card", "PAN Card", "Business plan", "Caste certificate (SC/ST) or gender proof", "Bank account details", "Project report"],
  },
  mgnregs: {
    name: "Mahatma Gandhi NREGS",
    portal: "nrega.nic.in",
    docs: ["Aadhaar Card", "Ration Card or Residence proof", "Photograph", "Bank / Post Office account"],
  },
  pmkvy: {
    name: "PM Kaushal Vikas Yojana 4.0 (PMKVY)",
    portal: "skillindiadigital.gov.in",
    docs: ["Aadhaar Card", "Education certificate", "Mobile number", "Photograph"],
  },
  pm_vishwakarma: {
    name: "PM Vishwakarma Scheme",
    portal: "pmvishwakarma.gov.in",
    docs: ["Aadhaar Card", "Caste / community certificate (traditional craft)", "Bank passbook", "Mobile number (linked to Aadhaar)", "Photograph"],
  },
  pmjdy: {
    name: "PM Jan Dhan Yojana (PMJDY)",
    portal: "pmjdy.gov.in",
    docs: ["Aadhaar Card", "Passport-size photograph"],
  },
  pmjjby: {
    name: "PM Jeevan Jyoti Bima Yojana (PMJJBY)",
    portal: "jansuraksha.gov.in",
    docs: ["Aadhaar Card", "Bank account linked to Aadhaar", "Mobile number"],
  },
  apy: {
    name: "Atal Pension Yojana (APY)",
    portal: "npscra.nsdl.co.in",
    docs: ["Aadhaar Card", "Bank account (savings)", "Mobile number", "Age proof"],
  },
  sukanya_samriddhi: {
    name: "Sukanya Samriddhi Yojana (SSY)",
    portal: "myscheme.gov.in/schemes/ssy",
    docs: ["Girl child birth certificate", "Parent/Guardian Aadhaar Card", "Parent/Guardian PAN Card", "Photograph (child + guardian)", "Address proof"],
  },
};

const LANG_NAMES = {
  en: "English",
  hi: "Hindi (हिंदी)",
  bn: "Bengali (বাংলা)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)",
  gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  ur: "Urdu (اردو)",
};

function normalizeSchemeId(id) {
  if (!id) return "pmkisan";
  const clean = String(id).toLowerCase().trim().replace(/[-_\s]/g, "");
  if (SCHEME_GROUNDING[id]) return id;
  for (const key of Object.keys(SCHEME_GROUNDING)) {
    if (key.replace(/[-_\s]/g, "") === clean) return key;
  }
  return id;
}

async function analyzeScreenshot({ schemeId, imageBase64, lang = "en" }) {
  if (!genAI) {
    if (process.env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else {
      throw new Error("GEMINI_API_KEY is not configured on server.");
    }
  }

  const normalizedKey = normalizeSchemeId(schemeId);
  const scheme = SCHEME_GROUNDING[normalizedKey] || {
    name: schemeId ? String(schemeId).toUpperCase() : "Government Welfare Scheme",
    portal: "Official Government Portal",
    docs: ["Aadhaar Card", "Bank Account Details", "Income Proof", "Identity Document", "Mobile Number (OTP)"],
  };

  const langName = LANG_NAMES[lang] || LANG_NAMES["en"];

  const prompt = [
    `You are JanSetu AI Apply Assist, an expert AI visual co-pilot helping an Indian citizen navigate the application website for "${scheme.name}".`,
    `Verified documents required for this scheme: ${scheme.docs.join(", ")}.`,
    `Language instruction: You MUST respond in ${langName}. If ${langName} is not English, write in that language's native script.`,
    ``,
    `Look carefully at the attached real screenshot of the government portal. Identify the exact visible text, dropdowns, input fields, buttons, and banners shown on the screen.`,
    ``,
    `Return ONLY a JSON object matching this schema with high precision:`,
    `{`,
    `  "sectionSummary": "1-2 sentences describing what specific form step, portal section, or search bar is visible on screen (e.g. Beneficiary Search by State/District, Senior Citizen Enrollment banner, Aadhaar OTP Verification, etc.)",`,
    `  "docsNeeded": ["1-3 specific documents from the verified list needed right now for this visible section"],`,
    `  "nextAction": "Actionable, crystal-clear instructions on what field to fill or button/dropdown to click next (mention exact on-screen button labels or dropdown names visible in the image)",`,
    `  "spokenText": "A warm, clear 2-3 sentence audio summary guiding the citizen on what to do next on this screen"`,
    `}`
  ].join("\n");

  let lastError = null;

  // Multi-model cascade: try each model until one succeeds
  for (const modelName of VISION_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        },
      ]);

      const raw = result.response.text().trim();
      const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(jsonText);

      console.log(`[copilotService] Analysis successful via ${modelName}`);

      return {
        sectionSummary: parsed.sectionSummary || "You are on the official government application portal.",
        docsNeeded: Array.isArray(parsed.docsNeeded) && parsed.docsNeeded.length > 0 ? parsed.docsNeeded : scheme.docs.slice(0, 2),
        nextAction: parsed.nextAction || "Please verify the information and proceed to the next step.",
        spokenText: parsed.spokenText || parsed.sectionSummary || "Please review the on-screen form.",
        schemeName: scheme.name,
        allDocs: scheme.docs,
        modelUsed: modelName,
      };
    } catch (err) {
      console.warn(`[copilotService] Model ${modelName} failed (${err.status || err.message}). Trying next...`);
      lastError = err;
    }
  }

  // If all models failed, throw error or return detailed message
  throw new Error(`Vision models unavailable: ${lastError?.message || "Please check API quota"}`);
}

/**
 * Answer a free-text question from the citizen, grounded in the scheme context.
 * @param {object} opts
 * @param {string} opts.schemeId
 * @param {string} opts.question  - The user's free-text question
 * @param {string} [opts.lang]    - ISO 639-1 language code
 * @returns {Promise<{answer: string}>}
 */
async function askQuestion({ schemeId, question, lang = "en" }) {
  if (!genAI) {
    if (process.env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else {
      throw new Error("GEMINI_API_KEY is not configured on server.");
    }
  }

  const normalizedKey = normalizeSchemeId(schemeId);
  const scheme = SCHEME_GROUNDING[normalizedKey] || {
    name: schemeId ? String(schemeId).toUpperCase() : "Government Welfare Scheme",
    portal: "Official Government Portal",
    docs: ["Aadhaar Card", "Bank Account Details", "Income Proof"],
  };

  const langName = LANG_NAMES[lang] || LANG_NAMES["en"];

  const prompt = [
    `You are JanSetu AI Apply Assist, a helpful and friendly AI guide for Indian citizens applying to government welfare schemes.`,
    `The citizen is currently applying for: "${scheme.name}" on ${scheme.portal}.`,
    `Documents required for this scheme: ${scheme.docs.join(", ")}.`,
    `Language instruction: You MUST respond in ${langName}. If ${langName} is not English, write in that language's native script.`,
    ``,
    `The citizen's question is: "${question}"`,
    ``,
    `Answer in 2-4 sentences. Be warm, simple, and direct. Avoid technical jargon.`,
    `If the question is unrelated to this scheme or government services, politely redirect them to ask about the scheme.`,
  ].join("\n");

  const TEXT_MODELS = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  let lastError = null;
  for (const modelName of TEXT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.4 },
      });
      const result = await model.generateContent(prompt);
      const answer = result.response.text().trim();
      console.log(`[copilotService] askQuestion successful via ${modelName}`);
      return { answer };
    } catch (err) {
      console.warn(`[copilotService] askQuestion model ${modelName} failed: ${err.message}`);
      lastError = err;
    }
  }
  throw new Error(`Could not generate answer: ${lastError?.message || "Please check API quota"}`);
}

export { analyzeScreenshot, askQuestion, SCHEME_GROUNDING };