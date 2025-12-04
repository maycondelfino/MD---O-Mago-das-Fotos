import React, { useState, useEffect } from 'react';
import { HistoryState, Tool } from '../types';
import { AdjustColorsPanel } from './AdjustColorsPanel';
import { VignettePanel } from './VignettePanel';
import { ColorPalettePanel } from './ColorPalettePanel';
import { ColorBalancePanel } from './ColorBalancePanel';
import { GradientFilterPanel } from './GradientFilterPanel';
import { FramePanel } from './FramePanel';
import { ContourPanel } from './ContourPanel';
import { StylizePanel } from './StylizePanel';
import { EditImageButton } from './EditImageButton';
import { SelectionPanel } from './SelectionPanel';
import { ResizePanel } from './ResizePanel';
import { FiltersPanel } from './FiltersPanel';
import { DuotonePanel } from './DuotonePanel';
import { BeautyPanel } from './BeautyPanel';
import { ReferenceImagePanel } from './ReferenceImagePanel';
import { SharpnessPanel } from './SharpnessPanel';
import { BackgroundBlurPanel } from './BackgroundBlurPanel';
import { Icon } from './Icon';
import { AccordionSection } from './AccordionSection';
import { QuickAdjustPanel } from './QuickAdjustPanel';
import { AgePanel } from './AgePanel';
import { WeightPanel } from './WeightPanel';
import { AnalysisPanel } from './AnalysisPanel';

