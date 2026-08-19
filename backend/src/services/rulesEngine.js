import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RULES_ENGINE_URL = process.env.RULES_ENGINE_URL || 'http://localhost:8000';

// Inline JS evaluator mirroring schemes.py eligibility rules
// Used as fallback when Python rules-engine is offline
const SCHEME_RULES = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    benefit_description: 'Direct income support of ₹6,000 per year to farmer families',
    benefit_amount: '₹6,000/year',
    score: (p) => {
      if (!p.occupation || !['farmer', 'Farmer'].includes(p.occupation)) return 0;
      if (p.income_tax_payer === true) return 0;
      if (p.is_government_employee === true) return 0;
      return 0.90;
    }
  },
  {
    id: 'pmfby',
    name: 'PMFBY (Crop Insurance)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    benefit_description: 'Comprehensive crop insurance against natural risks',
    benefit_amount: '2% premium for Kharif crops',
    score: (p) => {
      if (!p.occupation || !['farmer', 'Farmer'].includes(p.occupation)) return 0;
      if (p.has_land === false) return 0;
      return p.has_land === true || p.landOwnership ? 0.85 : 0.60;
    }
  },
  {
    id: 'pmayg',
    name: 'PMAY-G',
    ministry: 'Ministry of Rural Development',
    category: 'housing',
    benefit_description: 'Financial assistance to build a pucca house',
    benefit_amount: 'Up to ₹1,30,000',
    score: (p) => {
      if (p.has_pucca_house === true) return 0;
      if (p.residence_type === 'urban') return 0;
      let s = 0;
      if (p.has_pucca_house === false) s += 0.50;
      if (p.residence_type === 'rural') s += 0.30;
      if (p.seeking_housing) s += 0.20;
      return Math.min(s, 0.90);
    }
  },
  {
    id: 'pmjdy',
    name: 'PM Jan Dhan Yojana',
    ministry: 'Ministry of Finance',
    category: 'financial',
    benefit_description: 'Universal access to banking with zero balance account',
    benefit_amount: 'Zero balance account, ₹2 lakh accident insurance',
    score: (p) => {
      if (p.has_bank_account === false) return 0.85;
      return 0; // Already has bank account
    }
  },
  {
    id: 'nsp_postmatric_sc',
    name: 'Post Matric Scholarship (SC)',
    ministry: 'Ministry of Social Justice & Empowerment',
    category: 'education',
    benefit_description: 'Financial assistance to SC students for post-matriculation studies',
    benefit_amount: 'Variable academic allowance',
    score: (p) => {
      const isStudent = p.occupation === 'Student' || p.currently_studying;
      if (!isStudent) return 0;
      if (!p.caste || !['SC', 'sc'].includes(p.caste)) return 0;
      const incomeOk = !p.income_annual || p.income_annual <= 250000;
      return incomeOk ? 0.90 : 0;
    }
  },
  {
    id: 'nsp_postmatric_obc',
    name: 'Post Matric Scholarship (OBC)',
    ministry: 'Ministry of Social Justice & Empowerment',
    category: 'education',
    benefit_description: 'Financial assistance to OBC students for post-matriculation studies',
    benefit_amount: 'Variable academic allowance',
    score: (p) => {
      const isStudent = p.occupation === 'Student' || p.currently_studying;
      if (!isStudent) return 0;
      if (!p.caste || !['OBC', 'obc'].includes(p.caste)) return 0;
      const incomeOk = !p.income_annual || p.income_annual <= 100000;
      return incomeOk ? 0.85 : 0;
    }
  },
  {
    id: 'pmegp',
    name: 'PMEGP',
    ministry: 'Ministry of MSME',
    category: 'business',
    benefit_description: 'Credit linked subsidy for setting up new micro-enterprises',
    benefit_amount: 'Up to ₹50 lakh for manufacturing, ₹20 lakh for service',
    score: (p) => {
      const occ = (p.occupation || '').toLowerCase();
      if (['unemployed', 'daily wage worker', 'street vendor'].includes(occ)) return 0.70;
      return 0;
    }
  },
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'business',
    benefit_description: 'Micro-credit facility for street vendors',
    benefit_amount: 'Working capital loan up to ₹50,000',
    score: (p) => {
      if (!p.occupation) return 0;
      if (['Street Vendor', 'street vendor', 'vendor', 'hawker'].includes(p.occupation)) return 0.90;
      return 0;
    }
  },
  {
    id: 'mgnregs',
    name: 'MGNREGS',
    ministry: 'Ministry of Rural Development',
    category: 'employment',
    benefit_description: '100 days guaranteed wage employment per year',
    benefit_amount: 'Daily wage as per state norms',
    score: (p) => {
      const occ = (p.occupation || '').toLowerCase();
      if (!['daily wage worker', 'unemployed', 'laborer'].includes(occ)) return 0;
      if (p.residence_type === 'urban') return 0;
      return p.residence_type === 'rural' ? 0.88 : 0.60;
    }
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat PM-JAY',
    ministry: 'Ministry of Health and Family Welfare',
    category: 'health',
    benefit_description: 'Health insurance cover up to ₹5 lakhs per family per year',
    benefit_amount: '₹5,00,000/year cover',
    score: (p) => {
      if (p.is_bpl === true) return 0.92;
      // Infer BPL from income
      if (p.income_annual && p.income_annual <= 100000) return 0.80;
      if (p.income_annual && p.income_annual <= 200000) return 0.60;
      return 0;
    }
  },
  {
    id: 'pmkvy',
    name: 'PMKVY',
    ministry: 'Ministry of Skill Development & Entrepreneurship',
    category: 'skill',
    benefit_description: 'Free skill training and certification for youth',
    benefit_amount: 'Free training + certification',
    score: (p) => {
      const occ = (p.occupation || '').toLowerCase();
      const age = p.age;
      if (!['unemployed', 'student', 'daily wage worker'].includes(occ) && !p.currently_studying) return 0;
      if (age && (age < 15 || age > 45)) return 0;
      return 0.75;
    }
  },
  {
    id: 'pmmvy',
    name: 'PMMVY',
    ministry: 'Ministry of Women and Child Development',
    category: 'maternity',
    benefit_description: 'Maternity benefit of ₹5000 for first living child',
    benefit_amount: '₹5,000',
    score: (p) => {
      if (p.gender !== 'female' && p.gender !== 'Female') return 0;
      if (p.is_pregnant !== true) return 0;
      if (p.is_government_employee === true) return 0;
      return 0.90;
    }
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana',
    ministry: 'Ministry of Finance',
    category: 'pension',
    benefit_description: 'Guaranteed minimum pension of ₹1,000 to ₹5,000 per month',
    benefit_amount: '₹1,000 - ₹5,000/month post 60',
    score: (p) => {
      const age = p.age;
      if (age && (age < 18 || age > 40)) return 0;
      if (p.has_bank_account === false) return 0;
      const occ = (p.occupation || '').toLowerCase();
      // Mainly for informal sector workers
      if (['daily wage worker', 'farmer', 'street vendor', 'unemployed'].includes(occ)) return 0.75;
      return 0.40; // possible for others
    }
  },
  {
    id: 'ujjwala',
    name: 'PM Ujjwala Yojana',
    ministry: 'Ministry of Petroleum and Natural Gas',
    category: 'energy',
    benefit_description: 'Free LPG connection to women from BPL households',
    benefit_amount: 'Free LPG connection',
    score: (p) => {
      if (p.gender !== 'female' && p.gender !== 'Female') return 0;
      if (p.has_lpg === true) return 0;
      if (p.income_annual && p.income_annual > 300000) return 0;
      return 0.80;
    }
  }
];

