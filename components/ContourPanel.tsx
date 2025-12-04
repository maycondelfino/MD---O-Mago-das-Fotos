import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

interface ContourPanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const ContourPanel: React.FC<ContourPanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4">
      <ManualSlider
        label="Intensidade"
        value={state.contour}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ contour: val })}
        onCommit={() => onCommit('Ajuste de Contorno')}
        unit="%"
      />
    </div>
  );
};