// utils/colorAnalyzer.ts

// Converte uma cor HSL para o formato RGB. h, s, l estão em [0, 1]
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

// Converte HSL para uma string hexadecimal
const hslToHex = (h: number, s: number, l: number): string => {
  const [r, g, b] = hslToRgb(h / 360, s, l); // hslToRgb espera h em [0, 1]
  const toHex = (c: number) => ('0' + Math.round(c).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Gera paletas de cores baseadas em um HSL dominante. h é [0, 360], s,l são [0, 1]
const generatePalettes = (dominantHsl: [number, number, number]): Record<string, string[]> => {
  const [h, s, l] = dominantHsl;

  const palettes: Record<string, string[]> = {};

  // Paleta Tonal
  palettes['Tonal'] = [
    hslToHex(h, s, Math.max(0.1, l * 0.5)),
    hslToHex(h, s, Math.max(0.1, l * 0.75)),
    hslToHex(h, s, l),
    hslToHex(h, s, Math.min(0.95, l + (1 - l) * 0.25)),
    hslToHex(h, s, Math.min(0.95, l + (1 - l) * 0.5)),
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Paleta Análoga
  palettes['Análoga'] = [
    hslToHex((h - 30 + 360) % 360, s, l),
    hslToHex(h, s, l),
    hslToHex((h + 30) % 360, s, l),
  ];

  // Paleta Complementar
  const complementaryH = (h + 180) % 360;
  palettes['Complementar'] = [
    hslToHex(h, s, l),
    hslToHex(h, Math.max(0.1, s * 0.6), Math.min(0.9, l + 0.15)),
    hslToHex(complementaryH, s, l),
    hslToHex(complementaryH, Math.max(0.1, s * 0.6), Math.min(0.9, l + 0.15)),
  ];

  // Paleta Triádica
  palettes['Triádica'] = [
    hslToHex(h, s, l),
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
  ];

  return palettes;
};

// Converte uma cor RGB para o formato HSL. Retorna [h, s, l] com h em [0, 360] e s,l em [0, 1]
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

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
  return [h * 360, s, l];
};

export const analyzeAndGeneratePalettes = (imageUrl: string): Promise<Record<string, string[]> | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(null);
        return;
      }

      const size = 50; // Amostra uma imagem 50x50 para performance
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      try {
        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colorCounts: Record<string, number> = {};
        const quantizationFactor = 32; // Agrupa cores similares

        for (let i = 0; i < imageData.length; i += 4) {
          const r = Math.round(imageData[i] / quantizationFactor) * quantizationFactor;
          const g = Math.round(imageData[i + 1] / quantizationFactor) * quantizationFactor;
          const b = Math.round(imageData[i + 2] / quantizationFactor) * quantizationFactor;
          
          // Ignora tons de cinza para focar em cores vibrantes
          if (Math.abs(r - g) < 20 && Math.abs(r - b) < 20 && Math.abs(g - b) < 20) {
            continue;
          }

          const colorKey = `${r},${g},${b}`;
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }

        const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
        
        if (sortedColors.length === 0) {
          resolve(null);
          return;
        }

        // Analisa as 5 cores mais frequentes para encontrar a mais vibrante
        const topCandidates = sortedColors.slice(0, 5).map(([rgbString]) => {
            const [r, g, b] = rgbString.split(',').map(Number);
            const [h, s, l] = rgbToHsl(r, g, b);
            return { h, s, l };
        });

        // Filtra candidatas que não são vibrantes o suficiente (muito escuras, claras ou sem cor)
        const vibrantCandidates = topCandidates.filter(c => c.s >= 0.25 && c.l >= 0.2 && c.l <= 0.8);

        if (vibrantCandidates.length === 0) {
            resolve(null);
            return;
        }

        // Escolhe a cor com a maior saturação como a cor dominante
        vibrantCandidates.sort((a, b) => b.s - a.s);
        const dominantColor = vibrantCandidates[0];

        const palettes = generatePalettes([dominantColor.h, dominantColor.s, dominantColor.l]);
        resolve(palettes);

      } catch (error) {
        console.error('Erro ao analisar as cores da imagem:', error);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.error('Falha ao carregar a imagem para análise de cor.');
      resolve(null);
    };
    img.src = imageUrl;
  });
};