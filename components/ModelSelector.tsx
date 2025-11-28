
import React from 'react';
import { MODELS } from '../constants';
import { Check, X } from 'lucide-react';
import { GeminiModel } from '../types';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onSelectModel: (modelId: GeminiModel) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ isOpen, onClose, currentModel, onSelectModel }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Slide-up Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-2xl z-50 p-6 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Pilih Model</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelectModel(model.id as GeminiModel);
                onClose();
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start justify-between group
                ${currentModel === model.id 
                  ? 'border-pink-500 bg-pink-50/50 shadow-sm ring-1 ring-pink-500/20' 
                  : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'}`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${currentModel === model.id ? 'text-pink-600' : 'text-gray-800'}`}>
                    {model.name}
                  </span>
                  {model.isNew && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full uppercase tracking-wider shadow-sm">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 leading-relaxed">
                  {model.description}
                </div>
              </div>
              {currentModel === model.id && (
                <div className="mt-1 text-pink-500">
                  <Check size={20} />
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="h-4" /> {/* Spacer bottom */}
      </div>
    </>
  );
};

export default ModelSelector;
