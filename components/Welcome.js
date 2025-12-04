

import React, { useRef, useState } from 'react';
import { Icon } from './Icon.js';

const FeatureCard = ({ icon, title, description, delay }) => (
    React.createElement("div", {
        className: "glass-panel p-4 rounded-xl flex flex-col items-center text-center animate-slideUpAndFade", // p-6 to p-4
        style: { animationDelay: delay }
    },
        React.createElement("div", { className: "w-14 h-14 bg-violet-500/20 rounded-full flex items-center justify-center mb-3 border border-violet-500/30" },
            React.createElement(Icon, { name: icon, className: "w-7 h-7 text-violet-300" })
        ),
        React.createElement("h3", { className: "text-lg font-bold text-white mb-1" }, title),
        React.createElement("p", { className: "text-slate-400 text-xs" }, description)
    )
);


export const Welcome = ({ onImageUpload, onGenerateClick }) => {
    const fileInputRef = useRef(null);
    const [loadingExample, setLoadingExample] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) onImageUpload(e.target.files[0]);
    };
    const handleButtonClick = () => fileInputRef.current?.click();
    
    const exampleImages = [
      { name: 'Retrato', url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { name: 'Paisagem', url: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { name: 'Objeto', url: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { name: 'Interior', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600' },
    ];
    
    const handleExampleClick = async (example) => {
        if (loadingExample) return;
        setLoadingExample(example.name);
        try {
            const response = await fetch(example.url);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const blob = await response.blob();
            const filename = example.url.split('/').pop()?.split('?')[0] || `${example.name.toLowerCase()}.jpg`;
            const file = new File([blob], filename, { type: blob.type });
            onImageUpload(file);
        } catch (error) {
            console.error("Error loading example image:", error);
            alert("Não foi possível carregar a imagem de exemplo. Verifique sua conexão com a internet.");
            setLoadingExample(null);
        }
    };

    return (
        React.createElement("div", { className: "flex flex-col items-center justify-start lg:justify-center min-h-full w-full text-center text-white px-4 py-8 sm:py-12 overflow-y-auto overflow-x-hidden no-scrollbar relative" },
            
            React.createElement("div", { className: "w-full flex flex-col items-center z-10" },
                React.createElement("div", { className: "glass-panel p-6 sm:p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 w-full max-w-4xl welcome-container" },
                    React.createElement(Icon, { name: "logo-magic", className: "w-20 h-20 text-cyan-400 animate-float" }),
                    React.createElement("div", { className: "welcome-title text-center" },
                        React.createElement("h1", { className: "text-3xl md:text-4xl font-bold tracking-tight text-white", style: { animationDelay: '0.2s' } },
                            "MD"
                        ),
                        React.createElement("h2", { className: "text-xl md:text-2xl font-semibold text-cyan-300 mt-1", style: { animationDelay: '0.4s' } },
                            "O Mago das Fotos"
                        )
                    ),
                    React.createElement("p", { className: "max-w-xl text-base text-slate-300" },
                        "D\xEA vida \xE0s suas fotos com o poder da Intelig\xEAncia Artificial. Remova objetos, mude cen\xE1rios ou crie imagens do zero. A m\xE1gica est\xE1 em suas m\xE3os."
                    ),
                    React.createElement("div", { className: "flex flex-col sm:flex-row gap-3 mt-2" },
                        React.createElement("button", { onClick: handleButtonClick, className: "px-6 py-3 bg-violet-600 rounded-lg font-bold text-base hover:bg-violet-500 transition-all duration-300 transform hover:scale-105 animate-pulse-glow" },
                            "Carregar uma Foto"
                        ),
                        React.createElement("button", { onClick: onGenerateClick, className: "px-6 py-3 bg-slate-700/50 border border-slate-600 rounded-lg font-bold text-base hover:bg-slate-700/80 transition-all duration-300 transform hover:scale-105" },
                            "Gerar com IA"
                        )
                    ),
                    React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileChange, className: "hidden" })
                ),

                React.createElement("div", { className: "mt-6 sm:mt-8 w-full max-w-5xl animate-slideUpAndFade", style: { animationDelay: '1.6s' } },
                    React.createElement("h2", { className: "text-xl font-bold text-slate-200 mb-4" }, "Ou comece com um exemplo"),
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" },
                        exampleImages.map(img => (
                            React.createElement("div", { key: img.name, className: "relative group rounded-lg overflow-hidden shadow-lg", onClick: () => handleExampleClick(img) },
                                React.createElement("img", { src: img.url, alt: img.name, className: "w-full h-24 md:h-32 object-cover rounded-lg transition-all duration-300 transform group-hover:scale-110 cursor-pointer" }),
                                React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-start justify-end p-2 cursor-pointer" },
                                    React.createElement("h3", { className: "text-white font-bold text-base" },
                                        img.name
                                    )
                                ),
                                loadingExample === img.name && (
                                    React.createElement("div", { className: "absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm" },
                                        React.createElement("svg", { className: "animate-spin h-8 w-8 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                                            React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                                            React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                                        ),
                                        React.createElement("p", { className: "text-sm mt-2 text-slate-200" }, "Carregando...")
                                    )
                                )
                            )
                        ))
                    )
                ),

                React.createElement("div", { className: "mt-8 sm:mt-12 w-full max-w-5xl" },
                    React.createElement("h2", { className: "text-xl font-bold text-slate-200 mb-6 welcome-container animate-slideUpAndFade", style: {animationDelay: '0.8s'} }, "Descubra a Magia"),
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                        React.createElement(FeatureCard, {
                            icon: "eraser",
                            title: "Edição M\xE1gica",
                            description: "Remova objetos, troque fundos ou adicione elementos com a precis\xE3o de um feiti\xE7o.",
                            delay: "1s"
                        }),
                        React.createElement(FeatureCard, {
                            icon: "face",
                            title: "Retoques de Beleza",
                            description: "Suavize pele, remova olheiras e realce tra\xE7os com a ajuda da IA.",
                            delay: "1.2s"
                        }),
                        React.createElement(FeatureCard, {
                            icon: "brush",
                            title: "Estilos Art\xEDsticos",
                            description: "Transforme suas fotos em obras de arte com estilos como aquarela, cyberpunk ou pintura a \xF3leo.",
                            delay: "1.4s"
                        }),
                        React.createElement(FeatureCard, {
                            icon: "zap",
                            title: "Cria\xE7\xE3o do Zero",
                            description: "N\xE3o tem uma foto? Descreva sua ideia e deixe a IA criar uma imagem \xFAnica para voc\xEA.",
                            delay: "1.6s"
                        })
                    )
                )
            )
        )
    );
};