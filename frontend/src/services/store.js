// Real Client store and scheme definitions synced with rules engine
export const INITIAL_SCHEMES = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'AGRICULTURE',
    sectorType: 'CENTRAL',
    icon: 'tractor',
    benefitShort: '₹6,000 / year',
    benefitType: 'Amount',
    benefitDetail: 'Direct income support of ₹6,000 per year to farmer families in three equal installments of ₹2,000 directly into bank accounts.',
    matchStatus: 'eligible',
    matchReason: 'Your occupation and land details match the core eligibility criteria.',
    qualifications: [
      { text: 'Occupation matches profile', sub: 'Your profile indicates you are involved in farming/agriculture.' },
      { text: 'Income criteria likely met', sub: 'Based on self-declared income data.' },
      { text: 'Location supported', sub: 'Scheme is active in your registered state.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Bank Account Details', status: 'Active account needed' },
      { name: 'Land Record Details', status: 'Khasra/Khatauni' }
    ],
    officialEligibility: {
      description: 'All landholding farmers\' families, which have cultivable landholding in their names are eligible to get benefit under the scheme.',
      exclusions: 'Institutional landholders, farmer families holding constitutional posts, serving/retired officers and employees of state/central government, professionals like doctors, engineers, and persons who paid income tax in the last assessment year.'
    }
  },
  {
    id: 'pmayg',
    name: 'PMAY-G',
    fullName: 'Pradhan Mantri Awas Yojana - Gramin',
    ministry: 'Ministry of Rural Development',
    category: 'HOUSING',
    sectorType: 'CENTRAL',
    icon: 'home',
    benefitShort: '₹1.2L / unit',
    benefitType: 'Assistance',
    benefitDetail: 'Financial assistance to build a pucca house with basic amenities for rural households without a permanent shelter.',
    matchStatus: 'eligible',
    matchReason: 'Your income level and current housing status align with scheme requirements.',
    qualifications: [
      { text: 'Rural residency confirmed', sub: 'Living in a designated rural panchayat.' },
      { text: 'No existing pucca house', sub: 'Kutcha roof / temporary dwelling reported.' },
      { text: 'Income within BPL limits', sub: 'Family income meets criteria.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Bank Account Details', status: 'DBT enabled' },
      { name: 'BPL / SECC 2011 Record', status: 'Panchayat list' }
    ],
    officialEligibility: {
      description: 'Homeless families and families living in kutcha and dilapidated houses in rural areas.',
      exclusions: 'Households owning motorized 2/3/4 wheelers, fishing boats, mechanized agricultural equipment, or earning more than ₹10,000 per month through a government employee.'
    }
  },
  {
    id: 'pmfby',
    name: 'PMFBY',
    fullName: 'Pradhan Mantri Fasal Bima Yojana',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'AGRICULTURE',
    sectorType: 'CENTRAL',
    icon: 'leaf',
    benefitShort: '2% Kharif crops',
    benefitType: 'Premium',
    benefitDetail: 'Comprehensive crop insurance against non-preventable natural risks from pre-sowing to post-harvest stages.',
    matchStatus: 'partial',
    matchReason: 'We need additional details about your specific crop cycle to confirm eligibility.',
    qualifications: [
      { text: 'Farmer with notified crop', sub: 'Cultivating crops covered under seasonal notification.' },
      { text: 'Valid land holding', sub: 'Owner or recorded tenant farmer.' }
    ],
    requiredDocs: [
      { name: 'Aadhaar Card', status: 'Pre-verified' },
      { name: 'Land Possession Certificate', status: 'Required' },
      { name: 'Sowing Certificate', status: 'From Patwari' }
    ],
    officialEligibility: {
      description: 'All farmers including sharecroppers and tenant farmers growing the notified crops in the notified areas are eligible for coverage.',
      exclusions: 'Crops not covered under the state insurance notification for the current season.'
    }
  },
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    fullName: 'Prime Minister Street Vendor\'s AtmaNirbhar Nidhi',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'URBAN',
    sectorType: 'CENTRAL',
    icon: 'store',
    benefitShort: '₹10,000 - ₹50,000',
    benefitType: 'Working Capital',
    benefitDetail: 'Affordable working capital loan up to ₹10,000 for 1st tranche, followed by ₹20,000 and ₹50,000 for timely repayment.',
    matchStatus: 'eligible',
    matchReason: 'Urban vendor livelihood aligns with working capital credit guidelines.',
    qualifications: [
      { text: 'Vending certificate available', sub: 'Vending identity card or letter of recommendation from ULB.' }
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
