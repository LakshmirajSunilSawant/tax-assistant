"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, AlertCircle, Download, ExternalLink } from "lucide-react";

interface ITRFormResultProps {
    itrForm: string;
    reasoning: string;
    formDetails: any;
    confidence: string;
    requiredDocuments: string[];
}

export default function ITRFormResult({
    itrForm,
    reasoning,
    formDetails,
    confidence,
    requiredDocuments,
}: ITRFormResultProps) {
    const confidenceColor = confidence === "high" ? "text-green-600" : "text-yellow-600";
    const confidenceBg = confidence === "high" ? "bg-green-50" : "bg-yellow-50";

    return (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-600">Recommended ITR Form</h3>
                                <p className="text-3xl font-bold text-slate-900">{itrForm}</p>
                            </div>
                        </div>
                        <Badge className={`${confidenceBg} ${confidenceColor} border-0`}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {confidence === "high" ? "High Confidence" : "Medium Confidence"}
                        </Badge>
                    </div>
                </div>

                {/* Reasoning */}
                <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        Why this form?
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{reasoning}</p>
                </div>

                {/* Form Details */}
                <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold text-slate-900 mb-3">Form Details</h4>
                    <div className="space-y-2">
                        <p className="text-sm text-slate-700">
                            <strong>Full Name:</strong> {formDetails.name}
                        </p>
                        <p className="text-sm text-slate-700">
                            <strong>Description:</strong> {formDetails.description}
                        </p>
                        {formDetails.eligibility?.restrictions && (
                            <div className="mt-3">
                                <p className="text-sm font-medium text-slate-900 mb-2">Key Requirements:</p>
                                <ul className="space-y-1">
                                    {formDetails.eligibility.restrictions.slice(0, 5).map((restriction: string, idx: number) => (
                                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                            <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>{restriction}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Required Documents */}
                <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Required Documents ({requiredDocuments.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {requiredDocuments.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                                <span>{doc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download Checklist
                    </Button>
                    <Button variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View ITR {itrForm} Guide
                    </Button>
                </div>
            </div>
        </Card>
    );
}
