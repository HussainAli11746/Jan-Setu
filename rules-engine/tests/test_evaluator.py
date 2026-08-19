from app.models import UserProfile
from app.evaluator import rank_schemes

def test_farmer_matches_pmkisan():
    profile = UserProfile(occupation='farmer', income_annual=80000, income_tax_payer=False, is_government_employee=False)
    result = rank_schemes(profile)
    scheme_ids = [m.scheme_id for m in result.matches]
    assert 'pmkisan' in scheme_ids
    pmkisan = next(m for m in result.matches if m.scheme_id == 'pmkisan')
    assert pmkisan.is_probable_match == True

def test_govt_employee_excluded_pmkisan():
    profile = UserProfile(occupation='salaried', is_government_employee=True)
    result = rank_schemes(profile)
    scheme_ids = [m.scheme_id for m in result.matches]
    assert 'pmkisan' not in scheme_ids

def test_woman_matches_ujjwala():
    profile = UserProfile(gender='female', age=25, is_bpl=True, has_lpg=False)
    result = rank_schemes(profile)
    scheme_ids = [m.scheme_id for m in result.matches]
    assert 'ujjwala' in scheme_ids

def test_woman_with_lpg_excluded_ujjwala():
    profile = UserProfile(gender='female', age=25, has_lpg=True)
    result = rank_schemes(profile)
    scheme_ids = [m.scheme_id for m in result.matches]
    assert 'ujjwala' not in scheme_ids

def test_sc_student_matches_scholarship():
    profile = UserProfile(caste='SC', currently_studying=True, income_annual=200000)
    result = rank_schemes(profile)
    scheme_ids = [m.scheme_id for m in result.matches]
    assert 'nsp_postmatric_sc' in scheme_ids

def test_rural_laborer_matches_mgnregs():
    profile = UserProfile(residence_type='rural', age=30, willing_to_do_unskilled_work=True)
    result = rank_schemes(profile)
    scheme_ids = [m.scheme_id for m in result.matches]
    assert 'mgnregs' in scheme_ids

def test_profile_completeness():
    empty_profile = UserProfile()
    result = rank_schemes(empty_profile)
    assert result.profile_completeness < 0.2
    
    full_profile = UserProfile(age=35, gender='male', occupation='farmer', income_annual=80000, residence_type='rural', caste='OBC', state='UP')
    result2 = rank_schemes(full_profile)
    assert result2.profile_completeness > 0.2

def test_pregnant_woman_matches_pmmvy():
    profile = UserProfile(gender='female', age=22, is_pregnant=True)
    result = rank_schemes(profile)
    scheme_ids = [m.scheme_id for m in result.matches]
    assert 'pmmvy' in scheme_ids
