"use server";

// API state management - persists across calls within the same server instance
let apiRateLimited = false;
let rateLimitResetTime: number | null = null;

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message: string;
    code?: number;
  };
}

// Check if API is currently rate limited
function isRateLimited(): boolean {
  if (!apiRateLimited) return false;
  
  // Check if rate limit has expired (reset after 60 seconds)
  if (rateLimitResetTime && Date.now() > rateLimitResetTime) {
    apiRateLimited = false;
    rateLimitResetTime = null;
    return false;
  }
  
  return true;
}

// Set rate limit state
function setRateLimited(): void {
  apiRateLimited = true;
  rateLimitResetTime = Date.now() + 60000; // Reset after 60 seconds
}

// Validate and normalize OCR output
function normalizeOcrOutput(text: string | null | undefined): {
  status: "full" | "partial" | "none";
  text: string;
} {
  if (!text || text.trim().length === 0) {
    return { status: "none", text: "" };
  }
  
  const trimmedText = text.trim();
  
  // Check if it looks like a valid bill (has numbers, dollar signs, etc.)
  const hasCurrency = /\$[\d,]+\.?\d*/.test(trimmedText);
  const hasNumbers = /\d+/.test(trimmedText);
  const hasEnoughContent = trimmedText.length > 50;
  
  if (hasCurrency && hasNumbers && hasEnoughContent) {
    return { status: "full", text: trimmedText };
  }
  
  if (hasNumbers && trimmedText.length > 20) {
    return { status: "partial", text: trimmedText };
  }
  
  return { status: "partial", text: trimmedText };
}

export async function extractTextFromImage(
  base64Data: string,
  mimeType: string
): Promise<{ 
  success: boolean; 
  text: string; 
  error?: string;
  status?: "full" | "partial" | "none";
  rateLimited?: boolean;
}> {
  // Check rate limit first - prevent wasted API calls
  if (isRateLimited()) {
    return {
      success: false,
      text: "",
      error: "AI service temporarily unavailable. Please enter bill text manually.",
      rateLimited: true,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      text: "",
      error: "GEMINI_API_KEY not configured. Please enter bill text manually.",
    };
  }

  try {
    // Use gemini-2.0-flash-001 which is the stable version
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Extract all text from this medical bill image. Preserve the structure including:
- Line items with procedure codes and amounts
- Totals and subtotals
- Provider and patient information
- Dates of service
- Any fees, surcharges, or adjustments

Format the output as plain text, maintaining the original layout. Include all dollar amounts exactly as shown. If this is not a medical bill, extract whatever text is visible.`,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    // Handle rate limit errors
    if (response.status === 429) {
      setRateLimited();
      console.warn("[v0] Gemini API rate limit exceeded - setting rate limit flag");
      return {
        success: false,
        text: "",
        error: "AI service rate limit reached. Continuing with manual entry mode.",
        rateLimited: true,
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `API request failed: ${response.status}`;
      
      // Check for quota/billing errors
      if (response.status === 403 || errorMessage.includes("quota") || errorMessage.includes("billing")) {
        setRateLimited();
        return {
          success: false,
          text: "",
          error: "AI service quota exceeded. Please enter bill text manually.",
          rateLimited: true,
        };
      }
      
      console.error("[v0] Gemini API error:", errorMessage);
      return {
        success: false,
        text: "",
        error: "AI extraction unavailable. Please enter bill text manually.",
      };
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        text: "",
        error: data.error.message || "AI extraction failed",
      };
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const normalized = normalizeOcrOutput(rawText);

    if (normalized.status === "none") {
      return {
        success: false,
        text: "",
        error: "No readable text found in the document. Please enter bill text manually.",
        status: "none",
      };
    }

    return {
      success: true,
      text: normalized.text,
      status: normalized.status,
    };
  } catch (error) {
    console.error("[v0] Gemini extraction error:", error);
    
    // Network errors or other failures
    return {
      success: false,
      text: "",
      error: "Unable to process document. Please enter bill text manually.",
    };
  }
}

export async function enhanceAnalysis(
  billText: string,
  findings: string
): Promise<{ success: boolean; insights: string; error?: string }> {
  // Check rate limit first
  if (isRateLimited()) {
    return {
      success: false,
      insights: "",
      error: "AI service temporarily unavailable",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      insights: "",
      error: "GEMINI_API_KEY not configured",
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this medical bill for additional patterns or issues:

BILL TEXT:
${billText.slice(0, 2000)}

CURRENT FINDINGS:
${findings.slice(0, 1000)}

Provide brief additional insights about:
1. Industry-standard pricing comparisons
2. Common billing code issues
3. Negotiation recommendations

Keep response under 200 words and focus on actionable insights.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (response.status === 429) {
      setRateLimited();
      return {
        success: false,
        insights: "",
        error: "Rate limit exceeded",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        insights: "",
        error: `API request failed: ${response.status}`,
      };
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        insights: "",
        error: data.error.message,
      };
    }

    const insights = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      success: true,
      insights,
    };
  } catch (error) {
    return {
      success: false,
      insights: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Export rate limit status for UI feedback
export async function getApiStatus(): Promise<{ rateLimited: boolean; }> {
  return { rateLimited: isRateLimited() };
}
