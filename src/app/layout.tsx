import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaxSmart AI - Simplified Tax Filing for India",
  description: "AI-powered tax filing assistant that helps Indian citizens correctly file ITR forms, discover deductions, and avoid common errors. Free and easy to use.",
  keywords: ["tax filing", "ITR", "India", "AI assistant", "deductions", "income tax"],
  authors: [{ name: "TaxSmart Team" }],
  openGraph: {
    title: "TaxSmart AI - Your Personal Tax Filing Assistant",
    description: "File your taxes correctly with AI-powered guidance. Get ITR recommendations, deduction suggestions, and error detection.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
