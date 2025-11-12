import React, { useMemo } from 'react';

type ResultStatus = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface ResultDisplayProps {
  label: string;
  description?: string;
  value: string;
  unit: string;
  status?: ResultStatus;
  tooltip?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, description, value, unit, status = 'default', tooltip }) => {
  
  const valueStyles = useMemo(() => {
    switch (status) {
      case 'primary':
        return 'text-blue-600 font-bold';
      case 'success':
        return 'text-green-600 font-semibold';
      case 'warning':
        return 'text-amber-500 font-semibold';
      case 'error':
        return 'text-red-600 font-bold';
      case 'default':
      default:
        return 'text-slate-900 font-semibold';
    }
  }, [status]);
  
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
      <div>
        <span className="font-medium text-slate-700">
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
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className={`text-lg text-right ${valueStyles}`}>
        <span>{value}</span>
        <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
      </div>
    </div>
  );
};
