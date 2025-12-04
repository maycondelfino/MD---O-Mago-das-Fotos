import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tool } from '../types';
import { Icon } from './Icon';

// Slider component is defined here to avoid creating a new file
interface BeautySliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
  disabled?: boolean;
}

const BeautySlider: React.FC<BeautySliderProps> = ({ label, value, min = -100, max = 100, onChange, onCommit, disabled }) => {
  const isZeroCentered = min < 0;

  // Calculate percentage
  const totalRange = max - min;
  const valuePercentage = totalRange === 0 ? 0 : ((value - min) / totalRange) * 100;
  
  const backgroundStyle = isZeroCentered
    ? value > 0
      ? `linear-gradient(to right, #1e293b 50%, #8b5cf6 50%, #8b5cf6 ${valuePercentage}%, #1e293b ${valuePercentage}%)`
      : value < 0
      ? `linear-gradient(to right, #1e293b ${valuePercentage}%, #4f46e5 ${valuePercentage}%, #4f46e5 50%, #1e293b 50%)`
    // Ensure gradient is visible for 0 value in zero-centered sliders
    : `linear-gradient(to right, #1e293b 0%, #1e293b 100%)`
    : `linear-gradient(to right, #8b5cf6 ${valuePercentage}%, #1e293b ${valuePercentage}%)`;

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <div className="flex justify-between items-center">
        <label className="font-medium text-slate-300 uppercase tracking-wider text-xs">{label}</label>
        <span className="text-xs font-mono bg-slate-800/80 text-slate-200 px-2 py-1 rounded-md w-12 text-center">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        disabled={disabled}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer custom-slider disabled:opacity-50"
        style={{ background: backgroundStyle }}
      />
    </div>
  );
};


interface BeautyAdjustment {
  label: string;
  feature: string;
  min?: number;
  promptIntensity?: string;
}

// Removed adjustments that alter facial geometry to comply with user's request
const adjustments: BeautyAdjustment[] = [
    { label: 'Suavizar Pele', feature: 'skinSmoothing', min: 0, promptIntensity: 'suavize a textura da pele do rosto em {value}%, reduzindo imperfeições e poros, mantendo um aspecto natural e não plastificado' },
    { label: 'Suavizar Rugas', feature: 'wrinkles', min: 0, promptIntensity: 'suavize as rugas e linhas de expressão do rosto em {value}%, mantendo um aspecto natural' },
    { label: 'Remover Olheira', feature: 'darkCircles', min: 0, promptIntensity: 'remova {value}% das olheiras e bolsas sob os olhos, clareando a área de forma suave' },
    { label: 'Cor dos Lábios', feature: 'lipColor', min: 0, promptIntensity: 'aplique um tom de batom vermelho sutil nos lábios com {value}% de intensidade' },
    { label: 'Preencher Barba', feature: 'fillBeard', min: 0, promptIntensity: 'preencha as falhas na barba para que pareça {value}% mais cheia e uniforme' },
    { label: 'Preencher Sobrancelha', feature: 'fillEyebrows', min: 0, promptIntensity: 'preencha e defina as sobrancelhas para parecerem {value}% mais cheias e simétricas' },
];

interface BeautyPanelProps {
  onAiEdit: (prompt: string, tool: Tool) => void;
  isLoading: boolean;
  selectedTool: Tool;
}

export const BeautyPanel: React.FC<BeautyPanelProps> = ({ onAiEdit, isLoading, selectedTool }) => {
  const [values, setValues] = useState<Record<string, number>>(
    adjustments.reduce((acc, adj) => ({ ...acc, [adj.feature]: 0 }), {})
  );
  const [hairColorDescription, setHairColorDescription] = useState<string>('');
  const debounceTimeoutRef = useRef<number | null>(null);

  const generateAndApplyPrompt = useCallback(() => {
    const promptParts: string[] = [];

    adjustments.forEach(adjustment => {
        const value = values[adjustment.feature];
        if (value === 0) return;

        let part = '';
        if (adjustment.promptIntensity) {
            part = adjustment.promptIntensity.replace('{value}', `${Math.abs(value)}`);
        }
        
        if (part) {
            promptParts.push(part);
        }
    });

    if (hairColorDescription.trim()) {
      promptParts.push(`mude a cor do cabelo para "${hairColorDescription.trim()}"`);
    }

    if (promptParts.length > 0) {
        const fullPrompt = "Aplique reparos e retoques de beleza na imagem. É crucial que as feições e proporções do rosto da pessoa NÃO sejam alteradas. Os ajustes devem ser naturais e sutis, focando apenas em aprimoramentos. Aqui estão os retoques solicitados: " + promptParts.join(', ') + ".";
        onAiEdit(fullPrompt, selectedTool);
    }
  }, [values, hairColorDescription, onAiEdit, selectedTool]);

  useEffect(() => {
    const hasActiveAdjustments = Object.values(values).some(v => v !== 0) || hairColorDescription.trim() !== '';

    if (!hasActiveAdjustments || isLoading) {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        return;
    }

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    debounceTimeoutRef.current = window.setTimeout(() => {
        generateAndApplyPrompt();
    }, 800);

    return () => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [values, hairColorDescription, isLoading, generateAndApplyPrompt]);

  const handleChange = (feature: string, value: number) => {
    setValues(prev => ({ ...prev, [feature]: value }));
  };
  
  const handleHairColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHairColorDescription(e.target.value);
  };

  const handleReset = () => {
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }
    setValues(adjustments.reduce((acc, adj) => ({ ...acc, [adj.feature]: 0 }), {}));
    setHairColorDescription('');
    onAiEdit('', selectedTool);
  };

  const hasChanges = Object.values(values).some(v => v !== 0) || hairColorDescription.trim() !== '';

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center gap-3 justify-end">
        <button
          onClick={handleReset}
          disabled={isLoading || !hasChanges}
          className="p-3 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Resetar todos os ajustes"
        >
          <Icon name="trash" className="w-5 h-5" />
        </button>
      </div>

      <hr className="border-slate-700/50" />
      
      {adjustments.map(adj => (
        <BeautySlider
          key={adj.feature}
          label={adj.label}
          value={values[adj.feature]}
          min={adj.min}
          max={100}
          onChange={(v) => handleChange(adj.feature, v)}
          disabled={isLoading}
        />
      ))}

      <div className="flex flex-col gap-1.5 text-sm">
        <label htmlFor="hair-color-description" className="font-medium text-slate-300 uppercase tracking-wider text-xs">Cor do Cabelo</label>
        <div className="flex gap-2">
            <input
                id="hair-color-description"
                type="text"
                value={hairColorDescription}
                onChange={handleHairColorChange}
                placeholder="Ex: loiro platinado, azul vibrante"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                disabled={isLoading}
            />
            {hairColorDescription.trim() && (
                <button
                    onClick={() => setHairColorDescription('')}
                    disabled={isLoading}
                    className="p-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Limpar cor do cabelo"
                >
                    <Icon name="x-circle" className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};