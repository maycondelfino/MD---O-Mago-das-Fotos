
import React, { useState, useEffect } from 'react';
import { AdjustColorsPanel } from './AdjustColorsPanel.js';
import { VignettePanel } from './VignettePanel.js';
import { ColorPalettePanel } from './ColorPalettePanel.js';
import { ColorBalancePanel } from './ColorBalancePanel.js';
import { GradientFilterPanel } from './GradientFilterPanel.js';
import { FramePanel } from './FramePanel.js';
import { ContourPanel } from './ContourPanel.js';
import { StylizePanel } from './StylizePanel.js';
import { EditImageButton } from './EditImageButton.js';
import { SelectionPanel } from './SelectionPanel.js';
import { ResizePanel } from './ResizePanel.js';
import { FiltersPanel } from './FiltersPanel.js';
import { DuotonePanel } from './DuotonePanel.js';
import { BeautyPanel } from './BeautyPanel.js';
import { ReferenceImagePanel } from './ReferenceImagePanel.js';
import { SharpnessPanel } from './SharpnessPanel.js';
import { BackgroundBlurPanel } from './BackgroundBlurPanel.js';
import { Icon } from './Icon.js';
import { AccordionSection } from './AccordionSection.js';
import { QuickAdjustPanel } from './QuickAdjustPanel.js';
import { AgePanel } from './AgePanel.js';
import { WeightPanel } from './WeightPanel.js';
import { AnalysisPanel } from './AnalysisPanel.js';

