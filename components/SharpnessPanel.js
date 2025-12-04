
import React from 'react';
import { ManualSlider } from './ManualSlider.js';

export const SharpnessPanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement("div", { className: "flex flex-col gap-2" },
        React.createElement("div", { className: "flex justify-between items-center text-sm" },
          React.createElement("label", { className: "font-medium text-slate-300" }, "Modo"),
          React.createElement("div", { className: "flex gap-1 bg-slate-800 p-0.5 rounded-md" },
            React.createElement("button", {
              onClick: () => onStateChange({ sharpnessMode: 'edge' }),
              className: `px-3 py-1 text-xs rounded-md ${state.sharpnessMode === 'edge' ? 'bg-violet-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`
            },
              "Bordas"
            ),
            React.createElement("button", {
              onClick: () => onStateChange({ sharpnessMode: 'clarity' }),
              className: `px-3 py-1 text-xs rounded-md ${state.sharpnessMode === 'clarity' ? 'bg-violet-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`
            },
              "Clareza"
            )
          )
        )
      ),
      React.createElement(ManualSlider, {
        label: "Intensidade",
        value: state.sharpness,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ sharpness: val }),
        onCommit: () => onCommit('Ajuste de Nitidez'),
        unit: "%"
      })
    )
  );
};
