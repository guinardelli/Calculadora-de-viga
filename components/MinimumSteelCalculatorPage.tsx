import React, { useState, useCallback, useMemo } from 'react';
import type { MinimumSteelInput, MinimumSteelResult } from '../types';
import { MinimumSteelStatus } from '../types';
import { DEFAULT_MINIMUM_STEEL_INPUTS, FCK_VALUES } from '../constants';
import { calculateMinimumSteel } from '../services/minimumSteelCalculationService';
import { FormField } from './FormField';

interface MinimumSteelCalculatorPageProps {
  onBackToHome: () => void;
}

const ResultField: React.FC<{ label: string; value: string; unit: string; }> = ({ label, value, unit }) => (
    <div className="mb-3">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="flex items-center">
            <input 
                type="text" 
                readOnly 
                value={value}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm text-slate-800 font-semibold focus:outline-none"
                aria-label={`${label}: ${value} ${unit}`}
            />
            <span className="ml-3 text-slate-500 font-medium">{unit}</span>
        </div>
    </div>
);


export const MinimumSteelCalculatorPage: React.FC<MinimumSteelCalculatorPageProps> = ({ onBackToHome }) => {
  const [inputs, setInputs] = useState<MinimumSteelInput>(DEFAULT_MINIMUM_STEEL_INPUTS);
  const [results, setResults] = useState<MinimumSteelResult | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  }, []);

  const handleCalculate = useCallback(() => {
    const calculationResults = calculateMinimumSteel(inputs);
    setResults(calculationResults);
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_MINIMUM_STEEL_INPUTS);
    setResults(null);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <header className="relative text-center mb-8">
        <button 
          onClick={onBackToHome} 
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-slate-600 hover:text-teal-600 transition-colors group"
          aria-label="Voltar para a página inicial"
        >
          <i className="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
          <span className="font-semibold">Início</span>
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Cálculo de Armadura Mínima</h1>
          <p className="text-lg text-slate-600 mt-2">Flexão Simples conforme NBR 6118</p>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-4">Dados</h2>
          
          <FormField id="bw" label="Base (cm)" value={inputs.bw} onChange={handleInputChange} />
          <FormField id="h" label="Altura (cm)" value={inputs.h} onChange={handleInputChange} />
          <FormField id="fck" label="fck (MPa)" type="select" options={FCK_VALUES.map(String)} value={inputs.fck} onChange={handleInputChange} />
          <FormField id="fyk" label="fy (MPa)" value={inputs.fyk} onChange={handleInputChange} />
          <FormField id="d_h_ratio" label="d/h" value={inputs.d_h_ratio} onChange={handleInputChange} step={0.01} tooltip="Relação entre altura útil e altura total da viga. Ex: 0.8"/>

          <button onClick={handleCalculate} className="w-full mt-4 bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400">
            <i className="fa fa-cogs mr-2"></i> Calcular
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          {results && results.status === MinimumSteelStatus.SUCCESS ? (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Taxa de Armadura</h3>
                        <ResultField label="Taxa Mínima (%)" value={results.rho_min_percent.toFixed(3)} unit="%" />
                        <ResultField label="As,mín (cm²)" value={results.as_min_by_rate.toFixed(2)} unit="cm²" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Momento Mínimo</h3>
                        <ResultField label="Módulo de Resistência (cm³)" value={results.w.toFixed(1)} unit="cm³" />
                        <ResultField label="Momento Mínimo (tf.m)" value={results.md_resisted.toFixed(2)} unit="tf.m" />
                        <ResultField label="Prof. Linha Neutra (cm)" value={results.x.toFixed(2)} unit="cm" />
                        <ResultField label="Taxa de Armadura (%)" value={results.rho_min_percent.toFixed(3)} unit="%" />
                        <ResultField label="As,mín (cm²)" value={results.as_min_by_rate.toFixed(2)} unit="cm²" />
                    </div>
                </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
              {results && results.status === MinimumSteelStatus.ERROR_INPUT ? (
                 <div className="w-full">
                    <div className="p-4 rounded-lg text-white flex items-center bg-red-500">
                        <i className="fa fa-times-circle text-2xl mr-4"></i>
                        <div>
                            <h3 className="font-bold text-lg">Erro na Entrada</h3>
                            <p className="text-sm">{results.message}</p>
                        </div>
                    </div>
                 </div>
              ) : (
                <>
                    <i className="fa fa-drafting-compass text-6xl text-slate-300 mb-4"></i>
                    <h2 className="text-2xl font-semibold text-slate-700">Aguardando Cálculo</h2>
                    <p className="text-slate-500 mt-2">Insira os dados e clique em "Calcular".</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
       <footer className="text-center mt-10 text-sm text-slate-500">
            <p>Esta ferramenta é para fins educacionais e de estudo. Os resultados devem ser verificados por um engenheiro qualificado antes do uso em projetos reais.</p>
       </footer>
    </div>
  );
};
