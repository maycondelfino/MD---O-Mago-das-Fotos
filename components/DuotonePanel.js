
import React from 'react';
import { ManualSlider } from './ManualSlider.js';

export const DuotonePanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement("div", { className: "flex justify-around items-center" },
        React.createElement("div", { className: "flex flex-col items-center gap-2" },
          React.createElement("label", { htmlFor: "duotoneColor1", className: "text-sm font-medium text-slate-300" }, "Cor Escura"),
          React.createElement("input", {
            id: "duotoneColor1",
            type: "color",
            value: state.duotoneColor1,
            onChange: (e) => onStateChange({ duotoneColor1: e.target.value }),
            onBlur: () => onCommit('Ajuste de Duotono'),
            className: "custom-color-input"
          })
        ),
        React.createElement("div", { className: "flex flex-col items-center gap-2" },
          React.createElement("label", { htmlFor: "duotoneColor2", className: "text-sm font-medium text-slate-300" }, "Cor Clara"),
          React.createElement("input", {
            id: "duotoneColor2",
            type: "color",
            value: state.duotoneColor2,
            onChange: (e) => onStateChange({ duotoneColor2: e.target.value }),
            onBlur: () => onCommit('Ajuste de Duotono'),
            className: "custom-color-input"
          })
        )
      ),
      React.createElement(ManualSlider, {
        label: "Intensidade",
        value: state.duotoneIntensity,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ duotoneIntensity: val }),
        onCommit: () => onCommit('Ajuste de Duotono'),
        unit: "%"
      })
    )
  );
};
