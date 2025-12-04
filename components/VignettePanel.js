

import React from 'react';
import { ManualSlider } from './ManualSlider.js';

export const VignettePanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement(ManualSlider, {
        label: "Intensidade",
        value: state.vignetteIntensity,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ vignetteIntensity: val }),
        onCommit: () => onCommit('Ajuste de Vinheta'),
        unit: "%"
      }),
      React.createElement(ManualSlider, {
        label: "Tamanho",
        value: state.vignetteSize,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ vignetteSize: val }),
        onCommit: () => onCommit('Ajuste de Vinheta'),
        unit: "%"
      })
    )
  );
};