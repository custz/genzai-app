import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import { GeminiModel, Message } from './types';
import { streamGeminiResponse, generateImage, enhanceImagePrompt } from './services/geminiService';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  // Set default ke Gemini 2.5 Flash
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.FLASH_2_5);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    // Tambahkan pesan user
    const userMessage: Message = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Placeholder untuk pesan AI
    // Tambahkan flag isGeneratingImage jika model adalah FLASH_IMAGE_2_5
    const isImageGen = selectedModel === GeminiModel.FLASH_IMAGE_2_5;
    
    const aiMessagePlaceholder: Message = { 
      role: 'model', 
      text: '', 
      isStreaming: true, 
      isGeneratingImage: isImageGen,
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
      // LOGIKA UNTUK GAMBAR (Gemini 2.5 Flash Image)
      if (selectedModel === GeminiModel.FLASH_IMAGE_2_5) {
        // STEP 1: ENHANCE PROMPT DI BACKGROUND
        // Kita panggil enhanceImagePrompt untuk mempercantik detail permintaan user
        let promptToUse = text;
        try {
          promptToUse = await enhanceImagePrompt(text);
        } catch (e) {
          // Silent catch agar proses tidak berhenti jika enhancer gagal
          console.log("Background enhancer skipped");
        }

        // STEP 2: GENERATE IMAGE DENGAN PROMPT YANG SUDAH DISEMPURNAKAN
        try {
          const imageBase64 = await generateImage(promptToUse);

          if (imageBase64) {
            setMessages(prev => {
              const newMsgs = [...prev];
              const lastMsg = newMsgs[newMsgs.length - 1];
              if (lastMsg) {
                // Menampilkan prompt asli user, tapi hasil gambarnya dari prompt yang disempurnakan
                lastMsg.text = `Here is the generated image for: "${text}"`; 
                lastMsg.image = imageBase64;
                lastMsg.isGeneratingImage = false; // Stop loading state visual
              }
              return newMsgs;
            });
          } else {
             throw new Error("Gagal generate gambar (Tidak ada output gambar).");
          }
        } catch (imgError: any) {
          // Tangkap error spesifik dari backend image
          throw new Error(imgError.message || "Gagal membuat gambar.");
        }

      } else {
        // LOGIKA UNTUK TEKS (GEMINI FLASH/PRO)
        // Siapkan history untuk API
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        // Panggil stream service
        const stream = await streamGeminiResponse(selectedModel, text, history);

        let accumulatedText = "";

        // Loop untuk membaca stream dari @google/generative-ai
        for await (const chunk of stream) {
          const chunkText = chunk.text();
          
          // Tangkap Grounding Metadata (Search Results) jika ada
          const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;

          if (chunkText || groundingMetadata) {
            if (chunkText) accumulatedText += chunkText;
            
            setMessages(prev => {
              const newMsgs = [...prev];
              const lastMsg = newMsgs[newMsgs.length - 1];
              if (lastMsg.role === 'model') {
                lastMsg.text = accumulatedText;
                // Update metadata jika ada yang baru
                if (groundingMetadata) {
                  lastMsg.groundingMetadata = groundingMetadata;
                }
              }
              return newMsgs;
            });
          }
        }
      }

    } catch (error: any) {
      console.error("Failed to generate response", error);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.role === 'model') {
          // Tampilkan pesan error yang lebih informatif kepada user
          const isImageError = selectedModel === GeminiModel.FLASH_IMAGE_2_5;
          const errorMessage = error.message.replace('API Error:', '').trim();
          
          lastMsg.text = isImageError 
            ? `⚠️ Maaf, GenzAI tidak dapat membuat gambar saat ini.\n\n**Alasan:** ${errorMessage}\n\nSilakan coba prompt lain atau tunggu beberapa saat.`
            : "Maaf, terjadi kesalahan saat menghubungi GenzAI. Pastikan koneksi internet lancar atau coba model lain.";
          
          lastMsg.isGeneratingImage = false;
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg) lastMsg.isStreaming = false;
        return newMsgs;
      });
    }
  }, [messages, selectedModel]);

  const handleNewChat = () => {
    setMessages([]);
    setIsLoading(false);
    setIsSidebarOpen(false); // Tutup sidebar jika new chat diklik dari sana
  };

  const hasStarted = messages.length > 0;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-pink-100 selection:text-pink-900">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNewChat={handleNewChat}
      />

      <Header 
        onNewChat={handleNewChat} 
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
      
      {/* Main Content Area */}
      <main className="relative h-screen flex flex-col">
        {hasStarted && (
          <ChatInterface 
            messages={messages} 
            onSuggestionClick={(text) => handleSend(text)}
          />
        )}
      </main>

      {/* Input Area (Overlay) */}
      <InputArea 
        onSend={handleSend}
        isChatStarted={hasStarted}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
}

export default App;