interface ControlPanelProps {
  selectedTool: Tool;
  currentState: HistoryState;
  prompt: string;
  onPromptChange: (value: string) => void;
  isLoading: boolean;
  onAiEdit: (prompt: string, tool: Tool) => void;
  onAiGenerate: (prompt: string, tool: Tool) => void;
  onAnalyzeImage: () => void;
  analysisResult: string | null;
  onManualChange: (values: Partial<HistoryState>) => void;
  onManualCommit: (actionName: string) => void;
  onResizeCommit: (width: number, height: number) => void;
  colorPalettes: Record<string, string[]> | null;
  isAnalyzingColors: boolean;
  styleIntensity: number;
  onStyleIntensityChange: (value: number) => void;
  brushSize: number;
  onBrushSizeChange: (value: number) => void;
  drawingMode: 'draw' | 'erase';
  onDrawingModeChange: (mode: 'draw' | 'erase') => void;
  onClearSelection: () => void;
  onSelectionUndo: () => void;
  canUndoSelection: boolean;
  onSelectionRedo: () => void;
  canRedoSelection: boolean;
  referenceImage: { dataUrl: string; mimeType: string } | null;
  onReferenceFileSelect: (file: File | null) => void;
  onReferenceImageRemove: () => void;
  onBack?: () => void;
  shouldChangeEnvironment: boolean;
  onShouldChangeEnvironmentChange: (value: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const { selectedTool, currentState, prompt, onPromptChange, isLoading, onAiEdit, onAiGenerate, onAnalyzeImage, analysisResult, onManualChange, onManualCommit, referenceImage, onReferenceFileSelect, onReferenceImageRemove, onBack, shouldChangeEnvironment, onShouldChangeEnvironmentChange } = props;
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [areSuggestionsOpen, setAreSuggestionsOpen] = useState(false);

  const promptExamples = selectedTool.promptExamples || [];
  
  const showPromptBox = !selectedTool.isManualControl && !selectedTool.oneClick && !['ia-stylize', 'ia-background-blur', 'ia-age-machine', 'ia-body-weight', 'ia-analyze-photo'].includes(selectedTool.id) || selectedTool.isGenerator;
  const showReferenceImage = ['ia-tattoo-artist', 'ia-change-background', 'ia-house-builder', 'ia-steal-clothes', 'ia-face-swap', 'ia-combine-people'].includes(selectedTool.id);

  // Lógica aprimorada para desabilitar o botão de IA
  const isRemoveObjectWithOnlySelection = selectedTool.id === 'ia-remove-object' && !!currentState.selectionMask && !prompt.trim();
  // Uma ação é possível se:
  // 1. Houver um prompt de texto.
  // 2. Houver uma imagem de referência.
  // 3. A ferramenta for "Remover Objeto" e houver uma seleção (mesmo sem prompt).
  const isActionable = !!prompt.trim() || !!referenceImage || isRemoveObjectWithOnlySelection;
  const isButtonDisabled = isLoading || !isActionable;

  const renderPanelContent = () => {
    switch (selectedTool.id) {
      case 'quick-adjust':
        return <QuickAdjustPanel state={currentState} onStateChange={onManualChange} onCommit={onManualCommit} />;
      case 'adjust-colors':
        return <AdjustColorsPanel state={currentState} onStateChange={onManualChange} onCommit={onManualCommit} />;
      case 'sharpness':
        return <SharpnessPanel state={currentState} onStateChange={onManualChange} onCommit={onManualCommit} />;
      case 'resize':
        return <ResizePanel currentWidth={currentState.width} currentHeight={currentState.height} onResize={props.onResizeCommit} />;
      case 'color-balance':
        return <ColorBalancePanel state={currentState} onStateChange={onManualChange} onCommit={() => onManualCommit('Balanço de Cores')} />;
      case 'vignette':
        return <VignettePanel state={currentState} onStateChange={onManualChange} onCommit={() => onManualCommit('Vinheta')} />;
      case 'gradient-filter':
        return <GradientFilterPanel state={currentState} onStateChange={onManualChange} onCommit={() => onManualCommit('Gradiente')} />;
      case 'frame':
        return <FramePanel state={currentState} onStateChange={onManualChange} onCommit={() => onManualCommit('Moldura')} />;
      case 'contour':
        return <ContourPanel state={currentState} onStateChange={onManualChange} onCommit={() => onManualCommit('Contorno')} />;
      case 'color-palette':
        return <ColorPalettePanel palettes={props.colorPalettes} isLoading={props.isAnalyzingColors} />;
      case 'filters':
        return <FiltersPanel state={currentState} onStateChange={onManualChange} onCommit={onManualCommit} />;
      case 'duotone':
        return <DuotonePanel state={currentState} onStateChange={onManualChange} onCommit={() => onManualCommit('Duotono')} />;
      case 'ia-selection':
        return <SelectionPanel 
                  brushSize={props.brushSize} 
                  onBrushSizeChange={props.onBrushSizeChange} 
                  drawingMode={props.drawingMode}
                  onDrawingModeChange={props.onDrawingModeChange}
                  onClear={props.onClearSelection}
                  onUndo={props.onSelectionUndo}
                  canUndo={props.canUndoSelection}
                  onRedo={props.onSelectionRedo}
                  canRedo={props.canRedoSelection}
                />;
      case 'ia-beauty-retouch':
        return <BeautyPanel onAiEdit={onAiEdit} isLoading={isLoading} selectedTool={selectedTool} />;
      case 'ia-age-machine':
        return <AgePanel onAiEdit={onAiEdit} isLoading={isLoading} selectedTool={selectedTool} />;
      case 'ia-body-weight':
        return <WeightPanel onAiEdit={onAiEdit} isLoading={isLoading} selectedTool={selectedTool} />;
      case 'ia-analyze-photo':
        return <AnalysisPanel onAnalyze={onAnalyzeImage} analysisResult={analysisResult} isLoading={isLoading} />;
      case 'ia-background-blur':
        return <BackgroundBlurPanel onAiEdit={onAiEdit} isLoading={isLoading} selectedTool={selectedTool} />;
      case 'ia-stylize':
        return <StylizePanel
          selectedTool={selectedTool}
          prompt={prompt}
          onPromptChange={onPromptChange}
          intensity={props.styleIntensity}
          onIntensityChange={props.onStyleIntensityChange}
          onAiEdit={onAiEdit}
          isLoading={isLoading}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-white">{selectedTool.name}</h3>
      </div>
      <p className="text-sm text-slate-400 mb-4">{selectedTool.description}</p>
      
      {renderPanelContent()}

      {showPromptBox && (
        <div className="flex flex-col gap-3 mt-4">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={
              showReferenceImage && referenceImage
                ? "Dê instruções adicionais (ex: aplique na pessoa da direita)."
                : selectedTool.promptSuggestion
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={3}
          />

          {promptExamples.length > 0 && (
             <AccordionSection
                title="Sugestões de Prompts"
                isOpen={areSuggestionsOpen}
                onToggle={() => setAreSuggestionsOpen(!areSuggestionsOpen)}
            >
                <div className="flex flex-wrap gap-2 pt-2">
                    {promptExamples.map((hint, index) => (
                        <button
                            key={index}
                            onClick={() => onPromptChange(hint)}
                            className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full hover:bg-slate-700 transition-colors"
                        >
                            {hint}
                        </button>
                    ))}
                </div>
            </AccordionSection>
          )}

          {showReferenceImage && (
            <>
              <div className="flex items-center gap-2 my-2 text-slate-500">
                <hr className="w-full border-t border-slate-700" />
                <span className="text-xs font-semibold">OU</span>
                <hr className="w-full border-t border-slate-700" />
              </div>
              <AccordionSection
                title="Usar Imagem de Referência"
                isOpen={isReferenceOpen}
                onToggle={() => setIsReferenceOpen(!isReferenceOpen)}
              >
                  <ReferenceImagePanel
                    referenceImage={referenceImage}
                    onFileSelect={onReferenceFileSelect}
                    onImageRemove={onReferenceImageRemove}
                    className="mt-0"
                  />
                  {selectedTool.id === 'ia-steal-clothes' && referenceImage && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-slate-800 rounded-md">
                      <input
                        type="checkbox"
                        id="change-environment-checkbox"
                        checked={shouldChangeEnvironment}
                        onChange={(e) => onShouldChangeEnvironmentChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 text-violet-500 bg-slate-700 focus:ring-violet-500 focus:ring-offset-slate-800"
                      />
                      <label htmlFor="change-environment-checkbox" className="text-sm text-slate-300 select-none cursor-pointer">
                        Também copiar o ambiente
                      </label>
                    </div>
                  )}
              </AccordionSection>
            </>
          )}
          
          {selectedTool.isGenerator ? (
            <EditImageButton 
              label={selectedTool.name}
              icon={selectedTool.icon} 
              onClick={() => onAiGenerate(prompt, selectedTool)}
              disabled={isLoading || !prompt.trim()} 
              isLoading={isLoading} />
          ) : (
            <EditImageButton 
              label="Aplicar Magia" 
              icon="sparkles" 
              onClick={() => onAiEdit(prompt, selectedTool)}
              disabled={isButtonDisabled}
              isLoading={isLoading}/>
          )}
        </div>
      )}
    </div>
  );
};