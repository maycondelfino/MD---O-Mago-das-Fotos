
import React from 'react';
import { ManualSlider } from './ManualSlider.js';

export const GradientFilterPanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement("div", { className: "flex justify-around items-center" },
        React.createElement("div", { className: "flex flex-col items-center gap-2" },
          React.createElement("label", { htmlFor: "gradientStartColor", className: "text-sm font-medium text-slate-300" }, "In\xEDcio"),
          React.createElement("input", {
            id: "gradientStartColor",
            type: "color",
            value: state.gradientStartColor,
            onChange: (e) => onStateChange({ gradientStartColor: e.target.value }),
            onBlur: () => onCommit('Ajuste de Gradiente'),
            className: "custom-color-input"
          })
        ),
        React.createElement("div", { className: "flex flex-col items-center gap-2" },
          React.createElement("label", { htmlFor: "gradientEndColor", className: "text-sm font-medium text-slate-300" }, "Fim"),
          React.createElement("input", {
            id: "gradientEndColor",
            type: "color",
            value: state.gradientEndColor,
            onChange: (e) => onStateChange({ gradientEndColor: e.target.value }),
            onBlur: () => onCommit('Ajuste de Gradiente'),
            className: "custom-color-input"
          })
        )
      ),
      React.createElement(ManualSlider, {
        label: "Intensidade",
        value: state.gradientIntensity,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ gradientIntensity: val }),
        onCommit: () => onCommit('Ajuste de Gradiente'),
        unit: "%"
      })
    )
  );
};
