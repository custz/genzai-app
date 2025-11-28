// services/geminiService.ts

// Kita tidak mengimport GoogleGenerativeAI di sini lagi
// karena file ini berjalan di browser. Kita panggil API backend.

export const streamGeminiResponse = async function* (
  modelId: string,
  prompt: string,
  history: { role: string; parts: { text: string }[] }[]
) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId,
        prompt,
        history
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Split buffer by newline because backend sends JSON string + \n
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() !== "") {
          try {
            const parsed = JSON.parse(line);
            
            // Yield object that matches App.tsx expectation
            // App.tsx expects chunk.text() and chunk.candidates...
            yield {
              text: () => parsed.text || "",
              candidates: parsed.groundingMetadata ? [{ groundingMetadata: parsed.groundingMetadata }] : []
            };
          } catch (e) {
            console.warn("Error parsing chunk", e);
          }
        }
      }
    }

  } catch (error) {
    console.error("Error calling Chat API:", error);
    throw error;
  }
};

export const enhanceImagePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: originalPrompt }),
    });

    if (!response.ok) return originalPrompt;
    
    const data = await response.json();
    return data.enhancedText || originalPrompt;
  } catch (error) {
    console.warn("API enhancement failed:", error);
    return originalPrompt;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to generate image");
    }

    const data = await response.json();
    return data.image; // Base64 string
  } catch (error) {
    console.error("Error calling Image API:", error);
    throw error;
  }
};