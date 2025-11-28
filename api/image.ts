import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // Gunakan model gemini-2.5-flash-image
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
    
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
      res.status(500).json({ error: "No image data returned from model" });
    }

  } catch (error: any) {
    console.error('Image Gen Error:', error);
    res.status(500).json({ error: error.message });
  }
}