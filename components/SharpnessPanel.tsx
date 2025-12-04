import React from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';

interface SharpnessPanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const SharpnessPanel: React.FC<SharpnessPanelProps> = ({ state, onStateChange, onCommit }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm">
          <label className="font-medium text-slate-300">Modo</label>
          <div className="flex gap-1 bg-slate-800 p-0.5 rounded-md">
            <button
              onClick={() => onStateChange({ sharpnessMode: 'edge' })}
              className={`px-3 py-1 text-xs rounded-md ${state.sharpnessMode === 'edge' ? 'bg-violet-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              Bordas
            </button>
            <button
              onClick={() => onStateChange({ sharpnessMode: 'clarity' })}
              className={`px-3 py-1 text-xs rounded-md ${state.sharpnessMode === 'clarity' ? 'bg-violet-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              Clareza
            </button>
          </div>
        </div>
      </div>
      <ManualSlider
        label="Intensidade"
        value={state.sharpness}
        min={0}
        max={100}
        step={1}
        onChange={(val) => onStateChange({ sharpness: val })}
        onCommit={() => onCommit('Ajuste de Nitidez')}
        unit="%"
      />
    </div>
  );
};
