"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Loader2, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatApi } from "@/lib/api-client";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    type?: "itr_result" | "deduction" | "error" | "text";
    data?: any;
}

export default function ChatInterface() {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "नमस्ते! 👋 Hi! I'm your Tax Filing Assistant. I'll help you:\n\n• Identify the correct ITR form\n• Discover tax deductions you can claim\n• Check for errors in your tax data\n• Guide you through filing step-by-step\n\nLet's start! What type of income do you have? (Salary, Business, Freelance, Rental, or Multiple sources?)",
            timestamp: new Date(),
            type: "text",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId] = useState("conv_" + Date.now());
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call the real backend API
            const response = await chatApi.sendMessage(
                input,
                conversationId,
                user?.id || "anonymous"
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.response || response.message || "I'm processing your request...",
                timestamp: new Date(),
                type: "text",
                data: response.data,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error calling API:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I'm having trouble connecting to the server. Please make sure the backend is running on http://localhost:8000",
                timestamp: new Date(),
                type: "text",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        { text: "I'm a salaried employee", icon: "💼" },
        { text: "I'm a freelancer", icon: "💻" },
        { text: "I have rental income", icon: "🏠" },
        { text: "Check my deductions", icon: "💰" },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="border-b bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Tax Filing Assistant</h1>
                    <p className="text-sm text-slate-500">Get personalized tax guidance</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarFallback className={message.role === "user" ? "bg-blue-600 text-white" : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"}>
                                        {message.role === "user" ? user?.firstName?.[0] || "U" : "T"}
                                    </AvatarFallback>
                                </Avatar>
                                <Card className={`p-4 max-w-2xl ${message.role === "user" ? "bg-blue-600 text-white" : "bg-white"}`}>
                                    <div className="prose prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    </div>
                                    {message.type === "itr_result" && message.data && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                <span className="font-semibold text-blue-900">Recommended ITR Form</span>
                                            </div>
                                            <div className="text-2xl font-bold text-blue-600 mb-2">{message.data.form}</div>
                                            <p className="text-sm text-slate-700">{message.data.reason}</p>
                                        </div>
                                    )}
                                    <div className="text-xs mt-2 opacity-70">
                                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </Card>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">T</AvatarFallback>
                                </Avatar>
                                <Card className="p-4 bg-white">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        <span className="text-sm text-slate-600">Analyzing...</span>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
                <div className="px-6 py-3 bg-white border-t flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-xs text-slate-500 mb-2">Quick options:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setInput(action.text);
                                    }}
                                    className="text-sm"
                                >
                                    <span className="mr-1">{action.icon}</span>
                                    {action.text}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t bg-white p-6 flex-shrink-0">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message... (Press Enter to send)"
                                className="min-h-[60px] max-h-[200px] resize-none"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-[60px] px-6"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Disclaimer: This is AI-powered guidance. Always verify with official tax rules.
                    </p>
                </div>
            </div>
        </div>
    );
}
