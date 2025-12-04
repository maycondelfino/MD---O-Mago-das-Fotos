import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

interface VignettePanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const VignettePanel: React.FC<VignettePanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4">
      <ManualSlider
        label="Intensidade"
        value={state.vignetteIntensity}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ vignetteIntensity: val })}
        onCommit={() => onCommit('Ajuste de Vinheta')}
        unit="%"
      />
      <ManualSlider
        label="Tamanho"
        value={state.vignetteSize}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ vignetteSize: val })}
        onCommit={() => onCommit('Ajuste de Vinheta')}
        unit="%"
      />
    </div>
  );
};
