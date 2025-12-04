import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';

const renderEditor = (config) => {
  const targetElement = document.getElementById(config.targetId);
  if (!targetElement) {
    console.error(`O Mago das Fotos: Target element with ID "${config.targetId}" not found.`);
    return;
  }
  
  try {
    const root = ReactDOM.createRoot(targetElement);
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(App, { onSave: config.onSave, initialImageUrl: config.initialImageUrl })
      )
    );
  } catch (error) {
    console.error("Failed to render React app:", error);
    targetElement.innerHTML = `<div style="color:red; padding: 20px;">Erro ao renderizar a aplicação: ${error.message}</div>`;
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(App, null)
      )
    );
  } catch (error) {
    console.error("Failed to render standalone React app:", error);
    rootElement.innerHTML = `<div style="color:red; padding: 20px;">Erro crítico: ${error.message}</div>`;
  }
}

window.MagoDasFotosEditor = {
  init: (config) => {
    if (!config || !config.targetId) return;
    if (document.readyState === 'complete') {
        renderEditor(config);
    } else {
        window.addEventListener('load', () => renderEditor(config));
    }
  }
};