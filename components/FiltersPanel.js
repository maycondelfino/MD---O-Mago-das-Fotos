
import React from 'react';
import { ManualSlider } from './ManualSlider.js';

export const FiltersPanel = ({ state, onStateChange, onCommit }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement(ManualSlider, {
        label: "S\xE9pia",
        value: state.sepia,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ sepia: val }),
        onCommit: () => onCommit('Filtro Sépia'),
        unit: "%"
      }),
      React.createElement(ManualSlider, {
        label: "Vintage",
        value: state.vintage,
        min: 0,
        max: 100,
        step: 1,
        onChange: (val) => onStateChange({ vintage: val }),
        onCommit: () => onCommit('Filtro Vintage'),
        unit: "%"
      })
    )
  );
};
