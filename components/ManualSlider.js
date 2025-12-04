

import React from 'react';

/**
 * @typedef {object} ManualSliderProps
 * @property {string} label
 * @property {number} value
 * @property {number} min
 * @property {number} max
 * @property {number} [step=1]
 * @property {(value: number) => void} onChange
 * @property {() => void} onCommit
 * @property {string} [unit='']
 * @property {string} [className='']
 * @property {boolean} [disabled=false]
 */

/**
 * @param {ManualSliderProps} props
 * @returns {React.FC<ManualSliderProps>}
 */
export const ManualSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  unit = '',
  className = '',
  disabled = false,
}) => {
  const totalRange = max - min;
  const valuePercentage = totalRange === 0 ? 0 : ((value - min) / totalRange) * 100;
  
  const isZeroCentered = min < 0 && max > 0;
  
  const backgroundStyle = isZeroCentered
    ? value > 0
      ? `linear-gradient(to right, #1e293b 50%, var(--primary-accent) 50%, var(--primary-accent) ${valuePercentage}%, #1e293b ${valuePercentage}%)`
      : value < 0
      ? `linear-gradient(to right, #1e293b ${valuePercentage}%, var(--primary-accent) ${valuePercentage}%, var(--primary-accent) 50%, #1e293b 50%)`
      : `linear-gradient(to right, #1e293b 50%, #1e293b 50%)`
    : `linear-gradient(to right, var(--primary-accent) ${valuePercentage}%, #1e293b ${valuePercentage}%)`;

  return (
    React.createElement("div", { className: `flex flex-col gap-1.5 text-sm ${className}` },
      React.createElement("div", { className: "flex justify-between items-center" },
        React.createElement("label", { className: "font-medium text-slate-300" }, label),
        React.createElement("span", { className: "text-xs font-mono bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md" },
          value.toFixed(label.startsWith('R') || label.startsWith('G') || label.startsWith('B') ? 0 : 0),
          unit
        )
      ),
      React.createElement("input", {
        type: "range",
        min: min,
        max: max,
        step: step,
        value: value,
        onChange: (e) => onChange(Number(e.target.value)),
        onMouseUp: onCommit,
        onTouchEnd: onCommit,
        // FIX: Pass disabled prop to input element and add disabled style.
        disabled: disabled,
        className: "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer custom-slider disabled:opacity-50",
        style: { background: backgroundStyle }
      })
    )
  );
};