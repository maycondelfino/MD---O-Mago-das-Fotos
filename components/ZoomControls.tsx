import React from 'react';
import { Icon } from './Icon';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut, onFitToScreen }) => {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 glass-panel p-1 rounded-lg">
      <button onClick={onZoomOut} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="Afastar">
        <Icon name="minus" className="w-5 h-5" />
      </button>
      <span className="text-sm font-mono w-16 text-center text-slate-200">{Math.round(zoom * 100)}%</span>
      <button onClick={onZoomIn} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="Aproximar">
        <Icon name="plus" className="w-5 h-5" />
      </button>
      <div className="w-px h-6 bg-slate-700 mx-1"></div>
      <button onClick={onFitToScreen} className="p-2 rounded-md hover:bg-slate-700 transition-colors" title="Ajustar à Tela">
        <Icon name="maximize" className="w-5 h-5" />
      </button>
    </div>
  );
};
