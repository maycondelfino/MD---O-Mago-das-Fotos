import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

interface FiltersPanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4">
      <ManualSlider
        label="Sépia"
        value={state.sepia}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ sepia: val })}
        onCommit={() => onCommit('Filtro Sépia')}
        unit="%"
      />
      <ManualSlider
        label="Vintage"
        value={state.vintage}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ vintage: val })}
        onCommit={() => onCommit('Filtro Vintage')}
        unit="%"
      />
    </div>
  );
};
