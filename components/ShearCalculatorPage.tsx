import React, { useState, useCallback, useMemo } from 'react';
import type { ShearInput, ShearCalculationResult } from '../types';
import { ShearCalculationStatus } from '../types';
import { DEFAULT_SHEAR_INPUTS, STIRRUP_DIAMETERS } from '../constants';
import { calculateShear } from '../services/shearCalculationService';
import { FormField } from './FormField';
import { ResultDisplay } from './ResultDisplay';

interface ShearCalculatorPageProps {
  onBackToHome: () => void;
}

export const ShearCalculatorPage: React.FC<ShearCalculatorPageProps> = ({ onBackToHome }) => {
  const [inputs, setInputs] = useState<ShearInput>(DEFAULT_SHEAR_INPUTS);
  const [results, setResults] = useState<ShearCalculationResult | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  }, []);

  const handleCalculate = useCallback(() => {
    const calculationResults = calculateShear(inputs);
    setResults(calculationResults);
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_SHEAR_INPUTS);
    setResults(null);
  }, []);

  const resultStatusStyles = useMemo(() => {
    if (!results) return { color: 'bg-slate-500', icon: 'fa-calculator' };
    switch (results.status) {
      case ShearCalculationStatus.SUCCESS:
        return { color: 'bg-green-500', icon: 'fa-check-circle' };
      case ShearCalculationStatus.WARNING_MIN_STEEL:
        return { color: 'bg-amber-500', icon: 'fa-exclamation-triangle' };
      case ShearCalculationStatus.ERROR_VRD2:
      case ShearCalculationStatus.ERROR_INPUT:
        return { color: 'bg-red-500', icon: 'fa-times-circle' };
      default:
        return { color: 'bg-slate-500', icon: 'fa-calculator' };
    }
  }, [results]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <header className="relative text-center mb-8">
        <button 
          onClick={onBackToHome} 
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-slate-600 hover:text-green-600 transition-colors group"
          aria-label="Voltar para a página inicial"
        >
          <i className="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
          <span className="font-semibold">Início</span>
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Calculadora de Viga de Concreto Armado</h1>
          <p className="text-lg text-slate-600 mt-2">Dimensionamento ao Cisalhamento (Estribos)</p>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-4">Parâmetros de Entrada</h2>
          
          <h3 className="text-lg font-medium text-slate-700 mb-2">Geometria e Materiais</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <FormField id="bw" label="Largura (b_w)" unit="cm" value={inputs.bw} onChange={handleInputChange} />
            <FormField id="h" label="Altura (h)" unit="cm" value={inputs.h} onChange={handleInputChange} />
          </div>
           <div className="grid grid-cols-2 gap-x-4">
            <FormField id="fck" label="f_ck" unit="MPa" value={inputs.fck} onChange={handleInputChange} tooltip="Resistência do concreto." />
             <FormField id="cover" label="Cobrimento" unit="cm" value={inputs.cover} onChange={handleInputChange} tooltip="Cobrimento da armadura." />
          </div>

          <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">Esforços e Estribos</h3>
          <FormField id="vk" label="Cortante (V_k)" unit="tf" value={inputs.vk} onChange={handleInputChange} tooltip="Força cortante característica atuante." />
          <FormField id="fyk" label="f_yk (Estribo)" unit="MPa" value={inputs.fyk} onChange={handleInputChange} tooltip="Resistência do aço dos estribos (CA-50 ou CA-60)." />
          
          <div className="grid grid-cols-2 gap-x-4">
            <FormField id="stirrupDiameter" label="Ø Estribo" unit="mm" type="select" options={STIRRUP_DIAMETERS.map(String)} value={inputs.stirrupDiameter} onChange={handleInputChange} />
            <FormField id="numLegs" label="Nº de Ramos" value={inputs.numLegs} onChange={handleInputChange} step={1} tooltip="Número de ramos verticais do estribo que cruzam uma seção." />
          </div>


          <div className="flex items-center space-x-4 mt-6">
            <button onClick={handleCalculate} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <i className="fa fa-cogs mr-2"></i> Calcular
            </button>
            <button onClick={handleReset} className="flex-1 bg-slate-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
               <i className="fa fa-sync-alt mr-2"></i> Limpar
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {results ? (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className={`p-4 rounded-lg mb-6 text-white flex items-center ${resultStatusStyles.color}`}>
                <i className={`fa ${resultStatusStyles.icon} text-2xl mr-4`}></i>
                <div>
                  <h3 className="font-bold text-lg">Status do Cálculo</h3>
                  <p className="text-sm">{results.message}</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-2">Resultados do Dimensionamento</h2>

              <ResultDisplay 
                label="Espaçamento Adotado" 
                description="s"
                value={results.s_adopted.toFixed(1)} 
                unit="cm" 
                status="primary"
                tooltip="Espaçamento final a ser utilizado para os estribos na viga." 
              />
               <ResultDisplay 
                label="Cortante de Cálculo" 
                description="Vd"
                value={results.vd.toFixed(2)} 
                unit="kN" 
                tooltip="Esforço cortante majorado pelos coeficientes de segurança."
              />
              <ResultDisplay 
                label="Resistência da Biela" 
                description="VRd,2"
                value={results.vrd2.toFixed(2)} 
                unit="kN" 
                status={results.status === ShearCalculationStatus.ERROR_VRD2 ? 'error' : 'default'}
                tooltip="Força cortante máxima que a seção de concreto pode resistir sem esmagamento."
              />
              <ResultDisplay 
                label="Contribuição do Concreto" 
                description="Vc"
                value={results.vc.toFixed(2)} 
                unit="kN" 
                tooltip="Parcela da força cortante resistida pelo concreto e mecanismos complementares." 
              />
               <ResultDisplay 
                label="Cortante nos Estribos" 
                description="Vsw"
                value={results.vsw.toFixed(2)} 
                unit="kN" 
                tooltip="Parcela da força cortante que deve ser resistida pelos estribos." 
              />
               <ResultDisplay 
                label="Espaçamento Calculado" 
                description="s,calc"
                value={isFinite(results.s_calc) ? results.s_calc.toFixed(1) : 'N/A'} 
                unit="cm" 
                tooltip="Espaçamento necessário para resistir a Vsw."
              />
              <ResultDisplay 
                label="Taxa Mínima de Armadura" 
                description="Asw/s,min"
                value={(results.asw_s_min).toFixed(3)}
                unit="cm²/cm"
                tooltip="Armadura mínima para garantir o comportamento dúctil."
              />
              <ResultDisplay 
                label="Espaçamento Máximo" 
                description="s,max"
                value={results.s_max.toFixed(1)} 
                unit="cm" 
                tooltip="Maior espaçamento permitido pela norma para garantir a costura dos banzos."
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white p-10 rounded-xl shadow-lg h-full text-center">
              <i className="fa fa-drafting-compass text-6xl text-slate-300 mb-4"></i>
              <h2 className="text-2xl font-semibold text-slate-700">Aguardando Cálculo</h2>
              <p className="text-slate-500 mt-2">Insira os parâmetros da viga e clique em "Calcular" para ver os resultados.</p>
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
