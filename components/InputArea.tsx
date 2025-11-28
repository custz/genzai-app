
import React, { useState, useRef } from 'react';
import { ArrowUp, Paperclip, AudioLines, ChevronUp } from 'lucide-react';
import { GeminiModel } from '../types';
import { MODELS } from '../constants';
import ModelSelector from './ModelSelector';

interface InputAreaProps {
  onSend: (text: string) => void;
  isChatStarted: boolean;
  isLoading: boolean;
  selectedModel: GeminiModel;
  onSelectModel: (model: GeminiModel) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isChatStarted, isLoading, selectedModel, onSelectModel }) => {
  const [text, setText] = useState('');
  const [isModelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  // Posisi Container: Tengah jika belum mulai, Bawah jika sudah mulai
  const containerClass = isChatStarted
    ? "fixed bottom-8 left-0 right-0 px-4 transition-all duration-700 ease-in-out z-20"
    : "fixed top-1/2 left-0 right-0 -translate-y-1/2 px-4 transition-all duration-700 ease-in-out z-20";

  const modelName = MODELS.find(m => m.id === selectedModel)?.name || 'Genz 2.5 Pro';
  
  // Logic Placeholder Dinamis
  const placeholderText = selectedModel === GeminiModel.FLASH_IMAGE_2_5 
    ? "Describe the image you want to create..." 
    : "Message GenzAI...";

  return (
    <>
      <div className={containerClass}>
        <div className="max-w-2xl mx-auto w-full relative group">
          
          {/* Judul Besar (Hanya muncul saat di tengah) */}
          <div className={`text-center mb-8 transition-opacity duration-500 ${isChatStarted ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-[length:200%_auto] animate-gradient-x tracking-tight">
              GenzAI
            </h1>
            <p className="mt-3 text-gray-500 text-lg font-medium tracking-wide">
              Hello I'm GenzAI, how can I help you?
            </p>
          </div>

          {/* Glow Animation Container */}
          <div className="relative rounded-[2rem] p-[2px] transition-all duration-300">
            {/* The Pulsing Glow Border */}
            <div className="absolute inset-0 rounded-[2rem] bg-pink-500 opacity-20 blur-sm group-hover:opacity-30 animate-pulse transition-opacity duration-500"></div>
            
            {/* Main Input Box */}
            <div className="relative bg-white rounded-[1.9rem] shadow-xl border border-pink-100 flex flex-col overflow-hidden transition-shadow hover:shadow-pink-200">
              
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                rows={1}
                className="w-full p-4 pl-6 pr-16 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none overflow-hidden min-h-[60px] max-h-[150px] leading-relaxed"
                style={{ paddingTop: '1.2rem' }}
              />

              <div className="flex items-center justify-between px-2 pb-2 mt-1">
                <button 
                  onClick={() => setModelSelectorOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 rounded-full transition-colors ml-2 mb-2"
                >
                  {modelName}
                  <ChevronUp size={14} className="animate-bounce-slow" />
                </button>

                <div className="flex items-center gap-2 mr-2 mb-2">
                   <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                     <Paperclip size={20} />
                   </button>
                   <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                     <AudioLines size={20} />
                   </button>
                   <button 
                    onClick={handleSubmit}
                    disabled={!text.trim() || isLoading}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      text.trim() && !isLoading
                        ? 'bg-gray-900 text-white shadow-lg transform hover:scale-105 active:scale-95' 
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                   >
                     <ArrowUp size={20} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright - Fixed at bottom of screen, separate from input */}
      <div className={`fixed bottom-4 left-0 right-0 text-center transition-all duration-500 ${isChatStarted ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'} z-10`}>
         <p className="text-xs text-gray-400">2025 Custz | Indonesian Inc.</p>
      </div>

      <ModelSelector 
        isOpen={isModelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        currentModel={selectedModel}
        onSelectModel={onSelectModel}
      />
    </>
  );
};

export default InputArea;
