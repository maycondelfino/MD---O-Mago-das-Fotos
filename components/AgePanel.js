
import React, { useState, useEffect, useRef } from 'react';
import { ManualSlider } from './ManualSlider.js';
import { Icon } from './Icon.js';

export const AgePanel = ({ onAiEdit, isLoading, selectedTool }) => {
  const [ageChange, setAgeChange] = useState(0);
  const debounceTimeoutRef = useRef(null);

  const generatePrompt = (value) => {
    if (value === 0) return '';
    const action = value > 0 ? 'envelheça' : 'rejuvenesça';
    const years = Math.abs(value);
    const plural = years > 1 ? 'anos' : 'ano';
    return `${action} a pessoa na foto em ${years} ${plural}, mantendo suas caracter\xEDsticas de identidade principais de forma fotorrealista.`;
  };

  useEffect(() => {
    if (isLoading) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Apenas aciona se o valor for diferente de zero
    if (ageChange !== 0) {
        debounceTimeoutRef.current = window.setTimeout(() => {
            const prompt = generatePrompt(ageChange);
            if (prompt) {
                onAiEdit(prompt, selectedTool);
            }
        }, 800);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [ageChange, onAiEdit, selectedTool, isLoading]);
  
  const handleReset = () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      setAgeChange(0);
      // Envia prompt vazio para sinalizar um 'undo' ou reset da edição
      onAiEdit('', selectedTool);
  };

  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement("div", { className: isLoading ? 'opacity-50 pointer-events-none' : '' },
        React.createElement("div", { className: "flex items-center gap-3 justify-end" },
            React.createElement("button", {
                onClick: handleReset,
                disabled: isLoading || ageChange === 0,
                className: "p-3 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                title: "Resetar ajuste de idade"
            },
                React.createElement(Icon, { name: "trash", className: "w-5 h-5" })
            )
        ),
        React.createElement(ManualSlider, {
          label: "Ajuste de Idade",
          value: ageChange,
          min: -50,
          max: 50,
          step: 1,
          onChange: setAgeChange,
          onCommit: () => {}, // Debounce lida com o commit
          unit: " anos"
        })
      ),
       isLoading && (
            React.createElement("div", { className: "flex items-center justify-center text-sm text-slate-400 gap-2 mt-2" },
                 React.createElement("svg", { className: "animate-spin h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                    React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ),
                React.createElement("span", null, "Aplicando efeito do tempo...")
            )
       )
    )
  );
};
