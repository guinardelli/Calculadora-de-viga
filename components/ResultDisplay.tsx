
import React from 'react';

interface ResultDisplayProps {
  label: string;
  value: string;
  unit: string;
  color?: string;
  tooltip?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, value, unit, color = 'text-slate-900', tooltip }) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-200">
      <span className="text-slate-600">
        {label}
        {tooltip && (
          <span className="ml-1 text-slate-400 group relative">
            <i className="fa fa-info-circle"></i>
            <span className="absolute bottom-full mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tooltip}
            </span>
          </span>
        )}
      </span>
      <span className={`font-bold text-lg ${color}`}>
        {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </span>
    </div>
  );
};
