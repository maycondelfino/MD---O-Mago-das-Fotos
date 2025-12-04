
import React from 'react';
import { ManualSlider } from './ManualSlider.js';

export const ContourPanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement(ManualSlider, {
        label: "Intensidade",
        value: state.contour,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ contour: val }),
        onCommit: () => onCommit('Ajuste de Contorno'),
        unit: "%"
      })
    )
  );
};
