
import React, { useState, useMemo } from 'react';
import { TOOLS } from '../constants.js';
import { Icon } from './Icon.js';
import { AccordionSection } from './AccordionSection.js';
import { ApiKeyPrompt } from './ApiKeyPrompt.js';
import { isAiAvailable } from '../services/geminiService.js';

const UI_LAYOUT_KEY = 'mdoUiLayout';

const ToolSelectionGrid = ({ setSelectedToolId, selectedToolId, favoriteTools = [], onToggleFavorite }) => {
  const [openSections, setOpenSections] = useState(() => {
    const defaultState = {
        'Ajustes Essenciais': true, 'Beleza (IA)': true, 'Edição Mágica (IA)': true,
        'Filtros com IA': false, 'Lar & Decoração (IA)': false, 'Salão de Beleza (IA)': false,
        'Arquitetura & Design (IA)': false, 'Barbearia (IA)': false, 'Efeitos Criativos': false,
        'Criação com IA': false, 'Construtor de Casas (IA)': true,
    };
    try {
        const saved = JSON.parse(localStorage.getItem(UI_LAYOUT_KEY) || '{}').openSections;
        return saved ? { ...defaultState, ...saved } : defaultState;
    } catch { return defaultState; }
  });

  const groupedTools = useMemo(() => TOOLS.filter(tool => !tool.disabled).reduce((acc, tool) => {
    (acc[tool.module] = acc[tool.module] || []).push(tool);
    return acc;
  }, {}), []);

  const favoritedToolsList = useMemo(() => {
    return TOOLS.filter(tool => favoriteTools.includes(tool.id) && !tool.disabled);
  }, [favoriteTools]);

  const handleToggleSection = (sectionName) => {
      const newSections = {...openSections, [sectionName]: !openSections[sectionName]};
      setOpenSections(newSections);
      localStorage.setItem(UI_LAYOUT_KEY, JSON.stringify({ openSections: newSections }));
  }

  const renderToolButton = (tool) => {
    const isFavorite = favoriteTools.includes(tool.id);
    return (
      React.createElement("div", { key: tool.id, className: "relative group aspect-square" },
        React.createElement("button", {
          onClick: () => setSelectedToolId?.(tool),
          "data-tool-id": tool.id,
          className: `glass-icon p-2 w-full h-full flex flex-col items-center justify-center text-center gap-1.5 rounded-lg ${selectedToolId === tool.id ? 'tool-selected-glow' : ''}`,
          title: tool.name
        },
          React.createElement(Icon, { name: tool.icon, className: "w-5 h-5" }),
          React.createElement("span", { className: "text-xs leading-tight" }, tool.name)
        ),
        onToggleFavorite && (
          React.createElement("button", {
            onClick: (e) => {
              e.stopPropagation();
              onToggleFavorite(tool.id);
            },
            className: "absolute top-1 right-1 p-0.5 bg-slate-800/50 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-110 active:scale-100",
            title: isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'
          },
            React.createElement(Icon, { name: isFavorite ? 'star-filled' : 'star', className: `w-4 h-4 ${isFavorite ? 'text-yellow-400' : 'text-slate-400 hover:text-white'} transition-colors` })
          )
        )
      )
    );
  };

  return (
    React.createElement(React.Fragment, null,
      !isAiAvailable && React.createElement(ApiKeyPrompt, { onDismiss: () => {} }),
      
      favoritedToolsList.length > 0 && (
        React.createElement(AccordionSection, {
          key: "favoritos",
          title: "Favoritos",
          icon: "star",
          isOpen: true,
          onToggle: () => {}
        },
          React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2" },
            favoritedToolsList.map(renderToolButton)
          )
        )
      ),

      Object.entries(groupedTools).map(([moduleName, tools]) => (
        React.createElement(AccordionSection, {
          key: moduleName,
          title: moduleName,
          isOpen: openSections[moduleName] || false,
          onToggle: () => handleToggleSection(moduleName)
        },
          React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2" },
            Array.isArray(tools) && tools.map(renderToolButton)
          )
        )
      ))
    )
  );
};

export const Sidebar = (props) => {
  const { isMobileToolSelectionOnly, className, onClose } = props;

  if (isMobileToolSelectionOnly) {
    return (
        React.createElement("div", { className: "flex flex-col h-full" },
            React.createElement("header", { className: "p-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(Icon, { name: "logo-magic", className: "w-8 h-8 text-cyan-400 header-logo" }),
                    React.createElement("h1", { className: "font-bold text-lg text-white" }, "Ferramentas")
                ),
                React.createElement("button", { onClick: onClose, className: "p-2 rounded-md hover:bg-slate-700 transition-colors" },
                    React.createElement(Icon, { name: "x-circle", className: "w-6 h-6" })
                )
            ),
            React.createElement("div", { className: "flex-grow overflow-y-auto no-scrollbar p-2" },
                React.createElement(ToolSelectionGrid, { ...props })
            )
        )
    );
  }

  return (
      React.createElement("aside", { className: `w-80 xl:w-96 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex-col h-full ${className}` },
        React.createElement("header", { className: "p-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0" },
          React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement(Icon, { name: "logo-magic", className: "w-8 h-8 text-cyan-400 header-logo" }),
            React.createElement("h1", { className: "font-bold text-lg text-white" }, "O Mago das Fotos")
          )
        ),

        React.createElement("div", { className: "flex-grow overflow-y-auto no-scrollbar p-2 lg:p-4" },
          React.createElement(ToolSelectionGrid, { ...props })
        )
      )
  );
};
