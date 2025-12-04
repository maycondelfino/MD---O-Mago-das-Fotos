import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

interface FramePanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const FramePanel: React.FC<FramePanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label htmlFor="frameColor" className="text-sm font-medium text-slate-300">Cor da Moldura</label>
        <input
          id="frameColor"
          type="color"
          value={state.frameColor}
          onChange={(e) => onStateChange({ frameColor: e.target.value })}
          onBlur={() => onCommit('Ajuste de Moldura')}
          className="custom-color-input"
        />
      </div>
      <ManualSlider
        label="Espessura"
        value={state.frameThickness}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ frameThickness: val })}
        onCommit={() => onCommit('Ajuste de Moldura')}
        unit="px"
      />
      <ManualSlider
        label="Preenchimento"
        value={state.framePadding}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ framePadding: val })}
        onCommit={() => onCommit('Ajuste de Moldura')}
        unit="px"
      />
    </div>
  );
};