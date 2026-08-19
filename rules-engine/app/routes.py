from fastapi import APIRouter
from app.models import MatchRequest, MatchResponse
from app.evaluator import rank_schemes
from app.schemes import SCHEMES

router = APIRouter(prefix='/api')

@router.post('/match', response_model=MatchResponse)
async def match_schemes(request: MatchRequest):
    return rank_schemes(request.profile, request.max_results)

@router.get('/schemes')
async def list_schemes():
    return {'schemes': list(SCHEMES.keys()), 'total': len(SCHEMES)}

@router.get('/schemes/{scheme_id}')
async def get_scheme(scheme_id: str):
    if scheme_id in SCHEMES:
        return SCHEMES[scheme_id]
    return {"error": "Scheme not found"}
