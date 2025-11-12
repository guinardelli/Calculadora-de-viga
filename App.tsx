import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { BeamInput, CalculationResult } from './types';
import { AggressivenessClass, CalculationStatus } from './types';
import { DEFAULT_INPUTS, COVER_BY_AGGRESSIVENESS } from './constants';
import { calculateBeam } from './services/calculationService';
import { FormField } from './components/FormField';
import { ResultDisplay } from './components/ResultDisplay';
import { BeamVisualizer } from './components/BeamVisualizer';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BeamInput>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculationResult | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: name === 'aggressiveness' ? value : parseFloat(value) || 0 }));
  }, []);

  useEffect(() => {
    const newCover = COVER_BY_AGGRESSIVENESS[inputs.aggressiveness];
    setInputs(prev => ({...prev, cover: newCover}));
  }, [inputs.aggressiveness]);

  const handleCalculate = useCallback(() => {
    const calculationResults = calculateBeam(inputs);
    setResults(calculationResults);
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setResults(null);
  }, []);

  const resultStatusStyles = useMemo(() => {
    if (!results) return { color: 'bg-slate-500', icon: 'fa-calculator' };
    switch (results.status) {
      case CalculationStatus.SUCCESS:
        return { color: 'bg-green-500', icon: 'fa-check-circle' };
      case CalculationStatus.WARNING_MIN_STEEL:
        return { color: 'bg-amber-500', icon: 'fa-exclamation-triangle' };
      case CalculationStatus.ERROR_X_D_LIMIT:
      case CalculationStatus.ERROR_MAX_STEEL:
      case CalculationStatus.ERROR_INPUT:
        return { color: 'bg-red-500', icon: 'fa-times-circle' };
      default:
        return { color: 'bg-slate-500', icon: 'fa-calculator' };
    }
  }, [results]);

  const asStatus = useMemo(() => {
    if (!results) return 'default';
    if (results.status === CalculationStatus.WARNING_MIN_STEEL) {
        return 'warning';
    }
    return 'primary';
  }, [results]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800">Calculadora de Viga de Concreto Armado</h1>
        <p className="text-lg text-slate-600 mt-2">Flexão Simples conforme NBR 6118</p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-4">Parâmetros de Entrada</h2>
          
          <div className="grid grid-cols-2 gap-x-4">
            <FormField id="bw" label="Largura (b_w)" unit="cm" value={inputs.bw} onChange={handleInputChange} tooltip="Largura da alma da viga." />
            <FormField id="h" label="Altura (h)" unit="cm" value={inputs.h} onChange={handleInputChange} tooltip="Altura total da seção transversal da viga." />
          </div>
          <FormField id="fck" label="f_ck" unit="MPa" value={inputs.fck} onChange={handleInputChange} tooltip="Resistência característica à compressão do concreto." />
          <FormField id="fyk" label="f_yk" unit="MPa" value={inputs.fyk} onChange={handleInputChange} tooltip="Resistência característica ao escoamento do aço." />
          <FormField id="mk" label="Momento (M_k)" unit="tf.m" value={inputs.mk} onChange={handleInputChange} tooltip="Momento fletor característico atuante na viga." />
          <FormField id="aggressiveness" label="Classe de Agressividade" type="select" options={Object.values(AggressivenessClass)} value={inputs.aggressiveness} onChange={handleInputChange} tooltip="Define o cobrimento mínimo da armadura conforme a exposição ambiental." />
          <FormField id="cover" label="Cobrimento" unit="cm" value={inputs.cover} onChange={handleInputChange} tooltip="Distância da face do concreto à face externa do estribo. Ajustado pela classe de agressividade." />

          <div className="flex items-center space-x-4 mt-6">
            <button onClick={handleCalculate} className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
                label="Área de Aço Final" 
                description="A_s"
                value={results.as.toFixed(2)} 
                unit="cm²" 
                status={asStatus}
                tooltip="Área de aço final necessária para a armadura de tração, considerando a armadura mínima." 
              />
              <ResultDisplay 
                label="Posição da Linha Neutra"
                description="x" 
                value={results.x.toFixed(2)} 
                unit="cm" 
                tooltip="Profundidade da linha neutra a partir da fibra mais comprimida."
              />
              <ResultDisplay 
                label="Altura Útil" 
                description="d"
                value={results.d.toFixed(2)} 
                unit="cm" 
                tooltip="Distância do centro de gravidade da armadura de tração à fibra mais comprimida." 
              />
              <ResultDisplay 
                label="Verificação de Ductilidade" 
                description="x/d"
                value={results.x_d_ratio.toFixed(2)} 
                unit={`(Limite: ${results.x_d_limit})`} 
                status={results.status === CalculationStatus.ERROR_X_D_LIMIT ? 'error' : 'default'} 
                tooltip="Verificação da ductilidade da seção. O valor deve ser menor que o limite normativo para garantir um comportamento dúctil."
              />
              <ResultDisplay 
                label="Armadura Mínima" 
                description="A_s,min"
                value={results.asMin.toFixed(2)} 
                unit="cm²" 
                tooltip="Menor área de aço permitida pela norma para evitar ruptura frágil."
              />
              <ResultDisplay 
                label="Armadura Máxima" 
                description="A_s,max"
                value={results.asMax.toFixed(2)} 
                unit="cm²" 
                tooltip="Maior área de aço permitida pela norma para garantir boa concretagem e evitar a fragilização do concreto."
              />
            
              {(results.status === CalculationStatus.SUCCESS || results.status === CalculationStatus.WARNING_MIN_STEEL) && (
                 <BeamVisualizer 
                    bw={inputs.bw} 
                    h={inputs.h} 
                    d={results.d} 
                    cover={inputs.cover} 
                    as={results.as} 
                    x={results.x} 
                    fck={inputs.fck} 
                 />
              )}
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

export default App;
