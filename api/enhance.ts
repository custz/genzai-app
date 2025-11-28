import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-preview' });
    
    const instruction = `You are a professional AI Prompt Engineer. 
    Your task is to rewrite the following user input into a highly detailed, artistic, and descriptive image generation prompt (in English). 
    
    Rules:
    1. Analyze the core subject of the user's request.
    2. Add details about lighting (e.g., cinematic, golden hour, neon), style (e.g., photorealistic, 3D render, oil painting), composition, and texture.
    3. If the input is simple (e.g., "cat"), make it amazing (e.g., "A majestic fluffy cat sitting on a velvet pillow, cinematic lighting, 8k resolution, photorealistic").
    4. ONLY return the enhanced prompt string. Do not add conversational text.
    5. If the input is in Indonesian, translate the intent to English first.
    
    User Input: "${prompt}"`;

    const result = await model.generateContent(instruction);
    const enhancedText = result.response.text();
    
    res.status(200).json({ enhancedText });

  } catch (error: any) {
    console.error('Enhance Error:', error);
    // Fallback ke prompt asli jika error
    res.status(200).json({ enhancedText: prompt });
  }
}