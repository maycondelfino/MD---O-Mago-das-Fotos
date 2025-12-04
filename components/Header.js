
import React from 'react';
import { Icon } from './Icon.js';

export const Header = ({ 
    className, 
    onNew,
    onDownload, 
    onShare, 
    onUndo, 
    canUndo, 
    onRedo, 
    canRedo, 
    onCompareToggle,
    isMobile,
    onToggleMobilePanel,
    isLoading,
}) => {
  return (
    React.createElement("header", { className: `p-1 lg:p-2 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0 bg-slate-900/50 backdrop-blur-sm z-10 ${className}` },
      React.createElement("div", { className: "flex items-center gap-2" },
        /* Ocultado para evitar redundância com a barra lateral esquerda em desktops */
        React.createElement("div", { className: "w-8 h-8 hidden xl:block" }),
        React.createElement("div", { className: "flex items-center gap-2 xl:hidden" },
            React.createElement(Icon, { name: "logo-magic", className: "w-6 h-6 text-cyan-400 header-logo" }),
            React.createElement("h1", { className: "font-bold text-base text-white" }, "O Mago das Fotos")
        )
      ),
      React.createElement("div", { className: "flex items-center gap-1 justify-end" },
        React.createElement("button", { onClick: onUndo, disabled: !canUndo || isLoading, className: "p-1.5 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100", title: "Desfazer" }, React.createElement(Icon, { name: "undo", className: "w-4 h-4" })),
        React.createElement("button", { onClick: onRedo, disabled: !canRedo || isLoading, className: "p-1.5 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100", title: "Refazer" }, React.createElement(Icon, { name: "redo", className: "w-4 h-4" })),
        React.createElement("button", { 
            onMouseDown: () => onCompareToggle(true), 
            onMouseUp: () => onCompareToggle(false),
            onTouchStart: () => onCompareToggle(true),
            onTouchEnd: () => onCompareToggle(false),
            disabled: !canUndo || isLoading, 
            className: "p-1.5 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100", title: "Comparar com anterior (segure)"
        },
          React.createElement(Icon, { name: "compare", className: "w-4 h-4" })
        ),
        React.createElement("button", { onClick: onShare, disabled: isLoading, className: "p-1.5 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100", title: "Compartilhar" },
          React.createElement(Icon, { name: "share-2", className: "w-4 h-4" })
        ),
        React.createElement("button", {
          onClick: onNew,
          disabled: isLoading,
          className: "p-1.5 rounded-md hover:bg-slate-700 transition-all duration-200 hover:scale-110 active:scale-100 disabled:opacity-30",
          title: "Novo Projeto"
        },
          React.createElement(Icon, { name: "file-plus", className: "w-4 h-4" })
        ),
        React.createElement("button", {
          onClick: onDownload,
          disabled: isLoading,
          className: "ml-1 px-3 py-1.5 bg-violet-600 text-white font-semibold rounded-md hover:bg-violet-700 transition-all duration-200 flex items-center gap-2 shadow-md shadow-violet-900/40 hover:shadow-lg hover:shadow-violet-700/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        },
          React.createElement(Icon, { name: "download", className: "w-4 h-4" }),
          React.createElement("span", { className: "hidden sm:inline" }, "Salvar")
        ),
        isMobile && (
            React.createElement("button", {
              onClick: onToggleMobilePanel,
              className: "p-1.5 rounded-md hover:bg-slate-700 transition-colors lg:hidden ml-1",
              title: "Mostrar/Esconder Painel"
            },
              React.createElement(Icon, { name: "menu", className: "w-5 h-5" })
            )
        )
      )
    )
  );
};