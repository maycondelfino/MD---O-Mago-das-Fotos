// types.ts
export interface Tool {
  id: string;
  module: string;
  icon: string;
  name: string;
  description: string;
  promptSuggestion: string;
  isGenerator?: boolean;
  disabled?: boolean;
  isManualControl?: boolean;
  predefinedStyles?: { name: string; prompt: string }[];
  oneClick?: boolean;
  promptExamples?: string[];
}

export interface ColorBalanceValue {
  color: string;
  intensity: number;
}

export interface ColorBalance {
  shadows: ColorBalanceValue;
  midtones: ColorBalanceValue;
  highlights: ColorBalanceValue;
}

export interface ToneCurvePoint {
  x: number;
  y: number;
}

export interface ToneCurvesState {
  rgb: ToneCurvePoint[];
  r: ToneCurvePoint[];
  g: ToneCurvePoint[];
  b: ToneCurvePoint[];
}

export interface HistoryState {
  imageUrl: string;
  width: number;
  height: number;
  actionName: string;
  thumbnailUrl: string;
  contrast: number;
  brightness: number;
  saturation: number;
  lightness: number;
  sepia: number;
  hue: number;
  vintage: number;
  shadows: number;
  highlights: number;
  colorBalance: ColorBalance;
  gradientStartColor: string;
  gradientEndColor: string;
  gradientIntensity: number;
  contour: number;
  selectionMask?: string | null; // Armazena a máscara de seleção como base64
  frameColor: string;
  frameThickness: number;
  framePadding: number;
  vignetteIntensity: number;
  vignetteSize: number;
  toneCurves: ToneCurvesState;
  duotoneColor1: string;
  duotoneColor2: string;
  duotoneIntensity: number;
  backgroundColor: string;
  sharpness: number;
  sharpnessMode: 'edge' | 'clarity';
  originalPrompt?: string; // Armazena o prompt de IA que gerou este estado
  feedback?: 'good' | 'bad' | null; // Armazena o feedback do usuário para edições de IA
  nightModeIntensity: number;
  beautySkinSmoothing: number;
  beautyWrinkles: number;
  beautyDarkCircles: number;
  beautyLipColor: number;
  beautyFillBeard: number;
  beautyFillEyebrows: number;
  beautyHairColor: string;
  ageChange: number;
  weightChange: number;
}
