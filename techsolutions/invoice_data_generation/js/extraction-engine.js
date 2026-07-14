window.InvoiceAI = window.InvoiceAI || {};

window.InvoiceAI.ExtractionEngine = {
  buildPrompt() {
    const { Schema } = window.InvoiceAI;
    return `You are an expert invoice data extraction system with 99.9% accuracy. Analyze the provided invoice image(s) and extract ALL relevant information.

CRITICAL RULES:
1. Extract EXACTLY what is written on the invoice. Do NOT infer, guess, or fabricate any data.
2. If a field is not clearly visible or not present, set its value to null and confidence to null.
3. For monetary amounts: extract as plain numbers WITHOUT currency symbols (e.g., 1250.00 not $1,250.00).
4. For dates: normalize to ISO 8601 format (YYYY-MM-DD). If only partial date is visible, extract what you can.
5. For line items: extract EVERY line item as a separate object. Do not skip any.
6. Currency: identify from symbols ($, €, £, ¥) or text and use ISO 4217 codes (USD, EUR, GBP, JPY).
7. Paid/Due Amounts: Look carefully for handwritten notes indicating amounts paid (e.g., "paid 10000", "deposit") or balance due. Capture these under totals.amount_paid and totals.amount_due.
8. If multiple pages are provided, they are parts of the SAME invoice. Combine information across all pages.

CONFIDENCE SCORING:
- "high": Text is clearly legible, unambiguous, and directly stated on the invoice
- "medium": Text is legible but required some interpretation (e.g., abbreviations, partial visibility)
- "low": Text is partially obscured, handwritten and hard to read, or uncertain
- null: Field is not present on the invoice at all

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema (no markdown formatting, no backticks, no wrap text, just clean JSON):
${Schema.EXTRACTION_SCHEMA}`;
  },

  async extract(base64Pages, onStatus) {
    const { ApiConfig } = window.InvoiceAI;
    const apiKey = ApiConfig.getApiKey();
    
    if (!apiKey) {
      throw new Error("API Key is missing. Click the settings gear icon to configure it.");
    }

    if (onStatus) onStatus("Building query request...");

    const promptText = this.buildPrompt();
    
    // Prepare inline_data parts for all pages
    const parts = [
      { text: promptText }
    ];

    base64Pages.forEach(pBase64 => {
      parts.push({
        inline_data: {
          mime_type: "image/png",
          data: pBase64
        }
      });
    });

    const body = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    const url = `${ApiConfig.API_BASE_URL}/${ApiConfig.MODEL}:generateContent?key=${apiKey}`;

    if (onStatus) onStatus("Sending document to secure gateway...");

    try {
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }, 3, onStatus);

      if (onStatus) onStatus("Validating extracted data structure...");

      const responseJson = await response.json();
      return this.parseResponse(responseJson);
    } catch (err) {
      console.error("Extraction Gateway Error:", err);
      throw err;
    }
  },

  parseResponse(responseJson) {
    const { Schema } = window.InvoiceAI;
    
    // Check if the structure contains candidates
    const candidate = responseJson && responseJson.candidates && responseJson.candidates[0];
    const textContent = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;
    
    if (!textContent) {
      throw new Error("No data returned from secure gateway. Check your connection quota or document content.");
    }

    let parsed = null;
    try {
      // Clean possible wrapper markdown blocks if Gemini added them despite settings
      let cleanText = textContent.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      parsed = JSON.parse(cleanText.trim());
    } catch (e) {
      console.error("JSON parsing error on text:", textContent);
      throw new Error("Secure gateway returned invalid JSON output: " + e.message);
    }

    const validation = Schema.validate(parsed);
    if (!validation.valid) {
      console.warn("Schema validation warnings:", validation.errors);
    }
    return validation.data;
  },

  async fetchWithRetry(url, options, maxRetries = 3, onStatus) {
    let delay = 1500;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 200) {
          return response;
        }

        if (response.status === 429) {
          if (onStatus) onStatus(`Rate limited. Retrying (Attempt ${attempt}/${maxRetries}) in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        if (response.status === 503) {
          if (onStatus) onStatus(`Service busy. Retrying (Attempt ${attempt}/${maxRetries}) in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        if (response.status === 400) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error && errData.error.message ? `: ${errData.error.message}` : '';
          throw new Error(`Invalid request format${errMsg}. Please try another document.`);
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid connection key. Click the settings gear in the top right to verify.");
        }

        throw new Error(`Connection gateway returned status ${response.status}: ${response.statusText}`);
      } catch (err) {
        if (attempt === maxRetries || err.message.includes("connection key")) {
          throw err;
        }
        if (onStatus) onStatus(`Connection error. Retrying (Attempt ${attempt}/${maxRetries}) in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error("Failed to get response after multiple attempts.");
  }
};
