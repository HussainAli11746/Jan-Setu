from pydantic import BaseModel
from typing import Optional, List

class UserProfile(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    income_annual: Optional[int] = None
    caste: Optional[str] = None
    religion: Optional[str] = None
    family_size: Optional[int] = None
    has_bank_account: Optional[bool] = None
    is_bpl: Optional[bool] = None
    residence_type: Optional[str] = None
    has_land: Optional[bool] = None
    land_area_acres: Optional[float] = None
    has_lpg: Optional[bool] = None
    has_pucca_house: Optional[bool] = None
    education_level: Optional[str] = None
    is_pregnant: Optional[bool] = None
    has_daughter: Optional[bool] = None
    daughter_age: Optional[int] = None
    disabilities: Optional[bool] = None
    currently_studying: Optional[bool] = None
    income_tax_payer: Optional[bool] = None
    is_government_employee: Optional[bool] = None
    has_crop_loan: Optional[bool] = None
    unemployed_or_dropout: Optional[bool] = None
    willing_to_do_unskilled_work: Optional[bool] = None
    has_daughter_under_10: Optional[bool] = None

class SchemeMatch(BaseModel):
    scheme_id: str
    scheme_name: str
    ministry: str
    category: str
    match_score: float
    match_reasons: List[str]
    missing_info: List[str]
    benefit_description: str
    benefit_amount: Optional[str] = None
    required_documents: List[str]
    is_definite_match: bool
    is_probable_match: bool

class MatchRequest(BaseModel):
    profile: UserProfile
    max_results: int = 10

class MatchResponse(BaseModel):
    matches: List[SchemeMatch]
    total_schemes_evaluated: int
    profile_completeness: float
