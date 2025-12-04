import React, { useState, useMemo, useEffect } from 'react';
import { TOOLS } from '../constants';
import { HistoryState, Tool } from '../types';
import { Icon } from './Icon';
import { AccordionSection } from './AccordionSection';
import { HistoryPanel } from './HistoryPanel';
import { ControlPanel } from './ControlPanel';
import { ApiKeyPrompt } from './ApiKeyPrompt';
import { isAiAvailable } from '../services/geminiService';

interface SidebarProps {
  isMobileToolSelectionOnly?: boolean;
  selectedToolId: string;
  setSelectedToolId: (tool: Tool) => void;
  history?: HistoryState[];
  historyIndex?: number;
  onJump?: (index: number) => void;
  onFeedback?: (index: number, rating: 'good' | 'bad') => void;
  currentState?: HistoryState;
  
  onAiEdit?: (prompt: string, tool: Tool) => void;
  onAiGenerate?: (prompt: string, tool: Tool) => void;
  onManualChange?: (values: Partial<HistoryState>) => void;
  onManualCommit?: (actionName: string) => void;
  onResizeCommit?: (width: number, height: number) => void;
  
  brushSize?: number;
  onBrushSizeChange?: (value: number) => void;
  drawingMode?: 'draw' | 'erase';
  onDrawingModeChange?: (mode: 'draw' | 'erase') => void;
  onClearSelection?: () => void;
  
  colorPalettes?: Record<string, string[]> | null;
  isAnalyzingColors?: boolean;
  isLoading?: boolean;
  referenceImage?: { dataUrl: string; base64: string; mimeType: string; } | null;
  onReferenceImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReferenceImageRemove?: () => void;
  isEditing?: boolean;

  prompt?: string;
  onPromptChange?: (value: string) => void;
  styleIntensity?: number;
  onStyleIntensityChange?: (value: number) => void;
  selectedTool?: Tool;
  shouldChangeEnvironment?: boolean;
  onShouldChangeEnvironmentChange?: (value: boolean) => void;
  className?: string;
  favoriteTools?: string[];
  onToggleFavorite?: (toolId: string) => void;
  onClose?: () => void;
}

const UI_LAYOUT_KEY = 'mdoUiLayout';

const ToolSelectionGrid: React.FC<Partial<SidebarProps>> = ({ setSelectedToolId, selectedToolId, favoriteTools = [], onToggleFavorite }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
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
  }, {} as Record<string, Tool[]>), []);

  const favoritedToolsList = useMemo(() => {
    return TOOLS.filter(tool => favoriteTools.includes(tool.id) && !tool.disabled);
  }, [favoriteTools]);

  const handleToggleSection = (sectionName: string) => {
      const newSections = {...openSections, [sectionName]: !openSections[sectionName]};
      setOpenSections(newSections);
      localStorage.setItem(UI_LAYOUT_KEY, JSON.stringify({ openSections: newSections }));
  }

  const renderToolButton = (tool: Tool) => {
    const isFavorite = favoriteTools.includes(tool.id);
    return (
      <div key={tool.id} className="relative group aspect-square">
        <button 
          onClick={() => setSelectedToolId?.(tool)}
          data-tool-id={tool.id}
          className={`glass-icon p-2 w-full h-full flex flex-col items-center justify-center text-center gap-1.5 rounded-lg ${selectedToolId === tool.id ? 'tool-selected-glow' : ''}`}
          title={tool.name}
        >
          <Icon name={tool.icon} className="w-5 h-5" />
          <span className="text-xs leading-tight">{tool.name}</span>
        </button>
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(tool.id);
            }}
            className="absolute top-1 right-1 p-0.5 bg-slate-800/50 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-110 active:scale-100"
            title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
          >
            <Icon name={isFavorite ? 'star-filled' : 'star'} className={`w-4 h-4 ${isFavorite ? 'text-yellow-400' : 'text-slate-400 hover:text-white'} transition-colors`} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {!isAiAvailable && <ApiKeyPrompt onDismiss={() => {}} />}
      
      {favoritedToolsList.length > 0 && (
        <AccordionSection 
          key="favoritos"
          title="Favoritos"
          icon="star"
          isOpen={true}
          onToggle={() => {}}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {favoritedToolsList.map(renderToolButton)}
          </div>
        </AccordionSection>
      )}

      {Object.entries(groupedTools).map(([moduleName, tools]) => (
        <AccordionSection 
          key={moduleName}
          title={moduleName}
          isOpen={openSections[moduleName] || false}
          onToggle={() => handleToggleSection(moduleName)}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.isArray(tools) && tools.map(renderToolButton)}
          </div>
        </AccordionSection>
      ))}
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { isMobileToolSelectionOnly, className, onClose } = props;

  if (isMobileToolSelectionOnly) {
    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Icon name="logo-magic" className="w-8 h-8 text-cyan-400 header-logo" />
                    <h1 className="font-bold text-lg text-white">Ferramentas</h1>
                </div>
                <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-700 transition-colors">
                    <Icon name="x-circle" className="w-6 h-6" />
                </button>
            </header>
            <div className="flex-grow overflow-y-auto no-scrollbar p-2">
                <ToolSelectionGrid {...props} />
            </div>
        </div>
    );
  }

  return (
      <aside className={`w-80 xl:w-96 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex-col h-full ${className}`}>
        <header className="p-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="logo-magic" className="w-8 h-8 text-cyan-400 header-logo" />
            <h1 className="font-bold text-lg text-white">O Mago das Fotos</h1>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto no-scrollbar p-2 lg:p-4">
          <ToolSelectionGrid {...props} />
        </div>
      </aside>
  );
};