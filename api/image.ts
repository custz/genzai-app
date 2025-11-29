import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // PENTING: Gunakan 'imagen-3.0-generate-001' secara eksplisit.
    // Model 'gemini-2.5-flash-image' seringkali memiliki limit 0 pada akun Free Tier.
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
      // Fallback pesan jika tidak ada gambar
      res.status(500).json({ error: "Gagal mendapatkan data gambar dari model." });
    }

  } catch (error: any) {
    console.error('Image Gen Error:', error);
    
    // Deteksi error spesifik untuk kuota/limit atau model tidak tersedia
    const errorMsg = error.message || '';
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('limit') || errorMsg.includes('Quota')) {
      return res.status(429).json({ 
        error: "Model gambar sedang sibuk atau limit akun tercapai. Silakan coba lagi nanti." 
      });
    }

    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      return res.status(404).json({
        error: "Model gambar tidak ditemukan atau API Key tidak memiliki akses ke Imagen 3."
      });
    }

    res.status(500).json({ error: error.message || "Gagal membuat gambar." });
  }
}