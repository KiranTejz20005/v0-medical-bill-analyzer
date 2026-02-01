"use client";

import { useState, useEffect } from "react";
import {
  Triangle,
  ArrowLeft,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisHistoryItem } from "@/lib/types";

interface HistoryViewProps {
  history: AnalysisHistoryItem[];
  onBack: () => void;
  onViewAnalysis: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryView({
  history,
  onBack,
  onViewAnalysis,
  onClearHistory,
}: HistoryViewProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusConfig = {
    HIGH_CONFIDENCE: {
      label: "High",
      className: "bg-amber-500/10 text-amber-500",
    },
    MEDIUM_CONFIDENCE: {
      label: "Medium",
      className: "bg-blue-500/10 text-blue-500",
    },
    LOW_CONFIDENCE: {
      label: "Low",
      className: "bg-zinc-500/10 text-zinc-400",
    },
  };

  const totalSavings = history.reduce((sum, item) => sum + item.totalSavings, 0);
  const totalFindings = history.reduce((sum, item) => sum + item.findingsCount, 0);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
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
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            onClick={onClearHistory}
            className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:border-red-800 bg-transparent transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className={`mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold mb-3">Analysis History</h1>
          <p className="text-zinc-400">
            View and manage your past bill analyses
          </p>
        </div>

        {/* Stats Row */}
        {history.length > 0 && (
          <div className={`grid grid-cols-3 gap-4 mb-8 ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-zinc-500" />
                <span className="text-xs text-zinc-500">TOTAL ANALYSES</span>
              </div>
              <p className="text-3xl font-bold">{history.length}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-zinc-500">TOTAL SAVINGS</span>
              </div>
              <p className="text-3xl font-bold text-green-500 font-mono">
                ${totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-xs text-zinc-500">ISSUES FOUND</span>
              </div>
              <p className="text-3xl font-bold">{totalFindings}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {history.length > 0 && (
          <div className={`flex gap-4 mb-6 ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by Patient ID or Analysis ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFilterStatus(null)}
                className={`border-zinc-800 bg-transparent transition-all ${!filterStatus ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              >
                All
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilterStatus("HIGH_CONFIDENCE")}
                className={`border-zinc-800 bg-transparent transition-all ${filterStatus === "HIGH_CONFIDENCE" ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'text-zinc-400'}`}
              >
                High
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilterStatus("MEDIUM_CONFIDENCE")}
                className={`border-zinc-800 bg-transparent transition-all ${filterStatus === "MEDIUM_CONFIDENCE" ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' : 'text-zinc-400'}`}
              >
                Medium
              </Button>
            </div>
          </div>
        )}

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className={`space-y-3 ${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
            {filteredHistory.map((item, index) => {
              const status = statusConfig[item.status];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewAnalysis(item.id)}
                  className="w-full text-left bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-900/70 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-zinc-800/50 rounded-xl flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">
                          Patient ID: {item.patientId}
                        </p>
                        <p className="text-sm text-zinc-500 font-mono">
                          {new Date(item.timestamp).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 mb-1">SAVINGS</p>
                        <p className="text-lg font-bold text-green-500 font-mono">
                          ${item.totalSavings.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 mb-1">FINDINGS</p>
                        <p className="text-lg font-bold">{item.findingsCount}</p>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : history.length === 0 ? (
          <div className={`text-center py-20 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="w-20 h-20 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No analysis history yet</h2>
            <p className="text-zinc-500 mb-6">
              Start analyzing bills to see your history here
            </p>
            <Button
              onClick={onBack}
              className="bg-white text-black hover:bg-zinc-200 transition-all"
            >
              Start Analysis
            </Button>
          </div>
        ) : (
          <div className={`text-center py-20 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <p className="text-zinc-500">No results match your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
