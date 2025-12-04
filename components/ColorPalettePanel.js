
import React, { useState } from 'react';
import { Icon } from './Icon.js';

const PaletteRow = ({ title, colors }) => {
  const [copiedColor, setCopiedColor] = useState(null);

  const handleCopy = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    React.createElement("div", null,
      React.createElement("h4", { className: "font-semibold text-slate-300 text-sm mb-2" }, title),
      React.createElement("div", { className: "flex gap-2 flex-wrap" },
        colors.map((color) => (
          React.createElement("div", {
            key: color,
            onClick: () => handleCopy(color),
            className: "w-10 h-10 rounded-md cursor-pointer border-2 border-transparent hover:border-white transition-all relative group",
            style: { backgroundColor: color },
            title: `Copiar ${color}`
          },
            copiedColor === color && (
              React.createElement("div", { className: "absolute inset-0 bg-black/70 flex items-center justify-center rounded-sm" },
                React.createElement(Icon, { name: "check-circle", className: "w-5 h-5 text-green-400" })
              )
            )
          )
        ))
      )
    )
  );
};

export const ColorPalettePanel = ({ palettes, isLoading }) => {
  if (isLoading) {
    return (
      React.createElement("div", { className: "flex items-center justify-center p-4 text-slate-400" },
        React.createElement("svg", { className: "animate-spin h-5 w-5 mr-3 text-violet-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
            React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
        ),
        "Analisando cores..."
      )
    );
  }

  if (!palettes) {
    return React.createElement("p", { className: "text-slate-400 text-sm" }, "N\xE3o foi poss\xEDvel extrair uma paleta de cores vibrantes desta imagem. Tente com uma foto mais colorida.");
  }

  return (
    React.createElement("div", { className: "flex flex-col gap-4" },
      Object.entries(palettes).map(([name, colors]) => (
        React.createElement(PaletteRow, { key: name, title: name, colors: colors })
      ))
    )
  );
};
