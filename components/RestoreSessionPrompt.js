

import React from 'react';
import { Icon } from './Icon.js';

export const RestoreSessionPrompt = ({ onRestore, onDismiss }) => {
  return (
    React.createElement("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-slideUpAndFade" },
      React.createElement("div", { className: "glass-panel rounded-lg p-4 shadow-2xl flex items-center justify-between gap-4" },
        React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement(Icon, { name: "save", className: "h-8 w-8 text-violet-400 flex-shrink-0" }),
            React.createElement("div", null,
                React.createElement("h3", { className: "font-bold text-white" }, "Sessão Salva Encontrada"),
                React.createElement("p", { className: "text-sm text-slate-300" }, "Deseja continuar de onde parou?")
            )
        ),
        React.createElement("div", { className: "flex gap-2 flex-shrink-0" },
          React.createElement("button", { 
            onClick: onRestore, 
            className: "px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-md text-sm transition-colors"
          },
            "Restaurar"
          ),
          React.createElement("button", { 
            onClick: onDismiss, 
            className: "px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-200 font-semibold rounded-md text-sm transition-colors"
          },
            "Ignorar"
          )
        )
      )
    )
  );
};