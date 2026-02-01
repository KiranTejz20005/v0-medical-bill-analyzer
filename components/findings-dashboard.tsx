"use client";

import React from "react"

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Package,
  FileText,
  Clock,
  Settings,
  Plus,
  ChevronRight,
  Flag,
  CheckCircle,
  Triangle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, Finding } from "@/lib/types";
import { getSeverityColor } from "@/lib/analysis-engine";

interface FindingsDashboardProps {
  result: AnalysisResult;
  onBack: () => void;
  onExportJson: () => void;
  onGenerateReport: () => void;
  onNewAudit: () => void;
}

type NavItem = "overview" | "deployments" | "findings" | "logs" | "settings";

export function FindingsDashboard({
  result,
  onBack,
  onExportJson,
  onGenerateReport,
  onNewAudit,
}: FindingsDashboardProps) {
  const [activeNav, setActiveNav] = useState<NavItem>("findings");
  const [flaggedItems, setFlaggedItems] = useState<Set<string>>(new Set());
  const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "deployments", label: "Deployments", icon: <Package className="w-4 h-4" /> },
    { id: "findings", label: "Findings", icon: <FileText className="w-4 h-4" /> },
    { id: "logs", label: "Logs", icon: <Clock className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const toggleFlag = (id: string) => {
    setFlaggedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleResolved = (id: string) => {
    setResolvedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const severityCounts = {
    HIGH: result.findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: result.findings.filter((f) => f.severity === "MEDIUM").length,
    LOW: result.findings.filter((f) => f.severity === "LOW").length,
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`w-60 border-r border-zinc-800/50 flex flex-col bg-zinc-950/50 ${mounted ? 'animate-slide-in-left' : 'opacity-0'}`}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center border border-zinc-800">
            <Triangle className="w-3.5 h-3.5 fill-white text-white" />
          </div>
          <span className="font-semibold text-sm tracking-wide">BILL ANALYZER</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveNav(item.id);
                if (item.id === "overview") {
                  onBack();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm mb-1 transition-all duration-200 ${
                activeNav === item.id
                  ? "bg-zinc-800/80 text-white"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* New Audit Button */}
        <div className="p-4">
          <Button
            onClick={onNewAudit}
            variant="outline"
            className="w-full border-zinc-800 text-white hover:bg-zinc-800/50 bg-transparent transition-all hover:border-zinc-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            NEW AUDIT
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`px-8 py-6 border-b border-zinc-800/50 bg-zinc-950/30 backdrop-blur-sm sticky top-0 z-20 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}>
          <div className="flex items-start justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Summary
              </Button>
              <h1 className="text-3xl font-bold mb-3">Detailed Findings</h1>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="tracking-wider">LIVE_ANALYSIS_STABLE</span>
                </span>
                <span className="font-mono text-zinc-600">COMMIT: 8A2F9C1</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onExportJson}
                className="border-zinc-800 text-white hover:bg-zinc-800/50 bg-transparent transition-all"
              >
                EXPORT JSON
              </Button>
              <Button
                onClick={onGenerateReport}
                className="bg-white text-black hover:bg-zinc-200 transition-all"
              >
                GENERATE REPORT
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="p-8">
          <div className="flex gap-8">
            {/* Findings Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {result.findings.map((finding, index) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    isFlagged={flaggedItems.has(finding.id)}
                    isResolved={resolvedItems.has(finding.id)}
                    onFlag={() => toggleFlag(finding.id)}
                    onResolve={() => toggleResolved(finding.id)}
                    index={index}
                    mounted={mounted}
                  />
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className={`w-80 shrink-0 space-y-4 ${mounted ? 'animate-slide-in-right' : 'opacity-0'}`}>
              {/* Summary Metrics */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                <h3 className="text-xs text-zinc-500 mb-5 tracking-widest font-medium">
                  SUMMARY METRICS
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-zinc-400">TOTAL DETECTED</span>
                  <span className="text-3xl font-bold tabular-nums">{result.findings.length}</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-zinc-400">EST. RECOVERY</span>
                  <span className="text-3xl font-bold font-mono text-green-500">
                    ${result.totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-zinc-800/50 pt-5 space-y-4">
                  <SeverityBar 
                    label="HIGH_SEVERITY" 
                    count={severityCounts.HIGH} 
                    total={result.findings.length}
                    color="red"
                  />
                  <SeverityBar 
                    label="MEDIUM_SEVERITY" 
                    count={severityCounts.MEDIUM} 
                    total={result.findings.length}
                    color="amber"
                  />
                  <SeverityBar 
                    label="LOW_SEVERITY" 
                    count={severityCounts.LOW} 
                    total={result.findings.length}
                    color="zinc"
                  />
                </div>
              </div>

              {/* System Note */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                <h3 className="text-xs text-zinc-500 mb-4 tracking-widest font-medium">
                  SYSTEM NOTE
                </h3>
                <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                  92% of duplicate charges are successfully mitigated via itemized
                  audit requests.{" "}
                  <button
                    type="button"
                    className="text-white hover:underline inline-flex items-center gap-1"
                  >
                    Read Documentation <ArrowRight className="w-3 h-3" />
                  </button>
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                <h3 className="text-xs text-zinc-500 mb-4 tracking-widest font-medium">
                  QUICK ACTIONS
                </h3>
                <div className="space-y-2">
                  <button type="button" className="w-full text-left px-4 py-3 bg-zinc-800/30 rounded-lg text-sm hover:bg-zinc-800/50 transition-colors flex items-center justify-between group">
                    <span>Flag all high severity</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button type="button" className="w-full text-left px-4 py-3 bg-zinc-800/30 rounded-lg text-sm hover:bg-zinc-800/50 transition-colors flex items-center justify-between group">
                    <span>Generate dispute letter</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button type="button" className="w-full text-left px-4 py-3 bg-zinc-800/30 rounded-lg text-sm hover:bg-zinc-800/50 transition-colors flex items-center justify-between group">
                    <span>Export to CSV</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface SeverityBarProps {
  label: string;
  count: number;
  total: number;
  color: "red" | "amber" | "zinc";
}

function SeverityBar({ label, count, total, color }: SeverityBarProps) {
  const colorClasses = {
    red: { text: "text-red-500", bg: "bg-red-500" },
    amber: { text: "text-amber-500", bg: "bg-amber-500" },
    zinc: { text: "text-zinc-500", bg: "bg-zinc-600" },
  };

  const classes = colorClasses[color];
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium ${classes.text}`}>{label}</span>
        <span className="text-sm text-zinc-400 tabular-nums">
          {String(count).padStart(2, "0")}
        </span>
      </div>
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${classes.bg} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface FindingCardProps {
  finding: Finding;
  isFlagged: boolean;
  isResolved: boolean;
  onFlag: () => void;
  onResolve: () => void;
  index: number;
  mounted: boolean;
}

function FindingCard({
  finding,
  isFlagged,
  isResolved,
  onFlag,
  onResolve,
  index,
  mounted,
}: FindingCardProps) {
  return (
    <div
      className={`group bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 ${
        isResolved ? "opacity-40" : ""
      } ${mounted ? 'animate-scale-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-md ${getSeverityColor(finding.severity)}`}
        >
          {finding.severity}
        </span>
        <div className="flex items-center gap-3">
          {finding.actionRequired && (
            <span className="text-xs text-amber-500 font-medium tracking-wide">
              {finding.actionRequired}
            </span>
          )}
          <span className="text-red-500 text-base font-mono font-semibold">
            -${finding.amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold mb-2 text-lg">{finding.title}</h3>

      {/* Description */}
      <p className="text-sm text-zinc-500 mb-5 line-clamp-3 leading-relaxed">
        {finding.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <button
          type="button"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors group/btn"
        >
          DETAILS <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onFlag}
            className={`p-2 rounded-lg hover:bg-zinc-800/50 transition-all ${
              isFlagged ? "text-amber-500 bg-amber-500/10" : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onResolve}
            className={`p-2 rounded-lg hover:bg-zinc-800/50 transition-all ${
              isResolved ? "text-green-500 bg-green-500/10" : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
