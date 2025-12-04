import React, { useState } from 'react';
import { Icon } from './Icon';

interface ColorPalettePanelProps {
  palettes: Record<string, string[]> | null;
  isLoading: boolean;
}

const PaletteRow: React.FC<{ title: string; colors: string[] }> = ({ title, colors }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div>
      <h4 className="font-semibold text-slate-300 text-sm mb-2">{title}</h4>
      <div className="flex gap-2 flex-wrap">
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => handleCopy(color)}
            className="w-10 h-10 rounded-md cursor-pointer border-2 border-transparent hover:border-white transition-all relative group"
            style={{ backgroundColor: color }}
            title={`Copiar ${color}`}
          >
            {copiedColor === color && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-sm">
                <Icon name="check-circle" className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ColorPalettePanel: React.FC<ColorPalettePanelProps> = ({ palettes, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-slate-400">
        <svg className="animate-spin h-5 w-5 mr-3 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Analisando cores...
      </div>
    );
  }

  if (!palettes) {
    return <p className="text-slate-400 text-sm">Não foi possível extrair uma paleta de cores vibrantes desta imagem. Tente com uma foto mais colorida.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(palettes).map(([name, colors]) => (
        <PaletteRow key={name} title={name} colors={colors} />
      ))}
    </div>
  );
};