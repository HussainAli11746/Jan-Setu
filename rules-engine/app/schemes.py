SCHEMES = {
    'pmkisan': {
        'name': 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        'name_hi': 'प्रधानमंत्री किसान सम्मान निधि',
        'ministry': 'Ministry of Agriculture & Farmers Welfare',
        'category': 'agriculture',
        'benefit_description': 'Direct income support of ₹6,000 per year to farmer families',
        'benefit_amount': '₹6,000/year',
        'required_documents': ['aadhaar', 'bank_account', 'land_records', 'self_declaration'],
        'eligibility': {
            'occupation_includes': ['farmer'],
            'exclude_income_tax_payer': True,
            'exclude_government_employee': True,
        }
    },
    'pmayg': {
        'name': 'Pradhan Mantri Awas Yojana - Gramin',
        'name_hi': 'प्रधानमंत्री आवास योजना - ग्रामीण',
        'ministry': 'Ministry of Rural Development',
        'category': 'housing',
        'benefit_description': 'Financial assistance to build a pucca house',
        'benefit_amount': 'Up to ₹1,30,000',
        'required_documents': ['aadhaar', 'bank_account', 'bpl_card', 'job_card'],
        'eligibility': {
            'residence_required': 'rural',
            'has_pucca_house': False,
        }
    },
    'pmjdy': {
        'name': 'Pradhan Mantri Jan Dhan Yojana',
        'name_hi': 'प्रधानमंत्री जन धन योजना',
        'ministry': 'Ministry of Finance',
        'category': 'financial',
        'benefit_description': 'Universal access to banking facilities',
        'benefit_amount': 'Zero balance account, ₹2 lakh accident insurance',
        'required_documents': ['aadhaar', 'pan_card', 'voter_id'],
        'eligibility': {
            'has_bank_account': False,
            'age_min': 10,
        }
    },
    'ayushman': {
        'name': 'Ayushman Bharat PM-JAY',
        'name_hi': 'आयुष्मान भारत',
        'ministry': 'Ministry of Health and Family Welfare',
        'category': 'health',
        'benefit_description': 'Health insurance cover up to ₹5 lakhs per family per year',
        'benefit_amount': '₹5,00,000/year cover',
        'required_documents': ['aadhaar', 'ration_card', 'pmjay_card'],
        'eligibility': {
            'is_bpl': True,
        }
    },
    'ujjwala': {
        'name': 'Pradhan Mantri Ujjwala Yojana',
        'name_hi': 'प्रधानमंत्री उज्ज्वला योजना',
        'ministry': 'Ministry of Petroleum and Natural Gas',
        'category': 'energy',
        'benefit_description': 'LPG connection to women from BPL households',
        'benefit_amount': 'Free LPG connection',
        'required_documents': ['aadhaar', 'bpl_ration_card', 'bank_account', 'passport_photo'],
        'eligibility': {
            'gender_required': 'female',
            'is_bpl': True,
            'has_lpg': False,
            'age_min': 18,
        }
    },
    'pmegp': {
        'name': 'Prime Minister Employment Generation Programme',
        'name_hi': 'प्रधानमंत्री रोजगार सृजन कार्यक्रम',
        'ministry': 'Ministry of Micro, Small & Medium Enterprises',
        'category': 'business',
        'benefit_description': 'Credit linked subsidy for setting up new micro-enterprises',
        'benefit_amount': 'Up to ₹50 lakh for manufacturing, ₹20 lakh for service sector',
        'required_documents': ['aadhaar', 'project_report', 'caste_certificate', 'education_certificate'],
        'eligibility': {
            'age_min': 18,
            'education_min_level': 'primary', # Or custom logic
        }
    },
    'nsp_postmatric_sc': {
        'name': 'Post Matric Scholarships Scheme for SC',
        'name_hi': 'अनुसूचित जाति के छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
        'ministry': 'Ministry of Social Justice & Empowerment',
        'category': 'education',
        'benefit_description': 'Financial assistance to SC students for studying at post matriculation level',
        'benefit_amount': 'Variable academic allowance',
        'required_documents': ['aadhaar', 'caste_certificate', 'income_certificate', 'fee_receipt', 'bank_account'],
        'eligibility': {
            'caste_required': ['SC'],
            'currently_studying': True,
            'income_max': 250000,
        }
    },
    'sukanya': {
        'name': 'Sukanya Samriddhi Yojana',
        'name_hi': 'सुकन्या समृद्धि योजना',
        'ministry': 'Ministry of Finance',
        'category': 'savings',
        'benefit_description': 'Small deposit scheme for the girl child',
        'benefit_amount': 'High interest rate, tax benefits',
        'required_documents': ['birth_certificate', 'parent_aadhaar', 'parent_pan'],
        'eligibility': {
            'has_daughter_under_10': True,
        }
    },
    'pmmvy': {
        'name': 'Pradhan Mantri Matru Vandana Yojana',
        'name_hi': 'प्रधानमंत्री मातृ वंदना योजना',
        'ministry': 'Ministry of Women and Child Development',
        'category': 'maternity',
        'benefit_description': 'Maternity benefit of ₹5000 for first living child of family',
        'benefit_amount': '₹5,000',
        'required_documents': ['aadhaar', 'bank_account', 'mcp_card'],
        'eligibility': {
            'gender_required': 'female',
            'is_pregnant': True,
            'age_min': 19,
            'exclude_government_employee': True,
        }
    },
    'apy': {
        'name': 'Atal Pension Yojana',
        'name_hi': 'अटल पेंशन योजना',
        'ministry': 'Ministry of Finance',
        'category': 'pension',
        'benefit_description': 'Guaranteed minimum pension of ₹1,000 to ₹5,000 per month',
        'benefit_amount': '₹1,000 - ₹5,000/month post 60',
        'required_documents': ['aadhaar', 'bank_account'],
        'eligibility': {
            'age_min': 18,
            'age_max': 40,
            'has_bank_account': True,
        }
    },
    'pmfby': {
        'name': 'Pradhan Mantri Fasal Bima Yojana',
        'name_hi': 'प्रधानमंत्री फसल बीमा योजना',
        'ministry': 'Ministry of Agriculture & Farmers Welfare',
        'category': 'agriculture',
        'benefit_description': 'Crop insurance scheme',
        'benefit_amount': 'Comprehensive insurance cover against failure of crop',
        'required_documents': ['aadhaar', 'land_records', 'bank_account', 'sowing_certificate'],
        'eligibility': {
            'occupation_includes': ['farmer'],
            'has_land': True,
        }
    },
    'pmkvy': {
        'name': 'Pradhan Mantri Kaushal Vikas Yojana',
        'name_hi': 'प्रधानमंत्री कौशल विकास योजना',
        'ministry': 'Ministry of Skill Development & Entrepreneurship',
        'category': 'skill',
        'benefit_description': 'Skill training to youth',
        'benefit_amount': 'Free training, certification',
        'required_documents': ['aadhaar', 'bank_account', 'education_certificate'],
        'eligibility': {
            'age_min': 15,
            'age_max': 45,
            'unemployed_or_dropout': True,
        }
    },
    'svanidhi': {
        'name': 'PM SVANidhi',
        'name_hi': 'पीएम स्वनिधि',
        'ministry': 'Ministry of Housing and Urban Affairs',
        'category': 'business',
        'benefit_description': 'Micro-credit facility for street vendors',
        'benefit_amount': 'Working capital loan up to ₹10,000',
        'required_documents': ['aadhaar', 'vending_certificate', 'bank_account'],
        'eligibility': {
            'occupation_includes': ['street_vendor'],
        }
    },
    'mgnregs': {
        'name': 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
        'name_hi': 'मनरेगा',
        'ministry': 'Ministry of Rural Development',
        'category': 'employment',
        'benefit_description': 'At least 100 days of guaranteed wage employment in a financial year',
        'benefit_amount': 'Daily wage as per state norms',
        'required_documents': ['aadhaar', 'job_card', 'bank_account', 'photograph'],
        'eligibility': {
            'residence_required': 'rural',
            'willing_to_do_unskilled_work': True,
            'age_min': 18,
        }
    },
    'bbbp': {
        'name': 'Beti Bachao Beti Padhao',
        'name_hi': 'बेटी बचाओ बेटी पढ़ाओ',
        'ministry': 'Ministry of Women and Child Development',
        'category': 'social',
        'benefit_description': 'Campaign to generate awareness and improve the efficiency of welfare services intended for girls',
        'benefit_amount': 'Social and educational benefits',
        'required_documents': ['birth_certificate', 'aadhaar'],
        'eligibility': {
            'has_daughter': True,
            'daughter_age_max': 18,
        }
    }
}
