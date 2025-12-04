import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

interface DuotonePanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const DuotonePanel: React.FC<DuotonePanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-around items-center">
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="duotoneColor1" className="text-sm font-medium text-slate-300">Cor Escura</label>
          <input
            id="duotoneColor1"
            type="color"
            value={state.duotoneColor1}
            onChange={(e) => onStateChange({ duotoneColor1: e.target.value })}
            onBlur={() => onCommit('Ajuste de Duotono')}
            className="custom-color-input"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="duotoneColor2" className="text-sm font-medium text-slate-300">Cor Clara</label>
          <input
            id="duotoneColor2"
            type="color"
            value={state.duotoneColor2}
            onChange={(e) => onStateChange({ duotoneColor2: e.target.value })}
            onBlur={() => onCommit('Ajuste de Duotono')}
            className="custom-color-input"
          />
        </div>
      </div>
      <ManualSlider
        label="Intensidade"
        value={state.duotoneIntensity}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ duotoneIntensity: val })}
        onCommit={() => onCommit('Ajuste de Duotono')}
        unit="%"
      />
    </div>
  );
};
