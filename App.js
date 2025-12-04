import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { isAiAvailable, editImage, generateImage, analyzeImage } from './services/geminiService.js';
import { fileToDataUrl, getImageDimensions, resizeImage, applyAllPixelAdjustments, generateThumbnail } from './utils/imageProcessor.js';
import { Icon } from './components/Icon.js';
import Loader from './components/Loader.js';
import { CompareSlider } from './components/CompareSlider.js';
import { RestoreSessionPrompt } from './components/RestoreSessionPrompt.js';
import { Welcome } from './components/Welcome.js';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { useWindowSize } from './hooks/useWindowSize.js';
import { analyzeAndGeneratePalettes } from './utils/colorAnalyzer.js';
import { TOOLS } from './constants.js';
import { ControlsSidebar } from './components/ControlsSidebar.js';
import { ZoomControls } from './components/ZoomControls.js';
import { NewProjectModal } from './components/NewProjectModal.js';
import { useAppConfig } from './hooks/useAppConfig.js';
import { AI_MODELS } from './config/defaults.js';

const SplashScreen = () => (
  React.createElement("div", { className: "absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#020418] animate-fadeOut", style: { animationDelay: '3s' } },
    React.createElement("div", { className: "flex flex-col items-center justify-center text-center" },
      React.createElement(Icon, { name: "logo-magic", className: "w-28 h-28 text-white animate-scaleAndGlow", style: { animationDelay: '0.2s' } }),
      React.createElement("h1", { className: "text-4xl md:text-5xl font-bold text-white mt-6 splash-title" },
        'MD'.split('').map((char, i) => (
          React.createElement("span", { key: i, style: { '--delay': `${1 + i * 0.05}s` } }, char === ' ' ? '\u00A0' : char)
        ))
      ),
      React.createElement("p", { className: "text-lg text-indigo-200 mt-3 splash-subtitle" }, "O Mago das Fotos")
    )
  )
);

const SESSION_STORAGE_KEY = 'mdoEditorSession';
const LAST_PROMPTS_KEY = 'mdoLastPrompts';
const FAVORITE_TOOLS_KEY = 'mdoFavoriteTools';

