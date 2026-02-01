export type Severity = "HIGH" | "MEDIUM" | "LOW";

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  amount: number;
  category: string;
  actionRequired?: string;
}

export interface AnalysisResult {
  id: string;
  patientId: string;
  status: "HIGH_CONFIDENCE" | "MEDIUM_CONFIDENCE" | "LOW_CONFIDENCE";
  originalTotal: number;
  correctedTotal: number;
  totalSavings: number;
  savingsPercentage: number;
  findings: Finding[];
  anomaliesCount: number;
  humanReviewCount: number;
  extractedText: string;
  timestamp: Date;
}

export interface BillData {
  rawText: string;
  lineItems: LineItem[];
  totalAmount: number;
  provider?: string;
  date?: string;
}

export interface LineItem {
  code?: string;
  description: string;
  amount: number;
  quantity?: number;
}

export type AppState = "landing" | "loading" | "results" | "findings" | "history" | "logs";

export interface AnalysisHistoryItem {
  id: string;
  patientId: string;
  timestamp: Date;
  status: "HIGH_CONFIDENCE" | "MEDIUM_CONFIDENCE" | "LOW_CONFIDENCE";
  totalSavings: number;
  findingsCount: number;
  anomaliesCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
  details?: string;
}

export interface SampleBill {
  name: string;
  description: string;
  content: string;
}
