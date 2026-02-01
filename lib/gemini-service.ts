"use server";

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
  };
}

export async function extractTextFromImage(
  base64Data: string,
  mimeType: string
): Promise<{ success: boolean; text: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      text: "",
      error: "GEMINI_API_KEY not configured",
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
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
- Line items with codes and amounts
- Totals and subtotals
- Provider information
- Dates
- Any fees or surcharges

Format the output as plain text, maintaining the original layout as much as possible. Include all dollar amounts exactly as shown.`,
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
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `API request failed: ${response.status}`;
      
      // Handle rate limit errors gracefully
      if (response.status === 429) {
        console.warn("Gemini API rate limit exceeded - falling back to manual entry");
        return {
          success: false,
          text: "",
          error: "API rate limit exceeded. Please enter bill text manually.",
        };
      }
      
      console.error("Gemini API error:", errorMessage);
      return {
        success: false,
        text: "",
        error: errorMessage,
      };
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        text: "",
        error: data.error.message,
      };
    }

    const extractedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!extractedText) {
      return {
        success: false,
        text: "",
        error: "No text extracted from image",
      };
    }

    return {
      success: true,
      text: extractedText,
    };
  } catch (error) {
    console.error("Gemini extraction error:", error);
    return {
      success: false,
      text: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function enhanceAnalysis(
  billText: string,
  findings: string
): Promise<{ success: boolean; insights: string; error?: string }> {
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
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
                  text: `Analyze this medical bill for additional patterns or issues that may have been missed:

BILL TEXT:
${billText}

CURRENT FINDINGS:
${findings}

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
