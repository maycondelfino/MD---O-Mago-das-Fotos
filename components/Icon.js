

import React from 'react';

export const Icon = ({ name, className, ...props }) => {
  const svgContent = () => {
    switch (name) {
      // Custom Logo
      case 'logo-magic': return React.createElement(React.Fragment, null,
          React.createElement("defs", null,
            React.createElement("linearGradient", { id: "hat-gradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
              React.createElement("stop", { offset: "0%", style: {stopColor: '#4c1d95'} }),
              React.createElement("stop", { offset: "100%", style: {stopColor: '#8b5cf6'} })
            ),
            React.createElement("radialGradient", { id: "glow-grad", cx: "50%", cy: "50%", r: "50%" },
              React.createElement("stop", { offset: "85%", stopColor: "var(--secondary-accent)", stopOpacity: "0.7" }),
              React.createElement("stop", { offset: "100%", stopColor: "var(--primary-accent)", stopOpacity: "0" })
            ),
            React.createElement("filter", { id: "logo-glow-filter" },
              React.createElement("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "0.7" })
            )
          ),
          React.createElement("circle", { cx: "12", cy: "12", r: "12", fill: "var(--glass-bg)" }),
          React.createElement("circle", { cx: "12", cy: "12", r: "11.5", stroke: "var(--secondary-accent)", strokeOpacity: "0.5", strokeWidth: "1", fill: "none" }),
          React.createElement("circle", { cx: "12", cy: "12", r: "12", fill: "url(#glow-grad)" }),
          
          React.createElement("g", { transform: "translate(-0.5, 0)" },
            React.createElement("path", { d: "M17.5 10C15.5 9 8.5 9 6.5 10L8.5 13.5H15.5Z M12 4L6.5 10H17.5Z", fill: "url(#hat-gradient)" }),
            React.createElement("path", { d: "M8 10.5 C9 9.8, 11 9.8, 12 10.5", stroke: "white", strokeWidth: "0.4", fill: "none", opacity: "0.7" })
          ),
          
          React.createElement("text", { x: "7", y: "19.5", fontFamily: "sans-serif", fontSize: "8", fontWeight: "bold", fill: "#f1f5f9", filter: "url(#logo-glow-filter)" }, "M"),
          React.createElement("text", { x: "13.5", y: "19.5", fontFamily: "sans-serif", fontSize: "8", fontWeight: "bold", fill: "#f1f5f9", filter: "url(#logo-glow-filter)" }, "D"),

          React.createElement("g", { transform: "translate(1, -1)" },
              React.createElement("path", { d: "M15 17 Q 18 18 16.5 21", stroke: "#f1f5f9", strokeWidth: "0.8", fill: "none", strokeLinecap: "round" }),
              React.createElement("circle", { cx: "16.3", cy: "21.2", r: "0.8", fill: "var(--secondary-accent)" }),
              React.createElement("circle", { cx: "16.3", cy: "21.2", r: "1.2", stroke: "var(--secondary-accent)", strokeWidth: "0.4", fill: "none" })
          )
      );
        
      // Custom Tool Icons
      case 'clock': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("polyline", { points: "12 6 12 12 16 14" }));
      case 'file-plus': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }), React.createElement("polyline", { points: "14 2 14 8 20 8" }), React.createElement("line", { x1: "12", y1: "18", x2: "12", y2: "12" }), React.createElement("line", { x1: "9", y1: "15", x2: "15", y2: "15" }));
      case 'home': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), React.createElement("polyline", { points: "9 22 9 12 15 12 15 22" }));
      case 'ruler': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M17 3l4 4L7 21l-4-4 14-14zM15 5l-2-2" }), React.createElement("path", { d: "M21 7l-2-2" }), React.createElement("path", { d: "M12 12l-2-2" }), React.createElement("path", { d: "M9 15l-2-2" }), React.createElement("path", { d: "M6 18l-2-2" }));
      case 'hand': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" }), React.createElement("path", { d: "M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" }), React.createElement("path", { d: "M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" }), React.createElement("path", { d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" }));
      case 'palette': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("path", { d: "M12 2a10 10 0 0 0-10 10c0 1.68.41 3.26 1.15 4.63l13.97-13.97A9.94 9.94 0 0 0 12 2Z" }));
      case 'curve': return React.createElement("path", { d: "M3 21S13 1 21 3" });
      case 'hair': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M15 4s-3 2-6 2-6-2-6-2-2 6 0 8 4 2 4 2" }), React.createElement("path", { d: "M12 16s-2-2-2-4 2-4 2-4" }), React.createElement("path", { d: "M15 14s-1-2-1-4 1-4 1-4" }));
      case 'eye-color': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }), React.createElement("circle", { cx: "12", cy: "12", r: "3" }), React.createElement("path", { d: "M20 17.5a2.5 2.5 0 0 1-5 0" }), React.createElement("path", { d: "M21 15c-1-2-3-2.5-3-2.5" }));
      case 'makeup-brush': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M14 19.5V16" }), React.createElement("path", { d: "M10.5 19.5 12 15l1.5 4.5" }), React.createElement("path", { d: "m7 19.5-2-7 5.5 2.5" }), React.createElement("path", { d: "m17 19.5 2-7-5.5 2.5" }), React.createElement("path", { d: "M12 15v-2a3 3 0 0 0-3-3H7a4 4 0 0 1 0-8h10a4 4 0 0 1 0 8h-2a3 3 0 0 0-3 3v2z" }));
      case 'skin': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 22a7.7 7.7 0 0 0 5-2 7.7 7.7 0 0 0 0-10.8A7.7 7.7 0 0 0 12 2a7.7 7.7 0 0 0-5 2 7.7 7.7 0 0 0 0 10.8A7.7 7.7 0 0 0 12 22Z" }), React.createElement("path", { d: "m12 8-1.5 3 2.5 2.5.5-5.5Z" }));
      case 'wrinkle': return React.createElement(React.Fragment, null, React.createElement("path", { d: "m3 15 4-4 4 4 4-4 4 4" }), React.createElement("path", { d: "m3 9 4-4 4 4 4-4 4 4" }));
      case 'eyebrow': return React.createElement("path", { d: "M17 10c-2 0-4-1-4-1s-2 1-4 1-4-1-4-1" });
      case 'eye': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }), React.createElement("circle", { cx: "12", cy: "12", r: "3" }));
      case 'lipstick': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M20.28 3.42a2.5 2.5 0 0 0-3.53 0l-8.19 8.19a1.5 1.5 0 0 0 0 2.12l5.65 5.66a1.5 1.5 0 0 0 2.12 0l8.19-8.19a2.5 2.5 0 0 0 0-3.53Z" }), React.createElement("path", { d: "m14 18 6-6" }), React.createElement("path", { d: "M11 11 2.83 2.83" }));
      case 'teeth': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M21 12c-2 0-4.5-1-4.5-1s-2 1-4.5 1-4.5-1-4.5-1-2.5 1-4.5 1" }), React.createElement("path", { d: "M3 13h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" }), React.createElement("path", { d: "M12 13v8" }), React.createElement("path", { d: "M8 13v8" }), React.createElement("path", { d: "M16 13v8" }));
      case 'glasses': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "6", cy: "15", r: "4" }), React.createElement("circle", { cx: "18", cy: "15", r: "4" }), React.createElement("path", { d: "M10 15h4" }), React.createElement("path", { d: "M21 15a9 9 0 0 0-18 0" }), React.createElement("path", { d: "M4 15 2 7" }), React.createElement("path", { d: "M20 15l2-8" }));
      case 'beard': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 16c-4 0-6-2-6-4V4h12v8c0 2-2 4-6 4Z" }), React.createElement("path", { d: "M10 16v4" }), React.createElement("path", { d: "M14 16v4" }), React.createElement("path", { d: "M12 16v4" }));
      case 'scissors': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "6", cy: "6", r: "3" }), React.createElement("circle", { cx: "6", cy: "18", r: "3" }), React.createElement("line", { x1: "20", y1: "4", x2: "8.12", y2: "15.88" }), React.createElement("line", { x1: "14.47", y1: "14.48", x2: "20", y2: "20" }), React.createElement("line", { x1: "8.12", y1: "8.12", x2: "12", y2: "12" }));
      case 'razor': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M3 6h18v4H3z" }), React.createElement("path", { d: "M7 10v10h10V10M10 10l-2-4h8l-2 4" }));
      case 'face': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("path", { d: "M8 14s1.5 2 4 2 4-2 4-2" }), React.createElement("line", { x1: "9", y1: "9", x2: "9.01", y2: "9" }), React.createElement("line", { x1: "15", y1: "9", x2: "15.01", y2: "9" }));
      case 'person-add': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "9", cy: "7", r: "4" }), React.createElement("path", { d: "M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" }), React.createElement("path", { d: "M16 11h6m-3-3v6" }));
      case 'age': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M14 12H4.5a2.5 2.5 0 0 0 0 5H14" }), React.createElement("path", { d: "M8 12V7c0-2.2 1.8-4 4-4s4 1.8 4 4v3" }), React.createElement("path", { d: "M12 22v-4" }), React.createElement("path", { d: "M20 12v3a2 2 0 0 1-2 2h-1.5a2.5 2 0 0 1 0-5H20" }));
      case 'weight': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "5", r: "3" }), React.createElement("path", { d: "M6.5 8a2 2 0 0 0-1.9 2.2L6 14h12l1.4-3.8A2 2 0 0 0 17.5 8h-11Z" }), React.createElement("path", { d: "M6 14h12v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5Z" }));
      case 'body': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "5", r: "3" }), React.createElement("path", { d: "M9 12h6v9H9z" }), React.createElement("path", { d: "m14 12-2 3-2-3" }), React.createElement("path", { d: "M6 12h12" }), React.createElement("path", { d: "M6 15h12" }), React.createElement("path", { d: "M6 18h12" }));
      case 'body-pose': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "4", r: "2" }), React.createElement("path", { d: "M12 6v6" }), React.createElement("path", { d: "m6 12 6 6 6-6" }), React.createElement("path", { d: "M12 18v4" }));
      case 'id-photo': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M20 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" }), React.createElement("path", { d: "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" }), React.createElement("path", { d: "M16 21a4 4 0 0 0-8 0" }));
      case 'avatar-3d': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 2a10 10 0 0 0-9.8 11.2 5 5 0 0 1 1.5 5.7 10 10 0 1 0 16.6 0 5 5 0 0 1 1.5-5.7A10 10 0 0 0 12 2Z" }));
      case 'improve-lighting': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 2v4" }), React.createElement("path", { d: "M12 18v4" }), React.createElement("path", { d: "m4.93 4.93 2.83 2.83" }), React.createElement("path", { d: "m16.24 16.24 2.83 2.83" }), React.createElement("path", { d: "M2 12h4" }), React.createElement("path", { d: "M18 12h4" }), React.createElement("path", { d: "m4.93 19.07 2.83-2.83" }), React.createElement("path", { d: "m16.24 7.76 2.83-2.83" }), React.createElement("circle", { cx: "12", cy: "12", r: "2" }));
      case 'deblur': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" }), React.createElement("path", { d: "M10 12h4" }), React.createElement("path", { d: "M9 9h6" }), React.createElement("path", { d: "M9 15h6" }));
      case 'night-mode': return React.createElement("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" });
      case 'swap': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M8 3L4 7l4 4" }), React.createElement("path", { d: "M4 7h16" }), React.createElement("path", { d: "m16 21 4-4-4-4" }), React.createElement("path", { d: "M20 17H4" }));
      case 'layers': return React.createElement(React.Fragment, null, React.createElement("polygon", { points: "12 2 2 7 12 12 22 7 12 2" }), React.createElement("polyline", { points: "2 17 12 22 22 17" }), React.createElement("polyline", { points: "2 12 12 17 22 12" }));
      case 'tattoo': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 12c-2-2.67-4-4-4-4a2 2 0 1 1 4 0c0 0-2 1.33-4 4" }), React.createElement("path", { d: "M12 12c2-2.67 4-4 4-4a2 2 0 1 0-4 0c0 0 2 1.33 4 4" }), React.createElement("path", { d: "M12 12c-2.67 2-4 4-4 4a2 2 0 1 0 0-4c0 0 1.33 2 4 4" }), React.createElement("path", { d: "M12 12c2.67 2 4 4 4 4a2 2 0 1 1 0-4c0 0-1.33 2-4 4" }), React.createElement("circle", { cx: "12", cy: "12", r: "10" }));
      case 'shirt': return React.createElement(React.Fragment, null, React.createElement("path", { d: "m18 8-4-4-4 4M8 8h8v12H8z" }), React.createElement("path", { d: "M4 12h4v4H4zM16 12h4v4h-4z" }));
      case 'logo': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("path", { d: "M12 12 8 8" }), React.createElement("path", { d: "M12 12 8 16" }), React.createElement("path", { d: "M12 12 16 8" }), React.createElement("path", { d: "M12 12 16 16" }));
      case 'type': return React.createElement(React.Fragment, null, React.createElement("polyline", { points: "4 7 4 4 20 4 20 7" }), React.createElement("line", { x1: "9", y1: "20", x2: "15", y2: "20" }), React.createElement("line", { x1: "12", y1: "4", x2: "12", y2: "20" }));
      case 'store': return React.createElement(React.Fragment, null, React.createElement("path", { d: "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" }), React.createElement("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4z" }), React.createElement("path", { d: "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" }));
      case 'tag': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 2H2v10l10 10 10-10L12 2Z" }), React.createElement("path", { d: "M7 7h.01" }));
      case 'share-2': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "18", cy: "5", r: "3" }), React.createElement("circle", { cx: "6", cy: "12", r: "3" }), React.createElement("circle", { cx: "18", cy: "19", r: "3" }), React.createElement("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }), React.createElement("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }));
      case 'package': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M16.5 9.4a4.5 4.5 0 1 0 0 5.2" }), React.createElement("path", { d: "m21 12-5.5-3.15" }), React.createElement("path", { d: "M21 12v3.15L15.5 18" }), React.createElement("path", { d: "M3.5 14.5 9 18l6.5-3.5" }), React.createElement("path", { d: "M9 6 3.5 9.15 9 12.3" }), React.createElement("path", { d: "M15.5 6 9 9.15v6.7L15.5 12V6Z" }));
      case 'shadow': return React.createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" });
      case 'rotate-3d': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2" }), React.createElement("path", { d: "m15.194 13.707 3.814 1.86-1.964 4.024" }), React.createElement("path", { d: "M19.799 11c.298 1.591.315 2.591.315 3a10 10 0 0 1-10 10c-4.868 0-8.9-5.32-8.9-10C1.215 8.01 4.215 4 8.215 4c.834 0 1.62.19 2.34.526" }));
      case 'aperture': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("path", { d: "m14.31 8 5.74 9.94" }), React.createElement("path", { d: "M9.69 8h11.48" }), React.createElement("path", { d: "M7.76 4.06 2.06 14" }), React.createElement("path", { d: "M16.24 4.06-1.8 14" }), React.createElement("path", { d: "M14.31 16H2.83" }), React.createElement("path", { d: "M4.93 21.07 10.63 11" }));
      case 'crop': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M6.13 1L6 16a2 2 0 0 0 2 2h15" }), React.createElement("path", { d: "M1 6.13L16 6a2 2 0 0 1 2 2v15" }));
      case 'droplet': return React.createElement("path", { d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7z" });
      case 'square': return React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" });
      case 'star': return React.createElement("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" });
      case 'star-filled': return React.createElement("polygon", { fill: "currentColor", stroke: "currentColor", points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" });
      
      // UI Control Icons
      case 'plus': return React.createElement(React.Fragment, null, React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" }));
      case 'minus': return React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" });
      case 'maximize': return React.createElement("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" });
      case 'menu': return React.createElement(React.Fragment, null, React.createElement("line", { x1: "3", y1: "12", x2: "21", y2: "12" }), React.createElement("line", { x1: "3", y1: "6", x2: "21", y2: "6" }), React.createElement("line", { x1: "3", y1: "18", x2: "21", y2: "18" }));
      case 'chevron-down': return React.createElement("path", { d: "m6 9 6 6 6-6" });
      case 'x-circle': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), React.createElement("line", { x1: "9", y1: "9", x2: "15", y2: "15" }));
      case 'save': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }), React.createElement("path", { d: "M17 21v-8H7v8" }), React.createElement("path", { d: "M7 3v5h8" }));
      case 'zap': return React.createElement("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" });
      case 'undo': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M21 9v6h-6" }), React.createElement("path", { d: "M3 10a9 9 0 0 1 9-4.56V3l-4.5 4.5L12 12V9.44A6.01 6.01 0 0 0 6 15" }));
      case 'redo': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M3 9v6h6" }), React.createElement("path", { d: "M21 10a9 9 0 0 0-9-4.56V3l4.5 4.5L12 12V9.44A6.01 6.01 0 0 1 18 15" }));
      case 'download': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), React.createElement("polyline", { points: "7 10 12 15 17 10" }), React.createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" }));
      case 'compare': return React.createElement(React.Fragment, null, React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "22" }), React.createElement("path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }));
      case 'upload-cloud': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" }), React.createElement("path", { d: "M12 12v9" }), React.createElement("path", { d: "m16 16-4-4-4 4" }));
      case 'trash': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M3 6h18" }), React.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }), React.createElement("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), React.createElement("line", { x1: "14", y1: "11", x2: "14", y2: "17" }));
      case 'image': return React.createElement(React.Fragment, null, React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }), React.createElement("circle", { cx: "9", cy: "9", r: "2" }), React.createElement("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }));
      case 'search': return React.createElement(React.Fragment, null, React.createElement("circle", { cx: "11", cy: "11", r: "8" }), React.createElement("path", { d: "m21 21-4.3-4.3" }));
      case 'eraser': return React.createElement("path", { d: "m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7Z" });
      case 'selection': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M5 3a2 2 0 0 0-2 2v.5a2 2 0 0 1-2 2v1a2 2 0 0 1 2 2V19a2 2 0 0 0 2 2h.5a2 2 0 0 1 2 2h1a2 2 0 0 1 2-2H19a2 2 0 0 0 2-2v-.5a2 2 0 0 1 2-2v-1a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-.5a2 2 0 0 1-2-2h-1a2 2 0 0 1-2 2H5Z" }), React.createElement("path", { d: "M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" }));
      case 'background': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" }), React.createElement("path", { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" }), React.createElement("path", { d: "m2 13 1.41-1.41a2 2 0 0 1 2.82 0L8 13l-4.29 4.29a2 2 0 0 1-2.82 0L-1 14.41a2 2 0 0 1 0-2.82L2 13Z" }));
      case 'tune': return React.createElement("path", { d: "M8 3v3m0 12v3m4-18v9m0 6v3m4-18v3m0 12v3M3 6h18M3 12h18M3 18h18" });
      case 'contour': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M12 3a9 9 0 0 0-9 9c0 2.5.9 4.8 2.5 6.5L12 21l6.5-2.5c1.6-1.7 2.5-4 2.5-6.5a9 9 0 0 0-9-9Z" }), React.createElement("circle", { cx: "12", cy: "12", r: "2" }));
      case 'sparkles': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6-10.375A1 1 0 0 1 3.437 2h17.125a1 1 0 0 1 .937 1.688L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.688 5.812a1 1 0 0 1-1.875 0Z" }), React.createElement("path", { d: "M12 22v-2" }), React.createElement("path", { d: "M19 9h2" }), React.createElement("path", { d: "M3 9h2" }), React.createElement("path", { d: "m20.5 14-2-1.5" }), React.createElement("path", { d: "m3.5 14 2-1.5" }), React.createElement("path", { d: "M12 2v2" }));
      case 'vignette': return React.createElement(React.Fragment, null, React.createElement("rect", { width: "20", height: "20", x: "2", y: "2", rx: "10" }), React.createElement("path", { d: "M15.42 19.34c-1.74.83-3.79 1.29-5.92 1.29-5.13 0-9.66-3.13-11.48-7.63" }));
      case 'brush': return React.createElement("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" });
      case 'check-circle': return React.createElement(React.Fragment, null, React.createElement("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), React.createElement("path", { d: "m9 11 3 3L22 4" }));
      case 'thumbs-up': return React.createElement("path", { d: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" });
      case 'thumbs-down': return React.createElement("path", { d: "M10 15v7a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" });

      default: return React.createElement("circle", { cx: "12", cy: "12", r: "10" });
    }
  };

  return (
    React.createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: className,
      ...props
    },
      svgContent()
    )
  );
};