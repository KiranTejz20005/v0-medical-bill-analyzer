"use client";

import { useState, useCallback } from "react";
import { LandingPage } from "@/components/landing-page";
import { LoadingScreen } from "@/components/loading-screen";
import { ResultsSummary } from "@/components/results-summary";
import { FindingsDashboard } from "@/components/findings-dashboard";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { TextEditorModal } from "@/components/text-editor-modal";
import type { AppState, AnalysisResult } from "@/lib/types";
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

  // Run analysis on text
  const runAnalysis = useCallback(async (text: string) => {
    setAppState("loading");
    setLoadingStage("extracting");
    setError(null);

    // Simulate multi-step analysis for better UX - matches the loading screen steps
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setLoadingStage("analyzing");
    await new Promise((resolve) => setTimeout(resolve, 3500));

    setLoadingStage("generating");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Parse and analyze
    const billData = parseBillText(text);
    const result = analyzeBill(billData);
    result.extractedText = text;

    setAnalysisResult(result);
    setAppState("results");
    setIsProcessing(false);
  }, []);

  // Handle text input analysis
  const handleStartAnalysis = useCallback(
    (text: string) => {
      setIsProcessing(true);
      setExtractedText(text);
      runAnalysis(text);
    },
    [runAnalysis]
  );

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setOcrFailed(false);

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
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
      setError(
        "Unsupported file format. Please upload PDF, PNG, JPG, or JPEG."
      );
      setIsProcessing(false);
      return;
    }

    setAppState("loading");
    setLoadingStage("extracting");

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call OCR API
      const mimeType = file.type === "application/pdf" ? "application/pdf" : file.type;
      const ocrResult = await extractTextFromImage(base64, mimeType);

      if (ocrResult.success && ocrResult.text) {
        setExtractedText(ocrResult.text);
        setShowTextEditor(true);
        setAppState("landing");
        setIsProcessing(false);
      } else {
        // OCR failed - show manual entry
        console.warn("OCR failed:", ocrResult.error);
        setOcrFailed(true);
        setExtractedText("");
        setShowTextEditor(true);
        setAppState("landing");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("File processing error:", err);
      setOcrFailed(true);
      setExtractedText("");
      setShowTextEditor(true);
      setAppState("landing");
      setIsProcessing(false);
    }
  }, []);

  // Handle text editor confirm
  const handleTextEditorConfirm = useCallback(
    (text: string) => {
      setShowTextEditor(false);
      setExtractedText(text);
      runAnalysis(text);
    },
    [runAnalysis]
  );

  // Navigation handlers
  const handleViewDetails = useCallback(() => {
    setAppState("findings");
  }, []);

  const handleBackToResults = useCallback(() => {
    setAppState("results");
  }, []);

  const handleNewAudit = useCallback(() => {
    setAppState("landing");
    setAnalysisResult(null);
    setExtractedText("");
    setError(null);
    setOcrFailed(false);
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
  }, [analysisResult]);

  const handleGenerateReport = useCallback(() => {
    if (!analysisResult) return;
    const letter = generateDisputeLetter(analysisResult);
    setDisputeLetter(letter);
  }, [analysisResult]);

  const handleExportPdf = useCallback(() => {
    // For now, generate report as text
    handleGenerateReport();
  }, [handleGenerateReport]);

  // Render based on state
  if (appState === "loading") {
    return <LoadingScreen stage={loadingStage} />;
  }

  if (appState === "results" && analysisResult) {
    return (
      <>
        <ResultsSummary
          result={analysisResult}
          onViewDetails={handleViewDetails}
          onExportPdf={handleExportPdf}
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
