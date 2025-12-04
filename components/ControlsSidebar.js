
import React from 'react';
import { AccordionSection } from './AccordionSection.js';
import { HistoryPanel } from './HistoryPanel.js';
import { ControlPanel } from './ControlPanel.js';
import { Icon } from './Icon.js';

export const ControlsSidebar = (props) => {
  const { selectedTool, history, historyIndex, onJump, onFeedback, isEditing, className, isMobile, onBack } = props;

  const content = (
    React.createElement(React.Fragment, null,
      React.createElement("div", { className: "flex-grow overflow-y-auto no-scrollbar p-2 lg:p-4" },
        selectedTool && (
          React.createElement("div", null,
            React.createElement(ControlPanel, { ...props })
          )
        ),

        React.createElement("div", { className: "mt-4" },
          React.createElement(AccordionSection, {
              title: "Hist\xF3rico",
              isOpen: true,
              onToggle: () => {} 
          },
              React.createElement(HistoryPanel, { history: history, currentIndex: historyIndex, onJump: onJump, onFeedback: onFeedback, isEditing: isEditing })
          )
        )
      )
    )
  );

  if (isMobile) {
    return (
        React.createElement("div", { className: "flex flex-col h-full" },
            React.createElement("header", { className: "p-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0" },
                React.createElement("button", { onClick: onBack, className: "p-2 -ml-2 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-1 text-sm" },
                    React.createElement(Icon, { name: "chevron-left", className: "w-5 h-5" }),
                    "Voltar"
                ),
                React.createElement("h2", { className: "font-bold text-lg text-white" }, selectedTool.name),
                React.createElement("div", { className: "w-16" })
            ),
            content
        )
    );
  }

  return (
    React.createElement("aside", { className: `flex-col h-full ${className || ''}` },
      content
    )
  );
};
