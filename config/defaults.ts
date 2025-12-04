

export interface AiModel {
  id: string;
  name: string;
  description: string;
}

export const AI_MODELS: AiModel[] = [
  { 
    id: 'gemini-3-pro-image-preview', 
    name: 'Gemini 3 Pro (Imagem)', 
    description: 'Modelo mais avançado para geração e edição de imagens em alta qualidade.' 
  },
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    description: 'Modelo rápido e eficiente.' 
  },
];

export interface AppConfig {
  aiModelId: string;
  aiModelIdForGeneration: string;
  backgroundImageUrl: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  aiModelId: 'gemini-3-pro-image-preview',
  aiModelIdForGeneration: 'gemini-3-pro-image-preview',
  backgroundImageUrl: '',
};
