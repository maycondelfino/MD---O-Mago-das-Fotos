import React, { useRef, useState, useCallback } from 'react';
import { Icon } from './Icon';

interface ReferenceImagePanelProps {
  referenceImage: { dataUrl: string } | null;
  onReferenceFileSelect: (file: File | null) => void;
  onReferenceImageRemove: () => void;
  className?: string;
}

export const ReferenceImagePanel: React.FC<ReferenceImagePanelProps> = ({ referenceImage, onReferenceFileSelect, onReferenceImageRemove, className = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onReferenceFileSelect(file);
    }
  }, [onReferenceFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onReferenceFileSelect(file);
    }
  };

  return (
    <div className={`mt-3 ${className}`}>
      <label className="block text-sm font-medium text-slate-300 mb-2">Imagem de Referência (Opcional)</label>
      {referenceImage ? (
        <div className="relative group">
          <img src={referenceImage.dataUrl} alt="Referência" className="w-full h-24 object-cover rounded-md" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onReferenceImageRemove}
              className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-600"
              title="Remover imagem de referência"
            >
              <Icon name="trash" className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md transition-colors bg-slate-800/50 ${isDragging ? 'border-violet-500 bg-slate-800' : 'border-slate-600 hover:border-indigo-500 hover:bg-slate-800'}`}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-center w-full"
          >
            <Icon name="upload-cloud" className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm text-slate-300">Carregar imagem</span>
            <span className="text-xs text-slate-500 mt-1">ou arraste e solte</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};