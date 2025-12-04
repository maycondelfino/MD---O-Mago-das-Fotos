import React from 'react';
import { ManualSlider } from './ManualSlider';
import { Icon } from './Icon';

interface SelectionPanelProps {
  brushSize: number;
  onBrushSizeChange: (value: number) => void;
  drawingMode: 'draw' | 'erase';
  onDrawingModeChange: (mode: 'draw' | 'erase') => void;
  onClear: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({ 
    brushSize, onBrushSizeChange, 
    drawingMode, onDrawingModeChange, 
    onClear, 
    onUndo, canUndo,
    onRedo, canRedo
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-30" title="Desfazer traço">
                <Icon name="undo" className="w-5 h-5"/>
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-30" title="Refazer traço">
                <Icon name="redo" className="w-5 h-5"/>
            </button>
        </div>
        
        <button
          onClick={() => onDrawingModeChange(drawingMode === 'draw' ? 'erase' : 'draw')}
          className="px-3 py-1.5 flex items-center gap-2 rounded-md text-sm transition-colors bg-slate-800 hover:bg-slate-700"
        >
          {drawingMode === 'draw' ? (
            <Icon name="brush" className="w-4 h-4 text-cyan-400" />
          ) : (
            <Icon name="eraser" className="w-4 h-4 text-rose-400" />
          )}
          <span className="text-slate-300">
             <span className="font-semibold text-white">{drawingMode === 'draw' ? 'Desenhar' : 'Apagar'}</span>
          </span>
          <Icon name="swap" className="w-4 h-4 text-slate-400 ml-1" />
        </button>
        
        <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold">
          Limpar
        </button>
      </div>
      <ManualSlider
        label="Tamanho do Pincel"
        value={brushSize}
        min={5}
        max={150}
        step={1}
        onChange={onBrushSizeChange}
        onCommit={() => {}} // No action here
        unit="px"
      />
    </div>
  );
};