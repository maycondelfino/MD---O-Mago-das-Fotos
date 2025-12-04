
import React, { useState } from 'react';
import { ManualSlider } from './ManualSlider.js';
import { AccordionSection } from './AccordionSection.js';

const ToneRangeSection = ({ toneRange, value, onStateChange, onCommit }) => {
    
    const { color, intensity } = value;

    return (
        React.createElement("div", { className: "flex flex-col gap-4 px-1 pt-2" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("label", { htmlFor: `${toneRange}-color`, className: "text-sm font-medium text-slate-300" }, "Cor do Tom"),
                React.createElement("input", {
                    id: `${toneRange}-color`,
                    type: "color",
                    value: color,
                    onChange: (e) => onStateChange(toneRange, { ...value, color: e.target.value }),
                    onBlur: () => onCommit('Ajuste de Balanço de Cores'),
                    className: "custom-color-input"
                })
            ),
            React.createElement(ManualSlider, {
                label: "Intensidade",
                value: intensity,
                min: 0,
                max: 100,
                unit: "%",
                onChange: (val) => onStateChange(toneRange, { ...value, intensity: val }),
                onCommit: () => onCommit('Ajuste de Balanço de Cores')
            })
        )
    );
};


export const ColorBalancePanel = ({ state, onStateChange, onCommit }) => {
  const [openToneRange, setOpenToneRange] = useState({
    'Sombras': true,
    'Tons Médios': false,
    'Realces': false,
  });

  const toggleToneRange = (range) => {
    setOpenToneRange(prev => ({ ...prev, [range]: !prev[range] }));
  };

  const handleToneRangeChange = (toneRange, newValue) => {
    onStateChange({
        colorBalance: {
            ...state.colorBalance,
            [toneRange]: newValue,
        },
    });
  };

  return (
    React.createElement("div", { className: "flex flex-col gap-1" },
      React.createElement(AccordionSection, {
        title: "Sombras",
        isOpen: openToneRange['Sombras'],
        onToggle: () => toggleToneRange('Sombras')
      },
        React.createElement(ToneRangeSection, {
          toneRange: "shadows",
          value: state.colorBalance.shadows,
          onStateChange: handleToneRangeChange,
          onCommit: onCommit
        })
      ),
      React.createElement(AccordionSection, {
        title: "Tons M\xE9dios",
        isOpen: openToneRange['Tons Médios'],
        onToggle: () => toggleToneRange('Tons Médios')
      },
        React.createElement(ToneRangeSection, {
          toneRange: "midtones",
          value: state.colorBalance.midtones,
          onStateChange: handleToneRangeChange,
          onCommit: onCommit
        })
      ),
      React.createElement(AccordionSection, {
        title: "Realces",
        isOpen: openToneRange['Realces'],
        onToggle: () => toggleToneRange('Realces')
      },
        React.createElement(ToneRangeSection, {
          toneRange: "highlights",
          value: state.colorBalance.highlights,
          onStateChange: handleToneRangeChange,
          onCommit: onCommit
        })
      )
    )
  );
};
