import json
import os
from typing import Dict, List, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ITRForm(str, Enum):
    ITR1 = "ITR-1"
    ITR2 = "ITR-2"
    ITR3 = "ITR-3"
    ITR4 = "ITR-4"

class TaxEngine:
    """Tax calculation and ITR form determination engine"""
    
    def __init__(self):
        # Load tax rules from JSON
        rules_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "knowledge",
            "tax_rules.json"
        )
        with open(rules_path, 'r', encoding='utf-8') as f:
            self.tax_rules = json.load(f)
        
        logger.info("Tax engine initialized with rules database")
    
    def determine_itr_form(
        self,
        income_sources: List[str],
        total_income: Optional[float] = None,
        is_director: bool = False,
        has_foreign_assets: bool = False,
        house_properties_count: int = 0,
        has_capital_gains: bool = False,
        is_business: bool = False,
        is_profession: bool = False,
        business_turnover: Optional[float] = None,
        professional_income: Optional[float] = None,
        use_presumptive: bool = False
    ) -> Dict[str, any]:
        """
        Determine the appropriate ITR form based on user profile
        
        Returns:
            Dict with itr_form, reasoning, and eligibility details
        """
        
        # ITR-4 Check (Presumptive taxation)
        if use_presumptive and (is_business or is_profession):
            if total_income and total_income <= 5000000:
                if is_business and business_turnover and business_turnover <= 20000000:
                    return {
                        "itr_form": ITRForm.ITR4,
                        "reasoning": "You're eligible for ITR-4 (SUGAM) as you opted for presumptive taxation under Section 44AD with business turnover up to ₹2 crore and total income up to ₹50 lakh.",
                        "form_details": self.tax_rules["itrForms"]["ITR-4"],
                        "confidence": "high"
                    }
                elif is_profession and professional_income and professional_income <= 5000000:
                    return {
                        "itr_form": ITRForm.ITR4,
                        "reasoning": "You're eligible for ITR-4 (SUGAM) as you opted for presumptive taxation under Section 44ADA with professional income up to ₹50 lakh.",
                        "form_details": self.tax_rules["itrForms"]["ITR-4"],
                        "confidence": "high"
                    }
        
        # ITR-3 Check (Business/Professional income)
        if is_business or is_profession:
            return {
                "itr_form": ITRForm.ITR3,
                "reasoning": "You need ITR-3 because you have business or professional income. This form requires maintaining regular books of accounts.",
                "form_details": self.tax_rules["itrForms"]["ITR-3"],
                "confidence": "high"
            }
        
        # ITR-2 Check (Multiple house properties, capital gains, director, foreign assets)
        needs_itr2 = (
            house_properties_count > 1 or
            has_capital_gains or
            is_director or
            has_foreign_assets
        )
        
        if needs_itr2:
            reasons = []
            if house_properties_count > 1:
                reasons.append("multiple house properties")
            if has_capital_gains:
                reasons.append("capital gains")
            if is_director:
                reasons.append("you're a director of a company")
            if has_foreign_assets:
                reasons.append("foreign assets/income")
            
            reason_text = ", ".join(reasons)
            return {
                "itr_form": ITRForm.ITR2,
                "reasoning": f"You need ITR-2 because you have {reason_text}. ITR-1 is not applicable in your case.",
                "form_details": self.tax_rules["itrForms"]["ITR-2"],
                "confidence": "high"
            }
        
        # ITR-1 Check (Simple salary/pension case)
        can_use_itr1 = (
            not is_business and
            not is_profession and
            not has_capital_gains and
            not is_director and
            not has_foreign_assets and
            house_properties_count <= 1 and
            (total_income is None or total_income <= 5000000)
        )
        
        if can_use_itr1:
            return {
                "itr_form": ITRForm.ITR1,
                "reasoning": "You can file ITR-1 (SAHAJ) - the simplest form for salaried individuals with income up to ₹50 lakh and one house property.",
                "form_details": self.tax_rules["itrForms"]["ITR-1"],
                "confidence": "high"
            }
        
        # Default to ITR-2
        return {
            "itr_form": ITRForm.ITR2,
            "reasoning": "Based on your profile, ITR-2 is recommended. This form covers most individual taxpayers with diverse income sources.",
            "form_details": self.tax_rules["itrForms"]["ITR-2"],
            "confidence": "medium"
        }
    
    def get_applicable_deductions(
        self,
        income_sources: List[str],
        age: Optional[int] = None,
        has_home_loan: bool = False,
        has_education_loan: bool = False,
        has_health_insurance: bool = False,
        is_salaried: bool = False,
        tax_regime: str = "new"  # "old" or "new"
    ) -> List[Dict[str, any]]:
        """
        Get list of applicable deductions for the user
        
        Returns:
            List of deduction objects with details
        """
        applicable_deductions = []
        
        # New regime allows very limited deductions
        if tax_regime == "new":
            applicable_deductions.append({
                "section": "Standard Deduction",
                "amount": 50000,
                "description": "Standard deduction for salaried individuals",
                "applicable": is_salaried
            })
            return applicable_deductions
        
        # Old regime deductions
        is_senior_citizen = age and age >= 60
        
        # 80C
        applicable_deductions.append({
            "section": "80C",
            "max_limit": 150000,
            "description": "Investments in PPF, ELSS, Insurance, EPF, etc.",
            "details": self.tax_rules["deductionSections"]["80C"],
            "required_documents": ["Investment proofs", "Premium receipts", "EPF statement"]
        })
        
        # 80CCD(1B)
        applicable_deductions.append({
            "section": "80CCD(1B)",
            "max_limit": 50000,
            "description": "Additional NPS contribution (over and above 80C)",
            "details": self.tax_rules["deductionSections"]["80CCD(1B)"],
            "required_documents": ["NPS contribution statement"]
        })
        
        # 80D (Health Insurance)
        if has_health_insurance or age:
            max_self = 50000 if is_senior_citizen else 25000
            applicable_deductions.append({
                "section": "80D",
                "max_limit": max_self + 50000,  # +50k for parents if senior
                "description": "Health insurance premium",
                "details": self.tax_rules["deductionSections"]["80D"],
                "required_documents": ["Insurance premium receipts", "Preventive health check-up bills"]
            })
        
        # 80TTA / 80TTB
        if is_senior_citizen:
            applicable_deductions.append({
                "section": "80TTB",
                "max_limit": 50000,
                "description": "Interest from bank deposits (Senior citizens)",
                "details": self.tax_rules["deductionSections"]["80TTB"],
                "required_documents": ["Bank interest certificates"]
            })
        else:
            applicable_deductions.append({
                "section": "80TTA",
                "max_limit": 10000,
                "description": "Interest from savings account",
                "details": self.tax_rules["deductionSections"]["80TTA"],
                "required_documents": ["Savings account interest certificate"]
            })
        
        # 80E (Education loan)
        if has_education_loan:
            applicable_deductions.append({
                "section": "80E",
                "max_limit": None,
                "description": "Interest on education loan (no limit)",
                "details": self.tax_rules["deductionSections"]["80E"],
                "required_documents": ["Education loan interest certificate"]
            })
        
        # Section 24 (Home loan)
        if has_home_loan:
            applicable_deductions.append({
                "section": "24",
                "max_limit": 200000,
                "description": "Home loan interest (self-occupied)",
                "details": self.tax_rules["deductionSections"]["24"],
                "required_documents": ["Home loan interest certificate", "Property documents"]
            })
        
        # HRA (only for salaried)
        if is_salaried:
            applicable_deductions.append({
                "section": "HRA",
                "max_limit": "Calculated based on rent paid",
                "description": "House Rent Allowance exemption",
                "details": self.tax_rules["deductionSections"]["HRA"],
                "required_documents": ["Rent receipts", "Rent agreement", "Landlord PAN (if rent > 1L/year)"]
            })
        
        # 80G (Donations)
        applicable_deductions.append({
            "section": "80G",
            "max_limit": "Varies by donation type",
            "description": "Donations to specified funds/charities",
            "details": self.tax_rules["deductionSections"]["80G"],
            "required_documents": ["Donation receipts with 80G certificate"]
        })
        
        return applicable_deductions
    
    def calculate_tax(
        self,
        total_income: float,
        deductions: Dict[str, float],
        tax_regime: str = "new",
        age: Optional[int] = None
    ) -> Dict[str, any]:
        """
        Calculate income tax based on regime and income
        
        Returns:
            Dict with tax calculations
        """
        regime_data = self.tax_rules["taxSlabs2024"]["newRegime" if tax_regime == "new" else "oldRegime"]
        slabs = regime_data["slabs"]
        
        # Calculate taxable income
        if tax_regime == "old" and regime_data["deductionsAllowed"]:
            total_deductions = sum(deductions.values())
            taxable_income = max(0, total_income - total_deductions)
        else:
            # New regime: only standard deduction
            standard_deduction = regime_data.get("standardDeduction", 0)
            taxable_income = max(0, total_income - standard_deduction)
        
        # Calculate tax based on slabs
        tax = 0
        for slab in slabs:
            slab_min = slab["min"]
            slab_max = slab["max"] if slab["max"] else float('inf')
            rate = slab["rate"] / 100
            
            if taxable_income > slab_min:
                taxable_in_slab = min(taxable_income, slab_max) - slab_min
                tax += taxable_in_slab * rate
        
        # Section 87A rebate
        rebate_info = regime_data["section87ARebate"]
        rebate = 0
        if taxable_income <= rebate_info["maxIncome"]:
            rebate = min(tax, rebate_info["rebate"])
        
        final_tax = max(0, tax - rebate)
        
        return {
            "total_income": total_income,
            "total_deductions": sum(deductions.values()) if tax_regime == "old" else regime_data.get("standardDeduction", 0),
            "taxable_income": taxable_income,
            "tax_before_rebate": tax,
            "rebate_87a": rebate,
            "final_tax": final_tax,
            "effective_tax_rate": (final_tax / total_income * 100) if total_income > 0 else 0,
            "regime": tax_regime
        }
    
    def get_required_documents(self, income_sources: List[str]) -> List[str]:
        """Get list of required documents based on income sources"""
        all_documents = set()
        
        # Always required
        all_documents.update(["PAN card", "Aadhaar card", "Form 26AS / AIS / TIS", "Bank statements"])
        
        # Add specific documents based on income sources
        for source in income_sources:
            source_lower = source.lower()
            if "salary" in source_lower or "salaried" in source_lower:
                all_documents.update(self.tax_rules["documentRequirements"].get("salaried", []))
            elif "business" in source_lower:
                all_documents.update(self.tax_rules["documentRequirements"].get("business", []))
            elif "freelance" in source_lower or "professional" in source_lower:
                all_documents.update(self.tax_rules["documentRequirements"].get("freelancer", []))
            elif "rental" in source_lower or "rent" in source_lower:
                all_documents.update(self.tax_rules["documentRequirements"].get("rental_income", []))
            elif "capital" in source_lower or "investment" in source_lower:
                all_documents.update(self.tax_rules["documentRequirements"].get("capital_gains", []))
        
        return sorted(list(all_documents))

# Singleton instance
tax_engine = TaxEngine()
