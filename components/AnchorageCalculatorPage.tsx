import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { AnchorageInput, AnchorageCalculationResult } from '../types';
import { AnchorageCalculationStatus, SteelRatioOption, BarType, AnchorageType, BondCondition } from '../types';
import { DEFAULT_ANCHORAGE_INPUTS, BAR_DIAMETERS } from '../constants';
import { calculateAnchorage } from '../services/anchorageCalculationService';
import { FormField } from './FormField';
import { ResultDisplay } from './ResultDisplay';
import { CalculationStep } from './CalculationStep';

interface AnchorageCalculatorPageProps {
  onBackToHome: () => void;
}

export const AnchorageCalculatorPage: React.FC<AnchorageCalculatorPageProps> = ({ onBackToHome }) => {
  const [inputs, setInputs] = useState<AnchorageInput>(DEFAULT_ANCHORAGE_INPUTS);
  const [results, setResults] = useState<AnchorageCalculationResult | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // For radio buttons, the value is a string from the enum. For others, parse as float.
    const isRadio = type === 'radio';
    setInputs(prev => ({
      ...prev,
      [name]: isRadio ? value : (name === 'barType' || name === 'bondCondition' || name === 'steelRatioOption' || name === 'anchorageType' ? value : parseFloat(value) || 0)
    }));
  }, []);
  
  // NBR 6118 does not allow hooks for plain bars (CA-25).
  // This effect ensures the correct anchorage type is selected if the user changes the bar type.
  useEffect(() => {
    if (inputs.barType === BarType.CA25) {
      setInputs(prev => ({ ...prev, anchorageType: AnchorageType.STRAIGHT }));
    }
  }, [inputs.barType]);

  const handleCalculate = useCallback(() => {
    const calculationResults = calculateAnchorage(inputs);
    setResults(calculationResults);
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_ANCHORAGE_INPUTS);
    setResults(null);
  }, []);
  
  const isCustomSteelRatio = useMemo(() => inputs.steelRatioOption === SteelRatioOption.CUSTOM, [inputs.steelRatioOption]);
  const isCA25 = useMemo(() => inputs.barType === BarType.CA25, [inputs.barType]);

  const resultStatusStyles = useMemo(() => {
    if (!results) return { color: 'bg-slate-500', icon: 'fa-calculator' };
    switch (results.status) {
      case AnchorageCalculationStatus.SUCCESS:
        return { color: 'bg-green-500', icon: 'fa-check-circle' };
      case AnchorageCalculationStatus.ERROR_INPUT:
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
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-slate-600 hover:text-orange-500 transition-colors group"
          aria-label="Voltar para a página inicial"
        >
          <i className="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
          <span className="font-semibold">Início</span>
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Calculadora de Ancoragem</h1>
          <p className="text-lg text-slate-600 mt-2">Comprimento de Ancoragem conforme NBR 6118</p>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-4">Parâmetros de Entrada</h2>

          <fieldset className="mb-4 border border-slate-200 p-3 rounded-md">
            <legend className="text-md font-semibold text-slate-800 px-2">Materiais</legend>
            <FormField id="diameter" label="Diâmetro (Ø)" unit="mm" type="select" options={BAR_DIAMETERS.map(String)} value={inputs.diameter} onChange={handleInputChange} />
            <FormField id="fck" label="f_ck" unit="MPa" value={inputs.fck} onChange={handleInputChange} tooltip="Resistência do concreto." />
          </fieldset>
          
           <fieldset className="mb-4 border border-slate-200 p-3 rounded-md">
            <legend className="text-md font-semibold text-slate-800 px-2">Barra e Aderência</legend>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Aço</label>
                  {(Object.values(BarType)).map(bar => (
                    <div key={bar} className="flex items-center mb-1">
                      <input type="radio" id={`bar-${bar}`} name="barType" value={bar} checked={inputs.barType === bar} onChange={handleInputChange} className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500" />
                      <label htmlFor={`bar-${bar}`} className="ml-2 block text-sm text-slate-900">{bar}</label>
                    </div>
                  ))}
               </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Aderência</label>
                   <div className="flex items-center mb-1">
                      <input type="radio" id="bond-good" name="bondCondition" value={BondCondition.GOOD} checked={inputs.bondCondition === BondCondition.GOOD} onChange={handleInputChange} className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500" />
                      <label htmlFor="bond-good" className="ml-2 block text-sm text-slate-900">Boa</label>
                    </div>
                     <div className="flex items-center mb-1">
                      <input type="radio" id="bond-poor" name="bondCondition" value={BondCondition.POOR} checked={inputs.bondCondition === BondCondition.POOR} onChange={handleInputChange} className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500" />
                      <label htmlFor="bond-poor" className="ml-2 block text-sm text-slate-900">Má</label>
                    </div>
               </div>
            </div>
           </fieldset>

          <fieldset className="mb-4 border border-slate-200 p-3 rounded-md">
            <legend className="text-md font-semibold text-slate-800 px-2">Armadura</legend>
             <div className="flex items-center mb-2">
              <input type="radio" id="steel-equal" name="steelRatioOption" value={SteelRatioOption.EQUAL} checked={!isCustomSteelRatio} onChange={handleInputChange} className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500"/>
              <label htmlFor="steel-equal" className="ml-2 block text-sm text-slate-900">A_s,calc = A_s,ef</label>
            </div>
             <div className="flex items-center mb-2">
              <input type="radio" id="steel-custom" name="steelRatioOption" value={SteelRatioOption.CUSTOM} checked={isCustomSteelRatio} onChange={handleInputChange} className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500"/>
               <label htmlFor="steel-custom" className="ml-2 block text-sm text-slate-900">Informar A_s</label>
            </div>
            {isCustomSteelRatio && (
              <div className="grid grid-cols-2 gap-x-4 mt-2 pl-6">
                <FormField id="asCalc" label="A_s,calc" unit="cm²" value={inputs.asCalc} onChange={handleInputChange} />
                <FormField id="asEff" label="A_s,ef" unit="cm²" value={inputs.asEff} onChange={handleInputChange} />
              </div>
            )}
          </fieldset>

           <fieldset className="mb-4 border border-slate-200 p-3 rounded-md">
            <legend className="text-md font-semibold text-slate-800 px-2">Ancoragem</legend>
              <div className="flex items-center mb-1">
                <input type="radio" id="anchor-straight" name="anchorageType" value={AnchorageType.STRAIGHT} checked={inputs.anchorageType === AnchorageType.STRAIGHT} onChange={handleInputChange} className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500" />
                <label htmlFor="anchor-straight" className="ml-2 block text-sm text-slate-900">Sem Gancho</label>
              </div>
              <div className="flex items-center mb-1">
                <input type="radio" id="anchor-hook" name="anchorageType" value={AnchorageType.HOOK} checked={inputs.anchorageType === AnchorageType.HOOK} onChange={handleInputChange} className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500 disabled:bg-slate-200 disabled:cursor-not-allowed" disabled={isCA25} />
                <label htmlFor="anchor-hook" className={`ml-2 block text-sm ${isCA25 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-900'}`}>Com Gancho {isCA25 && "(N/A)"}</label>
              </div>
           </fieldset>
          
          <div className="flex items-center space-x-4 mt-6">
            <button onClick={handleCalculate} className="flex-1 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400">
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
              
              <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-2">Resultados</h2>

              <ResultDisplay 
                label="Comp. de Ancoragem Necessário" 
                description="l_b,nec"
                value={results.lb_nec.toFixed(1)} 
                unit="cm" 
                status="primary"
                tooltip="Comprimento final a ser adotado, considerando o valor mínimo." 
              />
               <ResultDisplay 
                label="Comp. de Ancoragem Básico" 
                description="l_b"
                value={results.lb.toFixed(1)} 
                unit="cm" 
                tooltip="Comprimento de ancoragem para uma barra tracionada, sem ganchos."
              />
              <ResultDisplay 
                label="Comp. de Ancoragem Mínimo"
                description="l_b,min"
                value={results.lb_min.toFixed(1)} 
                unit="cm" 
                tooltip="Valor mínimo absoluto para o comprimento de ancoragem, conforme a norma."
              />

              {results.status === AnchorageCalculationStatus.SUCCESS && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">Memória de Cálculo</h2>
                    <div className="space-y-4">
                        <CalculationStep 
                            title="Resistência de Cálculo do Aço (fyd)"
                            formula="f_yd = f_yk / γ_s"
                            calculation={`f_yd = ${results.fyd * 1.15 * 10} MPa / 1.15`}
                            result={`f_yd = ${results.fyd.toFixed(2)} kN/cm²`}
                        />
                        <CalculationStep 
                            title="Resistência de Cálculo do Concreto à Tração (fctd)"
                            formula="f_ctd = f_ctk,inf / γ_c"
                            calculation={`f_ctd = ${results.fctd * 1.4 * 10} MPa / 1.4`}
                            result={`f_ctd = ${results.fctd.toFixed(4)} kN/cm²`}
                        />
                         <CalculationStep 
                            title="Tensão de Aderência de Cálculo (fbd)"
                            formula="f_bd = η₁ ⋅ η₂ ⋅ η₃ ⋅ f_ctd"
                            calculation={`f_bd = ${results.n1.toFixed(2)} ⋅ ${results.n2.toFixed(1)} ⋅ ${results.n3.toFixed(2)} ⋅ ${results.fctd.toFixed(4)}`}
                            result={`f_bd = ${results.fbd.toFixed(4)} kN/cm²`}
                        />
                         <CalculationStep 
                            title="Comprimento de Ancoragem Básico (lb)"
                            formula="l_b = (Ø / 4) ⋅ (f_yd / f_bd)"
                            calculation={`l_b = (${results.phi.toFixed(2)} cm / 4) ⋅ (${results.fyd.toFixed(2)} / ${results.fbd.toFixed(4)})`}
                            result={`l_b = ${results.lb.toFixed(1)} cm`}
                            note={isCA25 ? "Nota: Valor multiplicado por 2.0 por se tratar de barra lisa (CA-25)." : ""}
                        />
                        <CalculationStep 
                            title="Comprimento de Ancoragem de Cálculo (lb,nec,calc)"
                            formula="l_b,nec,calc = α ⋅ (A_s,calc / A_s,ef) ⋅ l_b"
                            calculation={`l_b,nec,calc = ${results.alpha.toFixed(1)} ⋅ ${results.steelRatio.toFixed(2)} ⋅ ${results.lb.toFixed(1)}`}
                            result={`l_b,nec,calc = ${results.lb_nec_calc.toFixed(1)} cm`}
                        />
                        <CalculationStep 
                            title="Comprimento de Ancoragem Mínimo (lb,min)"
                            formula="l_b,min = max(0.3 ⋅ l_b; 10 ⋅ Ø; 10 cm)"
                            calculation={`l_b,min = max(${(0.3 * results.lb).toFixed(1)}; ${(10 * results.phi).toFixed(1)}; 10)`}
                            result={`l_b,min = ${results.lb_min.toFixed(1)} cm`}
                        />
                         <CalculationStep 
                            title="Comprimento de Ancoragem Necessário (lb,nec)"
                            formula="l_b,nec = max(l_b,nec,calc; l_b,min)"
                            calculation={`l_b,nec = max(${results.lb_nec_calc.toFixed(1)}; ${results.lb_min.toFixed(1)})`}
                            result={`l_b,nec = ${results.lb_nec.toFixed(1)} cm`}
                            isFinal
                        />
                    </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white p-10 rounded-xl shadow-lg h-full text-center">
              <i className="fa fa-drafting-compass text-6xl text-slate-300 mb-4"></i>
              <h2 className="text-2xl font-semibold text-slate-700">Aguardando Cálculo</h2>
              <p className="text-slate-500 mt-2">Insira os parâmetros e clique em "Calcular" para ver os resultados.</p>
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