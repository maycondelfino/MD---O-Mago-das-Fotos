import React from 'react';
import { EditImageButton } from './EditImageButton';
import { Icon } from './Icon';

interface AnalysisPanelProps {
  onAnalyze: () => void;
  analysisResult: string | null;
  isLoading: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onAnalyze, analysisResult, isLoading }) => {
  return (
    <div className="flex flex-col gap-4">
      <EditImageButton
        label="Analisar Foto"
        icon="search"
        onClick={onAnalyze}
        isLoading={isLoading && !analysisResult}
        disabled={isLoading}
      />
      
      {isLoading && !analysisResult && (
        <div className="flex items-center justify-center p-4 text-slate-400">
          <svg className="animate-spin h-5 w-5 mr-3 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analisando sua imagem...
        </div>
      )}

      {analysisResult && (
        <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-md animate-fadeIn">
          <h4 className="font-bold text-sm text-violet-300 mb-3 flex items-center gap-2">
            <Icon name="sparkles" className="w-4 h-4" />
            Sugestões da IA
          </h4>
          <div className="text-sm text-slate-300 space-y-2">
            {analysisResult.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
                return (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-violet-400 mt-1">•</span>
                    <p>{trimmedLine.substring(1).trim()}</p>
                  </div>
                );
              }
              if(trimmedLine) {
                return <p key={index}>{trimmedLine}</p>;
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};