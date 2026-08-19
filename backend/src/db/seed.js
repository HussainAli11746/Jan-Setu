import pool from './pool.js';

const schemes = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    ministry: 'Ministry of Agriculture',
    category: 'agriculture',
    benefit_description: '₹6,000/year in 3 installments',
    eligibility_rules: { occupation: ['farmer'], land_ownership: true, income_max: null, exclude: ['income_tax_payer', 'government_employee'] },
    required_documents: ['aadhaar', 'land_record', 'bank_passbook'],
    form_fields: { name: 'text', land_area: 'number', bank_account: 'text' }
  },
  {
    id: 'pmayg',
    name: 'PMAY-G (Pradhan Mantri Awas Yojana - Gramin)',
    ministry: 'Ministry of Rural Development',
    category: 'housing',
    benefit_description: '₹1.2 Lakh (plains) / ₹1.3 Lakh (hills)',
    eligibility_rules: { residence: 'rural', has_pucca_house: false, income_max: null, priority: ['SC', 'ST', 'BPL', 'disabled', 'women_headed'] },
    required_documents: ['aadhaar', 'bpl_certificate', 'bank_passbook'],
    form_fields: { name: 'text', address: 'text' }
  },
  {
    id: 'pmjdy',
    name: 'PM Jan Dhan Yojana',
    ministry: 'Ministry of Finance',
    category: 'finance',
    benefit_description: 'Zero-balance bank account, ₹1L accident insurance, ₹30K life cover',
    eligibility_rules: { has_bank_account: false, age_min: 10 },
    required_documents: ['aadhaar'],
    form_fields: { name: 'text', dob: 'date' }
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat PM-JAY',
    ministry: 'Ministry of Health',
    category: 'health',
    benefit_description: '₹5 Lakh/year health insurance per family',
    eligibility_rules: { income_category: ['BPL', 'SECC'], exclude: ['above_poverty_line_non_secc'] },
    required_documents: ['aadhaar', 'ration_card'],
    form_fields: { name: 'text', family_members: 'number' }
  },
  {
    id: 'ujjwala',
    name: 'PM Ujjwala Yojana 2.0',
    ministry: 'Ministry of Petroleum',
    category: 'energy',
    benefit_description: 'Free LPG connection + first refill + hotplate',
    eligibility_rules: { gender: 'female', age_min: 18, bpl_or_secc: true, has_lpg: false },
    required_documents: ['aadhaar', 'ration_card', 'bank_passbook'],
    form_fields: { name: 'text', age: 'number' }
  },
  {
    id: 'pmegp',
    name: 'PMEGP',
    ministry: 'Ministry of MSME',
    category: 'employment',
    benefit_description: 'Subsidy 15-35% on project cost up to ₹25L (manufacturing) or ₹10L (service)',
    eligibility_rules: { age_min: 18, income_max: null, not_existing_government_beneficiary: true, education: { required: false } },
    required_documents: ['aadhaar', 'project_report'],
    form_fields: { name: 'text', project_cost: 'number' }
  },
  {
    id: 'nsp_postmatric_sc',
    name: 'NSP Post-Matric Scholarship (SC)',
    ministry: 'Ministry of Social Justice',
    category: 'education',
    benefit_description: 'Full maintenance allowance + course fees',
    eligibility_rules: { caste: ['SC'], currently_studying: true, income_max: 250000, grade_min: null },
    required_documents: ['aadhaar', 'caste_certificate', 'income_certificate', 'marksheet'],
    form_fields: { name: 'text', institute: 'text', course: 'text' }
  },
  {
    id: 'sukanya',
    name: 'Sukanya Samriddhi Yojana',
    ministry: 'Ministry of Finance',
    category: 'women',
    benefit_description: '8.2% interest, tax-free, maturity at 21 years',
    eligibility_rules: { gender_child: 'female', age_child_max: 10, parent_or_guardian: true },
    required_documents: ['birth_certificate', 'parent_aadhaar'],
    form_fields: { child_name: 'text', parent_name: 'text' }
  },
  {
    id: 'pmmvy',
    name: 'PM Matru Vandana Yojana',
    ministry: 'Ministry of WCD',
    category: 'women',
    benefit_description: '₹5,000 in 3 installments for first pregnancy',
    eligibility_rules: { gender: 'female', pregnant_or_lactating: true, first_child: true, age_min: 19 },
    required_documents: ['aadhaar', 'mcp_card', 'bank_passbook'],
    form_fields: { name: 'text', lmp_date: 'date' }
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana',
    ministry: 'Ministry of Finance',
    category: 'pension',
    benefit_description: '₹1,000–₹5,000/month pension after age 60',
    eligibility_rules: { age_min: 18, age_max: 40, has_bank_account: true, income_tax_payer: false },
    required_documents: ['aadhaar', 'bank_passbook'],
    form_fields: { name: 'text', pension_amount: 'number' }
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana',
    ministry: 'Ministry of Agriculture',
    category: 'agriculture',
    benefit_description: 'Crop insurance against natural calamities',
    eligibility_rules: { occupation: ['farmer'], has_crop_loan: true },
    required_documents: ['aadhaar', 'land_record', 'bank_passbook'],
    form_fields: { name: 'text', crop_details: 'text' }
  },
  {
    id: 'pmkvy',
    name: 'PM Kaushal Vikas Yojana 4.0',
    ministry: 'Ministry of Skill Development',
    category: 'skill',
    benefit_description: 'Free skill training + ₹8,000 reward + placement support',
    eligibility_rules: { age_min: 15, age_max: 45, unemployed_or_dropout: true },
    required_documents: ['aadhaar', 'education_certificate'],
    form_fields: { name: 'text', education: 'text' }
  },
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    ministry: 'Ministry of Housing & Urban Affairs',
    category: 'finance',
    benefit_description: 'Working capital loan ₹10K → ₹20K → ₹50K',
    eligibility_rules: { occupation: ['street_vendor'], has_certificate_of_vending: null },
    required_documents: ['aadhaar', 'vending_certificate'],
    form_fields: { name: 'text', vending_location: 'text' }
  },
  {
    id: 'mgnregs',
    name: 'MGNREGS',
    ministry: 'Ministry of Rural Development',
    category: 'employment',
    benefit_description: '100 days/year guaranteed wage employment',
    eligibility_rules: { residence: 'rural', age_min: 18, willing_to_do_unskilled_work: true },
    required_documents: ['aadhaar', 'bank_passbook', 'job_card'],
    form_fields: { name: 'text', address: 'text' }
  },
  {
    id: 'bbbp',
    name: 'Beti Bachao Beti Padhao',
    ministry: 'Ministry of WCD',
    category: 'women',
    benefit_description: 'Girl child welfare programs, education support',
    eligibility_rules: { has_daughter: true },
    required_documents: ['aadhaar', 'daughter_birth_certificate'],
    form_fields: { parent_name: 'text', daughter_name: 'text' }
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting seeder...');
    
    for (const scheme of schemes) {
      await client.query(`
        INSERT INTO schemes (
          id, name, ministry, category, benefit_description, 
          eligibility_rules, required_documents, form_fields
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          ministry = EXCLUDED.ministry,
          category = EXCLUDED.category,
          benefit_description = EXCLUDED.benefit_description,
          eligibility_rules = EXCLUDED.eligibility_rules,
          required_documents = EXCLUDED.required_documents,
          form_fields = EXCLUDED.form_fields
      `, [
        scheme.id, scheme.name, scheme.ministry, scheme.category, scheme.benefit_description,
        scheme.eligibility_rules, JSON.stringify(scheme.required_documents), JSON.stringify(scheme.form_fields)
      ]);
    }
    
    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding failed', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
