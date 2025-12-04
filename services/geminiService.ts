
import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';

// Configuração do modelo de IA. Conforme solicitado, todas as chamadas utilizarão o Gemini 3 Pro.
const AI_MODEL = 'gemini-3-pro-image-preview';

// O API key DEVE ser obtido exclusivamente de process.env.API_KEY.
// Assumimos que process.env.API_KEY é pré-configurado, válido e acessível.
// A remoção de `?.` garante que a inicialização falhe se process.env.API_KEY não estiver disponível,
// conforme a guideline de que ele sempre estará presente.
const API_KEY = process.env.API_KEY; 
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper function to handle AI errors gracefully
const handleAiError = (error: any, signal?: AbortSignal): Error => {
  if (signal?.aborted) {
    return new Error('A requisição foi cancelada pelo usuário.');
  }

  console.error("Erro na chamada à API Gemini:", error);

  // Check for the specific 503 overloaded error
  if (error.message && (error.message.includes('"code":503') || error.message.includes('"status":"UNAVAILABLE"'))) {
    return new Error('O Mago está muito ocupado no momento. Por favor, tente novamente em alguns instantes.');
  }

  // Attempt to parse a JSON error message for a cleaner output
  try {
    const errorJson = JSON.parse(error.message);
    if (errorJson.error && errorJson.error.message) {
      return new Error(`Ocorreu um erro com a IA: ${errorJson.error.message}`);
    }
  } catch (e) {
    // Not a JSON error message, proceed with the original message
  }

  // Default error message for other cases
  return new Error(`Ocorreu um erro com a IA: ${error.message || 'Falha na comunicação.'}`);
};

const generateAiErrorFromResponse = (response: GenerateContentResponse): Error => {
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') {
        const blockedCategory = response.candidates?.[0]?.safetyRatings?.find(r => r.blocked)?.category;
        return new Error(`Bloqueado por segurança. Motivo: ${blockedCategory || 'Não especificado'}.`);
    }

    const textResponse = response.text;
    if (textResponse) {
        return new Error(`A IA retornou um texto em vez de uma imagem: "${textResponse.substring(0, 150)}..."`);
    }
    
    return new Error('A IA não retornou uma imagem. Tente novamente com um prompt diferente.');
};


// Interfaces for function parameters
interface EditImageParams {
  base64ImageData: string;
  mimeType: string;
  prompt: string;
  // toolId: string; // This property is not used by the API call and can be removed.
  selectionMask?: { base64: string; mimeType: string };
  referenceImage?: { base64: string; mimeType: string };
  shouldChangeEnvironment?: boolean;
  signal?: AbortSignal;
  // Added 'model' property to allow specifying the AI model
  model: string;
}

interface GenerateImageParams {
  prompt: string;
  signal?: AbortSignal;
  // Added 'model' property to allow specifying the AI model
  model: string;
}

interface AnalyzeImageParams {
    base64ImageData: string;
    mimeType: string;
    signal?: AbortSignal;
    // Added 'model' property to allow specifying the AI model
    model: string;
}

export const editImage = async ({
  base64ImageData,
  mimeType,
  prompt,
  // Removed toolId as it's not used in the API call directly
  selectionMask,
  referenceImage,
  signal,
  model,
}: EditImageParams): Promise<{ base64: string; mimeType: string }> => {
  // A verificação de 'ai' não é necessária, pois a guideline indica que ele sempre será inicializado.
  // if (!ai) throw new Error('A IA não está disponível.');

  try {
    const parts: Part[] = [
      { inlineData: { mimeType, data: base64ImageData } },
    ];
    
    // The order is important to match the prompt engineering in App.tsx
    if (referenceImage) {
        parts.push({ inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.base64 } });
    }
    if (selectionMask) {
        parts.push({ inlineData: { mimeType: selectionMask.mimeType, data: selectionMask.base64 } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: model, // Utilizando o modelo Gemini 3 Pro
      contents: { parts },
    });

    // Find the first image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return {
                base64: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
            };
        }
    }

    throw generateAiErrorFromResponse(response);
  } catch (error) {
    throw handleAiError(error, signal);
  }
};

export const generateImage = async ({ prompt, signal, model }: GenerateImageParams): Promise<{ base64: string; mimeType: string }> => {
    // if (!ai) throw new Error('A IA não está disponível.');

    try {
        const response = await ai.models.generateContent({
            model: model, // Utilizando o modelo Gemini 3 Pro
            contents: { parts: [{ text: prompt }] },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        
        throw generateAiErrorFromResponse(response);
    } catch (error) {
        throw handleAiError(error, signal);
    }
};

export const analyzeImage = async ({ base64ImageData, mimeType, signal, model }: AnalyzeImageParams): Promise<string> => {
    // if (!ai) throw new Error('A IA não está disponível.');

    try {
        const prompt = "Analise esta foto como um fotógrafo e editor profissional. Forneça uma lista curta (bullet points) de sugestões práticas para melhorar a imagem, focando em iluminação, cor, composição e possíveis retoques. Seja conciso e direto.";

        const response = await ai.models.generateContent({
            model: model, // Utilizando o modelo Gemini 3 Pro
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64ImageData } },
                    { text: prompt },
                ],
            },
        });
        
        const text = response.text;
        if (!text) {
             throw new Error('A IA não retornou uma análise de texto.');
        }

        return text;
    } catch (error) {
        throw handleAiError(error, signal);
    }
};

// isAiAvailable deve ser true se a inicialização de ai for bem-sucedida, conforme as diretrizes
export const isAiAvailable = true;
