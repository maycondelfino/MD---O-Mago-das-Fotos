


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HistoryState, Tool } from './types';
import { isAiAvailable, editImage, generateImage, analyzeImage } from './services/geminiService';
import { fileToDataUrl, getImageDimensions, resizeImage, applyAllPixelAdjustments, generateThumbnail } from './utils/imageProcessor';
import { Icon } from './components/Icon';
import Loader from './components/Loader';
import { CompareSlider } from './components/CompareSlider';
import { RestoreSessionPrompt } from './components/RestoreSessionPrompt';
import { Welcome } from './components/Welcome';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useWindowSize } from './hooks/useWindowSize';
import { analyzeAndGeneratePalettes } from './utils/colorAnalyzer';
import { TOOLS } from './constants';
import { ControlsSidebar } from './components/ControlsSidebar';
import { ZoomControls } from './components/ZoomControls';
import { NewProjectModal } from './components/NewProjectModal';
import { useAppConfig } from './hooks/useAppConfig';
import { AI_MODELS } from './config/defaults';

const SplashScreen = () => (
  <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#020418] animate-fadeOut" style={{ animationDelay: '3s' }}>
    <div className="flex flex-col items-center justify-center text-center">
      <Icon name="logo-magic" className="w-28 h-28 text-white animate-scaleAndGlow" style={{ animationDelay: '0.2s' }}/>
      <h1 className="text-4xl md:text-5xl font-bold text-white mt-6 splash-title">
        {'MD'.split('').map((char, i) => (
          <span key={i} style={{ '--delay': `${1 + i * 0.05}s` } as React.CSSProperties}>{char === ' ' ? '\u00A0' : char}</span>
        ))}
      </h1>
      <p className="text-lg text-indigo-200 mt-3 splash-subtitle">O Mago das Fotos</p>
    </div>
  </div>
);

interface AppProps {
  onSave?: (dataUrl: string) => void;
  initialImageUrl?: string;
}

interface SavedSessionData {
    history: HistoryState[];
    historyIndex: number;
    lastPrompts: Record<string, string>;
    selectedToolId: string;
    favoriteTools: string[];
    zoom: number;
    offset: { x: 0; y: 0 };
    selectionHistory: string[];
    selectionHistoryIndex: number;
}

const SESSION_STORAGE_KEY = 'mdoEditorSession';
const LAST_PROMPTS_KEY = 'mdoLastPrompts';
const FAVORITE_TOOLS_KEY = 'mdoFavoriteTools';

const INITIAL_MANUAL_STATE: Omit<HistoryState, 'imageUrl' | 'width' | 'height' | 'actionName' | 'thumbnailUrl' | 'originalPrompt' | 'feedback'> = {
  contrast: 100, brightness: 100, saturation: 100, lightness: 100, sepia: 0, hue: 0, vintage: 0, shadows: 0, highlights: 0,
  colorBalance: { shadows: { color: '#808080', intensity: 0 }, midtones: { color: '#808080', intensity: 0 }, highlights: { color: '#808080', intensity: 0 } },
  gradientStartColor: '#8b5cf6', gradientEndColor: '#22d3ee', gradientIntensity: 30, contour: 0,
  selectionMask: null,
  frameColor: '#ffffff', frameThickness: 0, framePadding: 0,
  vignetteIntensity: 70, vignetteSize: 50,
  toneCurves: {
    rgb: [{ x: 0, y: 0 }, { x: 127, y: 127 }, { x: 255, y: 255 }],
    r: [{ x: 0, y: 0 }, { x: 255, y: 255 }], g: [{ x: 0, y: 0 }, { x: 255, y: 255 }], b: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  },
  duotoneColor1: '#080c3b', duotoneColor2: '#e63946', duotoneIntensity: 0, backgroundColor: 'transparent', sharpness: 55, sharpnessMode: 'clarity',
  nightModeIntensity: 50, beautySkinSmoothing: 0, beautyWrinkles: 0, beautyDarkCircles: 0, beautyLipColor: 0,
  beautyFillBeard: 0, beautyFillEyebrows: 0, beautyHairColor: '', ageChange: 0, weightChange: 0,
};

