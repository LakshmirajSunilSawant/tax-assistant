import json
import os
from typing import Dict, List, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ErrorSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    SUGGESTION = "suggestion"

class ValidationEngine:
    """Validation and error detection engine for tax data"""
    
    def __init__(self):
        # Load tax rules for error patterns
        rules_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "knowledge",
            "tax_rules.json"
        )
        with open(rules_path, 'r', encoding='utf-8') as f:
            self.tax_rules = json.load(f)
        
        self.common_errors = self.tax_rules.get("commonErrors", [])
        logger.info("Validation engine initialized")
    
    def validate_tax_data(
        self,
        user_data: Dict[str, any],
        form_26as_data: Optional[Dict[str, any]] = None,
        ais_data: Optional[Dict[str, any]] = None
    ) -> List[Dict[str, any]]:
        """
        Validate user's tax data and detect errors
        
        Returns:
            List of validation errors/warnings
        """
        errors = []
        
        # Check bank interest declaration
        bank_interest_error = self._check_bank_interest(user_data, ais_data)
        if bank_interest_error:
            errors.append(bank_interest_error)
        
        # Check salary mismatch with 26AS
        salary_error = self._check_salary_mismatch(user_data, form_26as_data)
        if salary_error:
            errors.append(salary_error)
        
        # Check TDS mismatch
        tds_error = self._check_tds_mismatch(user_data, form_26as_data)
        if tds_error:
            errors.append(tds_error)
        
        # Check capital gains
        capital_gains_error = self._check_capital_gains(user_data, ais_data)
        if capital_gains_error:
            errors.append(capital_gains_error)
        
        # Check ITR form selection
        itr_error = self._check_itr_form(user_data)
        if itr_error:
            errors.append(itr_error)
        
        # Check Section 87A rebate
        rebate_check = self._check_87a_rebate(user_data)
        if rebate_check:
            errors.append(rebate_check)
        
        # Check deduction limits
        deduction_errors = self._check_deduction_limits(user_data)
        errors.extend(deduction_errors)
        
        # Check house property income
        house_property_error = self._check_house_property(user_data)
        if house_property_error:
            errors.append(house_property_error)
        
        return errors
    
    def _check_bank_interest(
        self,
        user_data: Dict[str, any],
        ais_data: Optional[Dict[str, any]]
    ) -> Optional[Dict[str, any]]:
        """Check if bank interest is properly declared"""
        if not ais_data:
            return None
        
        ais_interest = ais_data.get("bank_interest", 0)
        declared_interest = user_data.get("other_income", {}).get("bank_interest", 0)
        
        if ais_interest > 0 and declared_interest == 0:
            return {
                "error_code": "bank_interest_not_declared",
                "severity": ErrorSeverity.CRITICAL,
                "title": "Bank Interest Not Declared",
                "description": f"Your AIS shows bank interest of ₹{ais_interest:,.0f} but you haven't declared any bank interest income.",
                "suggestion": "Add bank interest income under 'Income from Other Sources'.",
                "amount_missing": ais_interest
            }
        elif ais_interest > declared_interest:
            return {
                "error_code": "bank_interest_mismatch",
                "severity": ErrorSeverity.WARNING,
                "title": "Bank Interest Mismatch",
                "description": f"AIS shows ₹{ais_interest:,.0f} but you declared only ₹{declared_interest:,.0f}.",
                "suggestion": "Verify your bank interest certificates and update the declared amount.",
                "amount_missing": ais_interest - declared_interest
            }
        
        return None
    
    def _check_salary_mismatch(
        self,
        user_data: Dict[str, any],
        form_26as_data: Optional[Dict[str, any]]
    ) -> Optional[Dict[str, any]]:
        """Check salary against Form 26AS"""
        if not form_26as_data:
            return None
        
        declared_salary = user_data.get("salary", {}).get("gross_salary", 0)
        form_26as_salary = form_26as_data.get("salary", 0)
        
        if abs(declared_salary - form_26as_salary) > 1000:
            return {
                "error_code": "salary_mismatch_26as",
                "severity": ErrorSeverity.CRITICAL,
                "title": "Salary Mismatch with Form 26AS",
                "description": f"Your declared salary (₹{declared_salary:,.0f}) doesn't match Form 26AS (₹{form_26as_salary:,.0f}).",
                "suggestion": "Cross-check with Form 16 and Form 26AS. Use the amount from Form 16.",
                "difference": abs(declared_salary - form_26as_salary)
            }
        
        return None
    
    def _check_tds_mismatch(
        self,
        user_data: Dict[str, any],
        form_26as_data: Optional[Dict[str, any]]
    ) -> Optional[Dict[str, any]]:
        """Check TDS claimed against Form 26AS"""
        if not form_26as_data:
            return None
        
        claimed_tds = user_data.get("tds_claimed", 0)
        form_26as_tds = form_26as_data.get("total_tds", 0)
        
        if claimed_tds > form_26as_tds:
            return {
                "error_code": "tds_mismatch",
                "severity": ErrorSeverity.CRITICAL,
                "title": "TDS Claimed Exceeds Form 26AS",
                "description": f"You claimed TDS of ₹{claimed_tds:,.0f} but Form 26AS shows only ₹{form_26as_tds:,.0f}.",
                "suggestion": "You can only claim TDS that appears in Form 26AS. Update your TDS claim.",
                "excess_claim": claimed_tds - form_26as_tds
            }
        
        return None
    
    def _check_capital_gains(
        self,
        user_data: Dict[str, any],
        ais_data: Optional[Dict[str, any]]
    ) -> Optional[Dict[str, any]]:
        """Check if capital gains are declared"""
        if not ais_data:
            return None
        
        ais_has_capital_gains = ais_data.get("has_capital_gains", False)
        declared_capital_gains = user_data.get("capital_gains", {}).get("total", 0)
        
        if ais_has_capital_gains and declared_capital_gains == 0:
            return {
                "error_code": "missing_capital_gains",
                "severity": ErrorSeverity.CRITICAL,
                "title": "Capital Gains Not Declared",
                "description": "Your AIS shows capital gains transactions (stock/mutual fund sales) but you haven't declared any capital gains.",
                "suggestion": "Check your broker statements and declare capital gains (STCG/LTCG).",
            }
        
        return None
    
    def _check_itr_form(self, user_data: Dict[str, any]) -> Optional[Dict[str, any]]:
        """Check if the correct ITR form is selected"""
        selected_itr = user_data.get("itr_form")
        income_sources = user_data.get("income_sources", [])
        
        # Check for common mistakes
        if selected_itr == "ITR-1":
            if user_data.get("is_director", False):
                return {
                    "error_code": "wrong_itr_selected",
                    "severity": ErrorSeverity.CRITICAL,
                    "title": "Wrong ITR Form",
                    "description": "You selected ITR-1 but you're a director of a company. You must file ITR-2.",
                    "suggestion": "Change to ITR-2.",
                }
            if user_data.get("has_capital_gains", False):
                return {
                    "error_code": "wrong_itr_selected",
                    "severity": ErrorSeverity.CRITICAL,
                    "title": "Wrong ITR Form",
                    "description": "You selected ITR-1 but have capital gains. You must file ITR-2.",
                    "suggestion": "Change to ITR-2.",
                }
        
        return None
    
    def _check_87a_rebate(self, user_data: Dict[str, any]) -> Optional[Dict[str, any]]:
        """Check if Section 87A rebate should be claimed"""
        taxable_income = user_data.get("taxable_income", 0)
        tax_regime = user_data.get("tax_regime", "new")
        claimed_rebate = user_data.get("claimed_87a_rebate", False)
        
        rebate_limit = 700000 if tax_regime == "new" else 500000
        
        if taxable_income <= rebate_limit and not claimed_rebate:
            rebate_amount = 25000 if tax_regime == "new" else 12500
            return {
                "error_code": "rebate_87a_not_applied",
                "severity": ErrorSeverity.WARNING,
                "title": "Section 87A Rebate Not Claimed",
                "description": f"Your taxable income is ₹{taxable_income:,.0f}, which is below ₹{rebate_limit:,.0f}. You're eligible for a tax rebate of up to ₹{rebate_amount:,.0f}.",
                "suggestion": "Claim Section 87A rebate to reduce your tax liability.",
                "potential_savings": rebate_amount
            }
        
        return None
    
    def _check_deduction_limits(self, user_data: Dict[str, any]) -> List[Dict[str, any]]:
        """Check if deductions exceed allowed limits"""
        errors = []
        deductions = user_data.get("deductions", {})
        
        # Check 80C limit
        if deductions.get("80C", 0) > 150000:
            errors.append({
                "error_code": "excess_deduction_claimed",
                "severity": ErrorSeverity.CRITICAL,
                "title": "80C Deduction Exceeds Limit",
                "description": f"You claimed ₹{deductions['80C']:,.0f} under Section 80C, but the maximum limit is ₹1,50,000.",
                "suggestion": "Reduce 80C deduction to ₹1,50,000.",
                "excess_amount": deductions["80C"] - 150000
            })
        
        # Check 80D limit
        max_80d = user_data.get("max_80d_limit", 100000)
        if deductions.get("80D", 0) > max_80d:
            errors.append({
                "error_code": "excess_deduction_claimed",
                "severity": ErrorSeverity.CRITICAL,
                "title": "80D Deduction Exceeds Limit",
                "description": f"You claimed ₹{deductions['80D']:,.0f} under Section 80D, but your allowed limit is ₹{max_80d:,.0f}.",
                "suggestion": f"Reduce 80D deduction to ₹{max_80d:,.0f}.",
                "excess_amount": deductions["80D"] - max_80d
            })
        
        return errors
    
    def _check_house_property(self, user_data: Dict[str, any]) -> Optional[Dict[str, any]]:
        """Check house property income calculation"""
        house_property = user_data.get("house_property", {})
        annual_value = house_property.get("annual_value", 0)
        deductions_claimed = house_property.get("deductions", 0)
        
        # Standard deduction should be 30% of annual value
        expected_standard_deduction = annual_value * 0.3
        
        if annual_value > 0 and abs(deductions_claimed - expected_standard_deduction) > 1000:
            return {
                "error_code": "house_property_income_wrong",
                "severity": ErrorSeverity.WARNING,
                "title": "House Property Calculation May Be Incorrect",
                "description": f"For annual value of ₹{annual_value:,.0f}, standard deduction (30%) should be ₹{expected_standard_deduction:,.0f}.",
                "suggestion": "Verify your house property income calculation. Don't forget 30% standard deduction.",
            }
        
        return None

# Singleton instance
validation_engine = ValidationEngine()