export const ControlPanel = (props) => {
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
        return React.createElement(QuickAdjustPanel, { state: currentState, onStateChange: onManualChange, onCommit: onManualCommit });
      case 'adjust-colors':
        return React.createElement(AdjustColorsPanel, { state: currentState, onStateChange: onManualChange, onCommit: onManualCommit });
      case 'sharpness':
        return React.createElement(SharpnessPanel, { state: currentState, onStateChange: onManualChange, onCommit: onManualCommit });
      case 'resize':
        return React.createElement(ResizePanel, { currentWidth: currentState.width, currentHeight: currentState.height, onResize: props.onResizeCommit });
      case 'color-balance':
        return React.createElement(ColorBalancePanel, { state: currentState, onStateChange: onManualChange, onCommit: () => onManualCommit('Balanço de Cores') });
      case 'vignette':
        return React.createElement(VignettePanel, { state: currentState, onStateChange: onManualChange, onCommit: () => onManualCommit('Vinheta') });
      case 'gradient-filter':
        return React.createElement(GradientFilterPanel, { state: currentState, onStateChange: onManualChange, onCommit: () => onManualCommit('Gradiente') });
      case 'frame':
        return React.createElement(FramePanel, { state: currentState, onStateChange: onManualChange, onCommit: () => onManualCommit('Moldura') });
      case 'contour':
        return React.createElement(ContourPanel, { state: currentState, onStateChange: onManualChange, onCommit: () => onManualCommit('Contorno') });
      case 'color-palette':
        return React.createElement(ColorPalettePanel, { palettes: props.colorPalettes, isLoading: props.isAnalyzingColors });
      case 'filters':
        return React.createElement(FiltersPanel, { state: currentState, onStateChange: onManualChange, onCommit: onManualCommit });
      case 'duotone':
        return React.createElement(DuotonePanel, { state: currentState, onStateChange: onManualChange, onCommit: () => onManualCommit('Duotono') });
      case 'ia-selection':
        return React.createElement(SelectionPanel, { 
                  brushSize: props.brushSize, 
                  onBrushSizeChange: props.onBrushSizeChange, 
                  drawingMode: props.drawingMode,
                  onDrawingModeChange: props.onDrawingModeChange,
                  onClear: props.onClearSelection,
                  onUndo: props.onSelectionUndo,
                  canUndo: props.canUndoSelection,
                  onRedo: props.onSelectionRedo,
                  canRedo: props.canRedoSelection
                });
      case 'ia-beauty-retouch':
        return React.createElement(BeautyPanel, { onAiEdit: onAiEdit, isLoading: isLoading, selectedTool: selectedTool });
      case 'ia-age-machine':
        return React.createElement(AgePanel, { onAiEdit: onAiEdit, isLoading: isLoading, selectedTool: selectedTool });
      case 'ia-body-weight':
        return React.createElement(WeightPanel, { onAiEdit: onAiEdit, isLoading: isLoading, selectedTool: selectedTool });
      case 'ia-analyze-photo':
        return React.createElement(AnalysisPanel, { onAnalyze: onAnalyzeImage, analysisResult: analysisResult, isLoading: isLoading });
      case 'ia-background-blur':
        return React.createElement(BackgroundBlurPanel, { onAiEdit: onAiEdit, isLoading: isLoading, selectedTool: selectedTool });
      case 'ia-stylize':
        return React.createElement(StylizePanel, {
          selectedTool: selectedTool,
          prompt: prompt,
          onPromptChange: onPromptChange,
          intensity: props.styleIntensity,
          onIntensityChange: props.onStyleIntensityChange,
          onAiEdit: onAiEdit,
          isLoading: isLoading
        });
      default:
        return null;
    }
  };

  return (
    React.createElement("div", { className: "animate-fadeIn" },
      React.createElement("div", { className: "flex justify-between items-center mb-3" },
        React.createElement("h3", { className: "font-bold text-white" }, selectedTool.name)
      ),
      React.createElement("p", { className: "text-sm text-slate-400 mb-4" }, selectedTool.description),
      
      renderPanelContent(),

      showPromptBox && (
        React.createElement("div", { className: "flex flex-col gap-3 mt-4" },
          React.createElement("textarea", {
            value: prompt,
            onChange: (e) => onPromptChange(e.target.value),
            placeholder: showReferenceImage && referenceImage
                ? "D\xEA instru\xE7\xF5es adicionais (ex: aplique na pessoa da direita)."
                : selectedTool.promptSuggestion,
            className: "w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            rows: 3
          }),

          promptExamples.length > 0 && (
             React.createElement(AccordionSection, {
                title: "Sugest\xF5es de Prompts",
                isOpen: areSuggestionsOpen,
                onToggle: () => setAreSuggestionsOpen(!areSuggestionsOpen)
            },
                React.createElement("div", { className: "flex flex-wrap gap-2 pt-2" },
                    promptExamples.map((hint, index) => (
                        React.createElement("button", {
                            key: index,
                            onClick: () => onPromptChange(hint),
                            className: "px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full hover:bg-slate-700 transition-colors"
                        },
                            hint
                        )
                    ))
                )
            )
          ),

          showReferenceImage && (
            React.createElement(React.Fragment, null,
              React.createElement("div", { className: "flex items-center gap-2 my-2 text-slate-500" },
                React.createElement("hr", { className: "w-full border-t border-slate-700" }),
                React.createElement("span", { className: "text-xs font-semibold" }, "OU"),
                React.createElement("hr", { className: "w-full border-t border-slate-700" })
              ),
              React.createElement(AccordionSection, {
                title: "Usar Imagem de Refer\xEAncia",
                isOpen: isReferenceOpen,
                onToggle: () => setIsReferenceOpen(!isReferenceOpen)
              },
                  React.createElement(ReferenceImagePanel, {
                    referenceImage: referenceImage,
                    onReferenceFileSelect: onReferenceFileSelect,
                    onReferenceImageRemove: onReferenceImageRemove,
                    className: "mt-0"
                  }),
                  selectedTool.id === 'ia-steal-clothes' && referenceImage && (
                    React.createElement("div", { className: "flex items-center gap-2 mt-2 p-2 bg-slate-800 rounded-md" },
                      React.createElement("input", {
                        type: "checkbox",
                        id: "change-environment-checkbox",
                        checked: shouldChangeEnvironment,
                        onChange: (e) => onShouldChangeEnvironmentChange(e.target.checked),
                        className: "h-4 w-4 rounded border-slate-600 text-violet-500 bg-slate-700 focus:ring-violet-500 focus:ring-offset-slate-800"
                      }),
                      React.createElement("label", { htmlFor: "change-environment-checkbox", className: "text-sm text-slate-300 select-none cursor-pointer" },
                        "Tamb\xE9m copiar o ambiente"
                      )
                    )
                  )
              )
            )
          ),
          
          selectedTool.isGenerator ? (
            React.createElement(EditImageButton, { 
              label: selectedTool.name,
              icon: selectedTool.icon, 
              onClick: () => onAiGenerate(prompt, selectedTool),
              disabled: isLoading || !prompt.trim(), 
              isLoading: isLoading })
          ) : (
            React.createElement(EditImageButton, { 
              label: "Aplicar M\xE1gica", 
              icon: "sparkles", 
              onClick: () => onAiEdit(prompt, selectedTool),
              disabled: isButtonDisabled,
              isLoading: isLoading})
          )
        )
      )
    )
  );
};