export const App: React.FC<AppProps> = ({ onSave, initialImageUrl }) => {
  const [splashState, setSplashState] = useState<'visible' | 'fading' | 'hidden'>('visible');
  const [editorState, setEditorState] = useState<'welcome' | 'editor'>('welcome'); // 'welcome', 'editor'
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [selectedToolId, setSelectedToolId] = useState<string>('quick-adjust');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(!isAiAvailable);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [showCompareSlider, setShowCompareSlider] = useState(false);
  const [tempState, setTempState] = useState<HistoryState | null>(null); // For compare slider "before" image
  
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;
  const [mobileView, setMobileView] = useState<'tools' | 'controls'>('tools'); // For mobile sidebar navigation
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'draw' | 'erase'>('draw');
  const [brushSize, setBrushSize] = useState(30);
  
  const [colorPalettes, setColorPalettes] = useState<Record<string, string[]> | null>(null);
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [referenceImage, setReferenceImage] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null); // Changed to string for AI feedback
  
  const [lastPrompts, setLastPrompts] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(LAST_PROMPTS_KEY) || '{}'); } catch { return {}; }
  });
  const [prompt, setPrompt] = useState<string>(''); // Current prompt input
  const [styleIntensity, setStyleIntensity] = useState<number>(75);
  const [shouldChangeEnvironment, setShouldChangeEnvironment] = useState(false); // For ia-steal-clothes
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Pan offset
  
  const [favoriteTools, setFavoriteTools] = useState<string[]>(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITE_TOOLS_KEY);
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (e) {
      console.error("Failed to parse favorite tools from localStorage:", e);
      return [];
    }
  });

  const [selectionHistory, setSelectionHistory] = useState<string[]>([]);
  const [selectionHistoryIndex, setSelectionHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping canvases
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  const isEditingManually = useRef(false);
  const saveTimeout = useRef<number | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const startPanOffset = useRef({ x: 0, y: 0 });

  const { currentConfig, updateConfig } = useAppConfig();
  const selectedAiModel = useMemo(() => AI_MODELS.find(m => m.id === currentConfig.aiModelId) || AI_MODELS[0], [currentConfig.aiModelId]);

  const currentState = useMemo(() => history[historyIndex], [history, historyIndex]);
  const selectedTool = useMemo(() => TOOLS.find(t => t.id === selectedToolId) || TOOLS[0], [selectedToolId]);

  // Callback to add state to history
  const addToHistory = useCallback((newState: Omit<HistoryState, 'thumbnailUrl'>, commitManualChanges: boolean = false) => {
    if (!canvasRef.current) return;
    
    // If there are pending manual changes, commit them first
    if (isEditingManually.current && commitManualChanges && currentState) {
        const manualAdjustedDataUrl = canvasRef.current.toDataURL(currentState.imageUrl.split(';')[0].split(':')[1]);
        const manualAdjustedThumbnail = generateThumbnail(canvasRef.current);
        const manualState: HistoryState = {
            ...currentState,
            imageUrl: manualAdjustedDataUrl,
            thumbnailUrl: manualAdjustedThumbnail,
            actionName: "Ajustes Manuais",
        };
        setHistory(prev => [...prev.slice(0, historyIndex + 1), manualState, { ...newState, thumbnailUrl: generateThumbnail(canvasRef.current!) }]);
        setHistoryIndex(prev => prev + 2);
    } else {
        const thumbnailUrl = generateThumbnail(canvasRef.current);
        setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        return [...newHistory, { ...newState, thumbnailUrl }];
        });
        setHistoryIndex(prev => prev + 1);
    }
    isEditingManually.current = false; // Reset manual editing flag
  }, [historyIndex, currentState]);

  // Callback to handle manual state commit
  const handleManualCommit = useCallback((actionName: string) => {
    if (!tempState) return; // No temporary state to commit
    const committedState = { ...tempState, actionName };
    addToHistory(committedState, false);
    setTempState(null); // Clear temporary state
    isEditingManually.current = false;
  }, [tempState, addToHistory]);

  // Debounce for manual edits (sliders) - uses handleManualCommit
  const debounceCommitManual = useCallback((actionName: string) => {
    if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = window.setTimeout(() => {
        handleManualCommit(actionName);
        saveTimeout.current = null;
    }, 300); // Commit after 300ms of inactivity
  }, [handleManualCommit]);

  const saveSession = useCallback(() => {
    if (currentState) {
      try {
        const sessionData: SavedSessionData = {
          history,
          historyIndex,
          lastPrompts,
          selectedToolId,
          favoriteTools,
          zoom,
          offset,
          selectionHistory,
          selectionHistoryIndex,
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.error("Falha ao salvar a sessão:", error);
        alert("Falha ao salvar a sessão: O armazenamento do navegador está cheio. Tente limpar o cache.");
      }
    }
  }, [currentState, history, historyIndex, lastPrompts, selectedToolId, favoriteTools, zoom, offset, selectionHistory, selectionHistoryIndex]);

  useEffect(() => {
    // Save session automatically 1 second after last change
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
        saveSession();
    }, 1000); // Save 1 second after last interaction

    return () => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [currentState, saveSession, selectedToolId, favoriteTools, lastPrompts, zoom, offset, selectionHistory, selectionHistoryIndex]);

  const drawCanvas = useCallback((stateToDraw: HistoryState, currentZoom: number, currentOffset: {x: number, y: number}) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !stateToDraw) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = stateToDraw.width;
      canvas.height = stateToDraw.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before drawing

      ctx.drawImage(img, 0, 0);

      applyAllPixelAdjustments(ctx, stateToDraw);
      
      const selectionCanvas = selectionCanvasRef.current;
      if (selectionCanvas && stateToDraw.selectionMask) {
          const selectionImg = new Image();
          selectionImg.onload = () => {
              selectionCanvas.width = stateToDraw.width;
              selectionCanvas.height = stateToDraw.height;
              const selCtx = selectionCanvas.getContext('2d');
              if (selCtx) {
                selCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
                selCtx.drawImage(selectionImg, 0, 0);
              }
          };
          selectionImg.src = `data:image/png;base64,${stateToDraw.selectionMask}`;
      } else if (selectionCanvas) {
          selectionCanvas.getContext('2d')?.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
      }
    };
    img.src = stateToDraw.imageUrl;
  }, []);

  // Effect to draw canvas when currentState changes or zoom/offset changes
  useEffect(() => {
    if (currentState) {
      drawCanvas(tempState || currentState, zoom, offset);
    }
  }, [currentState, drawCanvas, zoom, offset, tempState]); // Added tempState to dependencies


  useEffect(() => {
    setTimeout(() => setSplashState('fading'), 2800);
    setTimeout(() => setSplashState('hidden'), 3800);

    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      setShowRestorePrompt(true);
    } else if (initialImageUrl) {
      loadImage(initialImageUrl, 'Imagem Inicial');
    }
  }, [initialImageUrl]);

  const loadImage = useCallback(async (imageSource: File | string, actionName: string, selectedToolAfterLoad?: Tool) => {
    setIsLoading(true);
    setLoadingMessage('Carregando imagem...');
    try {
      let dataUrl, base64, mimeType;
      
      if (typeof imageSource === 'string') {
        dataUrl = imageSource;
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        mimeType = blob.type;
        const reader = new FileReader();
        base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const result = await fileToDataUrl(imageSource, (p) => setLoadingMessage(`Carregando... ${p}%`));
        base64 = result.base64;
        mimeType = result.mimeType;
        dataUrl = `data:${mimeType};base64,${base64}`;
      }

      const { width, height } = await getImageDimensions(dataUrl);
      const newState: Omit<HistoryState, 'thumbnailUrl' | 'originalPrompt' | 'feedback'> = {
        ...INITIAL_MANUAL_STATE,
        imageUrl: dataUrl,
        width,
        height,
        actionName,
      };
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
          const img = new Image();
          img.onload = () => {
              tempCanvas.width = width;
              tempCanvas.height = height;
              tempCtx.drawImage(img, 0, 0); // Draw image to temporary canvas
              const thumbnailUrl = generateThumbnail(tempCanvas); // Generate thumbnail from temp canvas
              setHistory([{ ...newState, thumbnailUrl }]);
              setHistoryIndex(0);
              setEditorState('editor');
              setZoom(1);
              setOffset({ x: 0, y: 0 });
              if(selectedToolAfterLoad) setSelectedToolId(selectedToolAfterLoad.id);
          };
          img.src = dataUrl;
      }
    } catch (error) {
      console.error("Erro ao carregar imagem:", error);
      alert('Houve um erro ao carregar a imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualChange = useCallback((values: Partial<HistoryState>) => {
    if (!currentState) return;
    setTempState({ ...currentState, ...values });
    isEditingManually.current = true;
  }, [currentState]);

  // Manual Adjustments (sliders) - uses handleManualCommit
  const onManualChange = useCallback((values: Partial<HistoryState>) => {
    if (!currentState) return;
    setTempState({ ...currentState, ...values });
    isEditingManually.current = true;
    // Debounce the commit
    debounceCommitManual(selectedTool.name);
  }, [currentState, selectedTool.name, debounceCommitManual]);

  const onManualCommitFinal = useCallback((actionName: string) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current); // Clear any pending debounced commits
    if (tempState) {
        addToHistory({ ...tempState, actionName }, false);
        setTempState(null);
    } else if (currentState && isEditingManually.current) {
        // If no tempState but manual editing was flagged, commit current state
        addToHistory({ ...currentState, actionName }, false);
    }
    isEditingManually.current = false;
  }, [tempState, currentState, addToHistory]);

  const handleResizeCommit = useCallback(async (newWidth: number, newHeight: number) => {
    if (!currentState || !canvasRef.current) return; // Ensure we have a current state and canvas

    setIsLoading(true);
    setLoadingMessage('Redimensionando imagem...');

    try {
        // Apply all current adjustments to the image before resizing
        const tempCtx = canvasRef.current.getContext('2d');
        if (!tempCtx) throw new Error('Não foi possível obter o contexto 2D para aplicar ajustes.');
        
        // Get the current rendered image from canvas
        const currentRenderedDataUrl = canvasRef.current.toDataURL('image/png'); // Use PNG for transparency if any
        
        const { base64, mimeType } = await resizeImage(currentRenderedDataUrl, newWidth, newHeight);
        const newDataUrl = `data:${mimeType};base64,${base64}`;

        const { width: finalWidth, height: finalHeight } = await getImageDimensions(newDataUrl);

        const newAdjustments = { ...INITIAL_MANUAL_STATE }; // Reset manual adjustments after resize
        const newState: HistoryState = {
            ...newAdjustments, // Apply initial adjustments
            imageUrl: newDataUrl,
            width: finalWidth,
            height: finalHeight,
            actionName: `Redimensionar ${finalWidth}x${finalHeight}`,
            thumbnailUrl: generateThumbnail(canvasRef.current!), // Generate thumbnail from the current canvas
            originalPrompt: undefined,
            feedback: null,
            // Carry over AI-related states if applicable, or reset
            selectionMask: null, // Clear selection mask as it would be misaligned
        };
        
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
        setHistoryIndex(prev => prev + 1);
        setTempState(null); // Clear temporary state
        isEditingManually.current = false;
        setZoom(1); // Reset zoom
        setOffset({ x: 0, y: 0 }); // Reset pan

    } catch (error) {
        console.error('Falha ao redimensionar imagem:', error);
        alert('Ocorreu um erro ao redimensionar a imagem.');
    } finally {
        setIsLoading(false);
    }
  }, [currentState, historyIndex, INITIAL_MANUAL_STATE]);

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number, canvas: HTMLCanvasElement, currentZoom: number, currentOffset: { x: number; y: number }) => {
    const rect = canvas.getBoundingClientRect();
    
    // Adjust client coordinates by wrapper's scroll and offset
    // const scrollLeft = canvasWrapperRef.current?.scrollLeft || 0;
    // const scrollTop = canvasWrapperRef.current?.scrollTop || 0;

    // Calculate position relative to the canvas (before zoom/pan)
    // We need to inverse the transformations applied by CSS
    const x = ((clientX - rect.left) / currentZoom) - currentOffset.x;
    const y = ((clientY - rect.top) / currentZoom) - currentOffset.y;

    // Return coordinates relative to the original image dimensions
    return { x, y };
  }, []);

  const drawSelectionLine = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, mode: 'draw' | 'erase') => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    ctx.strokeStyle = mode === 'draw' ? 'rgba(139, 92, 246, 0.7)' : 'rgba(0,0,0,1)'; // Violet or black for erase
    ctx.globalCompositeOperation = mode === 'draw' ? 'source-over' : 'destination-out';
    
    ctx.lineTo(x, y);
    ctx.stroke();

    lastMousePosition.current = { x, y };

    const currentSelectionMask = selectionCanvasRef.current?.toDataURL('image/png').split(',')[1];
    if (currentSelectionMask) {
        setSelectionHistory(prev => {
            const newHistory = prev.slice(0, selectionHistoryIndex + 1);
            return [...newHistory, currentSelectionMask];
        });
        setSelectionHistoryIndex(prev => prev + 1);
    }
  }, [selectionHistoryIndex]);

  const handleSelectionCommit = useCallback(() => {
    if (!selectionCanvasRef.current || !currentState) return;
    const currentSelectionMask = selectionCanvasRef.current.toDataURL('image/png').split(',')[1];
    
    // Only commit if the mask has changed or it's a new selection
    if (currentState.selectionMask !== currentSelectionMask) {
        addToHistory({ ...currentState, selectionMask: currentSelectionMask, actionName: 'Máscara de Seleção' });
        setSelectionHistory([]); // Clear selection drawing history
        setSelectionHistoryIndex(-1);
    }
  }, [currentState, addToHistory]);

  const handleClearSelection = useCallback(() => {
    if (!selectionCanvasRef.current || !currentState) return;
    const ctx = selectionCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);
      addToHistory({ ...currentState, selectionMask: null, actionName: 'Limpar Seleção' });
      setSelectionHistory([]);
      setSelectionHistoryIndex(-1);
    }
  }, [currentState, addToHistory]);

  const handleSelectionUndo = useCallback(() => {
    if (selectionHistoryIndex > 0) {
        setSelectionHistoryIndex(prev => prev - 1);
        const prevMask = selectionHistory[selectionHistoryIndex - 1];
        const selectionCanvas = selectionCanvasRef.current;
        if (selectionCanvas && prevMask) {
            const selectionImg = new Image();
            selectionImg.onload = () => {
                const selCtx = selectionCanvas.getContext('2d');
                if (selCtx) {
                    selCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
                    selCtx.drawImage(selectionImg, 0, 0);
                }
            };
            selectionImg.src = `data:image/png;base64,${prevMask}`;
        }
    }
  }, [selectionHistory, selectionHistoryIndex]);

  const handleSelectionRedo = useCallback(() => {
    if (selectionHistoryIndex < selectionHistory.length - 1) {
        setSelectionHistoryIndex(prev => prev + 1);
        const nextMask = selectionHistory[selectionHistoryIndex + 1];
        const selectionCanvas = selectionCanvasRef.current;
        if (selectionCanvas && nextMask) {
            const selectionImg = new Image();
            selectionImg.onload = () => {
                const selCtx = selectionCanvas.getContext('2d');
                if (selCtx) {
                    selCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
                    selCtx.drawImage(selectionImg, 0, 0);
                }
            };
            selectionImg.src = `data:image/png;base64,${nextMask}`;
        }
    }
  }, [selectionHistory, selectionHistoryIndex]);


  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || !currentState) return;

    // Prevent right-click context menu
    if ('button' in e && e.button === 2) {
        e.preventDefault();
        return;
    }
    
    // Determine if it's a touch event and get the touch point
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (clientX === undefined || clientY === undefined) return;

    const canvas = canvasRef.current;
    const { x, y } = getCanvasCoordinates(clientX, clientY, canvas, zoom, offset);

    if (selectedToolId === 'ia-selection') {
        setIsDrawing(true);
        lastMousePosition.current = { x, y };
        const selectionCtx = selectionCanvasRef.current?.getContext('2d');
        if (selectionCtx) {
            selectionCtx.beginPath();
            selectionCtx.moveTo(x, y);
            drawSelectionLine(selectionCtx, x, y, brushSize, drawingMode); // Draw initial point
        }
    } else { // Panning
        setIsPanning(true);
        lastMousePosition.current = { x: clientX, y: clientY }; // Use client coords for pan start
        startPanOffset.current = { x: offset.x, y: offset.y };
    }
}, [selectedToolId, currentState, getCanvasCoordinates, zoom, offset, brushSize, drawingMode, drawSelectionLine]);

