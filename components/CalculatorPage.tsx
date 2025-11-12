
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { BeamInput, CalculationResult } from '../types';
import { AggressivenessClass, CalculationStatus } from '../types';
import { DEFAULT_INPUTS, COVER_BY_AGGRESSIVENESS, GAMMA_C, GAMMA_S, GAMMA_F } from '../constants';
import { calculateBeam } from '../services/calculationService';
import { FormField } from './FormField';
import { ResultDisplay } from './ResultDisplay';
import { BeamVisualizer } from './BeamVisualizer';
import { CalculationStep } from './CalculationStep';

interface FlexureCalculatorPageProps {
  onBackToHome: () => void;
}

export const FlexureCalculatorPage: React.FC<FlexureCalculatorPageProps> = ({ onBackToHome }) => {
  const [inputs, setInputs] = useState<BeamInput>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [forceCompressionCalc, setForceCompressionCalc] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: name === 'aggressiveness' ? value : parseFloat(value) || 0 }));
  }, []);

  useEffect(() => {
    const newCover = COVER_BY_AGGRESSIVENESS[inputs.aggressiveness];
    setInputs(prev => ({...prev, cover: newCover}));
  }, [inputs.aggressiveness]);

  const handleCalculate = useCallback(() => {
    const calculationResults = calculateBeam(inputs, forceCompressionCalc);
    setResults(calculationResults);
  }, [inputs, forceCompressionCalc]);

  useEffect(() => {
    if (!results) {
      setHighlightedFields(new Set());
      return;
    }
    const fieldsToHighlight = new Set<string>();
    switch (results.status) {
      case CalculationStatus.ERROR_INPUT:
        ['bw', 'h', 'fck', 'fyk', 'mk', 'cover', 'dPrime'].forEach(f => fieldsToHighlight.add(f));
        break;
      case CalculationStatus.ERROR_X_D_LIMIT:
        fieldsToHighlight.add('bw');
        fieldsToHighlight.add('h');
        fieldsToHighlight.add('mk');
        break;
      case CalculationStatus.ERROR_MAX_STEEL:
        fieldsToHighlight.add('bw');
        fieldsToHighlight.add('h');
        break;
      default:
        // Clear highlights for success and warning states
        break;
    }
    setHighlightedFields(fieldsToHighlight);
  }, [results]);

  useEffect(() => {
    if (forceCompressionCalc) {
      handleCalculate();
    }
  }, [forceCompressionCalc, handleCalculate]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setResults(null);
    setForceCompressionCalc(false);
    setHighlightedFields(new Set());
  }, []);

  const resultStatusStyles = useMemo(() => {
    if (!results) return { color: 'bg-slate-500', icon: 'fa-calculator' };
    switch (results.status) {
      case CalculationStatus.SUCCESS:
      case CalculationStatus.SUCCESS_COMPRESSION_STEEL:
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
      <header className="relative text-center mb-8">
        <button 
          onClick={onBackToHome} 
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-slate-600 hover:text-blue-600 transition-colors group"
          aria-label="Voltar para a página inicial"
        >
          <i className="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
          <span className="font-semibold">Início</span>
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Calculadora de Viga de Concreto Armado</h1>
          <p className="text-lg text-slate-600 mt-2">Flexão Simples conforme NBR 6118</p>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-4">Parâmetros de Entrada</h2>
          
          <div className="grid grid-cols-2 gap-x-4">
            <FormField id="bw" label="Largura (b_w)" unit="cm" value={inputs.bw} onChange={handleInputChange} tooltip="Largura da alma da viga." isHighlighted={highlightedFields.has('bw')} />
            <FormField id="h" label="Altura (h)" unit="cm" value={inputs.h} onChange={handleInputChange} tooltip="Altura total da seção transversal da viga." isHighlighted={highlightedFields.has('h')} />
          </div>
          <FormField id="fck" label="f_ck" unit="MPa" value={inputs.fck} onChange={handleInputChange} tooltip="Resistência característica à compressão do concreto." isHighlighted={highlightedFields.has('fck')} />
          <FormField id="fyk" label="f_yk" unit="MPa" value={inputs.fyk} onChange={handleInputChange} tooltip="Resistência característica ao escoamento do aço." isHighlighted={highlightedFields.has('fyk')} />
          <FormField id="mk" label="Momento (M_k)" unit="tf.m" value={inputs.mk} onChange={handleInputChange} tooltip="Momento fletor característico atuante na viga." isHighlighted={highlightedFields.has('mk')} />
          <FormField id="aggressiveness" label="Classe de Agressividade" type="select" options={Object.values(AggressivenessClass)} value={inputs.aggressiveness} onChange={handleInputChange} tooltip="Define o cobrimento mínimo da armadura conforme a exposição ambiental." />
          <div className="grid grid-cols-2 gap-x-4">
            <FormField id="cover" label="Cobrimento (c)" unit="cm" value={inputs.cover} onChange={handleInputChange} tooltip="Distância da face do concreto à face externa do estribo. Ajustado pela classe de agressividade." isHighlighted={highlightedFields.has('cover')} />
            <FormField id="dPrime" label="Cobrimento Comp. (d')" unit="cm" value={inputs.dPrime} onChange={handleInputChange} tooltip="Distância da face mais comprimida ao centro da armadura de compressão." isHighlighted={highlightedFields.has('dPrime')} />
          </div>

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
              
              {results.status === CalculationStatus.ERROR_X_D_LIMIT && (
                <div className="mt-4 text-center mb-6">
                  <button
                    onClick={() => setForceCompressionCalc(true)}
                    className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                  >
                    <i className="fas fa-layer-group mr-2"></i>
                    Dimensionar com Armadura Dupla
                  </button>
                  <p className="text-xs text-slate-500 mt-2">Isto irá fixar x/d no limite e calcular a armadura de compressão necessária.</p>
                </div>
              )}
              
              <h2 className="text-2xl font-semibold text-slate-800 border-b pb-3 mb-2">Resultados</h2>
              
              {results.asPrime > 0 && (
                 <ResultDisplay 
                    label="Área de Aço de Compressão" 
                    description="A'_s"
                    value={results.asPrime.toFixed(2)} 
                    unit="cm²" 
                    status="primary"
                    tooltip="Área de aço necessária para a armadura de compressão." 
                  />
              )}
              <ResultDisplay 
                label="Área de Aço de Tração" 
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
            
              {(results.status !== CalculationStatus.IDLE && results.status !== CalculationStatus.ERROR_INPUT && results.status !== CalculationStatus.ERROR_X_D_LIMIT) && (
                 <>
                  <BeamVisualizer 
                      bw={inputs.bw} 
                      h={inputs.h} 
                      d={results.d} 
                      cover={inputs.cover} 
                      as={results.as} 
                      x={results.x} 
                      fck={inputs.fck} 
                  />
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    {results.status === CalculationStatus.SUCCESS_COMPRESSION_STEEL ? (
                      <>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Memória de Cálculo (Armadura Dupla)</h2>
                        <div className="space-y-4">
                            <CalculationStep 
                                title="Fixar Linha Neutra no Limite (x)"
                                formula="x = (x/d)_lim ⋅ d"
                                calculation={`x = ${results.x_d_limit} ⋅ ${results.d.toFixed(2)}`}
                                result={`x = ${results.x.toFixed(2)} cm`}
                            />
                             <CalculationStep 
                                title="Momento da Parcela Concreto-Aço (M1d)"
                                formula="M_1d = 0.68⋅b_w⋅x⋅f_cd⋅(d - 0.4⋅x)"
                                calculation={`M_1d = 0.68⋅${inputs.bw}⋅${results.x.toFixed(2)}⋅${results.fcd.toFixed(2)}⋅(${results.d.toFixed(2)} - 0.4⋅${results.x.toFixed(2)})`}
                                result={`M_1d = ${(results.m1d / 100).toFixed(2)} kN.m`}
                            />
                            <CalculationStep 
                                title="Momento da Parcela Aço-Aço (M2d)"
                                formula="M_2d = M_d - M_1d"
                                calculation={`M_2d = ${(results.md / 100).toFixed(2)} - ${(results.m1d / 100).toFixed(2)}`}
                                result={`M_2d = ${(results.m2d / 100).toFixed(2)} kN.m`}
                            />
                            <CalculationStep 
                                title="Tensão na Armadura de Compressão (σ_sd)"
                                formula="σ_sd = ε_sc ⋅ E_s ≤ f_yd"
                                calculation={`Calculada a partir da deformação ε_sc. σ_sd = ${results.sigma_sd.toFixed(2)} kN/cm²`}
                                result={results.sigma_sd < results.fyd ? "Armadura não escoou" : "Armadura escoou"}
                            />
                            <CalculationStep 
                                title="Área de Aço de Compressão (A's)"
                                formula="A'_s = M_2d / (σ_sd ⋅ (d - d'))"
                                calculation={`A'_s = ${results.m2d.toFixed(2)} / (${results.sigma_sd.toFixed(2)} ⋅ (${results.d.toFixed(2)} - ${inputs.dPrime}))`}
                                result={`A'_s = ${results.asPrimeCalc.toFixed(2)} cm²`}
                            />
                             <CalculationStep 
                                title="Parcelas da Armadura de Tração (As1 + As2)"
                                formula="A_s1 = M_1d / (...); A_s2 = (A'_s ⋅ σ_sd) / f_yd"
                                calculation={`A_s1 = ${results.as1.toFixed(2)} cm²; A_s2 = ${results.as2.toFixed(2)} cm²`}
                                result={`A_s,calc = ${results.as1.toFixed(2)} + ${results.as2.toFixed(2)} = ${results.asCalc.toFixed(2)} cm²`}
                            />
                            <CalculationStep 
                                title="Área de Aço Final (As)"
                                formula="A_s = max(A_s,calc, A_s,min)"
                                calculation={`A_s = max(${results.asCalc.toFixed(2)}, ${results.asMin.toFixed(2)})`}
                                result={`A_s = ${results.as.toFixed(2)} cm²`}
                                isFinal
                            />
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Memória de Cálculo</h2>
                        <div className="space-y-4">
                            <CalculationStep 
                                title="Resistências de Cálculo dos Materiais"
                                formula="f_cd = f_ck / γ_c; f_yd = f_yk / γ_s"
                                calculation={`f_cd = ${inputs.fck} / ${GAMMA_C}; f_yd = ${inputs.fyk} / ${GAMMA_S}`}
                                result={`f_cd = ${(results.fcd * 10).toFixed(2)} MPa; f_yd = ${(results.fyd * 10).toFixed(2)} MPa`}
                            />
                            <CalculationStep 
                                title="Momento Fletor de Cálculo (Md)"
                                formula="M_d = M_k ⋅ γ_f"
                                calculation={`M_d = ${inputs.mk.toFixed(2)} tf.m ⋅ ${GAMMA_F}`}
                                result={`M_d = ${(results.md / 100).toFixed(2)} kN.m`}
                            />
                            <CalculationStep 
                                title="Posição da Linha Neutra (x)"
                                formula="0.272⋅b_w⋅f_cd⋅x² - 0.68⋅b_w⋅f_cd⋅d⋅x + M_d = 0"
                                calculation="Resolvendo a equação de 2º grau para x..."
                                result={`x = ${results.x.toFixed(2)} cm`}
                                note={`Altura útil (d) = ${results.d.toFixed(2)} cm`}
                            />
                            <CalculationStep 
                                title="Verificação de Ductilidade (x/d)"
                                formula="(x/d) ≤ (x/d)_lim"
                                calculation={`${results.x.toFixed(2)} / ${results.d.toFixed(2)} = ${results.x_d_ratio.toFixed(3)}`}
                                result={`${results.x_d_ratio.toFixed(3)} ≤ ${results.x_d_limit}`}
                            />
                            <CalculationStep 
                                title="Área de Aço Calculada (As,calc)"
                                formula="A_s,calc = M_d / (f_yd ⋅ (d - 0.4⋅x))"
                                calculation={`A_s,calc = ${results.md.toFixed(2)} / (${(results.fyd).toFixed(2)} ⋅ (${results.d.toFixed(2)} - 0.4⋅${results.x.toFixed(2)}))`}
                                result={`A_s,calc = ${results.asCalc.toFixed(2)} cm²`}
                            />
                            <CalculationStep 
                                title="Armadura Mínima (As,min)"
                                formula="A_s,min = max(ρ_min ⋅ b_w ⋅ d, 0.15% ⋅ b_w ⋅ h)"
                                calculation={`A_s,min = max(${(results.rhoMin * inputs.bw * results.d).toFixed(2)}, ${(0.0015 * inputs.bw * inputs.h).toFixed(2)})`}
                                result={`A_s,min = ${results.asMin.toFixed(2)} cm²`}
                                note={`ρ_min = ${results.rhoMin.toFixed(5)}`}
                            />
                            <CalculationStep 
                                title="Área de Aço Final (As)"
                                formula="A_s = max(A_s,calc, A_s,min)"
                                calculation={`A_s = max(${results.asCalc.toFixed(2)}, ${results.asMin.toFixed(2)})`}
                                result={`A_s = ${results.as.toFixed(2)} cm²`}
                                isFinal
                            />
                        </div>
                      </>
                    )}
                  </div>
                 </>
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
