
import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  unit?: string;
  tooltip?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: 'number' | 'select';
  options?: readonly string[];
  min?: number;
  step?: number;
  isHighlighted?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({ id, label, unit, tooltip, value, onChange, type = 'number', options, min = 0, step = 0.1, isHighlighted = false }) => {
  const commonClasses = "w-full px-3 py-2 bg-slate-50 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition text-slate-900";
  const stateClasses = isHighlighted
    ? "border-red-500 ring-red-200 focus:border-red-500 focus:ring-red-500" // Error/Warning state
    : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"; // Default state

  const finalClasses = `${commonClasses} ${stateClasses}`;

  return (
    <div className="relative mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {tooltip && (
          <span className="ml-1 text-slate-400 group relative">
            <i className="fa fa-info-circle"></i>
            <span className="absolute bottom-full mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <div className="flex items-center">
        {type === 'number' ? (
          <input
            type="number"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            min={min}
            step={step}
            className={finalClasses}
          />
        ) : (
          <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className={`${finalClasses} appearance-none`}
          >
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
        {unit && <span className="ml-3 text-slate-500 font-medium">{unit}</span>}
      </div>
    </div>
  );
};
