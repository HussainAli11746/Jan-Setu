import express from 'express';
import { matchProfileSchemesWithGemini } from '../services/gemini.js';

const router = express.Router();

// Expanded Schemes Catalog
const SCHEMES_CATALOG = [
  // Agriculture
  {
    id: 'pmkisan',
    name: 'PM Kisan Samman Nidhi',
    shortName: 'PM-KISAN',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    benefit_amount: '₹6,000 / year',
    benefit_description: 'Direct income support of ₹6,000 per year transferred into bank accounts in 3 equal installments for all landholding farmers.',
    is_active: true,
    apply_url: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana',
    shortName: 'PMFBY',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    benefit_amount: 'Comprehensive Crop Insurance',
    benefit_description: 'Financial support and comprehensive risk insurance against non-preventable natural risks from pre-sowing to post-harvest.',
    is_active: true,
    apply_url: 'https://pmfby.gov.in',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    shortName: 'KCC',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    benefit_amount: 'Credit up to ₹3 Lakh at 4% interest',
    benefit_description: 'Timely access to affordable credit for farmers to meet agriculture inputs and allied activities.',
    is_active: true,
    apply_url: 'https://www.myscheme.gov.in/schemes/kcc',
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana',
    shortName: 'PMKSY',
    ministry: 'Ministry of Jal Shakti / Agriculture',
    category: 'agriculture',
    benefit_amount: 'Up to 55% Micro-Irrigation Subsidy',
    benefit_description: 'Expands cultivable area under assured irrigation, improves on-farm water use efficiency ("Per Drop More Crop").',
    is_active: true,
    apply_url: 'https://pmksy.gov.in',
  },

  // Housing
  {
    id: 'pmayg',
    name: 'PM Awas Yojana - Gramin',
    shortName: 'PMAY-G',
    ministry: 'Ministry of Rural Development',
    category: 'housing',
    benefit_amount: 'Up to ₹1.30 Lakh + Toilet grant',
    benefit_description: 'Financial assistance to homeless and kutcha house dwellers in rural areas to construct pucca houses with basic amenities.',
    is_active: true,
    apply_url: 'https://pmayg.nic.in',
  },
  {
    id: 'pmayu',
    name: 'PM Awas Yojana - Urban',
    shortName: 'PMAY-U',
    ministry: 'Ministry of Housing & Urban Affairs',
    category: 'housing',
    benefit_amount: 'Up to ₹2.67 Lakh Interest Subsidy',
    benefit_description: 'Credit-linked subsidy scheme on home loans for economically weaker sections (EWS) and lower income groups (LIG).',
    is_active: true,
    apply_url: 'https://pmay-urban.gov.in',
  },

  // Health
  {
    id: 'pmjay',
    name: 'Ayushman Bharat PM-JAY',
    shortName: 'AB PM-JAY',
    ministry: 'Ministry of Health & Family Welfare',
    category: 'health',
    benefit_amount: '₹5 Lakh / family / year',
    benefit_description: 'Cashless and paperless access to secondary and tertiary healthcare services across empanelled public and private hospitals.',
    is_active: true,
    apply_url: 'https://beneficiary.nha.gov.in',
  },
  {
    id: 'pmsby',
    name: 'PM Suraksha Bima Yojana',
    shortName: 'PMSBY',
    ministry: 'Ministry of Finance',
    category: 'health',
    benefit_amount: '₹2 Lakh Accidental Cover for ₹20/year',
    benefit_description: 'Accident insurance providing ₹2 Lakh coverage for accidental death and permanent full disability at an affordable ₹20/year.',
    is_active: true,
    apply_url: 'https://www.jansuraksha.gov.in',
  },

  // Education
  {
    id: 'nsp_sc',
    name: 'Post Matric Scholarship for SC Students',
    shortName: 'NSP-SC',
    ministry: 'Ministry of Social Justice & Empowerment',
    category: 'education',
    benefit_amount: 'Full Tuition Fee + Living Allowance',
    benefit_description: 'Direct scholarship assistance to Scheduled Caste students studying in recognized post-matriculation courses.',
    is_active: true,
    apply_url: 'https://scholarships.gov.in',
  },
  {
    id: 'nmmss',
    name: 'National Means-cum-Merit Scholarship',
    shortName: 'NMMSS',
    ministry: 'Ministry of Education',
    category: 'education',
    benefit_amount: '₹12,000 / year (Class 9 to 12)',
    benefit_description: 'Financial aid awarded to meritorious students from economically weaker sections to arrest dropouts at class 8.',
    is_active: true,
    apply_url: 'https://scholarships.gov.in',
  },
  {
    id: 'cbse_merit_single_girl',
    name: 'CBSE Single Girl Child Scholarship',
    shortName: 'CBSE-SGC',
    ministry: 'Department of School Education & Literacy',
    category: 'education',
    benefit_amount: '₹500 / month for 2 years',
    benefit_description: 'Merit scholarship for single girl children who have passed CBSE Class X examination with 60% or more marks.',
    is_active: true,
    apply_url: 'https://www.cbse.gov.in/cbsenew/scholar.html',
  },
  {
    id: 'pm-poshan',
    name: 'PM POSHAN Scheme',
    shortName: 'PM-POSHAN',
    ministry: 'Ministry of Education',
    category: 'education',
    benefit_amount: 'Nutritional Support & Hot Meals',
    benefit_description: 'National initiative providing hot cooked meals to children in primary and upper-primary government schools.',
    is_active: true,
    apply_url: 'https://pmposhan.education.gov.in/index.html',
  },

  // Business & Livelihood
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    shortName: 'SVANidhi',
    ministry: 'Ministry of Housing & Urban Affairs',
    category: 'business',
    benefit_amount: 'Collateral-free loan up to ₹50,000',
    benefit_description: 'Affordable working capital micro-loans with 7% interest subsidy for urban street vendors and small traders.',
    is_active: true,
    apply_url: 'https://pmsvanidhi.mohua.gov.in',
  },
  {
    id: 'mudra',
    name: 'Pradhan Mantri MUDRA Yojana',
    shortName: 'PMMY',
    ministry: 'Ministry of Finance',
    category: 'business',
    benefit_amount: 'Loans up to ₹10 Lakh (Shishu, Kishore, Tarun)',
    benefit_description: 'Collateral-free funding for micro and small non-corporate, non-farm enterprises.',
    is_active: true,
    apply_url: 'https://www.udyamimitra.in',
  },
  {
    id: 'standup_india',
    name: 'Stand-Up India Scheme',
    shortName: 'StandUp India',
    ministry: 'Ministry of Finance',
    category: 'business',
    benefit_amount: 'Bank loans from ₹10 Lakh to ₹1 Crore',
    benefit_description: 'Facilitates bank loans for setting up greenfield enterprises to at least one SC/ST and one woman borrower per bank branch.',
    is_active: true,
    apply_url: 'https://www.standupmitra.in',
  },

  // Employment & Skill
  {
    id: 'mgnregs',
    name: 'Mahatma Gandhi NREGS',
    shortName: 'MGNREGS',
    ministry: 'Ministry of Rural Development',
    category: 'employment',
    benefit_amount: '100 days Guaranteed Wage Employment',
    benefit_description: 'Legal guarantee for at least 100 days of wage employment in every financial year to adult members of any rural household.',
    is_active: true,
    apply_url: 'https://nrega.nic.in',
  },
  {
    id: 'pmkvy',
    name: 'PM Kaushal Vikas Yojana 4.0',
    shortName: 'PMKVY',
    ministry: 'Ministry of Skill Development & Entrepreneurship',
    category: 'skill',
    benefit_amount: 'Free Industry Skill Training + Certification + ₹8,000',
    benefit_description: 'Skill certification scheme to enable Indian youth to take up industry-relevant skill training for better livelihoods.',
    is_active: true,
    apply_url: 'https://www.skillindiadigital.gov.in',
  },
  {
    id: 'pm_vishwakarma',
    name: 'PM Vishwakarma Scheme',
    shortName: 'PM-Vishwakarma',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    category: 'skill',
    benefit_amount: '₹15,000 Toolkit + Loan up to ₹3 Lakh at 5%',
    benefit_description: 'Comprehensive support to traditional artisans and craftspeople including recognition, skill upgradation, toolkit incentive, and collateral-free credit.',
    is_active: true,
    apply_url: 'https://pmvishwakarma.gov.in',
  },

  // Social Security & Financial Inclusion
  {
    id: 'pmjdy',
    name: 'PM Jan Dhan Yojana',
    shortName: 'PMJDY',
    ministry: 'Ministry of Finance',
    category: 'social',
    benefit_amount: 'Zero balance account + ₹2 Lakh RuPay insurance',
    benefit_description: 'National mission for financial inclusion ensuring access to banking facilities, remittance, credit, insurance, and pension.',
    is_active: true,
    apply_url: 'https://pmjdy.gov.in',
  },
  {
    id: 'pmjjby',
    name: 'PM Jeevan Jyoti Bima Yojana',
    shortName: 'PMJJBY',
    ministry: 'Ministry of Finance',
    category: 'social',
    benefit_amount: '₹2 Lakh Life Insurance for ₹436/year',
    benefit_description: 'One-year renewable life insurance scheme offering ₹2 Lakh coverage for death due to any reason.',
    is_active: true,
    apply_url: 'https://www.jansuraksha.gov.in',
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana',
    shortName: 'APY',
    ministry: 'Ministry of Finance',
    category: 'social',
    benefit_amount: 'Guaranteed pension of ₹1,000 to ₹5,000 / month',
    benefit_description: 'Government-backed pension scheme focused on unorganized sector workers with guaranteed minimum monthly pension after age 60.',
    is_active: true,
    apply_url: 'https://www.npscra.nsdl.co.in/scheme-details.php',
  },
  {
    id: 'sukanya_samriddhi',
    name: 'Sukanya Samriddhi Yojana',
    shortName: 'SSY',
    ministry: 'Ministry of Finance',
    category: 'social',
    benefit_amount: 'High 8.2% Interest + Tax Exemption under 80C',
    benefit_description: 'Small deposit savings scheme targeted for girl child education and marriage expenses.',
    is_active: true,
    apply_url: 'https://www.myscheme.gov.in/schemes/ssy',
  },
];

// GET /api/schemes?page=1&limit=6&category=all
router.get('/', (req, res) => {
  const { category, page = 1, limit = 6, search } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 6;

  let filtered = SCHEMES_CATALOG;

  if (category && category !== 'all') {
    filtered = filtered.filter(s => s.category?.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.shortName?.toLowerCase().includes(q) ||
      s.ministry?.toLowerCase().includes(q) ||
      s.benefit_description?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const paginatedSchemes = filtered.slice(startIndex, endIndex);
  const hasMore = endIndex < total;

  res.json({
    schemes: paginatedSchemes,
    total,
    page: pageNum,
    limit: limitNum,
    hasMore,
  });
});

// GET /api/schemes/:id
router.get('/:id', (req, res) => {
  const scheme = SCHEMES_CATALOG.find(s => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  res.json(scheme);
});

// POST /api/schemes/match
router.post('/match', async (req, res) => {
  try {
    const { profile, language = 'en' } = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile is required' });

    const schemes = await matchProfileSchemesWithGemini(profile, language);
    res.json({ schemes });
  } catch (err) {
    console.error('Scheme match error:', err);
    res.status(500).json({ error: 'Failed to match schemes' });
  }
});

export default router;
