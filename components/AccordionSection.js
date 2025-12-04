

import React from 'react';
import { Icon } from './Icon.js';

export const AccordionSection = ({ title, icon, isOpen, onToggle, children, headerExtra }) => {
  return (
    React.createElement("div", { className: "mb-2" },
      React.createElement("button", {
        onClick: onToggle,
        className: "w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-700/30 transition-colors"
      },
        React.createElement("div", { className: "flex items-center gap-2" },
          icon && React.createElement(Icon, { name: icon, className: "w-4 h-4 text-violet-400" }),
          React.createElement("h3", { className: "font-bold text-sm text-violet-400 uppercase tracking-wider" },
            title
          )
        ),
        React.createElement("div", { className: "flex items-center gap-2" },
            headerExtra,
            React.createElement(Icon, { 
              name: "chevron-down", 
              className: `w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}` 
            })
        )
      ),
      React.createElement("div", { className: `accordion-content ${isOpen ? 'open' : ''}` },
        React.createElement("div", { className: "pt-2 flex flex-col gap-1" },
          children
        )
      )
    )
  );
};