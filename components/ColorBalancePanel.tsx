import React, { useState } from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState, ColorBalanceValue } from '../types';
import { AccordionSection } from './AccordionSection';

interface ColorBalancePanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

type ToneRange = 'shadows' | 'midtones' | 'highlights';

const ToneRangeSection: React.FC<{
  toneRange: ToneRange;
  value: ColorBalanceValue;
  onStateChange: (toneRange: ToneRange, newValue: ColorBalanceValue) => void;
  onCommit: (actionName: string) => void;
}> = ({ toneRange, value, onStateChange, onCommit }) => {
    
    const { color, intensity } = value;

    return (
        <div className="flex flex-col gap-4 px-1 pt-2">
            <div className="flex items-center justify-between">
                <label htmlFor={`${toneRange}-color`} className="text-sm font-medium text-slate-300">Cor do Tom</label>
                <input
                    id={`${toneRange}-color`}
                    type="color"
                    value={color}
                    onChange={(e) => onStateChange(toneRange, { ...value, color: e.target.value })}
                    onBlur={() => onCommit('Ajuste de Balanço de Cores')}
                    className="custom-color-input"
                />
            </div>
            <ManualSlider
                label="Intensidade"
                value={intensity}
                min={0}
                max={100}
                unit="%"
                onChange={(val) => onStateChange(toneRange, { ...value, intensity: val })}
                onCommit={() => onCommit('Ajuste de Balanço de Cores')}
            />
        </div>
    );
};


export const ColorBalancePanel: React.FC<ColorBalancePanelProps> = ({ state, onStateChange, onCommit }) => {
  const [openToneRange, setOpenToneRange] = useState<Record<string, boolean>>({
    'Sombras': true,
    'Tons Médios': false,
    'Realces': false,
  });

  const toggleToneRange = (range: string) => {
    setOpenToneRange(prev => ({ ...prev, [range]: !prev[range] }));
  };

  const handleToneRangeChange = (toneRange: ToneRange, newValue: ColorBalanceValue) => {
    onStateChange({
        colorBalance: {
            ...state.colorBalance,
            [toneRange]: newValue,
        },
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <AccordionSection
        title="Sombras"
        isOpen={openToneRange['Sombras']}
        onToggle={() => toggleToneRange('Sombras')}
      >
        <ToneRangeSection
          toneRange="shadows"
          value={state.colorBalance.shadows}
          onStateChange={handleToneRangeChange}
          onCommit={onCommit}
        />
      </AccordionSection>
      <AccordionSection
        title="Tons Médios"
        isOpen={openToneRange['Tons Médios']}
        onToggle={() => toggleToneRange('Tons Médios')}
      >
        <ToneRangeSection
          toneRange="midtones"
          value={state.colorBalance.midtones}
          onStateChange={handleToneRangeChange}
          onCommit={onCommit}
        />
      </AccordionSection>
      <AccordionSection
        title="Realces"
        isOpen={openToneRange['Realces']}
        onToggle={() => toggleToneRange('Realces')}
      >
        <ToneRangeSection
          toneRange="highlights"
          value={state.colorBalance.highlights}
          onStateChange={handleToneRangeChange}
          onCommit={onCommit}
        />
      </AccordionSection>
    </div>
  );
};