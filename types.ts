
export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string untuk gambar
  isStreaming?: boolean;
  isGeneratingImage?: boolean; // Penanda khusus proses generate image
  groundingMetadata?: any; // Data hasil Google Search
  timestamp: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  isNew?: boolean; // Penanda untuk badge "NEW"
}

export enum GeminiModel {
  FLASH_2_5 = 'gemini-2.5-flash',
  FLASH_2_0 = 'gemini-2.0-flash',
  FLASH_LITE_2_0 = 'gemini-2.0-flash-lite-preview',
  FLASH_IMAGE_2_5 = 'gemini-2.5-flash-image', // Mengganti Imagen 3
}
