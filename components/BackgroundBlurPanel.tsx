import React, { useState, useEffect, useRef } from 'react';
import { Tool } from '../types';
import { ManualSlider } from './ManualSlider';

interface BackgroundBlurPanelProps {
  onAiEdit: (prompt: string, tool: Tool) => void;
  isLoading: boolean;
  selectedTool: Tool;
}

export const BackgroundBlurPanel: React.FC<BackgroundBlurPanelProps> = ({ onAiEdit, isLoading, selectedTool }) => {
  const [intensity, setIntensity] = useState(75);
  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    isInitialMount.current = true;
  }, [selectedTool.id]);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    if (isLoading) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const prompt = `Aplique um efeito de foco de retrato com ${intensity}% de intensidade de desfoque, mantendo o assunto principal nítido`;
      onAiEdit(prompt, selectedTool);
    }, 800); // Tempo de debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [intensity, onAiEdit, selectedTool, isLoading]);

  return (
    <div className="flex flex-col gap-4">
      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        <ManualSlider
          label="Intensidade"
          value={intensity}
          min={0}
          max={100}
          step={5}
          onChange={setIntensity}
          onCommit={() => {}}
          unit="%"
        />
      </div>
       {isLoading && (
            <div className="flex items-center justify-center text-sm text-slate-400 gap-2 mt-2">
                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Aplicando foco de retrato...</span>
            </div>
          )}
    </div>
  );
};