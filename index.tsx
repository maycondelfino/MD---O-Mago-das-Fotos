
import React from 'react';
import ReactDOM from 'react-dom/client';
// A importação agora funciona pois App.tsx exporta um componente válido.
import { App } from './App';

interface EditorConfig {
  targetId: string;
  onSave?: (dataUrl: string) => void;
  initialImageUrl?: string;
}

// Para evitar múltiplas renderizações no mesmo elemento em cenários de hot-reloading ou chamadas duplicadas
const renderedRoots = new Map<string, ReactDOM.Root>();

const renderEditor = (config: EditorConfig) => {
  const targetElement = document.getElementById(config.targetId);
  if (!targetElement) {
    console.error(`O Mago das Fotos: Target element with ID "${config.targetId}" not found.`);
    return;
  }

  // Evita re-renderizar se já foi inicializado
  if (renderedRoots.has(config.targetId)) {
    console.warn(`O Mago das Fotos: Already initialized on element with ID "${config.targetId}".`);
    return;
  }
  
  const root = ReactDOM.createRoot(targetElement);
  renderedRoots.set(config.targetId, root);

  root.render(
    <React.StrictMode>
      <App onSave={config.onSave} initialImageUrl={config.initialImageUrl} />
    </React.StrictMode>
  );
};

// Modo autônomo: renderiza se encontrar o elemento #root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Expõe a API de integração na janela global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).MagoDasFotosEditor = {
  init: (config: EditorConfig) => {
    if (!config || !config.targetId) {
      console.error("O Mago das Fotos: `targetId` is required in the configuration object.");
      return;
    }
    // Garante que o DOM está pronto antes de tentar encontrar o elemento
    if (document.readyState === 'complete') {
        renderEditor(config);
    } else {
        window.addEventListener('load', () => renderEditor(config));
    }
  }
};

// Declaração global para o TypeScript reconhecer a nossa API
declare global {
  interface Window {
    MagoDasFotosEditor: {
      init: (config: EditorConfig) => void;
    };
  }
}
