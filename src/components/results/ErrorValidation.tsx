"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";

interface ValidationError {
    error_code?: string;
    severity: "critical" | "warning" | "suggestion";
    title: string;
    description: string;
    suggestion?: string;
    amount_missing?: number;
    difference?: number;
    potential_savings?: number;
}

interface ErrorValidationProps {
    errors: ValidationError[];
    validationStatus: "failed" | "passed_with_warnings" | "passed";
}

export default function ErrorValidation({ errors, validationStatus }: ErrorValidationProps) {
    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case "critical":
                return {
                    icon: AlertTriangle,
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                    iconColor: "text-red-600",
                    badge: "bg-red-100 text-red-700",
                    badgeText: "Critical",
                };
            case "warning":
                return {
                    icon: AlertCircle,
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                    iconColor: "text-yellow-600",
                    badge: "bg-yellow-100 text-yellow-700",
                    badgeText: "Warning",
                };
            default:
                return {
                    icon: Info,
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                    iconColor: "text-blue-600",
                    badge: "bg-blue-100 text-blue-700",
                    badgeText: "Suggestion",
                };
        }
    };

    const criticalCount = errors.filter((e) => e.severity === "critical").length;
    const warningCount = errors.filter((e) => e.severity === "warning").length;

    return (
        <div className="space-y-4">
            {/* Header Summary */}
            <Card
                className={`p-6 ${validationStatus === "passed"
                        ? "bg-green-50 border-green-200"
                        : validationStatus === "failed"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                    }`}
            >
                <div className="flex items-start gap-4">
                    {validationStatus === "passed" ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {validationStatus === "passed"
                                ? "✅ All Clear!"
                                : validationStatus === "failed"
                                    ? "⚠️ Issues Found"
                                    : "⚠️ Review Needed"}
                        </h3>
                        <p className="text-sm text-slate-700">
                            {validationStatus === "passed"
                                ? "No errors detected in your tax data. You're good to file!"
                                : `Found ${criticalCount} critical error${criticalCount !== 1 ? "s" : ""} and ${warningCount} warning${warningCount !== 1 ? "s" : ""
                                }. Please review below.`}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Error/Warning Cards */}
            {errors.length > 0 && (
                <div className="space-y-3">
                    {errors.map((error, idx) => {
                        const config = getSeverityConfig(error.severity);
                        const Icon = config.icon;

                        return (
                            <Card key={idx} className={`p-5 ${config.bgColor} border ${config.borderColor}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`h-10 w-10 ${config.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`h-5 w-5 ${config.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-semibold text-slate-900">{error.title}</h4>
                                            <Badge className={config.badge}>{config.badgeText}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-700 mb-3">{error.description}</p>

                                        {/* Amounts */}
                                        {(error.amount_missing || error.difference || error.potential_savings) && (
                                            <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                                {error.amount_missing && (
                                                    <div>
                                                        <span className="text-slate-600">Missing Amount: </span>
                                                        <span className="font-semibold text-slate-900">
                                                            ₹{error.amount_missing.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                )}
                                                {error.difference && (
                                                    <div>
                                                        <span className="text-slate-600">Difference: </span>
                                                        <span className="font-semibold text-slate-900">
                                                            ₹{error.difference.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                )}
                                                {error.potential_savings && (
                                                    <div>
                                                        <span className="text-slate-600">Potential Savings: </span>
                                                        <span className="font-semibold text-green-700">
                                                            ₹{error.potential_savings.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Suggestion */}
                                        {error.suggestion && (
                                            <div className="bg-white/60 rounded-lg p-3 border border-slate-200">
                                                <p className="text-xs font-medium text-slate-700 mb-1">💡 How to fix:</p>
                                                <p className="text-sm text-slate-600">{error.suggestion}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
