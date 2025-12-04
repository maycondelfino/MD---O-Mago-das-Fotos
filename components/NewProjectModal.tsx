import React, { useRef, useState } from 'react';
import { Icon } from './Icon'; // Caminho relativo
import { Tool } from '../types'; // Caminho relativo
import { TOOLS } from '../constants'; // Caminho relativo
import { fileToDataUrl } from '../utils/imageProcessor'; // Caminho relativo
import { EditImageButton } from './EditImageButton'; // Caminho relativo

interface NewProjectModalProps {
  onClose: () => void;
  onLoadImage: (file: File) => void;
  onGenerateImageClick: (tool: Tool) => void;
}

const exampleImages = [
  { name: 'Retrato (Mulher)', url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['people', 'portrait'] },
  { name: 'Paisagem (Montanhas)', url: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['landscape', 'nature'] },
  { name: 'Objeto (Câmera)', url: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['object', 'tech'] },
  { name: 'Interior (Sala)', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['interior', 'home'] },
  { name: 'Retrato (Homem)', url: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['people', 'portrait'] },
  { name: 'Urbano (Rua)', url: 'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['city', 'street'] },
];


export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onLoadImage, onGenerateImageClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingExample, setLoadingExample] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLoadImage(e.target.files[0]);
      onClose();
    }
  };

  const handleExampleClick = async (example: { name: string; url: string }) => {
    if (loadingExample) return;
    setLoadingExample(example.name);
    try {
      const response = await fetch(example.url);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      const blob = await response.blob();
      const filename = example.url.split('/').pop()?.split('?')[0] || `${example.name.toLowerCase()}.jpg`;
      const file = new File([blob], filename, { type: blob.type });
      onLoadImage(file);
    } catch (error) {
      console.error("Error loading example image:", error);
      alert("Não foi possível carregar a imagem de exemplo. Verifique sua conexão com a internet.");
      setLoadingExample(null);
    }
  };

  const generateTool = TOOLS.find(tool => tool.id === 'ia-generate-image');

  if (!generateTool) return null; // Should not happen

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={onClose}>
      <div className="bg-slate-900 glass-panel p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Iniciar Novo Projeto</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Fechar">
            <Icon name="x-circle" className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Opção 1: Carregar uma Foto */}
          <div>
            <h3 className="text-xl font-semibold text-violet-400 mb-3 flex items-center gap-2">
                <Icon name="upload-cloud" className="w-5 h-5" /> Carregar uma Foto
            </h3>
            <EditImageButton 
              label="Selecionar Arquivo"
              icon="image"
              onClick={() => fileInputRef.current?.click()}
              className="w-auto px-6 py-2"
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Opção 2: Gerar com IA */}
          <div>
            <h3 className="text-xl font-semibold text-violet-400 mb-3 flex items-center gap-2">
                <Icon name="zap" className="w-5 h-5" /> Gerar com IA
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              Crie uma imagem totalmente nova a partir de uma descrição de texto usando o poder da inteligência artificial.
            </p>
            <EditImageButton 
              label="Iniciar Gerador de Imagens"
              icon={generateTool.icon}
              onClick={() => { onGenerateImageClick(generateTool); onClose(); }}
              className="w-auto px-6 py-2"
            />
          </div>

          {/* Opção 3: Começar com um Exemplo */}
          <div>
            <h3 className="text-xl font-semibold text-violet-400 mb-3 flex items-center gap-2">
                <Icon name="image" className="w-5 h-5" /> Começar com um Exemplo
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Escolha uma imagem para experimentar as ferramentas do editor.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exampleImages.map(img => (
                <div 
                  key={img.name} 
                  className="relative group rounded-lg overflow-hidden shadow-lg border border-slate-700 hover:border-violet-500 transition-all duration-300 transform hover:scale-105 cursor-pointer" 
                  onClick={() => handleExampleClick(img)}
                >
                  <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-start justify-end p-3">
                    <h4 className="text-white font-bold text-base">{img.name}</h4>
                  </div>
                  {loadingExample === img.name && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm mt-2 text-slate-200">Carregando...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