// Profile-aware JS scheme evaluator — mirrors Python rules-engine logic
const evaluateProfileJS = (userProfile) => {
  const results = [];
  for (const scheme of SCHEME_RULES) {
    const score = scheme.score(userProfile);
    if (score > 0) {
      results.push({
        id: scheme.id,
        name: scheme.name,
        ministry: scheme.ministry,
        category: scheme.category,
        benefit_description: scheme.benefit_description,
        benefit_amount: scheme.benefit_amount,
        match_score: score,
        is_definite_match: score >= 0.80,
        is_probable_match: true
      });
    }
  }
  results.sort((a, b) => b.match_score - a.match_score);
  return results;
};

export const matchSchemes = async (userProfile) => {
  try {
    const response = await axios.post(`${RULES_ENGINE_URL}/api/match`, { profile: userProfile }, { timeout: 5000 });
    const schemes = response.data.schemes || response.data || [];
    if (Array.isArray(schemes) && schemes.length > 0) return schemes;
    // If rules engine returns empty, fall through to JS evaluator
    return evaluateProfileJS(userProfile);
  } catch (error) {
    console.warn('Rules engine unavailable, using JS fallback evaluator.', error.message);
    return evaluateProfileJS(userProfile);
  }
};

export const fetchAllSchemesFromEngine = async () => {
  try {
    const response = await axios.get(`${RULES_ENGINE_URL}/api/schemes`, { timeout: 5000 });
    return response.data || [];
  } catch (error) {
    console.warn('Rules engine schemes fetch failed:', error.message);
    return [];
  }
};

export const fetchSchemeByIdFromEngine = async (id) => {
  try {
    const response = await axios.get(`${RULES_ENGINE_URL}/api/schemes/${id}`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.warn(`Rules engine scheme fetch for ${id} failed:`, error.message);
    return null;
  }
};

export const healthCheck = async () => {
  try {
    const response = await axios.get(`${RULES_ENGINE_URL}/health`, { timeout: 2000 });
    return response.data;
  } catch (error) {
    return { status: 'down' };
  }
};
