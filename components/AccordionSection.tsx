import React from 'react';
import { Icon } from './Icon';

interface AccordionSectionProps {
  title: string;
  icon?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({ title, icon, isOpen, onToggle, children, headerExtra }) => {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <Icon name={icon} className="w-4 h-4 text-violet-400" />}
          <h3 className="font-bold text-sm text-violet-400 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
            {headerExtra}
            <Icon 
              name="chevron-down" 
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
            />
        </div>
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="pt-2 flex flex-col gap-1">
          {children}
        </div>
      </div>
    </div>
  );
};