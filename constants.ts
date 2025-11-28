
import { GeminiModel, ModelOption } from './types';

export const MODELS: ModelOption[] = [
  {
    id: GeminiModel.FLASH_2_5,
    name: 'Genz 2.5 Pro', // Renamed from Gemini 2.5 Flash
    description: 'Model utama GenzAI. Seimbang, cerdas, dan responsif.',
    isNew: true,
  },
  {
    id: GeminiModel.FLASH_2_0,
    name: 'Genz 2.0 Flash', // Renamed from Gemini 2.0 Flash
    description: 'Kemampuan reasoning tingkat lanjut untuk tugas kompleks.',
  },
  {
    id: GeminiModel.FLASH_LITE_2_0,
    name: 'Genz 2.0 Lite', // Renamed from Gemini 2.0 Flash Lite
    description: 'Versi paling ringan untuk kecepatan respons maksimal.',
  },
  {
    id: GeminiModel.FLASH_IMAGE_2_5,
    name: 'Genz Imagen', // Renamed from Gemini 2.5 Flash Image
    description: 'Model multimodal terbaru untuk membuat gambar.',
    isNew: true,
  },
];

export const SUGGESTIONS = [
  "Jelaskan teori relativitas",
  "Buatkan puisi senja",
  "Gambarkan suasana kota cyberpunk",
  "Tips produktivitas kerja"
];
