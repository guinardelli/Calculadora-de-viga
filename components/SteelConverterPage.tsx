import React, { useState, useCallback, useMemo } from 'react';
import { BAR_DIAMETERS } from '../constants';
import { ResultDisplay } from './ResultDisplay';

interface SteelConverterPageProps {
  onBackToHome: () => void;
}

const DEFAULT_INPUTS = {
  originalDiameter: 8.0,
  originalSpacing: 10.0,
  equivalentDiameter: 10.0,
  truncate: false,
};

export const SteelConverterPage: React.FC<SteelConverterPageProps> = ({ onBackToHome }) => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [result, setResult] = useState<{ spacing: number; asPerMeter: number; } | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }));
  }, []);
  
  const handleConvert = useCallback(() => {
    const { originalDiameter, originalSpacing, equivalentDiameter, truncate } = inputs;
    
    if (originalDiameter <= 0 || originalSpacing <= 0 || equivalentDiameter <= 0) {
      setResult(null);
      return;
    }

    const originalRadius = originalDiameter / 10 / 2; // in cm
    const originalArea = Math.PI * originalRadius * originalRadius;
    const barsPerMeter = 100 / originalSpacing;
    const asPerMeter = originalArea * barsPerMeter;

    const equivalentRadius = equivalentDiameter / 10 / 2; // in cm
    const equivalentArea = Math.PI * equivalentRadius * equivalentRadius;

    let equivalentSpacing = 100 / (asPerMeter / equivalentArea);

    if (truncate) {
      equivalentSpacing = Math.floor(equivalentSpacing * 10) / 10;
    }

    setResult({ spacing: equivalentSpacing, asPerMeter });

  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setResult(null);
  }, []);
  
  // CA-60 Checkboxes are included for visual fidelity to the user's image,
  // but do not affect the geometric area calculation.
  const [ca60, setCa60] = useState({ original: false, equivalent: false });


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
       <header className="relative text-center mb-8">
        <button 
          onClick={onBackToHome} 
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-slate-600 hover:text-indigo-500 transition-colors group"
          aria-label="Voltar para a página inicial"
        >
          <i className="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
          <span className="font-semibold">Início</span>
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Conversor de Armadura</h1>
          <p className="text-lg text-slate-600 mt-2">Equivalência de Bitolas e Espaçamentos</p>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-fit">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Armadura Original</h3>
            <label htmlFor="originalDiameter" className="block text-sm font-medium text-slate-700 mb-1">Bitola (mm)</label>
            <select id="originalDiameter" name="originalDiameter" value={inputs.originalDiameter} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-900 mb-3">
              {BAR_DIAMETERS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <label htmlFor="originalSpacing" className="block text-sm font-medium text-slate-700 mb-1">Espaçamento (cm)</label>
            <input type="number" id="originalSpacing" name="originalSpacing" value={inputs.originalSpacing} onChange={handleInputChange} min="0.1" step="0.1" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
             <div className="flex items-center mt-3">
              <input type="checkbox" id="originalCA60" name="original" checked={ca60.original} onChange={(e) => setCa60(p => ({...p, original: e.target.checked}))} className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
              <label htmlFor="originalCA60" className="ml-2 text-sm text-slate-700">CA-60</label>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Armadura Equivalente</h3>
             <label htmlFor="equivalentDiameter" className="block text-sm font-medium text-slate-700 mb-1">Bitola (mm)</label>
            <select id="equivalentDiameter" name="equivalentDiameter" value={inputs.equivalentDiameter} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-900 mb-3">
              {BAR_DIAMETERS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
             <div className="flex items-center mt-3">
                <input type="checkbox" id="equivalentCA60" name="equivalent" checked={ca60.equivalent} onChange={(e) => setCa60(p => ({...p, equivalent: e.target.checked}))} className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                <label htmlFor="equivalentCA60" className="ml-2 text-sm text-slate-700">CA-60</label>
            </div>
            <div className="flex items-center mt-3">
              <input type="checkbox" id="truncate" name="truncate" checked={inputs.truncate} onChange={handleInputChange} className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
              <label htmlFor="truncate" className="ml-2 text-sm text-slate-700">Truncar resultado (arredondar para baixo)</label>
            </div>
          </div>
          
           <div className="flex items-center space-x-4 mt-6">
            <button onClick={handleConvert} className="flex-1 bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400">
              <i className="fa fa-exchange-alt mr-2"></i> Converter
            </button>
            <button onClick={handleReset} className="flex-1 bg-slate-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
               <i className="fa fa-sync-alt mr-2"></i> Limpar
            </button>
          </div>
        </div>
        
         {/* Results Panel */}
        <div className="lg:col-span-3">
          {result ? (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="p-4 rounded-lg mb-6 text-white flex items-center bg-green-500">
                  <i className="fa fa-check-circle text-2xl mr-4"></i>
                  <div>
                    <h3 className="font-bold text-lg">Conversão Realizada</h3>
                    <p className="text-sm">O espaçamento equivalente foi calculado.</p>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-2">Resultados</h2>

                <div className="bg-slate-50 p-4 rounded-lg text-center my-4">
                  <p className="text-slate-600 text-lg">Para ter a mesma área de aço, use:</p>
                  <p className="text-3xl font-bold text-indigo-600 my-2">
                    Ø {inputs.equivalentDiameter} mm c/ {result.spacing.toFixed(1)} cm
                  </p>
                </div>
              
                <ResultDisplay
                  label="Área de Aço por Metro"
                  description="A_s / metro"
                  value={result.asPerMeter.toFixed(2)}
                  unit="cm²/m"
                  tooltip="Área de aço total por metro de laje ou viga para a configuração original."
                />
                 <ResultDisplay
                  label="Espaçamento Equivalente"
                  description="s,eq"
                  value={result.spacing.toFixed(2)}
                  unit="cm"
                  status="primary"
                  tooltip="Novo espaçamento calculado para a bitola equivalente, mantendo a mesma A_s/m."
                />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white p-10 rounded-xl shadow-lg h-full text-center">
              <i className="fa fa-drafting-compass text-6xl text-slate-300 mb-4"></i>
              <h2 className="text-2xl font-semibold text-slate-700">Aguardando Conversão</h2>
              <p className="text-slate-500 mt-2">Insira os dados da armadura e clique em "Converter".</p>
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
