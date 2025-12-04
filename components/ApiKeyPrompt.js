

import React from 'react';
import { Icon } from './Icon.js';

export const ApiKeyPrompt = ({ onDismiss }) => {
  return (
    React.createElement("div", { className: "bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm rounded-lg p-3 mb-4 relative animate-fadeIn" },
      React.createElement("div", { className: "flex items-start gap-3" },
        React.createElement(Icon, { name: "zap", className: "w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" }),
        React.createElement("div", null,
          React.createElement("h4", { className: "font-bold" }, "Funcionalidades de IA Desabilitadas"),
          React.createElement("p", { className: "mt-1" },
            "Para ativar as ferramentas m\xE1gicas, por favor, configure sua chave de API do Gemini nas vari\xE1veis de ambiente do projeto."
          )
        )
      ),
      React.createElement("button", { 
        onClick: onDismiss, 
        className: "absolute top-2 right-2 p-1 rounded-full hover:bg-orange-500/20 transition-colors",
        "aria-label": "Dispensar aviso"
      },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))
      )
    )
  );
};