const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!canvasRef.current || !currentState) return;

    // Determine if it's a touch event and get the touch point
    const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY;

    if (clientX === undefined || clientY === undefined) return;

    if (isDrawing || isPanning) {
        // Prevent scrolling ONLY when we are actively interacting with the canvas
        if (e.cancelable) {
            e.preventDefault(); 
        }
    }

    const canvas = canvasRef.current;
    if (isDrawing) {
        if (!lastMousePosition.current) return;
        const { x, y } = getCanvasCoordinates(clientX, clientY, canvas, zoom, offset);
        const selectionCtx = selectionCanvasRef.current?.getContext('2d');
        if (selectionCtx) {
            selectionCtx.beginPath(); // Start a new path for each move segment to prevent lines from connecting
            selectionCtx.moveTo(lastMousePosition.current.x, lastMousePosition.current.y);
            drawSelectionLine(selectionCtx, x, y, brushSize, drawingMode);
        }
        lastMousePosition.current = { x, y };
    } else if (isPanning) {
        if (!lastMousePosition.current || !startPanOffset.current) return;
        const dx = clientX - lastMousePosition.current.x;
        const dy = clientY - lastMousePosition.current.y;
        setOffset({
            x: startPanOffset.current.x + dx / zoom,
            y: startPanOffset.current.y + dy / zoom,
        });
        lastMousePosition.current = { x: clientX, y: clientY };
    }
}, [isDrawing, isPanning, currentState, getCanvasCoordinates, zoom, offset, brushSize, drawingMode, drawSelectionLine, setOffset]);


