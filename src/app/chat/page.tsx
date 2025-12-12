"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";
import Sidebar from "@/components/chat/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function ChatPage() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in");
        }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || !isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-slate-50">
            {/* Mobile Sidebar Toggle */}
            <Button
                variant="ghost"
                size="sm"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Sidebar */}
            <div
                className={`fixed lg:static inset-y-0 left-0 z-40 w-80 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <Sidebar />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Chat Interface */}
            <div className="flex-1 flex flex-col h-screen">
                <ChatInterface />
            </div>
        </div>
    );
}
