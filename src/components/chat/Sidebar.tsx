"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, TrendingUp, AlertTriangle, CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
    const { user } = useUser();

    return (
        <div className="h-full bg-white border-r flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/">
                        <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">T</span>
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                TaxSmart
                            </span>
                        </div>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">
                        {user?.firstName || "User"}
                    </p>
                    <p className="text-xs text-slate-500">
                        {user?.emailAddresses[0]?.emailAddress}
                    </p>
                </div>
            </div>

            {/* Tax Profile Summary */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Quick Tips */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Quick Tips
                    </h3>
                    <Card className="p-4 bg-slate-50 border-slate-200">
                        <div className="space-y-3 text-sm text-slate-600">
                            <p>💡 Tell the AI about your income sources to get ITR form recommendations</p>
                            <Separator />
                            <p>📋 Ask about deductions under 80C, 80D, HRA and more</p>
                            <Separator />
                            <p>✅ Get help validating your tax data before filing</p>
                        </div>
                    </Card>
                </div>

                {/* Sample Questions */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Try Asking</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                        <p className="p-2 bg-slate-50 rounded border cursor-pointer hover:bg-slate-100">
                            "Which ITR form for salaried employee?"
                        </p>
                        <p className="p-2 bg-slate-50 rounded border cursor-pointer hover:bg-slate-100">
                            "What deductions can I claim?"
                        </p>
                        <p className="p-2 bg-slate-50 rounded border cursor-pointer hover:bg-slate-100">
                            "How to save tax on 10 LPA income?"
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="space-y-2">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Button>
                    </Link>
                    <Link href="/chat">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Chat Assistant
                        </Button>
                    </Link>
                </div>

                {/* Help Card */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Need Help?</h4>
                    <p className="text-xs text-blue-700 mb-3">
                        Chat with our AI assistant to get started with your tax filing journey.
                    </p>
                    <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                        Learn More
                    </Button>
                </Card>
            </div>
        </div>
    );
}
