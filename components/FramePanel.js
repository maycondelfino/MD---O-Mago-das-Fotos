
import React from 'react';
import { ManualSlider } from './ManualSlider.js';

export const FramePanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement("div", { className: "flex items-center justify-between" },
        React.createElement("label", { htmlFor: "frameColor", className: "text-sm font-medium text-slate-300" }, "Cor da Moldura"),
        React.createElement("input", {
          id: "frameColor",
          type: "color",
          value: state.frameColor,
          onChange: (e) => onStateChange({ frameColor: e.target.value }),
          onBlur: () => onCommit('Ajuste de Moldura'),
          className: "custom-color-input"
        })
      ),
      React.createElement(ManualSlider, {
        label: "Espessura",
        value: state.frameThickness,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ frameThickness: val }),
        onCommit: () => onCommit('Ajuste de Moldura'),
        unit: "px"
      }),
      React.createElement(ManualSlider, {
        label: "Preenchimento",
        value: state.framePadding,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ framePadding: val }),
        onCommit: () => onCommit('Ajuste de Moldura'),
        unit: "px"
      })
    )
  );
};
