import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

interface GradientFilterPanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const GradientFilterPanel: React.FC<GradientFilterPanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-around items-center">
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="gradientStartColor" className="text-sm font-medium text-slate-300">Início</label>
          <input
            id="gradientStartColor"
            type="color"
            value={state.gradientStartColor}
            onChange={(e) => onStateChange({ gradientStartColor: e.target.value })}
            onBlur={() => onCommit('Ajuste de Gradiente')}
            className="custom-color-input"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="gradientEndColor" className="text-sm font-medium text-slate-300">Fim</label>
          <input
            id="gradientEndColor"
            type="color"
            value={state.gradientEndColor}
            onChange={(e) => onStateChange({ gradientEndColor: e.target.value })}
            onBlur={() => onCommit('Ajuste de Gradiente')}
            className="custom-color-input"
          />
        </div>
      </div>
      <ManualSlider
        label="Intensidade"
        value={state.gradientIntensity}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ gradientIntensity: val })}
        onCommit={() => onCommit('Ajuste de Gradiente')}
        unit="%"
      />
    </div>
  );
};