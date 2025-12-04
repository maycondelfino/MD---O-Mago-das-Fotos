

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon.js';

export const CompareSlider = ({ beforeImageUrl, afterImageUrl, onClose }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let newPosition = (x / rect.width) * 100;
    if (newPosition < 0) newPosition = 0;
    if (newPosition > 100) newPosition = 100;
    setSliderPosition(newPosition);
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleTouchStart = (e) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    
    const handleTouchEnd = () => setIsDragging(false);
    const handleTouchMove = (e) => {
        if (isDragging && e.touches[0]) {
            handleMove(e.touches[0].clientX);
        }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handleMove]);

  return (
    React.createElement("div", { className: "absolute inset-0 z-40 flex items-center justify-center bg-black/70 animate-fadeIn" },
      React.createElement("div", { 
        ref: containerRef,
        className: "relative max-w-full max-h-full aspect-auto select-none overflow-hidden rounded-lg shadow-2xl",
        onMouseDown: handleMouseDown,
        onTouchStart: handleTouchStart
      },
        React.createElement("img", {
          src: beforeImageUrl,
          alt: "Antes",
          className: "block w-full h-auto pointer-events-none"
        }),
        React.createElement("div", {
          className: "absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none",
          style: { clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }
        },
          React.createElement("img", {
            src: afterImageUrl,
            alt: "Depois",
            className: "block h-full w-full max-w-none max-h-none object-cover absolute top-0 left-0 pointer-events-none",
            style: { width: containerRef.current?.offsetWidth, height: containerRef.current?.offsetHeight }
          })
        ),

        React.createElement("div", {
          className: "compare-slider-line",
          style: { left: `${sliderPosition}%` }
        },
          React.createElement("div", { className: "compare-slider-handle" },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M8 3L4 7l4 4m8 8l4-4-4-4M4 7h16M20 17H4"}))
          )
        ),

        React.createElement("div", { className: "absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold" }, "Antes"),
        React.createElement("div", { className: "absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold" }, "Depois")
      ),
      
      React.createElement("button", { 
        onClick: onClose, 
        className: "absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors",
        "aria-label": "Fechar comparação"
      },
        React.createElement(Icon, { name: "x-circle", className: "h-8 w-8" })
      )
    )
  );
};