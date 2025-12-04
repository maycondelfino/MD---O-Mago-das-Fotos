import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

// Mapeia o valor da UI (-100 a 100) para o valor do estado (0 a 200)
const uiToState = (uiValue: number) => uiValue + 100;
const stateToUi = (stateValue: number) => stateValue - 100;

interface QuickAdjustPanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const QuickAdjustPanel: React.FC<QuickAdjustPanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4 p-1">
      <ManualSlider
        label="Brilho"
        value={stateToUi(state.brightness)}
        min={-100}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ brightness: uiToState(val) })}
        onCommit={() => onCommit('Ajuste de Brilho')}
        unit=""
      />
      <ManualSlider
        label="Contraste"
        value={stateToUi(state.contrast)}
        min={-100}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ contrast: uiToState(val) })}
        onCommit={() => onCommit('Ajuste de Contraste')}
        unit=""
      />
      <ManualSlider
        label="Sombras"
        value={state.shadows}
        min={-100}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ shadows: val })}
        onCommit={() => onCommit('Ajuste de Sombras')}
        unit=""
      />
    </div>
  );
};
