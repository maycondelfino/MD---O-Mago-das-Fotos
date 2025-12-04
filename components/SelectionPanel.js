
import React from 'react';
import { ManualSlider } from './ManualSlider.js';
import { Icon } from './Icon.js';

export const SelectionPanel = ({ 
    brushSize, onBrushSizeChange, 
    drawingMode, onDrawingModeChange, 
    onClear, 
    onUndo, canUndo,
    onRedo, canRedo
}) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement("div", { className: "flex flex-wrap justify-between items-center gap-3" },
        React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("button", { onClick: onUndo, disabled: !canUndo, className: "p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-30", title: "Desfazer tra\xE7o" },
                React.createElement(Icon, { name: "undo", className: "w-5 h-5" })
            ),
            React.createElement("button", { onClick: onRedo, disabled: !canRedo, className: "p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-30", title: "Refazer tra\xE7o" },
                React.createElement(Icon, { name: "redo", className: "w-5 h-5" })
            )
        ),
        
        React.createElement("button", {
          onClick: () => onDrawingModeChange(drawingMode === 'draw' ? 'erase' : 'draw'),
          className: "px-3 py-1.5 flex items-center gap-2 rounded-md text-sm transition-colors bg-slate-800 hover:bg-slate-700"
        },
          drawingMode === 'draw' ? (
            React.createElement(Icon, { name: "brush", className: "w-4 h-4 text-cyan-400" })
          ) : (
            React.createElement(Icon, { name: "eraser", className: "w-4 h-4 text-rose-400" })
          ),
          React.createElement("span", { className: "text-slate-300" },
             React.createElement("span", { className: "font-semibold text-white" }, drawingMode === 'draw' ? 'Desenhar' : 'Apagar')
          ),
          React.createElement(Icon, { name: "swap", className: "w-4 h-4 text-slate-400 ml-1" })
        ),
        
        React.createElement("button", { onClick: onClear, className: "text-xs text-red-400 hover:text-red-300 transition-colors font-semibold" },
          "Limpar"
        )
      ),
      React.createElement(ManualSlider, {
        label: "Tamanho do Pincel",
        value: brushSize,
        min: 5,
        max: 150,
        step: 1,
        onChange: onBrushSizeChange,
        onCommit: () => {}, // No action here
        unit: "px"
      })
    )
  );
};
