import React, { useEffect, useRef } from 'react';
import { Tool } from '../types';
import { ManualSlider } from './ManualSlider';

interface StylizePanelProps {
  selectedTool: Tool;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  onAiEdit: (prompt: string, tool: Tool) => void;
  isLoading: boolean;
}

export const StylizePanel: React.FC<StylizePanelProps> = ({
  selectedTool,
  prompt,
  onPromptChange,
  intensity,
  onIntensityChange,
  onAiEdit,
  isLoading,
}) => {
  const styles = selectedTool.predefinedStyles || [];
  const selectedStylePrompt = styles.find(s => s.prompt === prompt)?.prompt || styles[0]?.prompt || '';
  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Efeito para definir o prompt inicial quando a ferramenta é selecionada
  useEffect(() => {
      if (styles.length > 0 && (!prompt || !styles.some(s => s.prompt === prompt))) {
          onPromptChange(styles[0].prompt);
      }
      isInitialMount.current = true; // Reset on tool change
  }, [selectedTool.id]);

  // Efeito para aplicar o estilo com debounce quando o estilo ou a intensidade mudam
  useEffect(() => {
    // Evita a execução no carregamento inicial do componente
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    if (isLoading || !prompt) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const finalPrompt = `${prompt} com ${intensity}% de intensidade.`;
      onAiEdit(finalPrompt, selectedTool);
    }, 800); // 800ms de debounce para evitar chamadas excessivas à API

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [prompt, intensity, onAiEdit, selectedTool, isLoading]);

  return (
    <div className={`flex flex-col gap-4 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
      <div>
        <label htmlFor="style-select" className="block text-sm font-medium text-slate-300 mb-2">Estilo Artístico</label>
        <select
          id="style-select"
          value={selectedStylePrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          disabled={isLoading}
        >
          {styles.map(style => (
            <option key={style.name} value={style.prompt}>{style.name}</option>
          ))}
        </select>
      </div>
      <ManualSlider
        label="Intensidade do Estilo"
        value={intensity}
        min={10}
        max={100}
        step={5}
        onChange={onIntensityChange}
        onCommit={() => {}} // Nenhuma ação necessária, o debounce cuida disso
        unit="%"
        disabled={isLoading}
      />
      {isLoading && (
        <div className="flex items-center justify-center text-sm text-slate-400 gap-2 mt-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Estilizando...</span>
        </div>
      )}
    </div>
  );
};