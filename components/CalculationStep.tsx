import React from 'react';

interface CalculationStepProps {
  title: string;
  formula: string;
  calculation: string;
  result: string;
  note?: string;
  isFinal?: boolean;
}

export const CalculationStep: React.FC<CalculationStepProps> = ({ title, formula, calculation, result, note, isFinal = false }) => {
  const resultClasses = isFinal 
    ? "font-bold text-lg text-orange-600 bg-orange-50 p-2 rounded-md" 
    : "font-semibold text-slate-800";

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <h4 className="font-semibold text-md text-slate-700 mb-2">{title}</h4>
      <div className="pl-2 border-l-2 border-slate-300 space-y-1 text-sm">
        <p className="text-slate-600 font-mono tracking-tighter">
          <span className="font-semibold">Fórmula:</span> {formula}
        </p>
        <p className="text-slate-600 font-mono tracking-tighter">
          <span className="font-semibold">Cálculo:</span> {calculation}
        </p>
        <p className={`text-slate-800 font-mono tracking-tighter ${resultClasses}`}>
          <span className="font-semibold">Resultado:</span> {result}
        </p>
        {note && <p className="text-xs text-slate-500 italic pt-1">{note}</p>}
      </div>
    </div>
  );
};