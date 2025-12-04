import React from 'react';
import { Icon } from './Icon';

interface RestoreSessionPromptProps {
  onRestore: () => void;
  onDismiss: () => void;
}

export const RestoreSessionPrompt: React.FC<RestoreSessionPromptProps> = ({ onRestore, onDismiss }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-slideUpAndFade">
      <div className="glass-panel rounded-lg p-4 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Icon name="save" className="h-8 w-8 text-violet-400 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-white">Sessão Salva Encontrada</h3>
                <p className="text-sm text-slate-300">Deseja continuar de onde parou?</p>
            </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button 
            onClick={onRestore} 
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-md text-sm transition-colors"
          >
            Restaurar
          </button>
          <button 
            onClick={onDismiss} 
            className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-200 font-semibold rounded-md text-sm transition-colors"
          >
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
};