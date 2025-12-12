from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from services.validation_engine import validation_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/validation", tags=["validation"])

class ValidationRequest(BaseModel):
    user_data: Dict[str, Any]
    form_26as_data: Optional[Dict[str, Any]] = None
    ais_data: Optional[Dict[str, Any]] = None

@router.post("/check")
async def validate_tax_data(request: ValidationRequest):
    """Validate user's tax data and detect errors"""
    try:
        errors = validation_engine.validate_tax_data(
            user_data=request.user_data,
            form_26as_data=request.form_26as_data,
            ais_data=request.ais_data
        )
        
        # Categorize errors by severity
        critical_errors = [e for e in errors if e.get("severity") == "critical"]
        warnings = [e for e in errors if e.get("severity") == "warning"]
        suggestions = [e for e in errors if e.get("severity") == "suggestion"]
        
        return {
            "all_errors": errors,
            "critical_errors": critical_errors,
            "warnings": warnings,
            "suggestions": suggestions,
            "total_count": len(errors),
            "critical_count": len(critical_errors),
            "has_critical_errors": len(critical_errors) > 0,
            "validation_status": "failed" if len(critical_errors) > 0 else "passed_with_warnings" if len(warnings) > 0 else "passed"
        }
    
    except Exception as e:
        logger.error(f"Error in validation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class Form26ASValidationRequest(BaseModel):
    declared_salary: float
    declared_tds: float
    form_26as_salary: float
    form_26as_tds: float

@router.post("/form26as")
async def validate_against_26as(request: Form26ASValidationRequest):
    """Validate declared values against Form 26AS"""
    try:
        errors = []
        
        # Check salary mismatch
        if abs(request.declared_salary - request.form_26as_salary) > 1000:
            errors.append({
                "type": "salary_mismatch",
                "severity": "critical",
                "message": f"Salary mismatch: Declared ₹{request.declared_salary:,.0f} vs 26AS shows ₹{request.form_26as_salary:,.0f}",
                "difference": abs(request.declared_salary - request.form_26as_salary)
            })
        
        # Check TDS mismatch
        if request.declared_tds > request.form_26as_tds:
            errors.append({
                "type": "tds_excess",
                "severity": "critical",
                "message": f"TDS claimed (₹{request.declared_tds:,.0f}) exceeds 26AS (₹{request.form_26as_tds:,.0f})",
                "excess": request.declared_tds - request.form_26as_tds
            })
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "message": "Form 26AS validation passed!" if len(errors) == 0 else "Please fix the highlighted issues"
        }
    
    except Exception as e:
        logger.error(f"Error in 26AS validation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/common-errors")
async def get_common_errors():
    """Get list of common tax filing errors"""
    return {
        "common_errors": validation_engine.common_errors
    }