const handlePointerUp = useCallback(() => {
    if (isDrawing) {
        setIsDrawing(false);
        lastMousePosition.current = null;
        if (selectedToolId === 'ia-selection') {
            handleSelectionCommit();
        }
    } else if (isPanning) {
        setIsPanning(false);
        lastMousePosition.current = null;
        startPanOffset.current = { x: 0, y: 0 };
    }
}, [isDrawing, isPanning, selectedToolId, handleSelectionCommit]);

useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (wrapper) {
        wrapper.addEventListener('mousemove', handlePointerMove);
        wrapper.addEventListener('mouseup', handlePointerUp);
        wrapper.addEventListener('touchmove', handlePointerMove, { passive: false }); // passive: false to allow preventDefault
        wrapper.addEventListener('touchend', handlePointerUp);
    }
    return () => {
        if (wrapper) {
            wrapper.removeEventListener('mousemove', handlePointerMove);
            wrapper.removeEventListener('mouseup', handlePointerUp);
            wrapper.removeEventListener('touchmove', handlePointerMove);
            wrapper.removeEventListener('touchend', handlePointerUp);
        }
    };
}, [handlePointerMove, handlePointerUp]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 5)); // Max zoom 5x
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.1)); // Min zoom 0.1x
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);


  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      if (isEditingManually.current) {
        // Discard temp state if undoing while manual editing is active
        setTempState(null);
        isEditingManually.current = false;
      }
      setHistoryIndex(prev => prev - 1);
      setZoom(1); // Reset zoom
      setOffset({ x: 0, y: 0 }); // Reset pan
      // Reset selection specific history if needed
      setSelectionHistory([]);
      setSelectionHistoryIndex(-1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setZoom(1); // Reset zoom
      setOffset({ x: 0, y: 0 }); // Reset pan
      // Reset selection specific history if needed
      setSelectionHistory([]);
      setSelectionHistoryIndex(-1);
    }
  }, [historyIndex, history.length]);

  const handleJumpToHistory = useCallback((index: number) => {
    if (isEditingManually.current) {
        setTempState(null);
        isEditingManually.current = false;
    }
    setHistoryIndex(index);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectionHistory([]);
    setSelectionHistoryIndex(-1);
  }, []);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current || !currentState) return;
    onManualCommitFinal("Download"); // Commit any pending manual changes

    const dataUrl = canvasRef.current.toDataURL(currentState.imageUrl.split(';')[0].split(':')[1]);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'md-mago-das-fotos.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [currentState, onManualCommitFinal]);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current || !currentState) return;
    onManualCommitFinal("Compartilhar"); // Commit any pending manual changes

    try {
      const dataUrl = canvasRef.current.toDataURL(currentState.imageUrl.split(';')[0].split(':')[1]);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'md-mago-das-fotos.png', { type: blob.type });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Minha foto mágica!',
          text: 'Confira a foto que editei com MD - O Mago das Fotos!',
        });
      } else {
        alert('Seu navegador não suporta o compartilhamento nativo. Você pode baixar a imagem.');
        handleDownload(); // Fallback to download
      }
    } catch (error) {
      console.error('Erro ao compartilhar imagem:', error);
      alert('Não foi possível compartilhar a imagem.');
    }
  }, [currentState, onManualCommitFinal, handleDownload]);

  const handleAiEdit = useCallback(async (aiPrompt: string, tool: Tool) => {
    if (!currentState) return;
    onManualCommitFinal(tool.name); // Commit any pending manual changes

    setIsLoading(true);
    setLoadingMessage(`Lançando feitiço: ${tool.name}...`);
    abortController.current = new AbortController();

    try {
      // const isSelectionToolActive = selectedToolId === 'ia-selection' && !!currentState.selectionMask;
      const isRemoveObjectTool = tool.id === 'ia-remove-object';
      const isChangeBackgroundTool = tool.id === 'ia-change-background';
      const isStealClothesTool = tool.id === 'ia-steal-clothes';
      const isFaceSwapTool = tool.id === 'ia-face-swap';
      const isCombinePeopleTool = tool.id === 'ia-combine-people';
      const isPosesExpressionsTool = tool.id === 'ia-poses-expressions';

      let finalPrompt = aiPrompt;
      let referenceImageData = referenceImage;
      let selectionMaskData = currentState.selectionMask;

      if (!aiPrompt && isRemoveObjectTool && selectionMaskData) {
        finalPrompt = 'Remova o objeto selecionado, preenchendo o fundo de forma fotorrealista.';
      } else if (!aiPrompt && (isChangeBackgroundTool || isStealClothesTool || isFaceSwapTool || isCombinePeopleTool || isPosesExpressionsTool) && referenceImageData) {
        finalPrompt = tool.promptSuggestion; // Use default if no custom prompt provided with ref image
      } else if (!aiPrompt && tool.oneClick) {
        finalPrompt = tool.promptSuggestion;
      }
      
      // Special prompt engineering for specific tools
      if (isStealClothesTool) {
        if (shouldChangeEnvironment) {
          finalPrompt = `Vista a pessoa na imagem principal com a roupa da pessoa na imagem de referência, e também mude o ambiente ao redor para se parecer com o ambiente da imagem de referência.`;
        } else {
          finalPrompt = `Vista a pessoa na imagem principal com a roupa da pessoa na imagem de referência. Mantenha o ambiente da imagem principal exatamente como está.`;
        }
        if (selectionMaskData) {
            finalPrompt += ` Foque a aplicação da roupa APENAS na área demarcada pela máscara de seleção.`;
        }
      } else if (isFaceSwapTool) {
          finalPrompt = `Troque o rosto da pessoa na imagem principal pelo rosto da imagem de referência. Integre o novo rosto de forma perfeita, ajustando cor, iluminação e ângulo.`;
          if (selectionMaskData) {
            finalPrompt += ` Foque a troca de rosto APENAS na área demarcada pela máscara de seleção.`;
          }
      } else if (isCombinePeopleTool) {
          finalPrompt = `Adicione a pessoa da imagem de referência na imagem principal, integrando-a de forma fotorrealista. A pessoa deve ser posicionada conforme a descrição: ${finalPrompt}`;
      } else if (isPosesExpressionsTool) {
          if (selectionMaskData) {
            finalPrompt = `Altere a pose/expressão da pessoa na área selecionada da imagem principal para: "${finalPrompt}". Mantenha o restante da imagem inalterado.`;
          } else {
            finalPrompt = `Altere a pose/expressão da pessoa principal na imagem para: "${finalPrompt}".`;
          }
      } else if (isRemoveObjectTool && selectionMaskData) {
          finalPrompt = `Remova o objeto ou a pessoa dentro da área marcada pela máscara de seleção. Preencha o espaço de forma fotorrealista e consistente com o fundo. A descrição adicional é: ${finalPrompt}`;
      } else if (isChangeBackgroundTool && selectionMaskData) {
          finalPrompt = `Substitua o fundo da imagem, mantendo o assunto principal intacto. O novo fundo deve ser: ${finalPrompt}. A área selecionada (máscara) indica o assunto principal.`;
      } else if (isChangeBackgroundTool && referenceImageData) {
          finalPrompt = `Substitua o fundo da imagem pelo cenário da imagem de referência. Mantenha o assunto principal da imagem original intacto.`;
      } else if (tool.id === 'ia-age-machine') {
          const agePrompt = `Altere a idade da pessoa na foto. ${currentState.ageChange > 0 ? 'Envelheça' : 'Rejuvenesça'} a pessoa em ${Math.abs(currentState.ageChange)} anos, mantendo suas características de identidade principais de forma fotorrealista.`;
          if (selectionMaskData) {
            finalPrompt = `${agePrompt} Foque APENAS na área demarcada pela máscara de seleção.`;
          } else {
            finalPrompt = agePrompt;
          }
      } else if (tool.id === 'ia-body-weight') {
          const weightPrompt = `Altere o peso corporal da pessoa na foto. Faça a pessoa ${currentState.weightChange > 0 ? 'parecer mais pesada' : 'parecer mais magra'} em aproximadamente ${Math.abs(currentState.weightChange)} kg, ajustando o corpo de forma fotorrealista e proporcional. Mantenha as feições do rosto e a identidade da pessoa.`;
          if (selectionMaskData) {
            finalPrompt = `${weightPrompt} Foque APENAS na área demarcada pela máscara de seleção.`;
          } else {
            finalPrompt = weightPrompt;
          }
      } else if (tool.id === 'ia-beauty-retouch') {
        const beautyPrompts: string[] = [];
        if (currentState.beautySkinSmoothing > 0) beautyPrompts.push(`suavize a textura da pele do rosto em ${currentState.beautySkinSmoothing}%, reduzindo imperfeições e poros, mantendo um aspecto natural e não plastificado`);
        if (currentState.beautyWrinkles > 0) beautyPrompts.push(`suavize as rugas e linhas de expressão do rosto em ${currentState.beautyWrinkles}%, mantendo um aspecto natural`);
        if (currentState.beautyDarkCircles > 0) beautyPrompts.push(`remova ${currentState.beautyDarkCircles}% das olheiras e bolsas sob os olhos, clareando a área de forma suave`);
        if (currentState.beautyLipColor > 0) beautyPrompts.push(`aplique um tone de batom vermelho sutil nos lábios com ${currentState.beautyLipColor}% de intensidade`);
        if (currentState.beautyFillBeard > 0) beautyPrompts.push(`preencha as falhas na barba para que pareça ${currentState.beautyFillBeard}% mais cheia e uniforme`);
        if (currentState.beautyFillEyebrows > 0) beautyPrompts.push(`preencha e defina as sobrancelhas para parecerem ${currentState.beautyFillEyebrows}% mais cheias e simétricas`);
        if (currentState.beautyHairColor.trim()) beautyPrompts.push(`mude a cor do cabelo para "${currentState.beautyHairColor.trim()}"`);

        if (beautyPrompts.length > 0) {
            finalPrompt = "Aplique reparos e retoques de beleza na imagem. É crucial que as feições e proporções do rosto da pessoa NÃO sejam alteradas. Os ajustes devem ser naturais e sutis, focando apenas em aprimoramentos. Aqui estão os retoques solicitados: " + beautyPrompts.join(', ') + ".";
            if (selectionMaskData) {
                finalPrompt += ` Foque a aplicação dos retoques APENAS na área demarcada pela máscara de seleção.`;
            }
        }
      } else if (tool.id === 'ia-expand-image') {
          // No prompt needed, the UI for expand is currently just the prompt box
      } else {
        // Generic AI edit
      }

      const response = await editImage({
        base64ImageData: currentState.imageUrl.split(',')[1],
        mimeType: currentState.imageUrl.split(';')[0].split(':')[1],
        prompt: finalPrompt,
        selectionMask: selectionMaskData ? { base64: selectionMaskData, mimeType: 'image/png' } : undefined,
        referenceImage: referenceImageData ? { base64: referenceImageData.dataUrl.split(',')[1], mimeType: referenceImageData.mimeType } : undefined,
        signal: abortController.current.signal,
        model: selectedAiModel.id, // Use selected AI model
      });

      const { width, height } = await getImageDimensions(`data:${response.mimeType};base64,${response.base64}`);

      const newState: HistoryState = {
        ...currentState,
        imageUrl: `data:${response.mimeType};base64,${response.base64}`,
        width,
        height,
        actionName: tool.name,
        originalPrompt: aiPrompt,
        feedback: null,
      };
      addToHistory(newState, false);
      
      setLastPrompts(prev => ({ ...prev, [tool.id]: aiPrompt }));
      setPrompt('');
      setReferenceImage(null); // Clear reference image after use
      if (selectionCanvasRef.current) { // Clear selection mask
        selectionCanvasRef.current.getContext('2d')?.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);
        addToHistory({ ...currentState, selectionMask: null, actionName: 'Limpar Seleção' });
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setLoadingMessage('Cancelado.');
      } else {
        console.error('Erro ao editar imagem com Gemini:', error);
        alert(`Erro ao editar imagem com Gemini: ${error.message || 'A IA não retornou uma imagem. Tente novamente com um prompt diferente.'}`);
      }
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  }, [currentState, selectedToolId, referenceImage, addToHistory, lastPrompts, onManualCommitFinal, shouldChangeEnvironment, selectedAiModel]);

  const handleAiGenerate = useCallback(async (aiPrompt: string, tool: Tool) => {
    if (!aiPrompt) return;
    setIsLoading(true);
    setLoadingMessage(`Gerando imagem com ${tool.name}...`);
    abortController.current = new AbortController();

    try {
      // Use the specified model for generation
      const generationModel = AI_MODELS.find(m => m.id === currentConfig.aiModelIdForGeneration) || AI_MODELS[0];

      const response = await generateImage({
        prompt: aiPrompt,
        signal: abortController.current.signal,
        model: generationModel.id, // Use selected generation AI model
      });

      const dataUrl = `data:${response.mimeType};base64,${response.base64}`;
      const { width, height } = await getImageDimensions(dataUrl);

      const newState: Omit<HistoryState, 'thumbnailUrl' | 'originalPrompt' | 'feedback'> = {
        ...INITIAL_MANUAL_STATE,
        imageUrl: dataUrl,
        width,
        height,
        actionName: tool.name,
      };
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
          const img = new Image();
          img.onload = () => {
              tempCanvas.width = width;
              tempCanvas.height = height;
              tempCtx.drawImage(img, 0, 0);
              const thumbnailUrl = generateThumbnail(tempCanvas);
              setHistory([{ ...newState, thumbnailUrl, originalPrompt: aiPrompt }]);
              setHistoryIndex(0);
              setEditorState('editor'); // Ensure editor is visible
              setZoom(1);
              setOffset({ x: 0, y: 0 });
          };
          img.src = dataUrl;
      }
      setLastPrompts(prev => ({ ...prev, [tool.id]: aiPrompt }));
      setPrompt('');

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setLoadingMessage('Cancelado.');
      } else {
        console.error('Erro ao gerar imagem com Gemini:', error);
        alert(`Erro ao gerar imagem com Gemini: ${error.message || 'A IA não retornou uma imagem. Tente novamente com um prompt diferente.'}`);
      }
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  }, [INITIAL_MANUAL_STATE, lastPrompts, setHistory, setHistoryIndex, setEditorState, currentConfig.aiModelIdForGeneration]);

  const handleAnalyzeImage = useCallback(async () => {
    if (!currentState) return;
    onManualCommitFinal("Analisar Foto");

    setIsAnalyzingColors(true);
    setLoadingMessage('Analisando sua imagem...');
    abortController.current = new AbortController();

    try {
      const result = await analyzeImage({
        base64ImageData: currentState.imageUrl.split(',')[1],
        mimeType: currentState.imageUrl.split(';')[0].split(':')[1],
        signal: abortController.current.signal,
        model: selectedAiModel.id, // Use selected AI model
      });
      setAnalysisResult(result); // result is already a formatted string from geminiService
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setLoadingMessage('Cancelado.');
      } else {
        console.error('Erro ao analisar imagem com Gemini:', error);
        alert(`Erro ao analisar imagem: ${error.message || 'Não foi possível analisar a imagem.'}`);
      }
      setAnalysisResult('Não foi possível obter uma análise da imagem.');
    } finally {
      setIsAnalyzingColors(false);
      setIsLoading(false); // Reset main loading as well, as analyze might trigger it
      abortController.current = null;
    }
  }, [currentState, onManualCommitFinal, selectedAiModel]);

  const handleToggleFavorite = useCallback((toolId: string) => {
    setFavoriteTools(prev => {
      const newFavorites = prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId];
      localStorage.setItem(FAVORITE_TOOLS_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const handleNewProjectClick = useCallback(() => {
    setShowNewProjectModal(true);
  }, []);
  
  const handleStartNewProject = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setReferenceImage(null);
    setAnalysisResult(null);
    setColorPalettes(null);
    setPrompt('');
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectionHistory([]);
    setSelectionHistoryIndex(-1);
    setIsMobilePanelOpen(false); // Close mobile panel
    setMobileView('tools'); // Reset mobile view
    setEditorState('welcome'); // Go back to welcome screen
    setShowNewProjectModal(false);
  }, []);

  const handleRestoreSession = useCallback(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const { history: savedHistory, historyIndex: savedIndex, lastPrompts: savedPrompts, selectedToolId: savedToolId, favoriteTools: savedFavorites, zoom: savedZoom, offset: savedOffset, selectionHistory: savedSelectionHistory, selectionHistoryIndex: savedSelectionIndex } = JSON.parse(savedSession) as SavedSessionData;
        
        if (savedHistory && savedHistory.length > 0) {
          setHistory(savedHistory);
          setHistoryIndex(savedIndex);
          setLastPrompts(savedPrompts);
          setSelectedToolId(savedToolId);
          setFavoriteTools(savedFavorites);
          setZoom(savedZoom);
          setOffset(savedOffset);
          setSelectionHistory(savedSelectionHistory || []);
          setSelectionHistoryIndex(savedSelectionIndex !== undefined ? savedSelectionIndex : -1);
          setEditorState('editor'); // Show editor
        }
      }
    } catch (error) {
      console.error("Falha ao restaurar a sessão:", error);
      alert("Houve um erro ao restaurar sua sessão. Ela pode estar corrompida.");
      localStorage.removeItem(SESSION_STORAGE_KEY); // Clear corrupt data
    } finally {
      setShowRestorePrompt(false);
      setIsLoading(false);
    }
  }, []);

  const handleAiModelChange = useCallback((modelId: string) => {
    updateConfig({ ...currentConfig, aiModelId: modelId });
  }, [currentConfig, updateConfig]);

  const handleAiModelForGenerationChange = useCallback((modelId: string) => {
    updateConfig({ ...currentConfig, aiModelIdForGeneration: modelId });
  }, [currentConfig, updateConfig]);

  const handleCompareToggle = useCallback((show: boolean) => {
    if (show && currentState && historyIndex > 0) {
        setTempState(history[historyIndex - 1]); // Set previous state as the 'before' image
        setShowCompareSlider(true);
    } else {
        setShowCompareSlider(false);
        setTempState(null); // Clear temp state
    }
  }, [currentState, historyIndex, history]);

  const handleSelectComparisonResult = useCallback((resultDataUrl: string) => {
      if (!currentState) return;
      
      const prevActionName = currentState.actionName;
      // Replace current state with the chosen comparison result
      const newHistory = history.slice(0, historyIndex); // Remove current state
      
      getImageDimensions(resultDataUrl).then(({width, height}) => {
          const newState = {
              ...INITIAL_MANUAL_STATE,
              ...history[historyIndex], // Keep all other states as they were
              imageUrl: resultDataUrl,
              width,
              height,
              actionName: prevActionName + " (Comparado)",
          };
          addToHistory(newState, false);
          setShowCompareSlider(false);
          setTempState(null);
      });
  }, [currentState, history, historyIndex, addToHistory, INITIAL_MANUAL_STATE]);


  useEffect(() => {
    if (selectedToolId === 'color-palette' && currentState && !isAnalyzingColors && !colorPalettes) {
      setIsAnalyzingColors(true);
      analyzeAndGeneratePalettes(currentState.imageUrl)
        .then(palettes => {
          setColorPalettes(palettes);
        })
        .catch(error => {
          console.error("Erro ao gerar paletas:", error);
          setColorPalettes(null);
        })
        .finally(() => {
          setIsAnalyzingColors(false);
        });
    } else if (selectedToolId !== 'color-palette') {
      setColorPalettes(null); // Clear palettes when switching tool
    }
  }, [selectedToolId, currentState, isAnalyzingColors, colorPalettes]);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const selectedToolForControls = useMemo(() => {
    // If mobile and in controls view, ensure selectedTool is passed.
    // Otherwise, it's already managed by selectedToolId.
    return selectedTool;
  }, [selectedTool]);


  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden" style={{ backgroundImage: currentConfig.backgroundImageUrl ? `url(${currentConfig.backgroundImageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {splashState !== 'hidden' && <SplashScreen />}
      
      {editorState === 'welcome' ? (
        <Welcome 
          onImageUpload={(file) => loadImage(file, 'Imagem Carregada')} 
          onGenerateClick={() => { setShowNewProjectModal(true); setSelectedToolId('ia-generate-image'); }}
        />
      ) : (
        <div className="flex h-full w-full relative">
          {!isMobile && <Sidebar {...{ selectedToolId, setSelectedToolId, favoriteTools, onToggleFavorite: handleToggleFavorite }}/>}
          
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <Header
                onNew={handleNewProjectClick}
                onDownload={handleDownload}
                onShare={handleShare}
                onUndo={handleUndo}
                canUndo={historyIndex > 0}
                onRedo={handleRedo}
                canRedo={historyIndex < history.length - 1}
                onCompareToggle={handleCompareToggle}
                isMobile={isMobile}
                onToggleMobilePanel={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
                isLoading={isLoading}
            />
            <div 
                ref={canvasWrapperRef}
                className={`flex-1 relative bg-black/50 overflow-hidden flex items-center justify-center ${selectedToolId === 'ia-selection' ? 'canvas-container-with-selection' : ''}`} 
                id="canvas-wrapper"
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right click
                style={{ touchAction: 'none' }}
            >
                {currentState && (
                    <>
                        <canvas 
                            ref={canvasRef} 
                            className="max-w-full max-h-full object-contain" 
                            style={{ 
                                transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                                transformOrigin: 'center center',
                                imageRendering: zoom > 2 ? 'pixelated' : 'auto', // Pixelate on high zoom for better drawing
                            }}
                        />
                        <canvas 
                            ref={selectionCanvasRef} 
                            className="absolute pointer-events-none opacity-40 mix-blend-screen" 
                            style={{ 
                                transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                                transformOrigin: 'center center',
                            }}
                        />
                    </>
                )}
                {isLoading && <Loader message={loadingMessage} onCancel={() => abortController.current?.abort()} />}
                {showCompareSlider && tempState && currentState && <CompareSlider 
                    beforeImageUrl={tempState.imageUrl} 
                    afterImageUrl={currentState.imageUrl} 
                    onClose={() => {setShowCompareSlider(false); setTempState(null);}}
                />}
                <ZoomControls 
                    zoom={zoom}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitToScreen={handleFitToScreen}
                />
            </div>
          </main>

          {!isMobile && (
            <ControlsSidebar {...{
              selectedToolId,
              selectedTool: selectedToolForControls, // Use the computed tool
              currentState: tempState || currentState,
              history,
              historyIndex,
              onJump: handleJumpToHistory,
              onFeedback: () => {}, // Implement feedback later
              isEditing: isEditingManually.current,
              className: 'w-80 xl:w-96 bg-slate-900/80 backdrop-blur-xl border-l border-slate-700/50 flex-col',
              prompt,
              onPromptChange: setPrompt,
              isLoading,
              onAiEdit: handleAiEdit,
              onAiGenerate: handleAiGenerate,
              onAnalyzeImage: handleAnalyzeImage,
              analysisResult,
              onManualChange: onManualChange,
              onManualCommit: onManualCommitFinal,
              onResizeCommit: handleResizeCommit,
              colorPalettes,
              isAnalyzingColors,
              styleIntensity,
              onStyleIntensityChange: setStyleIntensity,
              brushSize,
              onBrushSizeChange: setBrushSize,
              drawingMode,
              onDrawingModeChange: setDrawingMode,
              onClearSelection: handleClearSelection,
              onSelectionUndo: handleSelectionUndo,
              canUndoSelection: selectionHistoryIndex > 0,
              onSelectionRedo: handleSelectionRedo,
              canRedoSelection: selectionHistoryIndex < selectionHistory.length - 1,
              referenceImage,
              onReferenceFileSelect: (file) => file ? fileToDataUrl(file, (p) => {}).then(res => setReferenceImage({ dataUrl: `data:${res.mimeType};base64${res.base64}`, mimeType: res.mimeType })) : setReferenceImage(null),
              onReferenceImageRemove: () => setReferenceImage(null),
              shouldChangeEnvironment,
              onShouldChangeEnvironmentChange: setShouldChangeEnvironment,
            }} />
          )}

          {isMobile && (
            <div className={`mobile-sidebar-container ${isMobilePanelOpen ? 'open' : ''}`} onClick={() => setIsMobilePanelOpen(false)}>
              <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="mobile-view-wrapper" style={{ transform: `translateX(${mobileView === 'tools' ? '0%' : '-50%'})` }}>
                  <div className="mobile-view">
                    <Sidebar 
                        isMobileToolSelectionOnly 
                        setSelectedToolId={(tool) => { 
                            setSelectedToolId(tool.id); 
                            setPrompt(lastPrompts[tool.id] || tool.promptSuggestion || ''); // Load last prompt
                            setMobileView('controls'); 
                        }} 
                        selectedToolId={selectedToolId} 
                        favoriteTools={favoriteTools} 
                        onToggleFavorite={handleToggleFavorite} 
                        onClose={() => setIsMobilePanelOpen(false)} 
                    />
                  </div>
                  <div className="mobile-view">
                     <ControlsSidebar {...{ 
                        selectedToolId,
                        selectedTool: selectedToolForControls,
                        currentState: tempState || currentState,
                        history,
                        historyIndex,
                        onJump: handleJumpToHistory,
                        onFeedback: () => {}, // Implement feedback later
                        isEditing: isEditingManually.current,
                        onBack: () => setMobileView('tools'),
                        isMobile: true,
                        prompt,
                        onPromptChange: setPrompt,
                        isLoading,
                        onAiEdit: handleAiEdit,
                        onAiGenerate: handleAiGenerate,
                        onAnalyzeImage: handleAnalyzeImage,
                        analysisResult,
                        onManualChange: onManualChange,
                        onManualCommit: onManualCommitFinal,
                        onResizeCommit: handleResizeCommit,
                        colorPalettes,
                        isAnalyzingColors,
                        styleIntensity,
                        onStyleIntensityChange: setStyleIntensity,
                        brushSize,
                        onBrushSizeChange: setBrushSize,
                        drawingMode,
                        onDrawingModeChange: setDrawingMode,
                        onClearSelection: handleClearSelection,
                        onSelectionUndo: handleSelectionUndo,
                        canUndoSelection: selectionHistoryIndex > 0,
                        onSelectionRedo: handleSelectionRedo,
                        canRedoSelection: selectionHistoryIndex < selectionHistory.length - 1,
                        referenceImage,
                        onReferenceFileSelect: (file) => file ? fileToDataUrl(file, (p) => {}).then(res => setReferenceImage({ dataUrl: `data:${res.mimeType};base64${res.base64}`, mimeType: res.mimeType })) : setReferenceImage(null),
                        onReferenceImageRemove: () => setReferenceImage(null),
                        shouldChangeEnvironment,
                        onShouldChangeEnvironmentChange: setShouldChangeEnvironment,
                     }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showRestorePrompt && <RestoreSessionPrompt onRestore={handleRestoreSession} onDismiss={() => { setShowRestorePrompt(false); if (!currentState && !initialImageUrl) setEditorState('welcome'); }} />}
      {showNewProjectModal && <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onLoadImage={(file) => { handleStartNewProject(); loadImage(file, 'Imagem Carregada'); }}
          onGenerateImageClick={(tool) => { handleStartNewProject(); setSelectedToolId(tool.id); setEditorState('editor'); }}
      />}
    </div>
  );
};
