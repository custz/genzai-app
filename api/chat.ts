import { GoogleGenerativeAI } from "@google/generative-ai";

// Ambil API Key dari Environment Variable Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  // Hanya terima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { modelId, prompt, history } = req.body;

    let tools = undefined;
    let systemInstruction = "Anda adalah GenzAI. Jawablah dengan sopan, cerdas, dan menggunakan format Markdown yang rapi. Selalu sertakan identitas 'GenzAI' jika diminta atau relevan. Gunakan Bahasa Indonesia yang baik.";

    // Konfigurasi Khusus untuk Genz 2.5 Pro (gemini-2.5-flash)
    if (modelId === 'gemini-2.5-flash') {
      tools = [{ googleSearch: {} }];
      systemInstruction += `
      \n[SYSTEM NOTICE: CHAIN OF THOUGHT REQUIRED]
      Anda berjalan pada mode "Genz 2.5 Pro" yang memiliki kemampuan reasoning tingkat tinggi.
      
      ATURAN WAJIB:
      1. JANGAN langsung menjawab pertanyaan user.
      2. MULAI setiap respon Anda dengan blok <thinking> ... </thinking>.
      3. Di dalam blok thinking, uraikan analisis langkah demi langkah, strategi pencarian informasi (jika perlu), dan struktur jawaban.
      4. Setelah tag </thinking> tertutup, barulah berikan jawaban akhir Anda kepada user.
      
      Format Respon:
      <thinking>
      - Analisis maksud user: ...
      - Rencana jawaban: ...
      </thinking>
      (Jawaban Akhir Anda Disini)
      `;
    }

    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: systemInstruction,
      tools: tools,
    });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessageStream(prompt);

    // Set header agar client tahu ini adalah streaming text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      
      // Kirim data sebagai JSON string per baris agar mudah diparsing di frontend
      // Kita bungkus dalam JSON stringified
      const data = JSON.stringify({
        text: chunkText,
        groundingMetadata: groundingMetadata
      });
      
      res.write(data + "\n");
    }

    res.end();

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}