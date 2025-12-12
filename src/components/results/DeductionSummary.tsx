"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, FileText, Info } from "lucide-react";

interface Deduction {
    section: string;
    max_limit: number | string | null;
    description: string;
    details?: any;
    required_documents?: string[];
}

interface DeductionSummaryProps {
    deductions: Deduction[];
    totalPotential: number;
    taxRegime: string;
}

export default function DeductionSummary({
    deductions,
    totalPotential,
    taxRegime,
}: DeductionSummaryProps) {
    const formatAmount = (amount: number | string | null) => {
        if (amount === null || amount === undefined) return "No limit";
        if (typeof amount === "string") return amount;
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    return (
        <div className="space-y-4">
            {/* Summary Header */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            Your Deduction Summary
                        </h3>
                        <p className="text-sm text-slate-600">
                            Found <strong>{deductions.length}</strong> applicable deductions
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-600">Total Potential</p>
                        <p className="text-2xl font-bold text-green-600">
                            ₹{totalPotential.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>

                {taxRegime === "new" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <p className="text-xs text-yellow-800">
                                <strong>Note:</strong> You're using the new tax regime. Most deductions are  not available.
                                Consider switching to the old regime if you have significant deductions to claim.
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Deduction Cards */}
            <div className="grid gap-4">
                {deductions.map((deduction, idx) => (
                    <Card key={idx} className="p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{deduction.section}</h4>
                                        <p className="text-xs text-slate-500">{deduction.description}</p>
                                    </div>
                                </div>
                            </div>
                            <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                                {formatAmount(deduction.max_limit)}
                            </Badge>
                        </div>

                        <Separator className="my-3" />

                        {/* Details */}
                        {deduction.details && (
                            <div className="space-y-2 mb-3">
                                {deduction.details.eligibleInvestments && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-700 mb-1">Eligible Options:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {deduction.details.eligibleInvestments.slice(0, 6).map((item: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {item}
                                                </Badge>
                                            ))}
                                            {deduction.details.eligibleInvestments.length > 6 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{deduction.details.eligibleInvestments.length - 6} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {deduction.details.note && (
                                    <p className="text-xs text-slate-600 italic">{deduction.details.note}</p>
                                )}
                            </div>
                        )}

                        {/* Required Documents */}
                        {deduction.required_documents && deduction.required_documents.length > 0 && (
                            <div className="bg-slate-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-3.5 w-3.5 text-slate-600" />
                                    <p className="text-xs font-medium text-slate-700">Required Documents:</p>
                                </div>
                                <ul className="space-y-1">
                                    {deduction.required_documents.map((doc, i) => (
                                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
