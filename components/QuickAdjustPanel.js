
import React from 'react';
import { ManualSlider } from './ManualSlider.js';

// Mapeia o valor da UI (-100 a 100) para o valor do estado (0 a 200)
const uiToState = (uiValue) => uiValue + 100;
const stateToUi = (stateValue) => stateValue - 100;

export const QuickAdjustPanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4 p-1" },
      React.createElement(ManualSlider, {
        label: "Brilho",
        value: stateToUi(state.brightness),
        min: -100,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ brightness: uiToState(val) }),
        onCommit: () => onCommit('Ajuste de Brilho'),
        unit: ""
      }),
      React.createElement(ManualSlider, {
        label: "Contraste",
        value: stateToUi(state.contrast),
        min: -100,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ contrast: uiToState(val) }),
        onCommit: () => onCommit('Ajuste de Contraste'),
        unit: ""
      }),
      React.createElement(ManualSlider, {
        label: "Sombras",
        value: state.shadows,
        min: -100,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ shadows: val }),
        onCommit: () => onCommit('Ajuste de Sombras'),
        unit: ""
      })
    )
  );
};
