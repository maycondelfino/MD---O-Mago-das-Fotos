

import React from 'react';

const Loader = ({ message, progress, onCancel }) => {
  return (
    React.createElement("div", { className: "absolute inset-0 bg-slate-900 bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm animate-fadeIn" },
      React.createElement("svg", {
        className: "animate-spin h-12 w-12 text-indigo-400",
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24"
      },
        React.createElement("circle", {
          className: "opacity-25",
          cx: "12",
          cy: "12",
          r: "10",
          stroke: "currentColor",
          strokeWidth: "4"
        }),
        React.createElement("path", {
          className: "opacity-75",
          fill: "currentColor",
          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        })
      ),
      React.createElement("p", { className: "mt-4 text-lg font-semibold text-slate-300" }, message),
      
      typeof progress === 'number' ? (
        React.createElement("div", { className: "w-64 mt-2 text-center" },
            React.createElement("div", { className: "w-full bg-slate-700 rounded-full h-2.5" },
                React.createElement("div", { 
                    className: "bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-linear", 
                    style: { width: `${progress}%` }
                })
            ),
            React.createElement("p", { className: "text-sm text-slate-400 mt-1.5 font-medium" }, progress.toFixed(0), "%")
        )
      ) : (
        React.createElement("p", { className: "text-sm text-slate-400" }, "Isso pode levar alguns segundos.")
      ),

      onCancel && (
        React.createElement("button", {
          onClick: onCancel,
          className: "mt-6 px-4 py-2 bg-red-600/50 text-red-200 text-sm font-semibold rounded-md hover:bg-red-600/80 transition-colors"
        },
          "Cancelar"
        )
      )
    )
  );
};

export default Loader;