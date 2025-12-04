

import React, { useState } from 'react';
import { ManualSlider } from './ManualSlider.js';
import { AccordionSection } from './AccordionSection.js';
import { ToneCurveEditor } from './ToneCurveEditor.js';

// Mapeia o valor da UI (-100 a 100) para o valor do estado (0 a 200)
const uiToState = (uiValue) => uiValue + 100;
const stateToUi = (stateValue) => stateValue - 100;

// Mapeia o valor da UI de matiz (-100 a 100) para o valor do estado (-180 a 180 graus)
const uiToHueState = (uiValue) => uiValue * 1.8;
const hueStateToUi = (stateValue) => stateValue / 1.8;

export const AdjustColorsPanel = ({ state, onStateChange, onCommit }) => {
  const [openAdjustment, setOpenAdjustment] = useState({
    'Basicos': true,
    'Curvas': false,
  });
  const [activeCurve, setActiveCurve] = useState('rgb');

  const toggleAdjustment = (adj) => {
    setOpenAdjustment(prev => ({ ...prev, [adj]: !prev[adj] }));
  };

  return (
    React.createElement("div", { className: "flex flex-col gap-1" },
      React.createElement(AccordionSection, {
        title: "Ajustes B\xE1sicos",
        isOpen: openAdjustment['Basicos'],
        onToggle: () => toggleAdjustment('Basicos')
      },
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
                label: "Luminosidade",
                value: stateToUi(state.lightness),
                min: -100,
                max: 100,
                step: 1,
                onChange: (val) => onStateChange({ lightness: uiToState(val) }),
                onCommit: () => onCommit('Ajuste de Luminosidade'),
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
            }),
            React.createElement(ManualSlider, {
                label: "Realces",
                value: state.highlights,
                min: -100,
                max: 100,
                step: 1,
                onChange: (val) => onStateChange({ highlights: val }),
                onCommit: () => onCommit('Ajuste de Realces'),
                unit: ""
            }),
            React.createElement(ManualSlider, {
                label: "Satura\xE7\xE3o",
                value: stateToUi(state.saturation),
                min: -100,
                max: 100,
                step: 1,
                onChange: (val) => onStateChange({ saturation: uiToState(val) }),
                onCommit: () => onCommit('Ajuste de Saturação'),
                unit: ""
            }),
            React.createElement(ManualSlider, {
                label: "Matiz",
                value: hueStateToUi(state.hue),
                min: -100,
                max: 100,
                step: 1,
                onChange: (val) => onStateChange({ hue: uiToHueState(val) }),
                onCommit: () => onCommit('Ajuste de Matiz'),
                unit: ""
            })
        )
      ),
      React.createElement(AccordionSection, {
        title: "Curvas de Tom",
        isOpen: openAdjustment['Curvas'],
        onToggle: () => toggleAdjustment('Curvas')
      },
        React.createElement("div", { className: "flex flex-col gap-3 items-center p-1" },
            React.createElement(ToneCurveEditor, { 
                points: state.toneCurves[activeCurve],
                onChange: points => onStateChange({ toneCurves: { ...state.toneCurves, [activeCurve]: points }}),
                onCommit: () => onCommit('Ajuste de Curvas'),
                color: activeCurve === 'r' ? '#ef4444' : activeCurve === 'g' ? '#22c55e' : activeCurve === 'b' ? '#3b82f6' : '#8b5cf6'
            }),
            React.createElement("div", { className: "flex gap-1 p-1 bg-slate-800 rounded-md" },
                ['rgb', 'r', 'g', 'b'].map(channel => (
                    React.createElement("button", { key: channel, onClick: () => setActiveCurve(channel), className: `px-2.5 py-1 text-xs font-bold rounded ${activeCurve === channel ? 'bg-violet-500 text-white' : 'text-slate-300 hover:bg-slate-700'}` },
                        channel.toUpperCase()
                    )
                ))
            )
        )
      )
    )
  );
};