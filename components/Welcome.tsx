import React, { useRef, useState } from 'react';
import { Icon } from './Icon';

interface WelcomeProps {
  onImageUpload: (file: File) => void;
  onGenerateClick: () => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; description: string; delay: string; }> = ({ icon, title, description, delay }) => (
    <div
        className="glass-panel p-4 rounded-xl flex flex-col items-center text-center animate-slideUpAndFade" // p-6 to p-4
        style={{ animationDelay: delay }}
    >
        <div className="w-14 h-14 bg-violet-500/20 rounded-full flex items-center justify-center mb-3 border border-violet-500/30">
            <Icon name={icon} className="w-7 h-7 text-violet-300" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-xs">{description}</p>
    </div>
);


export const Welcome: React.FC<WelcomeProps> = ({ onImageUpload, onGenerateClick }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loadingExample, setLoadingExample] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) onImageUpload(e.target.files[0]);
    };
    const handleButtonClick = () => fileInputRef.current?.click();
    
    const exampleImages = [
      { name: 'Retrato', url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { name: 'Paisagem', url: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { name: 'Objeto', url: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { name: 'Interior', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600' },
    ];
    
    const handleExampleClick = async (example: { name: string; url: string }) => {
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
        <div className="flex flex-col items-center justify-start lg:justify-center min-h-full w-full text-center text-white px-4 py-8 sm:py-12 overflow-y-auto overflow-x-hidden no-scrollbar relative">
            
            <div className="w-full flex flex-col items-center z-10">
                <div className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 w-full max-w-4xl welcome-container">
                    <Icon name="logo-magic" className="w-20 h-20 text-cyan-400 animate-float" />
                    <div className="welcome-title text-center">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ animationDelay: '0.2s' }}>
                            MD
                        </h1>
                        <h2 className="text-xl md:text-2xl font-semibold text-cyan-300 mt-1" style={{ animationDelay: '0.4s' }}>
                            O Mago das Fotos
                        </h2>
                    </div>
                    <p className="max-w-xl text-base text-slate-300">
                        Dê vida às suas fotos com o poder da Inteligência Artificial. Remova objetos, mude cenários ou crie imagens do zero. A mágica está em suas mãos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <button onClick={handleButtonClick} className="px-6 py-3 bg-violet-600 rounded-lg font-bold text-base hover:bg-violet-500 transition-all duration-300 transform hover:scale-105 animate-pulse-glow">
                            Carregar uma Foto
                        </button>
                        <button onClick={onGenerateClick} className="px-6 py-3 bg-slate-700/50 border border-slate-600 rounded-lg font-bold text-base hover:bg-slate-700/80 transition-all duration-300 transform hover:scale-105">
                            Gerar com IA
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <div className="mt-6 sm:mt-8 w-full max-w-5xl animate-slideUpAndFade" style={{ animationDelay: '1.6s' }}>
                    <h2 className="text-xl font-bold text-slate-200 mb-4">Ou comece com um exemplo</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {exampleImages.map(img => (
                            <div key={img.name} className="relative group rounded-lg overflow-hidden shadow-lg" onClick={() => handleExampleClick(img)}>
                                <img src={img.url} alt={img.name} className="w-full h-24 md:h-32 object-cover rounded-lg transition-all duration-300 transform group-hover:scale-110 cursor-pointer" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-start justify-end p-2 cursor-pointer">
                                    <h3 className="text-white font-bold text-base">
                                        {img.name}
                                    </h3>
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

                <div className="mt-8 sm:mt-12 w-full max-w-5xl">
                    <h2 className="text-xl font-bold text-slate-200 mb-6 welcome-container animate-slideUpAndFade" style={{animationDelay: '0.8s'}}>Descubra a Magia</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FeatureCard
                            icon="eraser"
                            title="Edição Mágica"
                            description="Remova objetos, troque fundos ou adicione elementos com a precisão de um feitiço."
                            delay="1s"
                        />
                        <FeatureCard
                            icon="face"
                            title="Retoques de Beleza"
                            description="Suavize pele, remova olheiras e realce traços com a ajuda da IA."
                            delay="1.2s"
                        />
                        <FeatureCard
                            icon="brush"
                            title="Estilos Artísticos"
                            description="Transforme suas fotos em obras de arte com estilos como aquarela, cyberpunk ou pintura a óleo."
                            delay="1.4s"
                        />
                        <FeatureCard
                            icon="zap"
                            title="Criação do Zero"
                            description="Não tem uma foto? Descreva sua ideia e deixe a IA criar uma imagem única para você."
                            delay="1.6s"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};