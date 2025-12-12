from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.tax_engine import tax_engine, ITRForm
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/itr", tags=["itr"])

class ITRDeterminationRequest(BaseModel):
    income_sources: List[str]
    total_income: Optional[float] = None
    is_director: bool = False
    has_foreign_assets: bool = False
    house_properties_count: int = 0
    has_capital_gains: bool = False
    is_business: bool = False
    is_profession: bool = False
    business_turnover: Optional[float] = None
    professional_income: Optional[float] = None
    use_presumptive: bool = False

class ITRDeterminationResponse(BaseModel):
    itr_form: str
    reasoning: str
    form_details: dict
    confidence: str
    required_documents: List[str]

@router.post("/determine", response_model=ITRDeterminationResponse)
async def determine_itr_form(request: ITRDeterminationRequest):
    """Determine the appropriate ITR form based on user profile"""
    try:
        # Determine ITR form
        result = tax_engine.determine_itr_form(
            income_sources=request.income_sources,
            total_income=request.total_income,
            is_director=request.is_director,
            has_foreign_assets=request.has_foreign_assets,
            house_properties_count=request.house_properties_count,
            has_capital_gains=request.has_capital_gains,
            is_business=request.is_business,
            is_profession=request.is_profession,
            business_turnover=request.business_turnover,
            professional_income=request.professional_income,
            use_presumptive=request.use_presumptive
        )
        
        # Get required documents
        documents = tax_engine.get_required_documents(request.income_sources)
        
        return ITRDeterminationResponse(
            itr_form=result["itr_form"],
            reasoning=result["reasoning"],
            form_details=result["form_details"],
            confidence=result["confidence"],
            required_documents=documents
        )
    
    except Exception as e:
        logger.error(f"Error determining ITR form: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forms")
async def get_all_itr_forms():
    """Get information about all ITR forms"""
    return {
        "forms": tax_engine.tax_rules["itrForms"]
    }

class ITRValidationRequest(BaseModel):
    selected_itr: str
    income_sources: List[str]
    total_income: Optional[float] = None
    is_director: bool = False
    has_foreign_assets: bool = False
    has_capital_gains: bool = False

@router.post("/validate")
async def validate_itr_selection(request: ITRValidationRequest):
    """Validate if the selected ITR form is appropriate"""
    try:
        # Determine correct ITR
        correct_result = tax_engine.determine_itr_form(
            income_sources=request.income_sources,
            total_income=request.total_income,
            is_director=request.is_director,
            has_foreign_assets=request.has_foreign_assets,
            has_capital_gains=request.has_capital_gains
        )
        
        is_correct = request.selected_itr == correct_result["itr_form"]
        
        return {
            "is_valid": is_correct,
            "selected_itr": request.selected_itr,
            "recommended_itr": correct_result["itr_form"],
            "message": "Your ITR selection is correct!" if is_correct else f"We recommend {correct_result['itr_form']} instead. {correct_result['reasoning']}"
        }
    
    except Exception as e:
        logger.error(f"Error validating ITR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
