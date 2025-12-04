import React from 'react';
import { Icon } from './Icon';

interface EditImageButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const EditImageButton: React.FC<EditImageButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
  isLoading = false,
  className = '',
}) => {
  const baseClasses = 'w-full px-4 py-3 text-white font-bold rounded-md flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transform';
  
  const stateClasses = isLoading
    ? 'bg-slate-700 text-slate-400 cursor-wait'
    : disabled
    ? 'bg-slate-600/50 text-slate-500 cursor-not-allowed'
    : 'bg-gradient-to-br from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 focus:ring-violet-500 shadow-lg hover:shadow-xl shadow-violet-900/30 hover:shadow-violet-600/40 hover:-translate-y-1 active:translate-y-0';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${stateClasses} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processando...</span>
        </>
      ) : (
        <>
          <Icon name={icon} className="w-5 h-5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};