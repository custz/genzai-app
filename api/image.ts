import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // PERBAIKAN: Menggunakan 'imagen-3.0-generate-001' karena 'gemini-2.5-flash-image'
    // seringkali memiliki limit 0 (tidak tersedia) untuk API Key gratis.
    const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    let base64Image = null;

    if (response.candidates && response.candidates.length > 0) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData && part.inlineData.data) {
            base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
         }
       }
    }

    if (base64Image) {
      res.status(200).json({ image: base64Image });
    } else {
      console.error("No image data in response:", JSON.stringify(response));
      res.status(500).json({ error: "Model tidak mengembalikan gambar. Kemungkinan limit akun tercapai." });
    }

  } catch (error: any) {
    console.error('Image Gen Error:', error);
    
    // Penanganan error khusus untuk kuota/limit
    if (error.status === 429 || error.message?.includes('429')) {
      return res.status(429).json({ 
        error: "Kuota habis atau model ini tidak tersedia di Free Tier akun Anda. Coba lagi nanti." 
      });
    }

    res.status(500).json({ error: error.message || "Gagal membuat gambar." });
  }
}