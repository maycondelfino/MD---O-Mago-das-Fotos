
import React, { useRef, useState, useMemo } from 'react';
import { Icon } from './Icon.js';
import { TOOLS } from '../constants.js';
import { EditImageButton } from './EditImageButton.js';

const exampleImages = [
  { name: 'Retrato (Mulher)', url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['people', 'portrait'] },
  { name: 'Paisagem (Montanhas)', url: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['landscape', 'nature'] },
  { name: 'Objeto (Câmera)', url: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['object', 'tech'] },
  { name: 'Interior (Sala)', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['interior', 'home'] },
  { name: 'Retrato (Homem)', url: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['people', 'portrait'] },
  { name: 'Urbano (Rua)', url: 'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['landscape', 'city', 'street'] },
];

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'people', label: 'Pessoas' },
  { id: 'landscape', label: 'Paisagens' },
  { id: 'object', label: 'Objetos' },
  { id: 'interior', label: 'Interiores' },
];

export const NewProjectModal = ({ onClose, onLoadImage, onGenerateImageClick }) => {
  const fileInputRef = useRef(null);
  const [loadingExample, setLoadingExample] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onLoadImage(e.target.files[0]);
      onClose();
    }
  };

  const handleExampleClick = async (example) => {
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

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return exampleImages;
    return exampleImages.filter(img => {
      if (activeCategory === 'landscape') return img.tags.some(t => ['landscape', 'nature', 'city'].includes(t));
      return img.tags.includes(activeCategory);
    });
  }, [activeCategory]);

  const generateTool = TOOLS.find(tool => tool.id === 'ia-generate-image');

  if (!generateTool) return null;

  return (
    React.createElement("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm", onClick: onClose },
      React.createElement("div", { className: "bg-slate-900 glass-panel p-6 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto no-scrollbar modal-content border border-slate-700/50", onClick: (e) => e.stopPropagation() },
        
        /* Header */
        React.createElement("div", { className: "flex justify-between items-center mb-8 sticky top-0 bg-slate-900/95 z-10 pb-4 border-b border-slate-800" },
          React.createElement("div", null,
            React.createElement("h2", { className: "text-3xl font-bold text-white tracking-tight" }, "Novo Projeto"),
            React.createElement("p", { className: "text-slate-400 text-sm mt-1" }, "Escolha como deseja começar sua criação")
          ),
          React.createElement("button", { onClick: onClose, className: "p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white", "aria-label": "Fechar" },
            React.createElement(Icon, { name: "x-circle", className: "w-8 h-8" })
          )
        ),

        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" },
          
          /* Coluna Esquerda: Ações Rápidas */
          React.createElement("div", { className: "flex flex-col gap-6 lg:col-span-1" },
            
            /* Opção 1: Carregar */
            React.createElement("div", { className: "bg-slate-800/50 p-5 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-colors" },
              React.createElement("h3", { className: "text-lg font-semibold text-white mb-2 flex items-center gap-2" },
                  React.createElement("div", { className: "p-1.5 bg-violet-500/20 rounded-md" },
                    React.createElement(Icon, { name: "upload-cloud", className: "w-5 h-5 text-violet-400" })
                  ),
                  "Seu Arquivo"
              ),
              React.createElement("p", { className: "text-sm text-slate-400 mb-4" }, "Carregue uma imagem do seu dispositivo para começar a editar."),
              React.createElement(EditImageButton, {
                label: "Carregar Foto",
                icon: "image",
                onClick: () => fileInputRef.current?.click(),
                className: "w-full"
              }),
              React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileChange, className: "hidden" })
            ),

            /* Opção 2: Gerar IA */
            React.createElement("div", { className: "bg-gradient-to-br from-slate-800/50 to-violet-900/20 p-5 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors" },
              React.createElement("h3", { className: "text-lg font-semibold text-white mb-2 flex items-center gap-2" },
                  React.createElement("div", { className: "p-1.5 bg-cyan-500/20 rounded-md" },
                    React.createElement(Icon, { name: "zap", className: "w-5 h-5 text-cyan-400" })
                  ),
                  "Criar com IA"
              ),
              React.createElement("p", { className: "text-sm text-slate-400 mb-4" }, "Descreva sua ideia e deixe a inteligência artificial gerar uma imagem única."),
              React.createElement(EditImageButton, {
                label: "Gerar Imagem",
                icon: generateTool.icon,
                onClick: () => { onGenerateImageClick(generateTool); onClose(); },
                className: "w-full"
              })
            )
          ),

          /* Coluna Direita: Galeria de Exemplos */
          React.createElement("div", { className: "lg:col-span-2 flex flex-col" },
            React.createElement("div", { className: "mb-4" },
                React.createElement("h3", { className: "text-lg font-semibold text-white mb-1 flex items-center gap-2" },
                    React.createElement(Icon, { name: "image", className: "w-5 h-5 text-emerald-400" }),
                    "Galeria de Exemplos"
                ),
                React.createElement("p", { className: "text-sm text-slate-400" }, "Escolha uma imagem de alta qualidade para testar.")
            ),

            /* Filtros de Categoria */
            React.createElement("div", { className: "flex flex-wrap gap-2 mb-5" },
                CATEGORIES.map(cat => (
                    React.createElement("button", {
                        key: cat.id,
                        onClick: () => setActiveCategory(cat.id),
                        className: `px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border ${
                            activeCategory === cat.id 
                            ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/50' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`
                    }, cat.label)
                ))
            ),

            /* Grid de Imagens - Refatorado para ser maior */
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
              filteredImages.map(img => (
                React.createElement("div", {
                  key: img.name,
                  className: "relative group rounded-xl overflow-hidden shadow-lg border border-slate-800 hover:border-violet-500 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer bg-slate-800",
                  onClick: () => handleExampleClick(img)
                },
                  /* Altura aumentada para h-48 para miniaturas maiores */
                  React.createElement("img", { src: img.url, alt: img.name, className: "w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" }),
                  
                  /* Overlay com Gradiente */
                  React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300 flex flex-col justify-end p-4" },
                    React.createElement("h4", { className: "text-white font-bold text-sm tracking-wide" }, img.name),
                    React.createElement("div", { className: "flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0" },
                        React.createElement("span", { className: "text-[10px] uppercase font-bold text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded" }, "Testar")
                    )
                  ),
                  
                  /* Loading Overlay */
                  loadingExample === img.name && (
                    React.createElement("div", { className: "absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-sm z-20" },
                      React.createElement("svg", { className: "animate-spin h-8 w-8 text-violet-500 mb-2", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                        React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                        React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                      ),
                      React.createElement("p", { className: "text-xs font-medium text-violet-200" }, "Carregando...")
                    )
                  )
                )
              ))
            ),
            
            filteredImages.length === 0 && (
                React.createElement("div", { className: "flex flex-col items-center justify-center py-10 text-slate-500" },
                    React.createElement(Icon, { name: "image", className: "w-10 h-10 mb-2 opacity-50" }),
                    React.createElement("p", { className: "text-sm" }, "Nenhum exemplo encontrado nesta categoria.")
                )
            )
          )
        )
      )
    )
  );
};
