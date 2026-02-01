"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, UserCircle, ArrowUpRight, Download, Triangle, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/types";

interface ResultsSummaryProps {
  result: AnalysisResult;
  onViewDetails: () => void;
  onExportPdf: () => void;
  onBack: () => void;
  onViewHistory: () => void;
}

export function ResultsSummary({
  result,
  onViewDetails,
  onExportPdf,
  onBack,
  onViewHistory,
}: ResultsSummaryProps) {
  const [mounted, setMounted] = useState(false);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Animate counters
    const anomalyTimer = setInterval(() => {
      setAnomalyCount((prev) => {
        if (prev >= result.anomaliesCount) {
          clearInterval(anomalyTimer);
          return result.anomaliesCount;
        }
        return prev + 1;
      });
    }, 100);

    const reviewTimer = setInterval(() => {
      setReviewCount((prev) => {
        if (prev >= result.humanReviewCount) {
          clearInterval(reviewTimer);
          return result.humanReviewCount;
        }
        return prev + 1;
      });
    }, 150);

    return () => {
      clearInterval(anomalyTimer);
      clearInterval(reviewTimer);
    };
  }, [result.anomaliesCount, result.humanReviewCount]);

  const statusConfig = {
    HIGH_CONFIDENCE: {
      label: "HIGH CONFIDENCE",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      dotColor: "bg-amber-500",
    },
    MEDIUM_CONFIDENCE: {
      label: "MEDIUM CONFIDENCE",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      dotColor: "bg-blue-500",
    },
    LOW_CONFIDENCE: {
      label: "LOW CONFIDENCE",
      className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      dotColor: "bg-zinc-500",
    },
  };

  const status = statusConfig[result.status];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 grid-pattern opacity-30" />

      {/* Navigation */}
      <nav className={`relative z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 backdrop-blur-sm ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}>
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="flex items-center gap-2 group cursor-pointer" onClick={onBack}>
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <Triangle className="w-4 h-4 fill-black text-black" />
            </div>
            <span className="font-semibold">BillAnalyzer</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400 ml-6">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-white transition-colors"
            >
              Overview
            </button>
            <button type="button" className="text-white relative">
              Analysis
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
            </button>
            <button
              type="button"
              onClick={onViewHistory}
              className="hover:text-white transition-colors"
            >
              History
            </button>
            <button
              type="button"
              className="hover:text-white transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onExportPdf}
            className="border-zinc-700 text-white hover:bg-zinc-800/50 bg-transparent transition-all hover:border-zinc-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF Summary
          </Button>
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className={`flex items-start justify-between mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div>
            <p className="text-xs text-zinc-500 mb-3 tracking-wider font-mono flex items-center gap-3">
              VARIANT 3.0 
              <span className="w-1 h-1 bg-zinc-600 rounded-full" />
              Patient ID: {result.patientId}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Analysis Results Summary
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 mb-2">Status</p>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border ${status.className}`}
            >
              <span className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Alert Banner */}
        <div className={`bg-zinc-900/50 rounded-2xl p-8 mb-8 border border-zinc-800/50 backdrop-blur-sm ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-amber-500 mb-4">
                Potential billing issues found
              </h2>
              <p className="text-zinc-400 max-w-xl leading-relaxed">
                Our engine has identified discrepancies between your insurance
                coverage and the provider{"'"}s statement. We recommend immediate
                review of the flagged line items below to potentially reduce your
                out-of-pocket costs.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="border-zinc-700 text-white hover:bg-zinc-800/50 shrink-0 bg-transparent transition-all hover:scale-105 px-6"
            >
              Review Flags
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className={`grid md:grid-cols-2 gap-4 mb-12 ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
          {/* Anomalies Card */}
          <div className="group bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <p className="text-xs text-zinc-500 tracking-widest font-medium">ANOMALIES</p>
              <div className="w-12 h-12 bg-zinc-800/50 rounded-xl flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <p className="text-7xl font-bold mb-4 tabular-nums">
              {String(anomalyCount).padStart(2, "0")}
            </p>
            <p className="text-white font-semibold mb-2">Issues Detected</p>
            <p className="text-sm text-zinc-500 leading-relaxed">
              System identified duplicate billing codes and unauthorized
              surcharges.
            </p>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-600 tracking-wider">PRIORITY: <span className="text-red-500">CRITICAL</span></p>
              <button
                type="button"
                onClick={onViewDetails}
                className="text-sm text-white flex items-center gap-1 hover:gap-2 transition-all group/btn"
              >
                Details <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Human Review Card */}
          <div className="group bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <p className="text-xs text-zinc-500 tracking-widest font-medium">HUMAN REVIEW</p>
              <div className="w-12 h-12 bg-zinc-800/50 rounded-xl flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                <UserCircle className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
            <p className="text-7xl font-bold mb-4 tabular-nums">
              {String(reviewCount).padStart(2, "0")}
            </p>
            <p className="text-white font-semibold mb-2">Manual Review Suggested</p>
            <p className="text-sm text-zinc-500 leading-relaxed">
              One complex medical procedure requires verification against your
              specific policy terms.
            </p>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-600 tracking-wider">CONSULTANCY <span className="text-green-500">AVAILABLE</span></p>
              <button
                type="button"
                className="text-sm text-white flex items-center gap-1 hover:gap-2 transition-all group/btn"
              >
                Get help <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-3 gap-4 mb-8 ${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
          <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800/30">
            <p className="text-xs text-zinc-500 mb-2">EST. SAVINGS</p>
            <p className="text-2xl font-bold text-green-500 font-mono">
              ${result.totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800/30">
            <p className="text-xs text-zinc-500 mb-2">LINE ITEMS</p>
            <p className="text-2xl font-bold font-mono">{result.findings.length}</p>
          </div>
          <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800/30">
            <p className="text-xs text-zinc-500 mb-2">CONFIDENCE</p>
            <p className="text-2xl font-bold font-mono">98.5%</p>
          </div>
        </div>

        {/* Action Button */}
        <div className={`flex justify-center ${mounted ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
          <Button
            onClick={onViewDetails}
            className="bg-white text-black hover:bg-zinc-200 px-8 py-6 text-base font-medium transition-all hover:scale-105"
          >
            View Detailed Findings
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-6 px-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600 font-mono">
            Generated by BillAnalyzer Core v2.4.0
          </p>
          <div className="flex items-center gap-8 text-xs text-zinc-500">
            <button type="button" className="hover:text-white transition-colors">
              Documentation
            </button>
            <button type="button" className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-white transition-colors">
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
