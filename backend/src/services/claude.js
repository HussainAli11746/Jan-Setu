import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

let client;
if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
  client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
}

export const extractUserProfile = async (message, language, conversationHistory = []) => {
  if (!client) {
    return { name: "Demo User", state: "Uttar Pradesh", occupation: "Farmer", income_annual: 80000 };
  }

  const prompt = `You are JanSetu AI, a helpful assistant that helps Indian citizens find government welfare schemes.
Extract a structured user profile from their message. Return JSON with fields:
{ name, age, gender, state, district, occupation, income_annual, caste, religion,
  family_size, has_bank_account, is_bpl, residence_type (rural/urban),
  has_land, has_lpg, has_pucca_house, education_level, is_pregnant,
  has_daughter, disabilities, currently_studying, additional_notes }
Only include fields mentioned. Respond ONLY with valid JSON.
The user is speaking in ${language}. Translate their input if needed.

User Message: ${message}`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: "Return only JSON without any markdown formatting or extra text.",
      messages: [{ role: 'user', content: prompt }]
    });

    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error("Claude API error:", error);
    return {};
  }
};

export const generateResponse = async (userMessage, profile, schemes, language, step) => {
  if (!client) {
    if (step === 1) return `मैंने आपके लिए ${schemes?.length || 3} योजनाएँ ढूँढी हैं।`;
    if (step === 2) return `यहाँ आपकी शीर्ष योजनाएँ हैं।`;
    if (step === 3) return `कृपया डिजीलॉकर के माध्यम से अपने दस्तावेज़ सत्यापित करें।`;
    if (step === 4) return `क्या आप फॉर्म जमा करना चाहते हैं?`;
    if (step === 5) return `आपका आवेदन सफलतापूर्वक जमा हो गया है।`;
    return "नमस्ते, मैं जनसेतु हूँ। मैं आपकी कैसे मदद कर सकता हूँ?";
  }

  let stepContext = "";
  switch(step) {
    case 1: stepContext = "Acknowledge and extract more info if needed, then say 'I found X schemes for you'"; break;
    case 2: stepContext = "Explain top matched schemes briefly"; break;
    case 3: stepContext = "Explain DigiLocker verification"; break;
    case 4: stepContext = "Confirm form is ready"; break;
    case 5: stepContext = "Confirm submission, give reference number"; break;
  }

  const prompt = `You are JanSetu AI. Respond in ${language}.
Context: ${stepContext}
User Profile: ${JSON.stringify(profile)}
Schemes: ${JSON.stringify(schemes)}
User Message: ${userMessage}`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });
    return response.content[0].text;
  } catch (error) {
    console.error("Claude API error:", error);
    return "मुझे खेद है, लेकिन अभी मुझे एक तकनीकी समस्या का सामना करना पड़ रहा है।";
  }
};
