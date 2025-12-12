from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from services.tax_engine import tax_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/deductions", tags=["deductions"])

class DeductionRequest(BaseModel):
    income_sources: List[str]
    age: Optional[int] = None
    has_home_loan: bool = False
    has_education_loan: bool = False
    has_health_insurance: bool = False
    is_salaried: bool = False
    tax_regime: str = "new"

@router.post("/suggest")
async def suggest_deductions(request: DeductionRequest):
    """Get applicable deduction suggestions based on user profile"""
    try:
        deductions = tax_engine.get_applicable_deductions(
            income_sources=request.income_sources,
            age=request.age,
            has_home_loan=request.has_home_loan,
            has_education_loan=request.has_education_loan,
            has_health_insurance=request.has_health_insurance,
            is_salaried=request.is_salaried,
            tax_regime=request.tax_regime
        )
        
        # Calculate potential savings
        total_potential = 0
        for deduction in deductions:
            if deduction.get("max_limit") and isinstance(deduction["max_limit"], (int, float)):
                total_potential += deduction["max_limit"]
        
        return {
            "deductions": deductions,
            "total_potential_deduction": total_potential,
            "tax_regime": request.tax_regime,
            "count": len(deductions),
            "note": "New tax regime allows limited deductions. Consider switching to old regime if you have significant deductions." if request.tax_regime == "new" else "Old regime allows all these deductions."
        }
    
    except Exception as e:
        logger.error(f"Error suggesting deductions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sections")
async def get_all_deduction_sections():
    """Get information about all deduction sections"""
    return {
        "sections": tax_engine.tax_rules["deductionSections"],
        "note": "Availability depends on tax regime selection"
    }

class TaxCalculationRequest(BaseModel):
    total_income: float
    deductions: Dict[str, float]
    tax_regime: str = "new"
    age: Optional[int] = None

@router.post("/calculate-tax")
async def calculate_tax(request: TaxCalculationRequest):
    """Calculate tax based on income and deductions"""
    try:
        result = tax_engine.calculate_tax(
            total_income=request.total_income,
            deductions=request.deductions,
            tax_regime=request.tax_regime,
            age=request.age
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Error calculating tax: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
