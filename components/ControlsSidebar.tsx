import React from 'react';
import { HistoryState, Tool } from '../types';
import { AccordionSection } from './AccordionSection';
import { HistoryPanel } from './HistoryPanel';
import { ControlPanel } from './ControlPanel';
import { Icon } from './Icon';

interface ControlsSidebarProps {
  selectedToolId: string;
  history: HistoryState[];
  historyIndex: number;
  onJump: (index: number) => void;
  onFeedback: (index: number, rating: 'good' | 'bad') => void;
  currentState: HistoryState;
  
  onAiEdit: (prompt: string, tool: Tool) => void;
  onAiGenerate: (prompt: string, tool: Tool) => void;
  onAnalyzeImage: () => void;
  analysisResult: string | null;
  onManualChange: (values: Partial<HistoryState>) => void;
  onManualCommit: (actionName: string) => void;
  onResizeCommit: (width: number, height: number) => void;
  
  brushSize: number;
  onBrushSizeChange: (value: number) => void;
  drawingMode: 'draw' | 'erase';
  onDrawingModeChange: (mode: 'draw' | 'erase') => void;
  onClearSelection: () => void;
  onSelectionUndo: () => void;
  canUndoSelection: boolean;
  onSelectionRedo: () => void;
  canRedoSelection: boolean;
  
  colorPalettes: Record<string, string[]> | null;
  isAnalyzingColors: boolean;
  isLoading: boolean;
  referenceImage: { dataUrl: string; mimeType: string; } | null;
  onReferenceFileSelect: (file: File | null) => void;
  onReferenceImageRemove: () => void;
  isEditing: boolean;

  prompt: string;
  onPromptChange: (value: string) => void;
  styleIntensity: number;
  onStyleIntensityChange: (value: number) => void;
  selectedTool: Tool;
  shouldChangeEnvironment: boolean;
  onShouldChangeEnvironmentChange: (value: boolean) => void;
  onBack?: () => void;
  className?: string;
  isMobile?: boolean;
}

export const ControlsSidebar: React.FC<ControlsSidebarProps> = (props) => {
  const { selectedTool, history, historyIndex, onJump, onFeedback, isEditing, className, isMobile, onBack } = props;

  const content = (
    <>
      <div className="flex-grow overflow-y-auto no-scrollbar p-2 lg:p-4">
        {selectedTool && (
          <div>
            <ControlPanel {...props} />
          </div>
        )}

        <div className="mt-4">
          <AccordionSection
              title="Histórico"
              isOpen={true}
              onToggle={() => {}} // No-op
          >
              <HistoryPanel history={history} currentIndex={historyIndex} onJump={onJump} onFeedback={onFeedback} isEditing={isEditing} />
          </AccordionSection>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-1 text-sm">
                    <Icon name="chevron-left" className="w-5 h-5" />
                    Voltar
                </button>
                <h2 className="font-bold text-lg text-white">{selectedTool.name}</h2>
                <div className="w-16"></div>
            </header>
            {content}
        </div>
    );
  }

  return (
    <aside className={`flex-col h-full ${className || ''}`}>
      {content}
    </aside>
  );
};