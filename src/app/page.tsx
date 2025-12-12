import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, FileText, Shield, Zap, TrendingUp, Users, Globe } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "ITR Form Selection",
      description: "AI-powered conversation to identify the correct ITR form for your profile in under 3 minutes",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Deduction Discovery",
      description: "Automatically identify tax deductions you're eligible for - 80C, 80D, HRA, and more",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Error Detection",
      description: "Validate your tax data against Form 26AS, AIS, and catch common filing mistakes",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Step-by-Step Guidance",
      description: "Clear, simple instructions for filing your taxes on the e-filing portal",
    },
  ];

  const stats = [
    { value: "95%+", label: "ITR Accuracy" },
    { value: "80%", label: "Error Reduction" },
    { value: "10 Min", label: "Average Time" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TaxSmart AI
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              How It Works
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            Powered by AI • Made for India
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
            File Your Taxes with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI-Powered Confidence
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
            The only tax assistant you need. Get instant ITR recommendations, discover hidden deductions,
            and file error-free returns in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/chat">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 h-12">
                Start Free Chat
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to File Correctly
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our AI assistant guides you through every step of tax filing, ensuring accuracy and maximizing your savings
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow border-slate-200 bg-white">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-white/50 rounded-3xl my-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simple, Fast, Accurate
          </h2>
          <p className="text-lg text-slate-600">Three steps to stress-free tax filing</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {[
            {
              step: "1",
              title: "Chat About Your Income",
              description: "Tell our AI about your salary, investments, rental income, or business. Natural conversation, no forms.",
            },
            {
              step: "2",
              title: "Get Personalized Recommendations",
              description: "Receive your ITR form, eligible deductions, required documents, and error checks - all validated against tax rules.",
            },
            {
              step: "3",
              title: "File with Confidence",
              description: "Follow step-by-step instructions to file on the official e-filing portal. We ensure compliance, you stay in control.",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-6">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {item.step}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
              Your Data is Safe & Private
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                <h4 className="font-semibold text-slate-900">No Auto-Filing</h4>
                <p className="text-sm text-slate-600">We guide, you file. Full control stays with you.</p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                <h4 className="font-semibold text-slate-900">Data Privacy</h4>
                <p className="text-sm text-slate-600">Session-only storage. No permanent data retention.</p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                <h4 className="font-semibold text-slate-900">Rule-Based Logic</h4>
                <p className="text-sm text-slate-600">AI suggestions validated against official tax rules.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Ready to File Your Taxes Smarter?
          </h2>
          <p className="text-lg text-slate-600">
            Join thousands of Indians who are filing taxes with confidence
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 h-12">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              © 2024 TaxSmart AI. Built for Indian taxpayers with ❤️
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
