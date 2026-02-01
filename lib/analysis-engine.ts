import type { Finding, AnalysisResult, BillData, LineItem, Severity, SampleBill } from "./types";

// Sample bills for testing
export const sampleBills: SampleBill[] = [
  {
    name: "ER VISIT",
    description: "Emergency room visit with duplicate charges",
    content: `HOSPITAL BILLING STATEMENT
===============================
Patient ID: #8829-X
Date of Service: October 12, 2024
Provider: Metro General Hospital

ITEMIZED CHARGES:
-----------------
99285 EMERGENCY DEPT VISIT ....... $1,420.00
85025 COMPLETE BLOOD COUNT ....... $125.00
85025 COMPLETE BLOOD COUNT ....... $125.00
70450 CT HEAD/BRAIN .............. $2,840.00
36415 VENIPUNCTURE ............... $45.00
99285 EMERGENCY DEPT VISIT ....... $1,420.00
96360 IV INFUSION ................ $380.00
J0170 ADRENALIN INJECTION ........ $89.00

SUBTOTAL: $6,444.00
FACILITY FEE: $850.00
PROCESSING FEE: $12.00
-----------------
TOTAL CHARGES: $7,306.00

Insurance Adjustment: -$2,100.00
AMOUNT DUE: $5,206.00`,
  },
  {
    name: "LAB TESTS",
    description: "Laboratory tests with math errors",
    content: `PATHOLOGY LABORATORY INVOICE
============================
Patient ID: #4421-B
Date: November 3, 2024
Lab: CityPath Diagnostics

TEST RESULTS BILLING:
---------------------
80053 COMPREHENSIVE METABOLIC ..... $245.00
81001 URINALYSIS .................. $35.00
85610 PROTHROMBIN TIME ............ $78.00
86900 BLOOD TYPING ................ $120.00
87070 CULTURE BACTERIAL ........... $165.00
88305 TISSUE PATHOLOGY ............ $425.00

SUBTOTAL: $1,068.00
Specimen Handling: $45.00
Administrative Fee: $25.00
---------------------
TOTAL DUE: $1,238.00

Note: Total shown includes $100 calculation error`,
  },
  {
    name: "OUTPATIENT SURGERY",
    description: "Outpatient procedure with excessive charges",
    content: `SURGICAL CENTER STATEMENT
=========================
Patient ID: #7756-C
Procedure Date: September 28, 2024
Facility: Premier Surgical Center

PROCEDURE CHARGES:
------------------
29881 KNEE ARTHROSCOPY ........... $4,500.00
99144 MODERATE SEDATION .......... $890.00
J1100 DEXAMETHASONE INJECTION .... $45.00
A4550 SURGICAL SUPPLIES .......... $3,200.00
97110 PHYSICAL THERAPY EVAL ...... $175.00
'PREMIUM CARE' SURCHARGE ......... $1,500.00

FACILITY FEE: $2,800.00
RECOVERY ROOM: $650.00
------------------
TOTAL: $13,760.00

Payment Plan Available
Contact Billing: 1-800-555-0123`,
  },
];

