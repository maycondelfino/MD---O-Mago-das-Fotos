import React from 'react';

interface LoaderProps {
  message: string;
  progress?: number | null;
  onCancel?: () => void;
}

const Loader: React.FC<LoaderProps> = ({ message, progress, onCancel }) => {
  return (
    <div className="absolute inset-0 bg-slate-900 bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <svg
        className="animate-spin h-12 w-12 text-indigo-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="mt-4 text-lg font-semibold text-slate-300">{message}</p>
      
      {typeof progress === 'number' ? (
        <div className="w-64 mt-2 text-center">
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm text-slate-400 mt-1.5 font-medium">{progress.toFixed(0)}%</p>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Isso pode levar alguns segundos.</p>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 px-4 py-2 bg-red-600/50 text-red-200 text-sm font-semibold rounded-md hover:bg-red-600/80 transition-colors"
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

export default Loader;