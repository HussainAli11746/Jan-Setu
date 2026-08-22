// Real Client store and scheme definitions synced with rules engine & catalog
export const INITIAL_SCHEMES = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    sectorType: 'CENTRAL',
    benefit_amount: '₹6,000 / year',
    benefitShort: '₹6,000 / year',
    benefitDetail: 'Direct income support of ₹6,000 per year to farmer families in three equal installments of ₹2,000 directly into bank accounts.',
    applyUrl: 'https://pmkisan.gov.in',
    apply_url: 'https://pmkisan.gov.in',
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
      description: 'All landholding farmers families, which have cultivable landholding in their names are eligible to get benefit under the scheme.',
      exclusions: 'Institutional landholders, farmer families holding constitutional posts, serving/retired officers and employees of state/central government, professionals, and persons who paid income tax in the last assessment year.'
    }
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana',
    fullName: 'Pradhan Mantri Fasal Bima Yojana',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    sectorType: 'CENTRAL',
    benefit_amount: 'Comprehensive Crop Insurance',
    benefitShort: '2% Kharif / 1.5% Rabi',
    benefitDetail: 'Financial support and comprehensive risk insurance against non-preventable natural risks from pre-sowing to post-harvest.',
    applyUrl: 'https://pmfby.gov.in',
    apply_url: 'https://pmfby.gov.in',
    qualifications: [
      { text: 'Farmer with notified crop', sub: 'Cultivating crops covered under seasonal notification.' },
      { text: 'Valid land holding', sub: 'Owner or recorded tenant farmer.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Land Record / Khasra', status: 'Required' },
      { name: 'Sowing Certificate', status: 'From Patwari' },
      { name: 'Bank Passbook', status: 'Active' }
    ],
    officialEligibility: {
      description: 'All farmers including sharecroppers and tenant farmers growing the notified crops in the notified areas are eligible for coverage.',
      exclusions: 'Crops not covered under the state insurance notification for the current season.'
    }
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    fullName: 'Kisan Credit Card (KCC) Scheme',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'agriculture',
    sectorType: 'CENTRAL',
    benefit_amount: 'Credit up to ₹3 Lakh at 4% interest',
    benefitShort: '₹3 Lakh / 4% interest',
    benefitDetail: 'Timely access to affordable credit for farmers to meet agriculture inputs and allied activities.',
    applyUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    apply_url: 'https://www.myscheme.gov.in/schemes/kcc',
    qualifications: [
      { text: 'Owner cultivators or tenant farmers', sub: 'Engaged in agricultural cultivation or allied activities.' },
      { text: 'Valid identification & land records', sub: 'Verified identity and cultivation proof.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Land Record & Cropping Pattern', status: 'Revenue record' },
      { name: 'Passport Photograph', status: 'Required' }
    ],
    officialEligibility: {
      description: 'All farmers, individual/joint borrowers, tenant farmers, oral lessees, and sharecroppers.',
      exclusions: 'Defaulting borrowers on institutional agricultural loans.'
    }
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana',
    fullName: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
    ministry: 'Ministry of Jal Shakti / Agriculture',
    category: 'agriculture',
    sectorType: 'CENTRAL',
    benefit_amount: 'Up to 55% Micro-Irrigation Subsidy',
    benefitShort: 'Up to 55% / Subsidy',
    benefitDetail: 'Expands cultivable area under assured irrigation, improves on-farm water use efficiency ("Per Drop More Crop").',
    applyUrl: 'https://pmksy.gov.in',
    apply_url: 'https://pmksy.gov.in',
  },
  {
    id: 'pmayg',
    name: 'PMAY-G',
    fullName: 'Pradhan Mantri Awas Yojana - Gramin',
    ministry: 'Ministry of Rural Development',
    category: 'housing',
    sectorType: 'CENTRAL',
    benefit_amount: 'Up to ₹1.30 Lakh + Toilet grant',
    benefitShort: '₹1.30 Lakh / unit',
    benefitDetail: 'Financial assistance to homeless and kutcha house dwellers in rural areas to construct pucca houses with basic amenities.',
    applyUrl: 'https://pmayg.nic.in',
    apply_url: 'https://pmayg.nic.in',
    qualifications: [
      { text: 'Rural residency confirmed', sub: 'Living in a designated rural panchayat.' },
      { text: 'No existing pucca house', sub: 'Kutcha roof / temporary dwelling reported.' },
      { text: 'Income within BPL limits', sub: 'Family income meets SECC 2011 criteria.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Bank Account Details (DBT)', status: 'DBT enabled' },
      { name: 'BPL / SECC 2011 Record', status: 'Panchayat list' }
    ],
    officialEligibility: {
      description: 'Homeless families and families living in kutcha and dilapidated houses in rural areas.',
      exclusions: 'Households owning motorized vehicles, mechanized agricultural equipment, or with a government employee earning above ₹10,000/month.'
    }
  },
  {
    id: 'pmayu',
    name: 'PM Awas Yojana - Urban',
    fullName: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
    ministry: 'Ministry of Housing & Urban Affairs',
    category: 'housing',
    sectorType: 'CENTRAL',
    benefit_amount: 'Up to ₹2.67 Lakh Interest Subsidy',
    benefitShort: 'Up to ₹2.67 Lakh / Subsidy',
    benefitDetail: 'Credit-linked subsidy scheme on home loans for economically weaker sections (EWS) and lower income groups (LIG).',
    applyUrl: 'https://pmay-urban.gov.in',
    apply_url: 'https://pmay-urban.gov.in',
  },
  {
    id: 'pmjay',
    name: 'Ayushman Bharat PM-JAY',
    fullName: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    ministry: 'Ministry of Health & Family Welfare',
    category: 'health',
    sectorType: 'CENTRAL',
    benefit_amount: '₹5 Lakh / family / year',
    benefitShort: '₹5,00,000 / family / year',
    benefitDetail: 'Cashless and paperless access to secondary and tertiary healthcare services across empanelled public and private hospitals.',
    applyUrl: 'https://beneficiary.nha.gov.in',
    apply_url: 'https://beneficiary.nha.gov.in',
    qualifications: [
      { text: 'Low-income household', sub: 'Annual family income below threshold.' },
      { text: 'Included in SECC / NFSA database', sub: 'Eligible beneficiary category.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Ration Card', status: 'For family identification' }
    ],
    officialEligibility: {
      description: 'Bottom 40% vulnerable population identified by SECC 2011 database.',
      exclusions: 'Households with high income or motorized 4-wheelers.'
    }
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat PM-JAY',
    fullName: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    ministry: 'Ministry of Health & Family Welfare',
    category: 'health',
    sectorType: 'CENTRAL',
    benefit_amount: '₹5 Lakh / family / year',
    benefitShort: '₹5,00,000 / family / year',
    benefitDetail: 'Cashless and paperless access to secondary and tertiary healthcare services across empanelled public and private hospitals.',
    applyUrl: 'https://beneficiary.nha.gov.in',
    apply_url: 'https://beneficiary.nha.gov.in',
  },
  {
    id: 'pmsby',
    name: 'PM Suraksha Bima Yojana',
    fullName: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    ministry: 'Ministry of Finance',
    category: 'health',
    sectorType: 'CENTRAL',
    benefit_amount: '₹2 Lakh Accidental Cover for ₹20/year',
    benefitShort: '₹2,00,000 / accidental cover',
    benefitDetail: 'Accident insurance providing ₹2 Lakh coverage for accidental death and permanent disability at ₹20/year.',
    applyUrl: 'https://www.jansuraksha.gov.in',
    apply_url: 'https://www.jansuraksha.gov.in',
  },
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    fullName: 'Prime Minister Street Vendor\'s AtmaNirbhar Nidhi',
    ministry: 'Ministry of Housing & Urban Affairs',
    category: 'business',
    sectorType: 'CENTRAL',
    benefit_amount: 'Collateral-free loan up to ₹50,000',
    benefitShort: '₹10,000 - ₹50,000 / loan',
    benefitDetail: 'Affordable working capital loan up to ₹10,000 for 1st tranche, followed by ₹20,000 and ₹50,000 for timely repayment.',
    applyUrl: 'https://pmsvanidhi.mohua.gov.in',
    apply_url: 'https://pmsvanidhi.mohua.gov.in',
    qualifications: [
      { text: 'Street vendor in urban area', sub: 'Vending identity card or letter of recommendation from ULB.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Vending Certificate', status: 'Municipal ID' },
      { name: 'Bank Account', status: 'Active' }
    ],
    officialEligibility: {
      description: 'Street vendors engaged in vending in urban areas on or before March 24, 2020.',
      exclusions: 'Non-urban vendors without valid recommendation certificate.'
    }
  },
  {
    id: 'mudra',
    name: 'Pradhan Mantri MUDRA Yojana',
    fullName: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    ministry: 'Ministry of Finance',
    category: 'business',
    sectorType: 'CENTRAL',
    benefit_amount: 'Loans up to ₹10 Lakh (Shishu, Kishore, Tarun)',
    benefitShort: 'Up to ₹10 Lakh / Loan',
    benefitDetail: 'Collateral-free funding for micro and small non-corporate, non-farm enterprises.',
    applyUrl: 'https://www.udyamimitra.in',
    apply_url: 'https://www.udyamimitra.in',
  },
  {
    id: 'mgnregs',
    name: 'Mahatma Gandhi NREGS',
    fullName: 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
    ministry: 'Ministry of Rural Development',
    category: 'employment',
    sectorType: 'CENTRAL',
    benefit_amount: '100 days Guaranteed Wage Employment',
    benefitShort: '100 days / year',
    benefitDetail: 'Legal guarantee for at least 100 days of wage employment in every financial year to adult members of any rural household.',
    applyUrl: 'https://nrega.nic.in',
    apply_url: 'https://nrega.nic.in',
  },
  {
    id: 'pmkvy',
    name: 'PM Kaushal Vikas Yojana 4.0',
    fullName: 'Pradhan Mantri Kaushal Vikas Yojana 4.0',
    ministry: 'Ministry of Skill Development & Entrepreneurship',
    category: 'skill',
    sectorType: 'CENTRAL',
    benefit_amount: 'Free Industry Skill Training + Certification + ₹8,000',
    benefitShort: 'Free Training + ₹8,000',
    benefitDetail: 'Skill certification scheme to enable Indian youth to take up industry-relevant skill training for better livelihoods.',
    applyUrl: 'https://www.skillindiadigital.gov.in',
    apply_url: 'https://www.skillindiadigital.gov.in',
  },
  {
    id: 'pm_vishwakarma',
    name: 'PM Vishwakarma Scheme',
    fullName: 'PM Vishwakarma Scheme for Artisans & Craftspeople',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    category: 'skill',
    sectorType: 'CENTRAL',
    benefit_amount: '₹15,000 Toolkit + Loan up to ₹3 Lakh at 5%',
    benefitShort: '₹15,000 Toolkit + ₹3L Loan',
    benefitDetail: 'Comprehensive support to traditional artisans and craftspeople including recognition, skill upgradation, toolkit incentive, and credit.',
    applyUrl: 'https://pmvishwakarma.gov.in',
    apply_url: 'https://pmvishwakarma.gov.in',
  },
  {
    id: 'pmvishwakarma',
    name: 'PM Vishwakarma Scheme',
    fullName: 'PM Vishwakarma Scheme for Artisans & Craftspeople',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    category: 'skill',
    sectorType: 'CENTRAL',
    benefit_amount: '₹15,000 Toolkit + Loan up to ₹3 Lakh at 5%',
    benefitShort: '₹15,000 Toolkit + ₹3L Loan',
    benefitDetail: 'Comprehensive support to traditional artisans and craftspeople including recognition, skill upgradation, toolkit incentive, and credit.',
    applyUrl: 'https://pmvishwakarma.gov.in',
    apply_url: 'https://pmvishwakarma.gov.in',
  },
  {
    id: 'sukanya_samriddhi',
    name: 'Sukanya Samriddhi Yojana',
    fullName: 'Sukanya Samriddhi Yojana (SSY)',
    ministry: 'Ministry of Finance',
    category: 'social',
    sectorType: 'CENTRAL',
    benefit_amount: 'High 8.2% Interest + Tax Exemption under 80C',
    benefitShort: '8.2% Interest / Tax-free',
    benefitDetail: 'Small deposit savings scheme targeted for girl child education and marriage expenses.',
    applyUrl: 'https://www.myscheme.gov.in/schemes/ssy',
    apply_url: 'https://www.myscheme.gov.in/schemes/ssy',
  },
  {
    id: 'ssy',
    name: 'Sukanya Samriddhi Yojana',
    fullName: 'Sukanya Samriddhi Yojana (SSY)',
    ministry: 'Ministry of Finance',
    category: 'social',
    sectorType: 'CENTRAL',
    benefit_amount: 'High 8.2% Interest + Tax Exemption under 80C',
    benefitShort: '8.2% Interest / Tax-free',
    benefitDetail: 'Small deposit savings scheme targeted for girl child education and marriage expenses.',
    applyUrl: 'https://www.myscheme.gov.in/schemes/ssy',
    apply_url: 'https://www.myscheme.gov.in/schemes/ssy',
  }
];

// Returns ONLY real submitted applications
export function getApplications() {
  const stored = localStorage.getItem('jansetu_applications');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export function saveApplication(app) {
  const current = getApplications();
  const updated = [app, ...current.filter(a => a.id !== app.id)];
  localStorage.setItem('jansetu_applications', JSON.stringify(updated));
  return updated;
}