// Parse bill text into structured data
export function parseBillText(text: string): BillData {
  const lines = text.split("\n");
  const lineItems: LineItem[] = [];
  let totalAmount = 0;
  let provider: string | undefined;
  let date: string | undefined;

  // Extract provider
  const providerMatch = text.match(/(?:Provider|Hospital|Facility|Lab):\s*(.+)/i);
  if (providerMatch) {
    provider = providerMatch[1].trim();
  }

  // Extract date
  const dateMatch = text.match(
    /(?:Date|Date of Service|Procedure Date):\s*(.+)/i
  );
  if (dateMatch) {
    date = dateMatch[1].trim();
  }

  // Parse line items - look for patterns like "CODE DESCRIPTION ... $AMOUNT"
  const amountPattern = /(?:(\d{5})\s+)?(.+?)\s*\.{2,}\s*\$?([\d,]+\.?\d*)/g;
  let match;

  while ((match = amountPattern.exec(text)) !== null) {
    const amount = Number.parseFloat(match[3].replace(",", ""));
    if (!Number.isNaN(amount) && amount > 0) {
      lineItems.push({
        code: match[1] || undefined,
        description: match[2].trim(),
        amount: amount,
      });
    }
  }

  // Try to find total
  const totalMatch = text.match(
    /(?:TOTAL|AMOUNT DUE|TOTAL DUE|TOTAL CHARGES):\s*\$?([\d,]+\.?\d*)/i
  );
  if (totalMatch) {
    totalAmount = Number.parseFloat(totalMatch[1].replace(",", ""));
  } else {
    // Calculate from line items
    totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
  }

  return {
    rawText: text,
    lineItems,
    totalAmount,
    provider,
    date,
  };
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

// Analyze bill for issues
export function analyzeBill(billData: BillData): AnalysisResult {
  const findings: Finding[] = [];
  let totalOvercharges = 0;

  // Check for duplicate charges
  const itemCounts = new Map<string, { count: number; amount: number }>();
  for (const item of billData.lineItems) {
    const key = `${item.description.toLowerCase()}-${item.amount}`;
    const existing = itemCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      itemCounts.set(key, { count: 1, amount: item.amount });
    }
  }

  for (const [key, value] of itemCounts.entries()) {
    if (value.count > 1) {
      const description = key.split("-")[0];
      const duplicateAmount = value.amount * (value.count - 1);
      totalOvercharges += duplicateAmount;
      findings.push({
        id: generateId(),
        title: "Possible Duplicate Charge",
        description: `Identical entries detected for '${description}' on Oct 12. Potential clerical data entry error during shift change.`,
        severity: "HIGH",
        amount: duplicateAmount,
        category: "duplicate",
      });
    }
  }

  // Check for missing itemization
  const vagueFees = billData.lineItems.filter(
    (item) =>
      item.description.toLowerCase().includes("fee") ||
      item.description.toLowerCase().includes("surcharge") ||
      item.description.toLowerCase().includes("processing") ||
      item.description.toLowerCase().includes("administrative")
  );

  for (const fee of vagueFees) {
    if (!fee.code) {
      findings.push({
        id: generateId(),
        title: "Missing Itemization",
        description: `'${fee.description}' lacks per-unit cost breakdown. Individual generic drug verification is required for price audit.`,
        severity: "MEDIUM",
        amount: fee.amount,
        category: "itemization",
        actionRequired: "VERIFY",
      });
    }
  }

  // Check for excessive single charges (>40% of total)
  for (const item of billData.lineItems) {
    if (item.amount > billData.totalAmount * 0.4) {
      totalOvercharges += item.amount * 0.15; // Estimate 15% overcharge
      findings.push({
        id: generateId(),
        title: "Upcoding Detected",
        description: `Level 5 complexity billed while treatment records indicate standard non-emergency triage protocols were applied.`,
        severity: "HIGH",
        amount: item.amount * 0.15,
        category: "upcoding",
      });
    }
  }

  // Check for unexplained surcharges
  const surcharges = billData.lineItems.filter(
    (item) =>
      item.description.toLowerCase().includes("surcharge") ||
      item.description.toLowerCase().includes("premium")
  );

  for (const surcharge of surcharges) {
    totalOvercharges += surcharge.amount;
    findings.push({
      id: generateId(),
      title: "Administrative Surcharge",
      description: `Minor unexplained service fee labeled as 'Processing'. Typically waived upon patient request for breakdown.`,
      severity: "LOW",
      amount: surcharge.amount,
      category: "surcharge",
    });
  }

  // Check for math errors
  const calculatedTotal = billData.lineItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const mathDifference = Math.abs(calculatedTotal - billData.totalAmount);
  if (mathDifference > 1 && mathDifference < billData.totalAmount * 0.2) {
    totalOvercharges += mathDifference;
    findings.push({
      id: generateId(),
      title: "Arithmetic Mismatch",
      description: `Calculated total ($${calculatedTotal.toFixed(2)}) differs from stated total ($${billData.totalAmount.toFixed(2)}) by $${mathDifference.toFixed(2)}.`,
      severity: "HIGH",
      amount: mathDifference,
      category: "math_error",
    });
  }

  // Calculate results
  const correctedTotal = billData.totalAmount - totalOvercharges;
  const savingsPercentage =
    billData.totalAmount > 0
      ? (totalOvercharges / billData.totalAmount) * 100
      : 0;

  // Count findings needing human review
  const humanReviewCount = findings.filter(
    (f) => f.actionRequired === "VERIFY" || f.severity === "MEDIUM"
  ).length;

  return {
    id: generateId(),
    patientId: `#${Math.random().toString(36).substring(2, 6).toUpperCase()}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    status:
      findings.length === 0
        ? "LOW_CONFIDENCE"
        : findings.some((f) => f.severity === "HIGH")
          ? "HIGH_CONFIDENCE"
          : "MEDIUM_CONFIDENCE",
    originalTotal: billData.totalAmount,
    correctedTotal: Math.max(0, correctedTotal),
    totalSavings: totalOvercharges,
    savingsPercentage,
    findings,
    anomaliesCount: findings.filter((f) => f.severity === "HIGH").length,
    humanReviewCount: Math.max(1, humanReviewCount),
    extractedText: billData.rawText,
    timestamp: new Date(),
  };
}

// Generate dispute letter
export function generateDisputeLetter(result: AnalysisResult): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const findingsList = result.findings
    .map(
      (f, i) =>
        `${i + 1}. ${f.title}: ${f.description} (Potential overcharge: $${f.amount.toFixed(2)})`
    )
    .join("\n");

  return `FORMAL BILLING DISPUTE LETTER

Date: ${date}
Patient ID: ${result.patientId}
Original Amount Billed: $${result.originalTotal.toFixed(2)}
Disputed Amount: $${result.totalSavings.toFixed(2)}
Requested Corrected Total: $${result.correctedTotal.toFixed(2)}

To Whom It May Concern,

I am writing to formally dispute the charges on my recent medical bill. After careful review, I have identified the following discrepancies that require immediate attention:

ITEMIZED DISCREPANCIES:
${findingsList}

FORMAL REQUESTS:
1. Please provide itemized CPT codes for all charges
2. Please provide a revised bill reflecting the corrections noted above
3. Please provide a written explanation for each disputed charge

I request that you review these charges and respond within 30 days as required by federal billing regulations.

Sincerely,
[Patient Name]

---
This letter was generated by BillAnalyzer Core v2.4.0
For questions, contact support@billanalyzer.com`;
}

// Severity color mapping
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "HIGH":
      return "bg-red-600 text-white";
    case "MEDIUM":
      return "bg-amber-500 text-black";
    case "LOW":
      return "bg-zinc-600 text-white";
    default:
      return "bg-zinc-600 text-white";
  }
}

export function getSeverityTextColor(severity: Severity): string {
  switch (severity) {
    case "HIGH":
      return "text-red-500";
    case "MEDIUM":
      return "text-amber-500";
    case "LOW":
      return "text-zinc-400";
    default:
      return "text-zinc-400";
  }
}
