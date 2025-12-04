// utils/imageProcessor.ts

import { ColorBalance, HistoryState, ToneCurvesState, ToneCurvePoint } from '../types';

export const fileToDataUrl = (
  file: File,
  onProgress: (progress: number) => void
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    reader.onload = () => {
      onProgress(100); // Garante que a barra chegue a 100%
      const result = reader.result as string;
      const [header, base64] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      resolve({ base64, mimeType });
    };

    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
};

export const applyBackgroundColor = (ctx: CanvasRenderingContext2D, color: string) => {
  ctx.save();
  // 'destination-over' desenha o novo conteúdo (a cor de fundo) atrás do conteúdo existente.
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
};

// Converte uma cor RGB para o formato HSL (Matiz, Saturação, Luminosidade)
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l]; // h, s, l estão em [0, 1]
};

// Converte uma cor HSL para o formato RGB
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export const applyGradientFilter = (ctx: CanvasRenderingContext2D, startColor: string, endColor: string, intensity: number) => {
    if (intensity === 0) return;
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    ctx.globalAlpha = intensity / 100;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const applyContourFilter = (ctx: CanvasRenderingContext2D, intensity: number) => {
    if (intensity === 0) return;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return;

    tempCtx.drawImage(ctx.canvas, 0, 0);
    tempCtx.filter = `grayscale(1) contrast(300%) invert(1)`;
    tempCtx.drawImage(tempCanvas, 0, 0);

    ctx.save();
    ctx.globalAlpha = intensity / 100;
    ctx.globalCompositeOperation = 'color-dodge'; 
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
};

export const applyVignette = (ctx: CanvasRenderingContext2D, intensity: number, size: number) => {
  if (intensity === 0) return;

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.save();

  const centerX = w / 2;
  const centerY = h / 2;

  // O raio externo alcança os cantos do canvas
  const outerRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  
  // 'size' (0-100) controla o início do gradiente.
  const startPoint = 1 - (size / 100); 
  const innerRadius = outerRadius * startPoint;

  const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);

  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${intensity / 100})`);

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
};

export const resizeImage = (
  dataUrl: string,
  newWidth: number,
  newHeight: number
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Não foi possível obter o contexto 2D do canvas.'));
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      const [header] = dataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

      const resizedDataUrl = canvas.toDataURL(mimeType);
      const [, base64] = resizedDataUrl.split(',');

      resolve({ base64, mimeType });
    };
    img.onerror = (err) => reject(new Error('Falha ao carregar a imagem para redimensionamento.'));
    img.src = dataUrl;
  });
};

export const generateThumbnail = (
  canvas: HTMLCanvasElement,
  maxSize: number = 50
): string => {
  const thumbCanvas = document.createElement('canvas');
  
  const aspectRatio = canvas.width / canvas.height;
  let width = maxSize;
  let height = maxSize;

  if (aspectRatio > 1) { // Paisagem
    height = maxSize / aspectRatio;
  } else { // Retrato ou quadrado
    width = maxSize * aspectRatio;
  }
  
  thumbCanvas.width = Math.round(width);
  thumbCanvas.height = Math.round(height);

  const ctx = thumbCanvas.getContext('2d');
  if (!ctx) {
    console.error("Não foi possível criar o contexto para a miniatura.");
    return '';
  }
  
  // Desenha o canvas de origem no canvas menor da miniatura.
  ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  
  // Usa JPEG para um data URL menor, ideal para pré-visualizações.
  return thumbCanvas.toDataURL('image/jpeg', 0.8);
};

const createLut = (points: ToneCurvePoint[]): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256);
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  for (let i = 0; i < 256; i++) {
    let p1: ToneCurvePoint | undefined, p2: ToneCurvePoint | undefined;

    if (i < sortedPoints[0].x) {
      lut[i] = sortedPoints[0].y;
      continue;
    }
    if (i > sortedPoints[sortedPoints.length - 1].x) {
      lut[i] = sortedPoints[sortedPoints.length - 1].y;
      continue;
    }

    for (let j = 0; j < sortedPoints.length - 1; j++) {
      if (i >= sortedPoints[j].x && i <= sortedPoints[j + 1].x) {
        p1 = sortedPoints[j];
        p2 = sortedPoints[j + 1];
        break;
      }
    }

    if (p1 && p2) {
      const t = (p2.x - p1.x) === 0 ? 0 : (i - p1.x) / (p2.x - p1.x);
      lut[i] = p1.y + t * (p2.y - p1.y);
    }
  }
  return lut;
};

export const applyAllPixelAdjustments = (ctx: CanvasRenderingContext2D, state: HistoryState) => {
    const { 
        contrast,
        brightness, saturation, hue, lightness,
        colorBalance,
        shadows, highlights,
        vintage,
        duotoneColor1, duotoneColor2, duotoneIntensity,
        toneCurves,
        sharpness,
        sharpnessMode,
    } = state;
    
    const isDefaultCurves = (curves: ToneCurvesState) => {
      const isDefaultPoints = (points: ToneCurvePoint[], hasMidpoint: boolean) => {
        if (hasMidpoint) {
          if (points.length !== 3) return false;
          return points[0].x === 0 && points[0].y === 0 && points[1].x === 127 && points[1].y === 127 && points[2].x === 255 && points[2].y === 255;
        }
        if (points.length !== 2) return false;
        return points[0].x === 0 && points[0].y === 0 && points[1].x === 255 && points[1].y === 255;
      };
      return isDefaultPoints(curves.rgb, true) && isDefaultPoints(curves.r, false) && isDefaultPoints(curves.g, false) && isDefaultPoints(curves.b, false);
    };

    const hasPixelAdjustments = !(
        contrast === 100 &&
        brightness === 100 && saturation === 100 && hue === 0 && lightness === 100 &&
        shadows === 0 && highlights === 0 &&
        vintage === 0 &&
        duotoneIntensity === 0 &&
        sharpness === 0 &&
        colorBalance.shadows.intensity === 0 &&
        colorBalance.midtones.intensity === 0 &&
        colorBalance.highlights.intensity === 0 &&
        isDefaultCurves(toneCurves)
    );

    if (hasPixelAdjustments) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        
        // Pass de Nitidez/Desfoque por Convolução (se necessário)
        if (sharpness !== 0) {
            const sourceData = new Uint8ClampedArray(data);
            const amount = sharpness / 100.0;

            if (sharpnessMode === 'clarity') {
                const blurredData = new Uint8ClampedArray(sourceData.length);
                // Box blur para performance
                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        const i = (y * w + x) * 4;
                        let r = 0, g = 0, b = 0;
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const pixel_i = ((y + ky) * w + (x + kx)) * 4;
                                r += sourceData[pixel_i];
                                g += sourceData[pixel_i + 1];
                                b += sourceData[pixel_i + 2];
                            }
                        }
                        blurredData[i] = r / 9;
                        blurredData[i + 1] = g / 9;
                        blurredData[i + 2] = b / 9;
                    }
                }
                // Aplica a fórmula de clareza (unsharp mask)
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = sourceData[i] + (sourceData[i] - blurredData[i]) * amount * 2;
                    data[i + 1] = sourceData[i + 1] + (sourceData[i + 1] - blurredData[i + 1]) * amount * 2;
                    data[i + 2] = sourceData[i + 2] + (sourceData[i + 2] - blurredData[i + 2]) * amount * 2;
                }
            } else { // modo 'edge' (padrão)
                const kernel = [
                    [0, -amount, 0],
                    [-amount, 1 + 4 * amount, -amount],
                    [0, -amount, 0]
                ];
                // Aplica a convolução
                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        const i = (y * w + x) * 4;
                        let r = 0, g = 0, b = 0;
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const pixel_i = ((y + ky) * w + (x + kx)) * 4;
                                const weight = kernel[ky + 1][kx + 1];
                                if (weight === 0) continue;
                                r += sourceData[pixel_i] * weight;
                                g += sourceData[pixel_i + 1] * weight;
                                b += sourceData[pixel_i + 2] * weight;
                            }
                        }
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                    }
                }
            }
        }


        const brightnessFactor = brightness / 100;
        const contrastFactor = contrast / 100.0;
        const saturationFactor = saturation / 100;
        const lightnessFactor = lightness / 100;
        const hueShift = hue / 360;
        const vintageFactor = vintage / 100;
        const duotoneFactor = duotoneIntensity / 100;
        
        const duotoneRgb1 = hexToRgb(duotoneColor1);
        const duotoneRgb2 = hexToRgb(duotoneColor2);
        
        const rgbLut = createLut(toneCurves.rgb);
        const rLut = createLut(toneCurves.r);
        const gLut = createLut(toneCurves.g);
        const bLut = createLut(toneCurves.b);

        for (let i = 0; i < data.length; i += 4) {
            const originalR = data[i];
            const originalG = data[i + 1];
            const originalB = data[i + 2];
            let r = originalR, g = originalG, b = originalB;

            r *= brightnessFactor;
            g *= brightnessFactor;
            b *= brightnessFactor;
            
            if (contrastFactor !== 1) {
                r = contrastFactor * (r - 128) + 128;
                g = contrastFactor * (g - 128) + 128;
                b = contrastFactor * (b - 128) + 128;
            }

            const luminosity = 0.299 * originalR + 0.587 * originalG + 0.114 * originalB;
            let shFactor = 1;
            if (shadows !== 0 && luminosity < 128) {
                shFactor = 1 + (shadows / 100) * ((128 - luminosity) / 128);
            } else if (highlights !== 0 && luminosity >= 128) {
                shFactor = 1 + (highlights / 100) * ((luminosity - 128) / 128);
            }
            r *= shFactor;
            g *= shFactor;
            b *= shFactor;

            let balanceAdj;
            if (luminosity < 85) balanceAdj = colorBalance.shadows;
            else if (luminosity < 170) balanceAdj = colorBalance.midtones;
            else balanceAdj = colorBalance.highlights;
            
            if (balanceAdj.intensity > 0) {
                const tintRgb = hexToRgb(balanceAdj.color);
                if (tintRgb) {
                    const factor = balanceAdj.intensity / 100.0;
                    r = r * (1 - factor) + tintRgb.r * factor;
                    g = g * (1 - factor) + tintRgb.g * factor;
                    b = b * (1 - factor) + tintRgb.b * factor;
                }
            }

            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));

            if (saturationFactor !== 1 || lightnessFactor !== 1 || hueShift !== 0) {
                const [h, s, l] = rgbToHsl(r, g, b);
                let newH = (h + hueShift + 1) % 1;
                const newS = Math.max(0, Math.min(1, s * saturationFactor));
                const newL = Math.max(0, Math.min(1, l * lightnessFactor));
                [r, g, b] = hslToRgb(newH, newS, newL);
            }

            if (vintageFactor > 0) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = r * (1 - 0.2 * vintageFactor) + gray * 0.2 * vintageFactor;
                g = g * (1 - 0.2 * vintageFactor) + gray * 0.2 * vintageFactor;
                b = b * (1 - 0.2 * vintageFactor) + gray * 0.2 * vintageFactor;
                r = Math.min(255, r + 20 * vintageFactor);
                g = Math.min(255, g + 10 * vintageFactor);
            }
            
            const rBeforeDuotone = r, gBeforeDuotone = g, bBeforeDuotone = b;

            if (duotoneFactor > 0 && duotoneRgb1 && duotoneRgb2) {
                const duoLuminosity = (0.299 * originalR + 0.587 * originalG + 0.114 * originalB) / 255;
                const duoR = duotoneRgb1.r * (1 - duoLuminosity) + duotoneRgb2.r * duoLuminosity;
                const duoG = duotoneRgb1.g * (1 - duoLuminosity) + duotoneRgb2.g * duoLuminosity;
                const duoB = duotoneRgb1.b * (1 - duoLuminosity) + duotoneRgb2.b * duoLuminosity;
                r = rBeforeDuotone * (1 - duotoneFactor) + duoR * duotoneFactor;
                g = gBeforeDuotone * (1 - duotoneFactor) + duoG * duotoneFactor;
                b = bBeforeDuotone * (1 - duotoneFactor) + duoB * duotoneFactor;
            }

            r = Math.round(Math.max(0, Math.min(255, r)));
            g = Math.round(Math.max(0, Math.min(255, g)));
            b = Math.round(Math.max(0, Math.min(255, b)));

            r = rLut[r];
            g = gLut[g];
            b = bLut[b];
            
            data[i] = rgbLut[r];
            data[i + 1] = rgbLut[g];
            data[i + 2] = rgbLut[b];
        }
        ctx.putImageData(imageData, 0, 0);
    }
};