"use client";

import { useState, useCallback, useEffect } from "react";
import { LandingPage } from "@/components/landing-page";
import { LoadingScreen } from "@/components/loading-screen";
import { ResultsSummary } from "@/components/results-summary";
import { FindingsDashboard } from "@/components/findings-dashboard";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { TextEditorModal } from "@/components/text-editor-modal";
import { HistoryView } from "@/components/history-view";
import { LogsView } from "@/components/logs-view";
import type { AppState, AnalysisResult, AnalysisHistoryItem, LogEntry } from "@/lib/types";
import {
  parseBillText,
  analyzeBill,
  generateDisputeLetter,
} from "@/lib/analysis-engine";
import { extractTextFromImage } from "@/lib/gemini-service";

export default function BillAnalyzerApp() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [loadingStage, setLoadingStage] = useState<
    "extracting" | "analyzing" | "generating"
  >("extracting");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [disputeLetter, setDisputeLetter] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [ocrFailed, setOcrFailed] = useState(false);
  
  // History and Logs state
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [savedResults, setSavedResults] = useState<Map<string, AnalysisResult>>(new Map());

  // Add log helper
  const addLog = useCallback((type: LogEntry["type"], message: string, details?: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("billanalyzer-history");
      const savedLogs = localStorage.getItem("billanalyzer-logs");
      const savedResultsData = localStorage.getItem("billanalyzer-results");
      
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setAnalysisHistory(parsed.map((item: AnalysisHistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      }
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        setLogs(parsed.map((item: LogEntry) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      }
      if (savedResultsData) {
        const parsed = JSON.parse(savedResultsData);
        const map = new Map<string, AnalysisResult>();
        Object.entries(parsed).forEach(([key, value]) => {
          map.set(key, value as AnalysisResult);
        });
        setSavedResults(map);
      }
    } catch (e) {
      console.error("Failed to load saved data:", e);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("billanalyzer-history", JSON.stringify(analysisHistory));
      localStorage.setItem("billanalyzer-logs", JSON.stringify(logs));
      const resultsObj: Record<string, AnalysisResult> = {};
      savedResults.forEach((value, key) => {
        resultsObj[key] = value;
      });
      localStorage.setItem("billanalyzer-results", JSON.stringify(resultsObj));
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }, [analysisHistory, logs, savedResults]);

  // Run analysis on text
  const runAnalysis = useCallback(async (text: string) => {
    setAppState("loading");
    setLoadingStage("extracting");
    setError(null);

    addLog("info", "Starting bill analysis", `Input text length: ${text.length} characters`);

    // Simulate multi-step analysis for better UX
    await new Promise((resolve) => setTimeout(resolve, 2000));
    addLog("info", "Extracting line items from bill data");
    
    setLoadingStage("analyzing");
    await new Promise((resolve) => setTimeout(resolve, 3500));
    addLog("info", "Analyzing billing codes and pricing");

    setLoadingStage("generating");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    addLog("info", "Generating analysis report");

    // Parse and analyze
    const billData = parseBillText(text);
    const result = analyzeBill(billData);
    result.extractedText = text;

    // Save to history
    const historyItem: AnalysisHistoryItem = {
      id: result.id,
      patientId: result.patientId,
      timestamp: result.timestamp,
      status: result.status,
      totalSavings: result.totalSavings,
      findingsCount: result.findings.length,
      anomaliesCount: result.anomaliesCount,
    };

    setAnalysisHistory((prev) => [historyItem, ...prev]);
    setSavedResults((prev) => {
      const newMap = new Map(prev);
      newMap.set(result.id, result);
      return newMap;
    });

    addLog("success", `Analysis complete: ${result.findings.length} issues found`, 
      `Estimated savings: $${result.totalSavings.toFixed(2)}`);

    setAnalysisResult(result);
    setAppState("results");
    setIsProcessing(false);
  }, [addLog]);

  // Handle text input analysis
  const handleStartAnalysis = useCallback(
    (text: string) => {
      setIsProcessing(true);
      setExtractedText(text);
      addLog("info", "User initiated analysis via text input");
      runAnalysis(text);
    },
    [runAnalysis, addLog]
  );

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setOcrFailed(false);

    addLog("info", `File uploaded: ${file.name}`, `Size: ${(file.size / 1024).toFixed(2)} KB, Type: ${file.type}`);

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      addLog("error", "File upload failed: Size limit exceeded", `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`);
      setError("File size exceeds 10MB limit. Please upload a smaller file.");
      setIsProcessing(false);
      return;
    }

    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      addLog("error", "File upload failed: Unsupported format", `File type: ${file.type}`);
      setError(
        "Unsupported file format. Please upload PDF, PNG, JPG, or JPEG."
      );
      setIsProcessing(false);
      return;
    }

    setAppState("loading");
    setLoadingStage("extracting");

    try {
      addLog("info", "Converting file to base64 for OCR processing");
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      addLog("info", "Calling Gemini Vision API for text extraction");

      // Call OCR API
      const mimeType = file.type === "application/pdf" ? "application/pdf" : file.type;
      const ocrResult = await extractTextFromImage(base64, mimeType);

      if (ocrResult.success && ocrResult.text) {
        addLog("success", "OCR extraction successful", `Extracted ${ocrResult.text.length} characters`);
        setExtractedText(ocrResult.text);
        setShowTextEditor(true);
        setAppState("landing");
        setIsProcessing(false);
      } else {
        addLog("warning", "OCR extraction failed - falling back to manual entry", ocrResult.error || "Unknown error");
        setOcrFailed(true);
        setExtractedText("");
        setShowTextEditor(true);
        setAppState("landing");
        setIsProcessing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addLog("error", "File processing error", errorMessage);
      setOcrFailed(true);
      setExtractedText("");
      setShowTextEditor(true);
      setAppState("landing");
      setIsProcessing(false);
    }
  }, [addLog]);

  // Handle text editor confirm
  const handleTextEditorConfirm = useCallback(
    (text: string) => {
      setShowTextEditor(false);
      setExtractedText(text);
      addLog("info", "User confirmed extracted text, proceeding with analysis");
      runAnalysis(text);
    },
    [runAnalysis, addLog]
  );

  // Navigation handlers
  const handleViewDetails = useCallback(() => {
    setAppState("findings");
    addLog("info", "User navigated to detailed findings");
  }, [addLog]);

  const handleBackToResults = useCallback(() => {
    setAppState("results");
  }, []);

  const handleNewAudit = useCallback(() => {
    setAppState("landing");
    setAnalysisResult(null);
    setExtractedText("");
    setError(null);
    setOcrFailed(false);
    addLog("info", "User started new audit session");
  }, [addLog]);

  const handleViewHistory = useCallback(() => {
    setAppState("history");
    addLog("info", "User viewed analysis history");
  }, [addLog]);

  const handleViewLogs = useCallback(() => {
    setAppState("logs");
  }, []);

  const handleViewAnalysisFromHistory = useCallback((id: string) => {
    const result = savedResults.get(id);
    if (result) {
      setAnalysisResult(result);
      setAppState("results");
      addLog("info", `Loaded analysis from history: ${id}`);
    }
  }, [savedResults, addLog]);

  const handleClearHistory = useCallback(() => {
    setAnalysisHistory([]);
    setSavedResults(new Map());
    addLog("warning", "Analysis history cleared");
  }, [addLog]);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Export handlers
  const handleExportJson = useCallback(() => {
    if (!analysisResult) return;

    const json = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bill-analysis-${analysisResult.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog("success", "Analysis exported as JSON", `File: bill-analysis-${analysisResult.id}.json`);
  }, [analysisResult, addLog]);

  const handleGenerateReport = useCallback(() => {
    if (!analysisResult) return;
    const letter = generateDisputeLetter(analysisResult);
    setDisputeLetter(letter);
    addLog("success", "Dispute letter generated");
  }, [analysisResult, addLog]);

  const handleExportPdf = useCallback(() => {
    handleGenerateReport();
  }, [handleGenerateReport]);

  // Handle cancel analysis
  const handleCancelAnalysis = useCallback(() => {
    setAppState("landing");
    setIsProcessing(false);
    setError(null);
    addLog("warning", "Analysis cancelled by user");
  }, [addLog]);

  // Render based on state
  if (appState === "loading") {
    return <LoadingScreen stage={loadingStage} onCancel={handleCancelAnalysis} />;
  }

  if (appState === "history") {
    return (
      <HistoryView
        history={analysisHistory}
        onBack={handleNewAudit}
        onViewAnalysis={handleViewAnalysisFromHistory}
        onClearHistory={handleClearHistory}
      />
    );
  }

  if (appState === "logs") {
    return (
      <LogsView
        logs={logs}
        onBack={handleNewAudit}
        onClearLogs={handleClearLogs}
      />
    );
  }

  if (appState === "results" && analysisResult) {
    return (
      <>
        <ResultsSummary
          result={analysisResult}
          onViewDetails={handleViewDetails}
          onExportPdf={handleExportPdf}
          onBack={handleNewAudit}
          onViewHistory={handleViewHistory}
        />
        {disputeLetter && (
          <DisputeLetterModal
            letter={disputeLetter}
            onClose={() => setDisputeLetter(null)}
          />
        )}
      </>
    );
  }

  if (appState === "findings" && analysisResult) {
    return (
      <>
        <FindingsDashboard
          result={analysisResult}
          onBack={handleBackToResults}
          onExportJson={handleExportJson}
          onGenerateReport={handleGenerateReport}
          onNewAudit={handleNewAudit}
          onViewHistory={handleViewHistory}
          onViewLogs={handleViewLogs}
        />
        {disputeLetter && (
          <DisputeLetterModal
            letter={disputeLetter}
            onClose={() => setDisputeLetter(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <LandingPage
        onStartAnalysis={handleStartAnalysis}
        onFileUpload={handleFileUpload}
        isProcessing={isProcessing}
        error={error}
        onViewHistory={handleViewHistory}
        historyCount={analysisHistory.length}
      />
      {showTextEditor && (
        <TextEditorModal
          initialText={extractedText}
          onConfirm={handleTextEditorConfirm}
          onClose={() => {
            setShowTextEditor(false);
            setIsProcessing(false);
          }}
          isOcrFailed={ocrFailed}
        />
      )}
    </>
  );
}
