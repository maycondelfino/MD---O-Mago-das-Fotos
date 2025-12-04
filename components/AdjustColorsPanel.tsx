import React, { useState } from 'react';
import { ManualSlider } from './ManualSlider';
import { HistoryState } from '../types';
import { AccordionSection } from './AccordionSection';
import { ToneCurveEditor } from './ToneCurveEditor';

// Mapeia o valor da UI (-100 a 100) para o valor do estado (0 a 200)
const uiToState = (uiValue: number) => uiValue + 100;
const stateToUi = (stateValue: number) => stateValue - 100;

// Mapeia o valor da UI de matiz (-100 a 100) para o valor do estado (-180 a 180 graus)
const uiToHueState = (uiValue: number) => uiValue * 1.8;
const hueStateToUi = (stateValue: number) => stateValue / 1.8;

interface AdjustColorsPanelProps {
  state: HistoryState;
  onStateChange: (newState: Partial<HistoryState>) => void;
  onCommit: (actionName: string) => void;
}

export const AdjustColorsPanel: React.FC<AdjustColorsPanelProps> = ({ state, onStateChange, onCommit }) => {
  const [openAdjustment, setOpenAdjustment] = useState<Record<string, boolean>>({
    'Basicos': true,
    'Curvas': false,
  });
  const [activeCurve, setActiveCurve] = useState<'rgb' | 'r' | 'g' | 'b'>('rgb');

  const toggleAdjustment = (adj: string) => {
    setOpenAdjustment(prev => ({ ...prev, [adj]: !prev[adj] }));
  };

  return (
    <div className="flex flex-col gap-1">
      <AccordionSection
        title="Ajustes Básicos"
        isOpen={openAdjustment['Basicos']}
        onToggle={() => toggleAdjustment('Basicos')}
      >
        <div className="flex flex-col gap-4 p-1">
            <ManualSlider
                label="Brilho"
                value={stateToUi(state.brightness)}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onStateChange({ brightness: uiToState(val) })}
                onCommit={() => onCommit('Ajuste de Brilho')}
                unit=""
            />
            <ManualSlider
                label="Luminosidade"
                value={stateToUi(state.lightness)}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onStateChange({ lightness: uiToState(val) })}
                onCommit={() => onCommit('Ajuste de Luminosidade')}
                unit=""
            />
            <ManualSlider
                label="Contraste"
                value={stateToUi(state.contrast)}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onStateChange({ contrast: uiToState(val) })}
                onCommit={() => onCommit('Ajuste de Contraste')}
                unit=""
            />
            <ManualSlider
                label="Sombras"
                value={state.shadows}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onStateChange({ shadows: val })}
                onCommit={() => onCommit('Ajuste de Sombras')}
                unit=""
            />
            <ManualSlider
                label="Realces"
                value={state.highlights}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onStateChange({ highlights: val })}
                onCommit={() => onCommit('Ajuste de Realces')}
                unit=""
            />
            <ManualSlider
                label="Saturação"
                value={stateToUi(state.saturation)}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onStateChange({ saturation: uiToState(val) })}
                onCommit={() => onCommit('Ajuste de Saturação')}
                unit=""
            />
            <ManualSlider
                label="Matiz"
                value={hueStateToUi(state.hue)}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onStateChange({ hue: uiToHueState(val) })}
                onCommit={() => onCommit('Ajuste de Matiz')}
                unit=""
            />
        </div>
      </AccordionSection>
      <AccordionSection
        title="Curvas de Tom"
        isOpen={openAdjustment['Curvas']}
        onToggle={() => toggleAdjustment('Curvas')}
      >
        <div className="flex flex-col gap-3 items-center p-1">
            <ToneCurveEditor 
                points={state.toneCurves[activeCurve]}
                onChange={points => onStateChange({ toneCurves: { ...state.toneCurves, [activeCurve]: points }})}
                onCommit={() => onCommit('Ajuste de Curvas')}
                color={activeCurve === 'r' ? '#ef4444' : activeCurve === 'g' ? '#22c55e' : activeCurve === 'b' ? '#3b82f6' : '#8b5cf6'}
            />
            <div className="flex gap-1 p-1 bg-slate-800 rounded-md">
                {['rgb', 'r', 'g', 'b'].map(channel => (
                    <button key={channel} onClick={() => setActiveCurve(channel as 'rgb'|'r'|'g'|'b')} className={`px-2.5 py-1 text-xs font-bold rounded ${activeCurve === channel ? 'bg-violet-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        {channel.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
      </AccordionSection>
    </div>
  );
};
