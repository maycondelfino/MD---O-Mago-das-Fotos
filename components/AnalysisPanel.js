
import React from 'react';
import { EditImageButton } from './EditImageButton.js';
import { Icon } from './Icon.js';

export const AnalysisPanel = ({ onAnalyze, analysisResult, isLoading }) => {
  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      React.createElement(EditImageButton, {
        label: "Analisar Foto",
        icon: "search",
        onClick: onAnalyze,
        isLoading: isLoading && !analysisResult,
        disabled: isLoading
      }),
      
      isLoading && !analysisResult && (
        React.createElement("div", { className: "flex items-center justify-center p-4 text-slate-400" },
          React.createElement("svg", { className: "animate-spin h-5 w-5 mr-3 text-violet-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
            React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          ),
          "Analisando sua imagem..."
        )
      ),

      analysisResult && (
        React.createElement("div", { className: "mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-md animate-fadeIn" },
          React.createElement("h4", { className: "font-bold text-sm text-violet-300 mb-3 flex items-center gap-2" },
            React.createElement(Icon, { name: "sparkles", className: "w-4 h-4" }),
            "Sugest\xF5es da IA"
          ),
          React.createElement("div", { className: "text-sm text-slate-300 space-y-2" },
            analysisResult.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
                return (
                  React.createElement("div", { key: index, className: "flex items-start gap-2" },
                    React.createElement("span", { className: "text-violet-400 mt-1" }, "\u2022"),
                    React.createElement("p", null, trimmedLine.substring(1).trim())
                  )
                );
              }
              if(trimmedLine) {
                return React.createElement("p", { key: index }, trimmedLine);
              }
              return null;
            })
          )
        )
      )
    )
  );
};
