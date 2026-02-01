"use client";

import React from "react"

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Plus,
  Triangle,
  AlertTriangle,
  Shield,
  Lock,
  Eye,
  Server,
  Zap,
  FileSearch,
  DollarSign,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
  Brain,
  Database,
  FileText,
  ShieldCheck,
  Code,
  Globe,
  Fingerprint,
  CloudOff,
  Scale,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleBills } from "@/lib/analysis-engine";

interface LandingPageProps {
  onStartAnalysis: (text: string) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
}

export function LandingPage({
  onStartAnalysis,
  onFileUpload,
  isProcessing,
  error,
}: LandingPageProps) {
  const [rawBillText, setRawBillText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleAnalyze = () => {
    if (rawBillText.trim()) {
      onStartAnalysis(rawBillText);
    }
  };

  const loadSampleBill = (index: number) => {
    setRawBillText(sampleBills[index].content);
  };

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI-Powered Detection",
      description:
        "Advanced machine learning identifies billing anomalies, duplicate charges, and coding errors with 98.5% accuracy.",
    },
    {
      icon: <FileSearch className="w-5 h-5" />,
      title: "CPT/HCPCS Validation",
      description:
        "Cross-reference every procedure code against official Medicare fee schedules and regional pricing data.",
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Fair Price Analysis",
      description:
        "Compare charges against fair market rates using data from 500,000+ healthcare transactions.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Detailed Reports",
      description:
        "Generate comprehensive PDF reports with line-by-line analysis and dispute letter templates.",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Real-time Processing",
      description:
        "Analyze bills in seconds, not hours. Our optimized engine processes complex itemized statements instantly.",
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: "Dispute Assistance",
      description:
        "Auto-generate dispute letters with legal citations and evidence to maximize your recovery chances.",
    },
  ];

  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "End-to-End Encryption",
      description:
        "All data transmitted using AES-256 encryption. Your medical information never leaves your secure session.",
    },
    {
      icon: <CloudOff className="w-6 h-6" />,
      title: "Zero Data Retention",
      description:
        "We don't store your bills. All processing happens in isolated environments that are destroyed after each session.",
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "HIPAA Compliant",
      description:
        "Fully compliant with HIPAA regulations. Your PHI (Protected Health Information) is handled with care.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "SOC 2 Type II Certified",
      description:
        "Independently audited security controls. Trust verified by leading security assessment firms.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 grid-pattern opacity-50" />
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-zinc-500/5 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className={`relative z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 backdrop-blur-sm ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center transition-transform group-hover:scale-110">
              <Triangle className="w-4 h-4 fill-black text-black" />
            </div>
            <span className="font-semibold tracking-tight text-lg">BILL ANALYZER</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
            </a>
            <a href="#security" className="hover:text-white transition-colors relative group">
              Security
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
            </a>
            <a href="#pricing" className="hover:text-white transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
            </a>
            <a href="#docs" className="hover:text-white transition-colors relative group">
              Docs
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 mr-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            All systems operational
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24">
        {/* Version Badge */}
        <div className={`flex justify-center mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="group flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full hover:border-zinc-700 transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-zinc-400">VERSION 2.0.1 IS LIVE</span>
            <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Title */}
        <div className={`text-center mb-8 ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text italic">Analyze bills</span>
            <br />
            <span className="text-white">in seconds.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The developer-first platform for hospital charge auditing.
            <br className="hidden sm:block" />
            Identify errors, find fair pricing, and negotiate with data.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className={`flex justify-center gap-4 mb-16 ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
          <Button
            onClick={handleAnalyze}
            disabled={!rawBillText.trim() || isProcessing}
            className="bg-white text-black hover:bg-zinc-200 px-8 py-6 text-base font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/10"
          >
            Start Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800/50 px-8 py-6 text-base bg-transparent transition-all hover:border-zinc-600"
            onClick={() => loadSampleBill(0)}
          >
            View Demo
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center gap-3 max-w-3xl mx-auto animate-scale-in">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Input Sections */}
        <div className={`grid md:grid-cols-2 gap-4 mb-6 max-w-4xl mx-auto ${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
          {/* Raw Bill Data */}
          <div className="group bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-medium tracking-wide">RAW BILL DATA</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono">UTF-8</span>
            </div>
            <textarea
              value={rawBillText}
              onChange={(e) => setRawBillText(e.target.value)}
              placeholder={`// Paste itemized bill text here...
// Example:
99285 EMERGENCY DEPT VISIT ....... $1,420.00
85025 COMPLETE BLOOD COUNT ....... $125.00
70450 CT HEAD/BRAIN .............. $2,840.00`}
              className="w-full h-52 bg-transparent p-4 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 resize-none focus:outline-none"
            />
          </div>

          {/* PDF Upload */}
          <div className="group bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Database className="w-3.5 h-3.5" />
                <span className="font-medium tracking-wide">PDF ANALYZER</span>
              </div>
              <span className="text-[10px] text-amber-500 font-medium">MAX 5MB</span>
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`h-52 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
                isDragging ? "bg-zinc-800/50 scale-[0.99]" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 border border-zinc-700 border-dashed rounded-xl flex items-center justify-center mb-4 hover:bg-zinc-800/50 hover:border-zinc-600 transition-all duration-300 group/btn"
              >
                <Plus className="w-6 h-6 text-zinc-500 group-hover/btn:text-white transition-colors" />
              </button>
              <p className="text-sm text-white mb-1 font-medium">Drop your PDF here</p>
              <p className="text-xs text-zinc-500 text-center mb-4 leading-relaxed">
                Our AI will automatically extract
                <br />
                codes and prices from your document.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-zinc-700 text-white hover:bg-zinc-800/50 text-xs bg-transparent"
              >
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Model Info Bar */}
        <div className={`flex flex-col sm:flex-row items-center justify-between bg-zinc-900/30 rounded-xl px-5 py-4 mb-20 max-w-4xl mx-auto border border-zinc-800/50 gap-4 ${mounted ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] text-zinc-500 mb-1 tracking-wider">MODEL</p>
              <p className="text-sm text-white font-medium">Healthcare-Llama 3 (V1)</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-zinc-800" />
            <div>
              <p className="text-[10px] text-zinc-500 mb-1 tracking-wider">PRIVACY</p>
              <p className="text-sm text-white flex items-center gap-2 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                End-to-end Encrypted
              </p>
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!rawBillText.trim() || isProcessing}
            className="bg-white text-black hover:bg-zinc-200 px-6 transition-all hover:scale-105 w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-rotate mr-2" />
                Analyzing...
              </>
            ) : (
              <>Analyze Bill <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>

        {/* Sample Data Buttons */}
        <div className={`text-center mb-24 ${mounted ? 'animate-fade-in-up stagger-5' : 'opacity-0'}`}>
          <p className="text-xs text-zinc-500 mb-4 tracking-widest">
            TRY WITH EXAMPLE DATA
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {sampleBills.map((bill, index) => (
              <Button
                key={bill.name}
                variant="outline"
                size="sm"
                onClick={() => loadSampleBill(index)}
                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:border-zinc-700 text-xs font-medium px-5 bg-transparent transition-all"
              >
                {bill.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-32 scroll-mt-24">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 mb-4">
              FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Everything you need to audit medical bills
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Powered by advanced AI and comprehensive healthcare pricing data to help you identify billing errors and recover overcharges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 bg-zinc-900/30 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 hover:bg-zinc-900/50 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center mb-4 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-32 scroll-mt-24">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 mb-4">
              SECURITY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Your data security is our priority
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Enterprise-grade security measures to protect your sensitive medical information at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group flex gap-5 p-6 bg-zinc-900/30 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 shrink-0 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Security badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500">
              <Shield className="w-5 h-5" />
              <span className="text-sm">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Lock className="w-5 h-5" />
              <span className="text-sm">SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Eye className="w-5 h-5" />
              <span className="text-sm">GDPR Ready</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Server className="w-5 h-5" />
              <span className="text-sm">256-bit Encryption</span>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mb-32 scroll-mt-24">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 mb-4">
              PRICING
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Pay only for what you use. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-500 text-black text-xs font-semibold rounded-bl-xl">
                MOST POPULAR
              </div>

              <div className="p-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold">$1</span>
                  <span className="text-zinc-400">/ analysis</span>
                </div>
                <p className="text-zinc-500 mb-8">Per bill analyzed</p>

                <div className="space-y-4 mb-8">
                  {[
                    "Full AI-powered analysis",
                    "Detailed PDF report",
                    "Dispute letter generation",
                    "CPT/HCPCS code validation",
                    "Fair price comparison",
                    "24/7 availability",
                    "No subscription required",
                    "Results in seconds",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <span className="text-zinc-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!rawBillText.trim() || isProcessing}
                  className="w-full bg-white text-black hover:bg-zinc-200 py-6 text-base font-medium transition-all"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="px-8 py-4 bg-zinc-900/50 border-t border-zinc-800">
                <p className="text-center text-xs text-zinc-500">
                  No credit card required for demo. Pay only when you analyze your real bills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source Section */}
        <section id="docs" className="mb-20 scroll-mt-24">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
              <Code className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Open Source Audit Logic</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Our core analysis engine is built on open-source principles. Review our methodology, contribute improvements, or fork for your own use.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800/50 shrink-0 bg-transparent"
            >
              <Globe className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-16 px-6 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <Triangle className="w-4 h-4 fill-black text-black" />
                </div>
                <span className="font-semibold">BILL ANALYZER</span>
              </div>
              <p className="text-sm text-zinc-500 mb-6 max-w-xs leading-relaxed">
                Auditing healthcare, one bill at a time. Trusted by thousands of patients and healthcare professionals.
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                All systems operational
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-4 font-semibold tracking-wider">PRODUCT</p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><button type="button" className="hover:text-white transition-colors">Features</button></li>
                <li><button type="button" className="hover:text-white transition-colors">Pricing</button></li>
                <li><button type="button" className="hover:text-white transition-colors">Documentation</button></li>
                <li><button type="button" className="hover:text-white transition-colors">API Reference</button></li>
              </ul>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-4 font-semibold tracking-wider">COMPANY</p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><button type="button" className="hover:text-white transition-colors">About</button></li>
                <li><button type="button" className="hover:text-white transition-colors">Blog</button></li>
                <li><button type="button" className="hover:text-white transition-colors">Careers</button></li>
                <li><button type="button" className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-4 font-semibold tracking-wider">LEGAL</p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><button type="button" className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button type="button" className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button type="button" className="hover:text-white transition-colors">Security</button></li>
                <li><button type="button" className="hover:text-white transition-colors">HIPAA</button></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-800/50 gap-4">
            <p className="text-xs text-zinc-600">
              © 2026 BILL ANALYZER INC. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <button type="button" className="hover:text-zinc-400 transition-colors">GitHub</button>
              <button type="button" className="hover:text-zinc-400 transition-colors">Twitter</button>
              <button type="button" className="hover:text-zinc-400 transition-colors">Discord</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