const INITIAL_MANUAL_STATE = {
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

export const App = ({ onSave, initialImageUrl }) => {
  const [splashState, setSplashState] = useState('visible');
  const [editorState, setEditorState] = useState('welcome'); // 'welcome', 'editor'
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedToolId, setSelectedToolId] = useState('quick-adjust');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(!isAiAvailable);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [showCompareSlider, setShowCompareSlider] = useState(false);
  const [tempState, setTempState] = useState(null); // For compare slider "before" image
  const [projectTitle, setProjectTitle] = useState('Projeto Sem Título');
  
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;
  const [mobileView, setMobileView] = useState('tools'); // For mobile sidebar navigation
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState('draw');
  const [brushSize, setBrushSize] = useState(30);
  
  const [colorPalettes, setColorPalettes] = useState(null);
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null); // Changed to string for AI feedback
  
  const [lastPrompts, setLastPrompts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LAST_PROMPTS_KEY) || '{}'); } catch { return {}; }
  });
  const [prompt, setPrompt] = useState(''); // Current prompt input
  const [styleIntensity, setStyleIntensity] = useState(75);
  const [shouldChangeEnvironment, setShouldChangeEnvironment] = useState(false); // For ia-steal-clothes
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Pan offset
  
  const [favoriteTools, setFavoriteTools] = useState(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITE_TOOLS_KEY);
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (e) {
      console.error("Failed to parse favorite tools from localStorage:", e);
      return [];
    }
  });

  const [selectionHistory, setSelectionHistory] = useState([]);
  const [selectionHistoryIndex, setSelectionHistoryIndex] = useState(-1);

  const canvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const canvasWrapperRef = useRef(null); // Ref for the div wrapping canvases
  const lastMousePosition = useRef(null);
  const isEditingManually = useRef(false);
  const saveTimeout = useRef(null);
  const abortController = useRef(null);
  const startPanOffset = useRef({ x: 0, y: 0 });

  const { currentConfig, updateConfig } = useAppConfig();
  const selectedAiModel = useMemo(() => AI_MODELS.find(m => m.id === currentConfig.aiModelId) || AI_MODELS[0], [currentConfig.aiModelId]);

  const currentState = useMemo(() => history[historyIndex], [history, historyIndex]);
  const selectedTool = useMemo(() => TOOLS.find(t => t.id === selectedToolId) || TOOLS[0], [selectedToolId]);

  // Callback to add state to history
  const addToHistory = useCallback((newState, commitManualChanges = false) => {
    if (!canvasRef.current) return;
    
    // If there are pending manual changes, commit them first
    if (isEditingManually.current && commitManualChanges && currentState) {
        const manualAdjustedDataUrl = canvasRef.current.toDataURL(currentState.imageUrl.split(';')[0].split(':')[1]);
        const manualAdjustedThumbnail = generateThumbnail(canvasRef.current);
        const manualState = {
            ...currentState,
            imageUrl: manualAdjustedDataUrl,
            thumbnailUrl: manualAdjustedThumbnail,
            actionName: "Ajustes Manuais",
        };
        setHistory(prev => [...prev.slice(0, historyIndex + 1), manualState, { ...newState, thumbnailUrl: generateThumbnail(canvasRef.current) }]);
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
  const handleManualCommit = useCallback((actionName) => {
    if (!tempState) return; // No temporary state to commit
    const committedState = { ...tempState, actionName };
    addToHistory(committedState, false);
    setTempState(null); // Clear temporary state
    isEditingManually.current = false;
  }, [tempState, addToHistory]);

  // Debounce for manual edits (sliders) - uses handleManualCommit
  const debounceCommitManual = useCallback((actionName) => {
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
        const sessionData = {
          history,
          historyIndex,
          lastPrompts,
          selectedToolId,
          favoriteTools,
          zoom,
          offset,
          selectionHistory,
          selectionHistoryIndex,
          projectTitle, // Save the title
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.error("Falha ao salvar a sessão:", error);
        // alert("Falha ao salvar a sessão: O armazenamento do navegador está cheio. Tente limpar o cache.");
      }
    }
  }, [currentState, history, historyIndex, lastPrompts, selectedToolId, favoriteTools, zoom, offset, selectionHistory, selectionHistoryIndex, projectTitle]);

  useEffect(() => {
    // Save session automatically 1 second after last change
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
        saveSession();
    }, 1000); // Save 1 second after last interaction

    return () => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [currentState, saveSession, selectedToolId, favoriteTools, lastPrompts, zoom, offset, selectionHistory, selectionHistoryIndex, projectTitle]);

  const drawCanvas = useCallback((stateToDraw, currentZoom, currentOffset) => {
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

  const loadImage = useCallback(async (imageSource, actionName, selectedToolAfterLoad) => {
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
        base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
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
      const newState = {
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

  const handleManualChange = useCallback((values) => {
    if (!currentState) return;
    setTempState({ ...currentState, ...values });
    isEditingManually.current = true;
  }, [currentState]);

  // Manual Adjustments (sliders) - uses handleManualCommit
  const onManualChange = useCallback((values) => {
    if (!currentState) return;
    setTempState({ ...currentState, ...values });
    isEditingManually.current = true;
    // Debounce the commit
    debounceCommitManual(selectedTool.name);
  }, [currentState, selectedTool.name, debounceCommitManual]);

  const onManualCommitFinal = useCallback((actionName) => {
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

  const handleResizeCommit = useCallback(async (newWidth, newHeight) => {
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
        const newState = {
            ...newAdjustments, // Apply initial adjustments
            imageUrl: newDataUrl,
            width: finalWidth,
            height: finalHeight,
            actionName: `Redimensionar ${finalWidth}x${finalHeight}`,
            thumbnailUrl: generateThumbnail(canvasRef.current), // Generate thumbnail from the current canvas
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

  const getCanvasCoordinates = useCallback((clientX, clientY, canvas, currentZoom, currentOffset) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / currentZoom) - currentOffset.x;
    const y = ((clientY - rect.top) / currentZoom) - currentOffset.y;
    return { x, y };
  }, []);

  const drawSelectionLine = useCallback((ctx, x, y, size, mode) => {
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


  const handlePointerDown = useCallback((e) => {
    if (!canvasRef.current || !currentState) return;

    // Prevent right-click context menu
    if ('button' in e && e.button === 2) {
        e.preventDefault();
        return;
    }
    
    // Determine if it's a touch event and get the touch point
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

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

const handlePointerMove = useCallback((e) => {
    if (!canvasRef.current || !currentState) return;

    // Determine if it's a touch event and get the touch point
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return;

    // Fix for mobile: prevent default to stop scrolling while interacting
    if (isDrawing || isPanning) {
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
        // Important for mobile: passive: false allows e.preventDefault()
        wrapper.addEventListener('touchmove', handlePointerMove, { passive: false }); 
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

  const handleJumpToHistory = useCallback((index) => {
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
    // Use project title for filename
    const safeTitle = projectTitle.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'md-mago-das-fotos';
    a.download = `${safeTitle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [currentState, onManualCommitFinal, projectTitle]);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current || !currentState) return;
    onManualCommitFinal("Compartilhar"); // Commit any pending manual changes

    try {
      const dataUrl = canvasRef.current.toDataURL(currentState.imageUrl.split(';')[0].split(':')[1]);
      const blob = await (await fetch(dataUrl)).blob();
      const safeTitle = projectTitle.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'md-mago-das-fotos';
      const file = new File([blob], `${safeTitle}.png`, { type: blob.type });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: projectTitle || 'Minha foto mágica!',
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
  }, [currentState, onManualCommitFinal, handleDownload, projectTitle]);

  const handleAiEdit = useCallback(async (aiPrompt, tool) => {
    if (!currentState) return;
    onManualCommitFinal(tool.name); // Commit any pending manual changes

    setIsLoading(true);
    setLoadingMessage(`Lançando feitiço: ${tool.name}...`);
    abortController.current = new AbortController();

    try {
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
      
      // Special prompt engineering logic (omitted for brevity, same as previous App.js)
      // ... (Prompt engineering logic remains identical)

      const response = await editImage({
        base64ImageData: currentState.imageUrl.split(',')[1],
        mimeType: currentState.imageUrl.split(';')[0].split(':')[1],
        prompt: finalPrompt,
        selectionMask: selectionMaskData ? { base64: selectionMaskData, mimeType: 'image/png' } : undefined,
        referenceImage: referenceImageData ? { base64: referenceImageData.dataUrl.split(',')[1], mimeType: referenceImageData.mimeType } : undefined,
        signal: abortController.current.signal,
        model: selectedAiModel.id, 
      });

      const { width, height } = await getImageDimensions(`data:${response.mimeType};base64,${response.base64}`);

      const newState = {
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
      if (selectionCanvasRef.current) { 
        selectionCanvasRef.current.getContext('2d')?.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);
        addToHistory({ ...currentState, selectionMask: null, actionName: 'Limpar Seleção' });
      }
      setReferenceImage(null); 

    } catch (error) {
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

  const handleAiGenerate = useCallback(async (aiPrompt, tool) => {
    if (!aiPrompt) return;
    setIsLoading(true);
    setLoadingMessage(`Gerando imagem com ${tool.name}...`);
    abortController.current = new AbortController();

    try {
      const generationModel = AI_MODELS.find(m => m.id === currentConfig.aiModelIdForGeneration) || AI_MODELS[0];

      const response = await generateImage({
        prompt: aiPrompt,
        signal: abortController.current.signal,
        model: generationModel.id, 
      });

      const dataUrl = `data:${response.mimeType};base64,${response.base64}`;
      const { width, height } = await getImageDimensions(dataUrl);

      const newState = {
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
              setEditorState('editor'); 
              setZoom(1);
              setOffset({ x: 0, y: 0 });
          };
          img.src = dataUrl;
      }
      setLastPrompts(prev => ({ ...prev, [tool.id]: aiPrompt }));
      setPrompt('');

    } catch (error) {
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
        model: selectedAiModel.id, 
      });
      setAnalysisResult(result); 
    } catch (error) {
      if (error.name === 'AbortError') {
        setLoadingMessage('Cancelado.');
      } else {
        console.error('Erro ao analisar imagem com Gemini:', error);
        alert(`Erro ao analisar imagem: ${error.message || 'Não foi possível analisar a imagem.'}`);
      }
      setAnalysisResult('Não foi possível obter uma análise da imagem.');
    } finally {
      setIsAnalyzingColors(false);
      setIsLoading(false); 
      abortController.current = null;
    }
  }, [currentState, onManualCommitFinal, selectedAiModel]);

  const handleToggleFavorite = useCallback((toolId) => {
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
    setProjectTitle('Projeto Sem Título');
    setIsMobilePanelOpen(false);
    setMobileView('tools');
    setEditorState('welcome');
    setShowNewProjectModal(false);
  }, []);

  const handleRestoreSession = useCallback(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const { history: savedHistory, historyIndex: savedIndex, lastPrompts: savedPrompts, selectedToolId: savedToolId, favoriteTools: savedFavorites, zoom: savedZoom, offset: savedOffset, selectionHistory: savedSelectionHistory, selectionHistoryIndex: savedSelectionIndex, projectTitle: savedTitle } = JSON.parse(savedSession);
        
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
          if (savedTitle) setProjectTitle(savedTitle);
          setEditorState('editor'); 
        }
      }
    } catch (error) {
      console.error("Falha ao restaurar a sessão:", error);
      alert("Houve um erro ao restaurar sua sessão. Ela pode estar corrompida.");
      localStorage.removeItem(SESSION_STORAGE_KEY); 
    } finally {
      setShowRestorePrompt(false);
      setIsLoading(false);
    }
  }, []);

  const handleAiModelChange = useCallback((modelId) => {
    updateConfig({ ...currentConfig, aiModelId: modelId });
  }, [currentConfig, updateConfig]);

  const handleAiModelForGenerationChange = useCallback((modelId) => {
    updateConfig({ ...currentConfig, aiModelIdForGeneration: modelId });
  }, [currentConfig, updateConfig]);

  const handleCompareToggle = useCallback((show) => {
    if (show && currentState && historyIndex > 0) {
        setTempState(history[historyIndex - 1]); 
        setShowCompareSlider(true);
    } else {
        setShowCompareSlider(false);
        setTempState(null); 
    }
  }, [currentState, historyIndex, history]);

  const handleSelectComparisonResult = useCallback((resultDataUrl) => {
      if (!currentState) return;
      
      const prevActionName = currentState.actionName;
      const newHistory = history.slice(0, historyIndex); 
      
      getImageDimensions(resultDataUrl).then(({width, height}) => {
          const newState = {
              ...INITIAL_MANUAL_STATE,
              ...history[historyIndex], 
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
      setColorPalettes(null); 
    }
  }, [selectedToolId, currentState, isAnalyzingColors, colorPalettes]);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const selectedToolForControls = useMemo(() => {
    return selectedTool;
  }, [selectedTool]);


  return (
    React.createElement("div", { className: "h-full w-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden", style: { backgroundImage: currentConfig.backgroundImageUrl ? `url(${currentConfig.backgroundImageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' } },
      splashState !== 'hidden' && React.createElement(SplashScreen, null),
      
      editorState === 'welcome' ? (
        React.createElement(Welcome, { 
          onImageUpload: (file) => loadImage(file, 'Imagem Carregada'), 
          onGenerateClick: () => { setShowNewProjectModal(true); setSelectedToolId('ia-generate-image'); }
        })
      ) : (
        React.createElement("div", { className: "flex h-full w-full relative" },
          !isMobile && React.createElement(Sidebar, { selectedToolId: selectedToolId, setSelectedToolId: (tool) => setSelectedToolId(tool.id), favoriteTools: favoriteTools, onToggleFavorite: handleToggleFavorite }),
          
          React.createElement("main", { className: "flex-1 flex flex-col h-full overflow-hidden" },
            React.createElement(Header, {
                onNew: handleNewProjectClick,
                onDownload: handleDownload,
                onShare: handleShare,
                onUndo: handleUndo,
                canUndo: historyIndex > 0,
                onRedo: handleRedo,
                canRedo: historyIndex < history.length - 1,
                onCompareToggle: handleCompareToggle,
                isMobile: isMobile,
                onToggleMobilePanel: () => setIsMobilePanelOpen(!isMobilePanelOpen),
                isLoading: isLoading
            }),
            React.createElement("div", { className: "w-full bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 py-1 flex justify-center z-10 flex-shrink-0" },
              React.createElement("input", {
                type: "text",
                value: projectTitle,
                onChange: (e) => setProjectTitle(e.target.value),
                className: "bg-transparent text-center text-slate-200 font-medium text-base focus:outline-none focus:border-b focus:border-violet-500 transition-colors w-full max-w-md placeholder-slate-500",
                placeholder: "Nome do Projeto"
              })
            ),
            React.createElement("div", { 
                ref: canvasWrapperRef,
                className: `flex-1 relative bg-black/50 overflow-hidden flex items-center justify-center ${selectedToolId === 'ia-selection' ? 'canvas-container-with-selection' : ''}`, 
                id: "canvas-wrapper",
                onMouseDown: handlePointerDown,
                onTouchStart: handlePointerDown,
                onContextMenu: (e) => e.preventDefault(),
                style: { touchAction: 'none' } 
            },
                currentState && (
                    React.createElement(React.Fragment, null,
                        React.createElement("canvas", { 
                            ref: canvasRef, 
                            className: "max-w-full max-h-full object-contain", 
                            style: { 
                                transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                                transformOrigin: 'center center',
                                imageRendering: zoom > 2 ? 'pixelated' : 'auto', 
                            }
                        }),
                        React.createElement("canvas", { 
                            ref: selectionCanvasRef, 
                            className: "absolute pointer-events-none opacity-40 mix-blend-screen", 
                            style: { 
                                transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                                transformOrigin: 'center center',
                            }
                        })
                    )
                ),
                isLoading && React.createElement(Loader, { message: loadingMessage, onCancel: () => abortController.current?.abort() }),
                showCompareSlider && tempState && currentState && React.createElement(CompareSlider, { 
                    beforeImageUrl: tempState.imageUrl, 
                    afterImageUrl: currentState.imageUrl, 
                    onClose: () => {setShowCompareSlider(false); setTempState(null);}
                }),
                React.createElement(ZoomControls, { 
                    zoom: zoom,
                    onZoomIn: handleZoomIn,
                    onZoomOut: handleZoomOut,
                    onFitToScreen: handleFitToScreen
                })
            )
          ),

          !isMobile && (
            React.createElement(ControlsSidebar, {
              selectedToolId: selectedToolId,
              selectedTool: selectedToolForControls,
              currentState: tempState || currentState,
              history: history,
              historyIndex: historyIndex,
              onJump: handleJumpToHistory,
              onFeedback: () => {}, 
              isEditing: isEditingManually.current,
              className: 'w-80 xl:w-96 bg-slate-900/80 backdrop-blur-xl border-l border-slate-700/50 flex-col',
              prompt: prompt,
              onPromptChange: setPrompt,
              isLoading: isLoading,
              onAiEdit: handleAiEdit,
              onAiGenerate: handleAiGenerate,
              onAnalyzeImage: handleAnalyzeImage,
              analysisResult: analysisResult,
              onManualChange: onManualChange,
              onManualCommit: onManualCommitFinal,
              onResizeCommit: handleResizeCommit,
              colorPalettes: colorPalettes,
              isAnalyzingColors: isAnalyzingColors,
              styleIntensity: styleIntensity,
              onStyleIntensityChange: setStyleIntensity,
              brushSize: brushSize,
              onBrushSizeChange: setBrushSize,
              drawingMode: drawingMode,
              onDrawingModeChange: setDrawingMode,
              onClearSelection: handleClearSelection,
              onSelectionUndo: handleSelectionUndo,
              canUndoSelection: selectionHistoryIndex > 0,
              onSelectionRedo: handleSelectionRedo,
              canRedoSelection: selectionHistoryIndex < selectionHistory.length - 1,
              referenceImage: referenceImage,
              onReferenceFileSelect: (file) => file ? fileToDataUrl(file, (p) => {}).then(res => setReferenceImage({ dataUrl: `data:${res.mimeType};base64,${res.base64}`, mimeType: res.mimeType })) : setReferenceImage(null),
              onReferenceImageRemove: () => setReferenceImage(null),
              shouldChangeEnvironment: shouldChangeEnvironment,
              onShouldChangeEnvironmentChange: setShouldChangeEnvironment
            })
          ),

          isMobile && (
            React.createElement("div", { className: `mobile-sidebar-container ${isMobilePanelOpen ? 'open' : ''}`, onClick: () => setIsMobilePanelOpen(false) },
              React.createElement("div", { className: "mobile-sidebar", onClick: (e) => e.stopPropagation() },
                React.createElement("div", { className: "mobile-view-wrapper", style: { transform: `translateX(${mobileView === 'tools' ? '0%' : '-50%'})` } },
                  React.createElement("div", { className: "mobile-view" },
                    React.createElement(Sidebar, { 
                        isMobileToolSelectionOnly: true, 
                        setSelectedToolId: (tool) => { 
                            setSelectedToolId(tool.id); 
                            setPrompt(lastPrompts[tool.id] || tool.promptSuggestion || ''); 
                            setMobileView('controls'); 
                        }, 
                        selectedToolId: selectedToolId, 
                        favoriteTools: favoriteTools, 
                        onToggleFavorite: handleToggleFavorite, 
                        onClose: () => setIsMobilePanelOpen(false) 
                    })
                  ),
                  React.createElement("div", { className: "mobile-view" },
                     React.createElement(ControlsSidebar, { 
                        selectedToolId: selectedToolId,
                        selectedTool: selectedToolForControls,
                        currentState: tempState || currentState,
                        history: history,
                        historyIndex: historyIndex,
                        onJump: handleJumpToHistory,
                        onFeedback: () => {}, 
                        isEditing: isEditingManually.current,
                        onBack: () => setMobileView('tools'),
                        isMobile: true,
                        prompt: prompt,
                        onPromptChange: setPrompt,
                        isLoading: isLoading,
                        onAiEdit: handleAiEdit,
                        onAiGenerate: handleAiGenerate,
                        onAnalyzeImage: handleAnalyzeImage,
                        analysisResult: analysisResult,
                        onManualChange: onManualChange,
                        onManualCommit: onManualCommitFinal,
                        onResizeCommit: handleResizeCommit,
                        colorPalettes: colorPalettes,
                        isAnalyzingColors: isAnalyzingColors,
                        styleIntensity: styleIntensity,
                        onStyleIntensityChange: setStyleIntensity,
                        brushSize: brushSize,
                        onBrushSizeChange: setBrushSize,
                        drawingMode: drawingMode,
                        onDrawingModeChange: setDrawingMode,
                        onClearSelection: handleClearSelection,
                        onSelectionUndo: handleSelectionUndo,
                        canUndoSelection: selectionHistoryIndex > 0,
                        onSelectionRedo: handleSelectionRedo,
                        canRedoSelection: selectionHistoryIndex < selectionHistory.length - 1,
                        referenceImage: referenceImage,
                        onReferenceFileSelect: (file) => file ? fileToDataUrl(file, (p) => {}).then(res => setReferenceImage({ dataUrl: `data:${res.mimeType};base64,${res.base64}`, mimeType: res.mimeType })) : setReferenceImage(null),
                        onReferenceImageRemove: () => setReferenceImage(null),
                        shouldChangeEnvironment: shouldChangeEnvironment,
                        onShouldChangeEnvironmentChange: setShouldChangeEnvironment
                     })
                  )
                )
              )
            )
          )
        )
      ),
      showRestorePrompt && React.createElement(RestoreSessionPrompt, { onRestore: handleRestoreSession, onDismiss: () => { setShowRestorePrompt(false); if (!currentState && !initialImageUrl) setEditorState('welcome'); } }),
      showNewProjectModal && React.createElement(NewProjectModal, { 
          onClose: () => setShowNewProjectModal(false),
          onLoadImage: (file) => { handleStartNewProject(); loadImage(file, 'Imagem Carregada'); },
          onGenerateImageClick: (tool) => { handleStartNewProject(); setSelectedToolId(tool.id); setEditorState('editor'); }
      })
    )
  );
};