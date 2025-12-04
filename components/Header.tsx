import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  className?: string;
  onNew: () => void;
  onDownload: () => void;
  onShare: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onCompareToggle: (show: boolean) => void;
  isMobile: boolean;
  onToggleMobilePanel: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
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
    <header className={`p-2 lg:p-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0 bg-slate-900/50 backdrop-blur-sm z-10 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Ocultado para evitar redundância com a barra lateral esquerda em desktops */}
        <div className="w-8 h-8 hidden xl:block"></div>
        <div className="flex items-center gap-2 xl:hidden">
            <Icon name="logo-magic" className="w-8 h-8 text-cyan-400 header-logo" />
            <h1 className="font-bold text-lg text-white">O Mago das Fotos</h1>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
        <button onClick={onUndo} disabled={!canUndo || isLoading} className="p-2 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100" title="Desfazer"><Icon name="undo" className="w-5 h-5"/></button>
        <button onClick={onRedo} disabled={!canRedo || isLoading} className="p-2 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100" title="Refazer"><Icon name="redo" className="w-5 h-5"/></button>
        <button 
            onMouseDown={() => onCompareToggle(true)} 
            onMouseUp={() => onCompareToggle(false)}
            onTouchStart={() => onCompareToggle(true)}
            onTouchEnd={() => onCompareToggle(false)}
            disabled={!canUndo || isLoading} 
            className="p-2 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100" title="Comparar com anterior (segure)">
          <Icon name="compare" className="w-5 h-5"/>
        </button>
        <button onClick={onShare} disabled={isLoading} className="p-2 rounded-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-30 disabled:transform-none hover:!opacity-100 hover:scale-110 active:scale-100" title="Compartilhar">
          <Icon name="share-2" className="w-5 h-5"/>
        </button>
        <button
          onClick={onNew}
          disabled={isLoading}
          className="p-2 rounded-md hover:bg-slate-700 transition-all duration-200 hover:scale-110 active:scale-100 disabled:opacity-30"
          title="Novo Projeto"
        >
          <Icon name="file-plus" className="w-5 h-5"/>
        </button>
        <button
          onClick={onDownload}
          disabled={isLoading}
          className="ml-2 px-3 sm:px-4 py-2 bg-violet-600 text-white font-semibold rounded-md hover:bg-violet-700 transition-all duration-200 flex items-center gap-2 shadow-md shadow-violet-900/40 hover:shadow-lg hover:shadow-violet-700/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="download" className="w-5 h-5" />
          <span className="hidden sm:inline">Salvar Foto</span>
        </button>
        {isMobile && (
            <button
              onClick={onToggleMobilePanel}
              className="p-2 rounded-md hover:bg-slate-700 transition-colors lg:hidden"
              title="Mostrar/Esconder Painel"
            >
              <Icon name="menu" className="w-5 h-5"/>
            </button>
        )}
      </div>
    </header>
  );
};