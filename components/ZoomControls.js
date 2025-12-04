
import React from 'react';
import { Icon } from './Icon.js';

export const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onFitToScreen }) => {
  return (
    React.createElement("div", { className: "absolute bottom-4 right-4 z-10 flex items-center gap-1 glass-panel p-1 rounded-lg" },
      React.createElement("button", { onClick: onZoomOut, className: "p-2 rounded-md hover:bg-slate-700 transition-colors", title: "Afastar" },
        React.createElement(Icon, { name: "minus", className: "w-5 h-5" })
      ),
      React.createElement("span", { className: "text-sm font-mono w-16 text-center text-slate-200" }, Math.round(zoom * 100), "%"),
      React.createElement("button", { onClick: onZoomIn, className: "p-2 rounded-md hover:bg-slate-700 transition-colors", title: "Aproximar" },
        React.createElement(Icon, { name: "plus", className: "w-5 h-5" })
      ),
      React.createElement("div", { className: "w-px h-6 bg-slate-700 mx-1" }),
      React.createElement("button", { onClick: onFitToScreen, className: "p-2 rounded-md hover:bg-slate-700 transition-colors", title: "Ajustar \xE0 Tela" },
        React.createElement(Icon, { name: "maximize", className: "w-5 h-5" })
      )
    )
  );
};
