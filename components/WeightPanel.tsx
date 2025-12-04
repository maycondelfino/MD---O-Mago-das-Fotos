import React, { useState, useEffect, useRef } from 'react';
import { Tool } from '../types';
import { ManualSlider } from './ManualSlider';
import { Icon } from './Icon';

interface WeightPanelProps {
  onAiEdit: (prompt: string, tool: Tool) => void;
  isLoading: boolean;
  selectedTool: Tool;
}

export const WeightPanel: React.FC<WeightPanelProps> = ({ onAiEdit, isLoading, selectedTool }) => {
  const [weightChange, setWeightChange] = useState(0);
  const debounceTimeoutRef = useRef<number | null>(null);

  const generatePrompt = (value: number): string => {
    if (value === 0) return '';
    const action = value > 0 ? 'parecer mais pesada' : 'parecer mais magra';
    const kg = Math.abs(value);
    const plural = kg === 1 ? 'kg' : 'kgs';
    return `Faça a pessoa na foto ${action} em aproximadamente ${kg} ${plural}, ajustando o corpo de forma fotorrealista e proporcional. Mantenha as feições do rosto e a identidade da pessoa.`;
  };

  useEffect(() => {
    if (isLoading) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (weightChange !== 0) {
        debounceTimeoutRef.current = window.setTimeout(() => {
            const prompt = generatePrompt(weightChange);
            if (prompt) {
                onAiEdit(prompt, selectedTool);
            }
        }, 800);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [weightChange, onAiEdit, selectedTool, isLoading]);
  
  const handleReset = () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      setWeightChange(0);
      onAiEdit('', selectedTool);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        <div className="flex items-center gap-3 justify-end">
            <button
                onClick={handleReset}
                disabled={isLoading || weightChange === 0}
                className="p-3 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Resetar ajuste de peso"
            >
                <Icon name="trash" className="w-5 h-5" />
            </button>
        </div>
        <ManualSlider
          label="Ajuste de Peso"
          value={weightChange}
          min={-50}
          max={50}
          step={1}
          onChange={setWeightChange}
          onCommit={() => {}} // Debounce handles commit
          unit=" kg"
        />
      </div>
       {isLoading && (
            <div className="flex items-center justify-center text-sm text-slate-400 gap-2 mt-2">
                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Ajustando o peso...</span>
            </div>
       )}
    </div>
  );
};