"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Trash2,
  Download,
  Filter,
  Triangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LogEntry } from "@/lib/types";
import { Logo } from "@/components/logo";

interface LogsViewProps {
  logs: LogEntry[];
  onBack: () => void;
  onClearLogs: () => void;
}

export function LogsView({ logs, onBack, onClearLogs }: LogsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLogs = filterType
    ? logs.filter((log) => log.type === filterType)
    : logs;

  const typeConfig = {
    info: {
      icon: <Info className="w-4 h-4" />,
      className: "text-blue-400 bg-blue-500/10",
      label: "INFO",
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      className: "text-amber-400 bg-amber-500/10",
      label: "WARN",
    },
    error: {
      icon: <XCircle className="w-4 h-4" />,
      className: "text-red-400 bg-red-500/10",
      label: "ERROR",
    },
    success: {
      icon: <CheckCircle className="w-4 h-4" />,
      className: "text-green-400 bg-green-500/10",
      label: "SUCCESS",
    },
  };

  const exportLogs = () => {
    const logText = logs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] [${log.type.toUpperCase()}] ${log.message}${log.details ? `\n  Details: ${log.details}` : ""}`
      )
      .join("\n\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billanalyzer-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={onBack}>
            <Logo size="md" variant="light" className="transition-transform group-hover:scale-105" />
            <span className="font-semibold">BillAnalyzer</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={exportLogs}
                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/50 bg-transparent transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
              <Button
                variant="outline"
                onClick={onClearLogs}
                className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:border-red-800 bg-transparent transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Logs
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className={`mb-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold mb-3">System Logs</h1>
          <p className="text-zinc-400">
            View system activity and processing logs
          </p>
        </div>

        {/* Filter Buttons */}
        {logs.length > 0 && (
          <div className={`flex gap-2 mb-6 ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            <Button
              variant="outline"
              onClick={() => setFilterType(null)}
              className={`border-zinc-800 bg-transparent transition-all ${!filterType ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
            >
              All ({logs.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilterType("info")}
              className={`border-zinc-800 bg-transparent transition-all ${filterType === "info" ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-zinc-400'}`}
            >
              Info ({logs.filter((l) => l.type === "info").length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilterType("success")}
              className={`border-zinc-800 bg-transparent transition-all ${filterType === "success" ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'text-zinc-400'}`}
            >
              Success ({logs.filter((l) => l.type === "success").length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilterType("warning")}
              className={`border-zinc-800 bg-transparent transition-all ${filterType === "warning" ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-zinc-400'}`}
            >
              Warning ({logs.filter((l) => l.type === "warning").length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilterType("error")}
              className={`border-zinc-800 bg-transparent transition-all ${filterType === "error" ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'text-zinc-400'}`}
            >
              Error ({logs.filter((l) => l.type === "error").length})
            </Button>
          </div>
        )}

        {/* Logs List */}
        {filteredLogs.length > 0 ? (
          <div className={`bg-zinc-900/50 rounded-xl border border-zinc-800/50 overflow-hidden ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <div className="divide-y divide-zinc-800/50">
              {filteredLogs.map((log, index) => {
                const config = typeConfig[log.type];
                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-zinc-800/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.className}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-xs font-mono font-medium ${config.className.split(" ")[0]}`}>
                            [{config.label}]
                          </span>
                          <span className="text-xs text-zinc-600 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-white">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-zinc-500 mt-1 font-mono bg-zinc-800/50 p-2 rounded mt-2">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className={`text-center py-20 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="w-20 h-20 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No logs yet</h2>
            <p className="text-zinc-500 mb-6">
              System activity will appear here as you use the app
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
            <p className="text-zinc-500">No logs match your filter</p>
          </div>
        )}
      </main>
    </div>
  );
}
