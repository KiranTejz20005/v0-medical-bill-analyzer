"use client";

import React from "react";

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
  ArrowRight,
  ArrowLeft,
  X,
  AlertTriangle,
  DollarSign,
  Tag,
  FileWarning,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, Finding } from "@/lib/types";
import { getSeverityColor } from "@/lib/analysis-engine";
import { Logo } from "@/components/logo";

interface FindingsDashboardProps {
  result: AnalysisResult;
  onBack: () => void;
  onExportJson: () => void;
  onGenerateReport: () => void;
  onNewAudit: () => void;
  onViewHistory: () => void;
  onViewLogs: () => void;
}

type NavItem = "overview" | "deployments" | "findings" | "logs" | "settings";

export function FindingsDashboard({
  result,
  onBack,
  onExportJson,
  onGenerateReport,
  onNewAudit,
  onViewHistory,
  onViewLogs,
}: FindingsDashboardProps) {
  const [activeNav, setActiveNav] = useState<NavItem>("findings");
  const [flaggedItems, setFlaggedItems] = useState<Set<string>>(new Set());
  const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: { id: NavItem; label: string; icon: React.ReactNode; description?: string }[] = [
    { id: "overview", label: "Overview", icon: <LayoutGrid className="w-4 h-4" />, description: "Analysis Summary" },
    { id: "deployments", label: "Deployments", icon: <Package className="w-4 h-4" /> },
    { id: "findings", label: "Findings", icon: <FileText className="w-4 h-4" />, description: "Detailed Issues" },
    { id: "logs", label: "Logs", icon: <Clock className="w-4 h-4" />, description: "Activity Log" },
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

  const flagAllHighSeverity = () => {
    const highSeverityIds = result.findings
      .filter((f) => f.severity === "HIGH")
      .map((f) => f.id);
    setFlaggedItems(new Set([...flaggedItems, ...highSeverityIds]));
  };

  const exportToCsv = () => {
    const headers = ["ID", "Title", "Severity", "Amount", "Category", "Description", "Action Required"];
    const rows = result.findings.map((f) => [
      f.id,
      f.title,
      f.severity,
      f.amount.toFixed(2),
      f.category,
      f.description.replace(/,/g, ";"),
      f.actionRequired || "N/A",
    ]);
    
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `findings-${result.patientId}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const severityCounts = {
    HIGH: result.findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: result.findings.filter((f) => f.severity === "MEDIUM").length,
    LOW: result.findings.filter((f) => f.severity === "LOW").length,
  };

  const handleNavClick = (navId: NavItem) => {
    setActiveNav(navId);
    if (navId === "overview") {
      onBack();
    } else if (navId === "logs") {
      onViewLogs();
    } else if (navId === "settings") {
      setShowSettings(true);
    } else if (navId === "deployments") {
      // Show deployments view (analysis versions)
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`w-60 border-r border-zinc-800/50 flex flex-col bg-zinc-950/50 ${mounted ? 'animate-slide-in-left' : 'opacity-0'}`}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3">
          <Logo size="sm" variant="dark" className="border border-zinc-800" />
          <span className="font-semibold text-sm tracking-wide">BILL ANALYZER</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
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
                    onViewDetails={() => setSelectedFinding(finding)}
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
                  <a
                    href="https://github.com/kiranlanke824/v0-medical-bill-analyzer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline inline-flex items-center gap-1"
                  >
                    Read Documentation <ArrowRight className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                <h3 className="text-xs text-zinc-500 mb-4 tracking-widest font-medium">
                  QUICK ACTIONS
                </h3>
                <div className="space-y-2">
                  <button 
                    type="button" 
                    onClick={flagAllHighSeverity}
                    className="w-full text-left px-4 py-3 bg-zinc-800/30 rounded-lg text-sm hover:bg-zinc-800/50 transition-colors flex items-center justify-between group"
                  >
                    <span>Flag all high severity</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    type="button" 
                    onClick={onGenerateReport}
                    className="w-full text-left px-4 py-3 bg-zinc-800/30 rounded-lg text-sm hover:bg-zinc-800/50 transition-colors flex items-center justify-between group"
                  >
                    <span>Generate dispute letter</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    type="button" 
                    onClick={exportToCsv}
                    className="w-full text-left px-4 py-3 bg-zinc-800/30 rounded-lg text-sm hover:bg-zinc-800/50 transition-colors flex items-center justify-between group"
                  >
                    <span>Export to CSV</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Finding Detail Modal */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          isFlagged={flaggedItems.has(selectedFinding.id)}
          isResolved={resolvedItems.has(selectedFinding.id)}
          onFlag={() => toggleFlag(selectedFinding.id)}
          onResolve={() => toggleResolved(selectedFinding.id)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
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
  onViewDetails: () => void;
  index: number;
  mounted: boolean;
}

function FindingCard({
  finding,
  isFlagged,
  isResolved,
  onFlag,
  onResolve,
  onViewDetails,
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
          onClick={onViewDetails}
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
            title={isFlagged ? "Remove flag" : "Flag for review"}
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onResolve}
            className={`p-2 rounded-lg hover:bg-zinc-800/50 transition-all ${
              isResolved ? "text-green-500 bg-green-500/10" : "text-zinc-600 hover:text-zinc-400"
            }`}
            title={isResolved ? "Mark as unresolved" : "Mark as resolved"}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface FindingDetailModalProps {
  finding: Finding;
  onClose: () => void;
  isFlagged: boolean;
  isResolved: boolean;
  onFlag: () => void;
  onResolve: () => void;
}

function FindingDetailModal({
  finding,
  onClose,
  isFlagged,
  isResolved,
  onFlag,
  onResolve,
}: FindingDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const copyDetails = () => {
    const text = `
Finding: ${finding.title}
Severity: ${finding.severity}
Amount: $${finding.amount.toFixed(2)}
Category: ${finding.category}
Description: ${finding.description}
Action Required: ${finding.actionRequired || "None"}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityDescription = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "This issue requires immediate attention and has a high likelihood of successful dispute.";
      case "MEDIUM":
        return "This issue should be reviewed and may require verification against your insurance policy.";
      case "LOW":
        return "This is a minor discrepancy that may be worth noting but has lower recovery potential.";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "duplicate":
        return <Copy className="w-5 h-5" />;
      case "upcoding":
        return <AlertTriangle className="w-5 h-5" />;
      case "pricing":
        return <DollarSign className="w-5 h-5" />;
      case "math":
        return <FileWarning className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const getRecommendedActions = (finding: Finding) => {
    const actions = [];
    
    if (finding.severity === "HIGH") {
      actions.push("Request itemized statement from provider");
      actions.push("File formal dispute with billing department");
    }
    
    if (finding.category === "duplicate") {
      actions.push("Cross-reference with previous statements");
      actions.push("Request duplicate charge removal");
    } else if (finding.category === "upcoding") {
      actions.push("Request medical records for verification");
      actions.push("Compare with standard procedure codes");
    } else if (finding.category === "pricing") {
      actions.push("Request fair pricing adjustment");
      actions.push("Compare with regional Medicare rates");
    }
    
    actions.push("Document all communications");
    
    return actions;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in-up"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              finding.severity === "HIGH" ? "bg-red-500/10 text-red-500" :
              finding.severity === "MEDIUM" ? "bg-amber-500/10 text-amber-500" :
              "bg-zinc-500/10 text-zinc-500"
            }`}>
              {getCategoryIcon(finding.category)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{finding.title}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </span>
                <span className="text-xs text-zinc-500 uppercase tracking-wide">{finding.category}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Amount */}
          <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Potential Recovery Amount</span>
              <span className="text-3xl font-bold font-mono text-red-500">
                -${finding.amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Description</h3>
            <p className="text-zinc-300 leading-relaxed">{finding.description}</p>
          </div>

          {/* Severity Explanation */}
          <div className="mb-6">
            <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Severity Assessment</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{getSeverityDescription(finding.severity)}</p>
          </div>

          {/* Action Required */}
          {finding.actionRequired && (
            <div className="mb-6">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Immediate Action</h3>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-amber-400 font-medium">{finding.actionRequired}</p>
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="mb-6">
            <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Recommended Actions</h3>
            <ul className="space-y-2">
              {getRecommendedActions(finding).map((action, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-zinc-400">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Flagged:</span>
              <span className={`text-sm font-medium ${isFlagged ? "text-amber-500" : "text-zinc-600"}`}>
                {isFlagged ? "Yes" : "No"}
              </span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Status:</span>
              <span className={`text-sm font-medium ${isResolved ? "text-green-500" : "text-zinc-400"}`}>
                {isResolved ? "Resolved" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onFlag}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isFlagged 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30" 
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Flag className="w-4 h-4" />
              {isFlagged ? "Unflag" : "Flag"}
            </button>
            <button
              type="button"
              onClick={onResolve}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isResolved 
                  ? "bg-green-500/10 text-green-500 border border-green-500/30" 
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {isResolved ? "Unresolve" : "Resolve"}
            </button>
          </div>
          <button
            type="button"
            onClick={copyDetails}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const [autoFlag, setAutoFlag] = useState(true);
  const [showLowSeverity, setShowLowSeverity] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in-up"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Auto Flag High Severity */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Auto-flag high severity</h3>
              <p className="text-xs text-zinc-500 mt-1">Automatically flag high severity findings</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoFlag(!autoFlag)}
              className={`w-11 h-6 rounded-full transition-colors ${autoFlag ? "bg-green-500" : "bg-zinc-700"}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${autoFlag ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Show Low Severity */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Show low severity issues</h3>
              <p className="text-xs text-zinc-500 mt-1">Display findings with low severity</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLowSeverity(!showLowSeverity)}
              className={`w-11 h-6 rounded-full transition-colors ${showLowSeverity ? "bg-green-500" : "bg-zinc-700"}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${showLowSeverity ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Email notifications</h3>
              <p className="text-xs text-zinc-500 mt-1">Receive analysis reports via email</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-11 h-6 rounded-full transition-colors ${emailNotifications ? "bg-green-500" : "bg-zinc-700"}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${emailNotifications ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-zinc-800">
          <Button
            onClick={onClose}
            className="bg-white text-black hover:bg-zinc-200"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
