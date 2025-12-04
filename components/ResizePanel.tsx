import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface ResizePanelProps {
  currentWidth: number;
  currentHeight: number;
  onResize: (newWidth: number, newHeight: number) => void;
}

export const ResizePanel: React.FC<ResizePanelProps> = ({ currentWidth, currentHeight, onResize }) => {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const aspectRatio = currentWidth / currentHeight;

  useEffect(() => {
    setWidth(currentWidth);
    setHeight(currentHeight);
  }, [currentWidth, currentHeight]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10) || 0;
    setWidth(newWidth);
    if (keepAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10) || 0;
    setHeight(newHeight);
    if (keepAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleResizeClick = () => {
    if (width > 0 && height > 0) {
      onResize(width, height);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="width" className="block text-sm font-medium text-slate-300 mb-1">Largura (px)</label>
          <input
            type="number"
            id="width"
            value={width}
            onChange={handleWidthChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-1">Altura (px)</label>
          <input
            type="number"
            id="height"
            value={height}
            onChange={handleHeightChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="aspectRatio"
          checked={keepAspectRatio}
          onChange={(e) => setKeepAspectRatio(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="aspectRatio" className="text-sm text-slate-300">Manter proporção</label>
      </div>
      <button
        onClick={handleResizeClick}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
      >
        Aplicar Redimensionamento
      </button>
    </div>
  );
};