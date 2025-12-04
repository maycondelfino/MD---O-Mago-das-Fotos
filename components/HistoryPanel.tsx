import React from 'react';
import { HistoryState } from '../types';
import { Icon } from './Icon';

interface HistoryPanelProps {
  history: HistoryState[];
  currentIndex: number;
  onJump: (index: number) => void;
  onFeedback: (index: number, rating: 'good' | 'bad') => void;
  isEditing: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, currentIndex, onJump, onFeedback, isEditing }) => {
  const currentItemRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    currentItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentIndex]);

  if (history.length === 0) {
    return <p className="text-sm text-slate-400 p-2 text-center">Nenhuma edição foi feita ainda.</p>;
  }

  return (
    <div className="flex flex-col-reverse gap-2 overflow-y-auto no-scrollbar p-1 max-h-60">
      {[...history].reverse().map((item, reversedIndex) => {
        const index = history.length - 1 - reversedIndex;
        const isCurrent = index === currentIndex;
        const isAiEdit = !!item.originalPrompt;
        const hasGoodFeedback = isAiEdit && item.feedback === 'good';

        return (
          <button
            key={`${index}-${item.actionName}`}
            ref={isCurrent ? currentItemRef : null}
            onClick={() => onJump(index)}
            className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-all duration-300 ${
              isCurrent
                ? 'bg-violet-500/30 ring-2 ring-violet-400'
                : 'bg-slate-800/60 hover:bg-slate-700/60'
            } ${
              hasGoodFeedback ? 'shadow-[0_0_10px_rgba(74,222,128,0.4)] ring-1 ring-green-500/60' : ''
            }`}
          >
            <img src={item.thumbnailUrl} alt={item.actionName} className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-slate-900" />
            <div className="flex-grow overflow-hidden">
              <div className="flex items-center gap-2">
                <p className={`font-semibold text-sm truncate ${isCurrent ? 'text-white' : 'text-slate-200'}`}>{item.actionName}</p>
                {isCurrent && isEditing && (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse flex-shrink-0"></div>
                )}
              </div>

              {isAiEdit && (
                 <div className="flex items-center gap-2 mt-1">
                    {item.feedback === null ? (
                       <>
                           <button onClick={(e) => { e.stopPropagation(); onFeedback(index, 'good');}} className="p-1 rounded-full hover:bg-green-500/20"><Icon name="thumbs-up" className="w-4 h-4 text-slate-400 hover:text-green-400"/></button>
                           <button onClick={(e) => { e.stopPropagation(); onFeedback(index, 'bad');}} className="p-1 rounded-full hover:bg-red-500/20"><Icon name="thumbs-down" className="w-4 h-4 text-slate-400 hover:text-red-400"/></button>
                       </>
                    ) : item.feedback === 'good' ? (
                        <Icon name="thumbs-up" className="w-4 h-4 text-green-500" />
                    ) : (
                        <Icon name="thumbs-down" className="w-4 h-4 text-red-500" />
                    )}
                 </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};