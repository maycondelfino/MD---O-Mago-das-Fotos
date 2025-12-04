

import React, { useState, useRef, useEffect, useCallback } from 'react';

// No need to import ToneCurvePoint as it's for type checking

const EDITOR_SIZE = 200;
const GRID_LINES = 4;
const POINT_RADIUS = 5;

/**
 * @typedef {object} ToneCurvePoint
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {object} ToneCurvesState
 * @property {ToneCurvePoint[]} rgb
 * @property {ToneCurvePoint[]} r
 * @property {ToneCurvePoint[]} g
 * @property {ToneCurvePoint[]} b
 */

/**
 * @typedef {object} ToneCurveEditorProps
 * @property {ToneCurvePoint[]} points
 * @property {(points: ToneCurvePoint[]) => void} onChange
 * @property {() => void} onCommit
 * @property {number} [width=EDITOR_SIZE]
 * @property {number} [height=EDITOR_SIZE]
 * @property {string} [color='#67fcae']
 */

/**
 * @param {ToneCurveEditorProps} props
 * @returns {React.FC<ToneCurveEditorProps>}
 */
export const ToneCurveEditor = ({
  points,
  onChange,
  onCommit,
  width = EDITOR_SIZE,
  height = EDITOR_SIZE,
  color = '#67fcae', // Verde-menta
}) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const svgRef = useRef(null);

  const getPointerPosition = useCallback((e) => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    let x = ((clientX - rect.left) / rect.width) * 255;
    let y = 255 - (((clientY - rect.top) / rect.height) * 255);

    x = Math.round(Math.max(0, Math.min(255, x)));
    y = Math.round(Math.max(0, Math.min(255, y)));

    return { x, y };
  }, []);

  const handleStartDrag = (index, e) => {
    e.preventDefault();
    setDraggingIndex(index);
  };

  const handleDrag = useCallback((e) => {
    if (draggingIndex === null) return;
    
    const pos = getPointerPosition(e);
    if (!pos) return;
    
    const newPoints = points.map((p, i) => {
      if (i !== draggingIndex) return p;
      // Impede que os pontos inicial e final se movam no eixo X
      const newX = (i === 0 || i === points.length - 1) ? p.x : pos.x;
      return { x: newX, y: pos.y };
    });
    
    onChange(newPoints);
  }, [draggingIndex, getPointerPosition, onChange, points]);

  const handleEndDrag = useCallback(() => {
    if (draggingIndex !== null) {
      onCommit();
      setDraggingIndex(null);
    }
  }, [draggingIndex, onCommit]);

  const handleDoubleClick = (e) => {
    const pos = getPointerPosition(e);
    if (!pos) return;

    // Check if double-clicking an existing point to remove it
    for (let i = 1; i < points.length - 1; i++) { // Skip endpoints
        const p = points[i];
        const dist = Math.sqrt(Math.pow((p.x / 255 * width) - (pos.x / 255 * width), 2) + Math.pow(((255 - p.y) / 255 * height) - ((255 - pos.y) / 255 * height), 2));
        if (dist <= POINT_RADIUS * 2) { // Generous hit area in screen space
            const newPoints = points.filter((_, index) => index !== i);
            onChange(newPoints);
            onCommit();
            return;
        }
    }
    
    // Add a new point if not removing one
    const newPoint = { x: pos.x, y: pos.y };
    const newPoints = [...points, newPoint].sort((a, b) => a.x - b.x);
    onChange(newPoints);
    onCommit();
  };


  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleDrag, { passive: false });
    window.addEventListener('touchend', handleEndDrag);

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [handleDrag, handleEndDrag]);

  const sortedPoints = [...points].sort((a, b) => a.x - b.x);
  const pathData = sortedPoints.map(p => `${p.x},${255 - p.y}`).join(' ');

  return (
    React.createElement("div", { className: "relative", style: { width, height } },
      React.createElement("svg", {
        ref: svgRef,
        viewBox: "0 0 255 255",
        className: "w-full h-full bg-slate-800 rounded-md select-none",
        onTouchMove: (e) => e.preventDefault(),
        onDoubleClick: handleDoubleClick
      },
        // Grid
        Array.from({ length: GRID_LINES - 1 }).map((_, i) => (
          React.createElement("g", { key: i },
            React.createElement("line", {
              x1: (255 / GRID_LINES) * (i + 1), y1: "0",
              x2: (255 / GRID_LINES) * (i + 1), y2: "255",
              stroke: "#475569", strokeWidth: "0.5"
            }),
            React.createElement("line", {
              x1: "0", y1: (255 / GRID_LINES) * (i + 1),
              x2: "255", y2: (255 / GRID_LINES) * (i + 1),
              stroke: "#475569", strokeWidth: "0.5"
            })
          )
        )),
        React.createElement("line", { x1: "0", y1: "255", x2: "255", y2: "0", stroke: "#64748b", strokeWidth: "0.5", strokeDasharray: "2,2" }),

        // Curve
        React.createElement("polyline", {
          points: pathData,
          fill: "none",
          stroke: color,
          strokeWidth: "2"
        }),

        // Points
        sortedPoints.map((p, i) => (
          React.createElement("circle", {
            key: i,
            cx: p.x,
            cy: 255 - p.y,
            r: POINT_RADIUS,
            fill: draggingIndex === points.indexOf(p) ? '#c084fc' : color, // violet-400
            stroke: "#1e293b", // slate-800
            strokeWidth: "2",
            onMouseDown: (e) => handleStartDrag(points.indexOf(p), e),
            onTouchStart: (e) => handleStartDrag(points.indexOf(p), e),
            className: "cursor-grab active:cursor-grabbing"
          })
        ))
      )
    )
  );
};