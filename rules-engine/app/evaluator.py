from app.models import UserProfile, SchemeMatch, MatchResponse
from app.schemes import SCHEMES
from typing import Dict, Any

def evaluate_scheme(scheme_id: str, scheme: Dict[str, Any], profile: UserProfile) -> SchemeMatch:
    match_reasons = []
    missing_info = []
    failed_criteria = []
    score = 0.0
    max_score = 0.0
    
    eligibility = scheme.get('eligibility', {})
    
    for criterion, expected_val in eligibility.items():
        max_score += 1.0
        
        if criterion == 'occupation_includes':
            if profile.occupation is None:
                missing_info.append("Please provide your occupation.")
            elif profile.occupation in expected_val:
                score += 1.0
                match_reasons.append(f"You are a {profile.occupation}.")
            else:
                failed_criteria.append(f"Occupation is not one of {', '.join(expected_val)}.")
                
        elif criterion == 'exclude_income_tax_payer':
            if profile.income_tax_payer is None:
                missing_info.append("Please confirm if you pay income tax.")
            elif not profile.income_tax_payer:
                score += 1.0
                match_reasons.append("You do not pay income tax.")
            else:
                failed_criteria.append("Income tax payers are not eligible.")
                
        elif criterion == 'exclude_government_employee':
            if profile.is_government_employee is None:
                missing_info.append("Please confirm if you are a government employee.")
            elif not profile.is_government_employee:
                score += 1.0
                match_reasons.append("You are not a government employee.")
            else:
                failed_criteria.append("Government employees are not eligible.")
                
        elif criterion == 'residence_required':
            if profile.residence_type is None:
                missing_info.append("Please confirm your residence type (rural/urban).")
            elif profile.residence_type == expected_val:
                score += 1.0
                match_reasons.append(f"You live in a {profile.residence_type} area.")
            else:
                failed_criteria.append(f"Must reside in a {expected_val} area.")
                
        elif criterion == 'has_pucca_house':
            if profile.has_pucca_house is None:
                missing_info.append("Please confirm if you have a pucca house.")
            elif profile.has_pucca_house == expected_val:
                score += 1.0
                match_reasons.append("You do not have a pucca house." if not expected_val else "You have a pucca house.")
            else:
                failed_criteria.append("Eligibility requires you to not have a pucca house." if not expected_val else "Must have a pucca house.")
                
        elif criterion == 'has_bank_account':
            if profile.has_bank_account is None:
                missing_info.append("Please confirm if you have a bank account.")
            elif profile.has_bank_account == expected_val:
                score += 1.0
                match_reasons.append("You have a bank account." if expected_val else "You do not have a bank account.")
            else:
                failed_criteria.append("Must not have a bank account." if not expected_val else "Must have a bank account.")
                
        elif criterion == 'age_min':
            if profile.age is None:
                missing_info.append("Please provide your age.")
            elif profile.age >= expected_val:
                score += 1.0
                match_reasons.append(f"You are at least {expected_val} years old.")
            else:
                failed_criteria.append(f"Must be at least {expected_val} years old.")
                
        elif criterion == 'age_max':
            if profile.age is None:
                missing_info.append("Please provide your age.")
            elif profile.age <= expected_val:
                score += 1.0
                match_reasons.append(f"You are {expected_val} years old or younger.")
            else:
                failed_criteria.append(f"Must be {expected_val} years old or younger.")
                
        elif criterion == 'is_bpl':
            if profile.is_bpl is None:
                missing_info.append("Please confirm if you are Below Poverty Line (BPL).")
            elif profile.is_bpl == expected_val:
                score += 1.0
                match_reasons.append("You are BPL." if expected_val else "You are not BPL.")
            else:
                failed_criteria.append("Must be BPL." if expected_val else "Must not be BPL.")
                
        elif criterion == 'gender_required':
            if profile.gender is None:
                missing_info.append("Please provide your gender.")
            elif profile.gender == expected_val:
                score += 1.0
                match_reasons.append(f"You are {profile.gender}.")
            else:
                failed_criteria.append(f"Must be {expected_val}.")
                
        elif criterion == 'has_lpg':
            if profile.has_lpg is None:
                missing_info.append("Please confirm if you have an LPG connection.")
            elif profile.has_lpg == expected_val:
                score += 1.0
                match_reasons.append("You have an LPG connection." if expected_val else "You do not have an LPG connection.")
            else:
                failed_criteria.append("Must not have an LPG connection." if not expected_val else "Must have an LPG connection.")
                
        elif criterion == 'education_min_level':
            if profile.education_level is None:
                missing_info.append("Please provide your education level.")
            else:
                score += 1.0
                match_reasons.append(f"Your education level is {profile.education_level}.")
                
        elif criterion == 'caste_required':
            if profile.caste is None:
                missing_info.append("Please provide your caste.")
            elif profile.caste in expected_val:
                score += 1.0
                match_reasons.append(f"You belong to {profile.caste} category.")
            else:
                failed_criteria.append(f"Must belong to one of {', '.join(expected_val)} categories.")
                
        elif criterion == 'currently_studying':
            if profile.currently_studying is None:
                missing_info.append("Please confirm if you are currently studying.")
            elif profile.currently_studying == expected_val:
                score += 1.0
                match_reasons.append("You are currently studying." if expected_val else "You are not currently studying.")
            else:
                failed_criteria.append("Must be currently studying." if expected_val else "Must not be currently studying.")
                
        elif criterion == 'income_max':
            if profile.income_annual is None:
                missing_info.append("Please provide your annual income.")
            elif profile.income_annual <= expected_val:
                score += 1.0
                match_reasons.append(f"Your income is under ₹{expected_val}.")
            else:
                failed_criteria.append(f"Income must be under ₹{expected_val}.")
                
        elif criterion == 'has_daughter_under_10':
            if profile.has_daughter_under_10 is None and (profile.has_daughter is None or profile.daughter_age is None):
                missing_info.append("Please confirm if you have a daughter under 10 years of age.")
            elif profile.has_daughter_under_10 or (profile.has_daughter and profile.daughter_age is not None and profile.daughter_age <= 10):
                score += 1.0
                match_reasons.append("You have a daughter under 10 years of age.")
            else:
                failed_criteria.append("Must have a daughter under 10 years of age.")
                
        elif criterion == 'daughter_age_max':
            if profile.has_daughter is None or profile.daughter_age is None:
                missing_info.append("Please provide details about your daughter's age.")
            elif profile.has_daughter and profile.daughter_age <= expected_val:
                score += 1.0
                match_reasons.append(f"You have a daughter aged {profile.daughter_age}.")
            else:
                failed_criteria.append(f"Daughter must be under {expected_val} years.")
                
        elif criterion == 'is_pregnant':
            if profile.is_pregnant is None:
                missing_info.append("Please confirm if you are pregnant.")
            elif profile.is_pregnant == expected_val:
                score += 1.0
                match_reasons.append("You are pregnant." if expected_val else "You are not pregnant.")
            else:
                failed_criteria.append("Must be pregnant." if expected_val else "Must not be pregnant.")
                
        elif criterion == 'has_land':
            if profile.has_land is None:
                missing_info.append("Please confirm if you own land.")
            elif profile.has_land == expected_val:
                score += 1.0
                match_reasons.append("You own land." if expected_val else "You do not own land.")
            else:
                failed_criteria.append("Must own land." if expected_val else "Must not own land.")
                
        elif criterion == 'unemployed_or_dropout':
            if profile.unemployed_or_dropout is None:
                missing_info.append("Please confirm if you are unemployed or a school dropout.")
            elif profile.unemployed_or_dropout == expected_val:
                score += 1.0
                match_reasons.append("You are unemployed or a school dropout." if expected_val else "You are not unemployed/dropout.")
            else:
                failed_criteria.append("Must be unemployed or a school dropout.")
                
        elif criterion == 'willing_to_do_unskilled_work':
            if profile.willing_to_do_unskilled_work is None:
                missing_info.append("Please confirm if you are willing to do unskilled work.")
            elif profile.willing_to_do_unskilled_work == expected_val:
                score += 1.0
                match_reasons.append("You are willing to do unskilled work." if expected_val else "You are not willing to do unskilled work.")
            else:
                failed_criteria.append("Must be willing to do unskilled work.")
                
        elif criterion == 'has_daughter':
            if profile.has_daughter is None:
                missing_info.append("Please confirm if you have a daughter.")
            elif profile.has_daughter == expected_val:
                score += 1.0
                match_reasons.append("You have a daughter." if expected_val else "You do not have a daughter.")
            else:
                failed_criteria.append("Must have a daughter.")
    
    if failed_criteria:
        score = 0.0
    elif max_score > 0:
        score = score / max_score
    else:
        score = 1.0
        
    is_definite = len(failed_criteria) == 0 and len(missing_info) == 0 and score > 0
    is_probable = len(failed_criteria) == 0 and score > 0
    
    return SchemeMatch(
        scheme_id=scheme_id,
        scheme_name=scheme['name'],
        ministry=scheme['ministry'],
        category=scheme['category'],
        match_score=score,
        match_reasons=match_reasons,
        missing_info=missing_info,
        benefit_description=scheme['benefit_description'],
        benefit_amount=scheme.get('benefit_amount'),
        required_documents=scheme.get('required_documents', []),
        is_definite_match=is_definite,
        is_probable_match=is_probable
    )

def rank_schemes(profile: UserProfile, max_results: int = 10) -> MatchResponse:
    matches = []
    
    for scheme_id, scheme in SCHEMES.items():
        match = evaluate_scheme(scheme_id, scheme, profile)
        if match.is_probable_match:
            matches.append(match)
            
    matches.sort(key=lambda x: (x.is_definite_match, x.match_score), reverse=True)
    matches = matches[:max_results]
    
    profile_dict = profile.model_dump()
    filled_fields = sum(1 for v in profile_dict.values() if v is not None)
    total_fields = len(profile_dict)
    completeness = filled_fields / total_fields if total_fields > 0 else 0.0
    
    return MatchResponse(
        matches=matches,
        total_schemes_evaluated=len(SCHEMES),
        profile_completeness=completeness
    )
