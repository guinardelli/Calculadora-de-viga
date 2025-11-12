
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
}

export const FormField: React.FC<FormFieldProps> = ({ id, label, unit, tooltip, value, onChange, type = 'number', options, min = 0, step = 0.1 }) => {
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-900"
          />
        ) : (
          <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none text-slate-900"
          >
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
        {unit && <span className="ml-3 text-slate-500 font-medium">{unit}</span>}
      </div>
    </div>
  );
};
