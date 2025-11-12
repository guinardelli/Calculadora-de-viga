import { GAMMA_C, GAMMA_S, MINIMUM_STEEL_RATES } from '../constants';
import type { MinimumSteelInput, MinimumSteelResult } from '../types';
import { MinimumSteelStatus } from '../types';

export const calculateMinimumSteel = (inputs: MinimumSteelInput): MinimumSteelResult => {
  const { bw, h, fck, fyk, d_h_ratio } = inputs;

  const baseEmptyResult: Omit<MinimumSteelResult, 'status' | 'message'> = {
    rho_min_percent: 0,
    as_min_by_rate: 0,
    w: 0,
    md_resisted: 0,
    x: 0,
    d: 0,
    fcd: 0,
    fyd: 0,
    md_resisted_kn_cm: 0,
  };

  if (!bw || !h || !fck || !fyk || !d_h_ratio || [bw, h, fck, fyk, d_h_ratio].some(v => v <= 0)) {
    return {
      ...baseEmptyResult,
      status: MinimumSteelStatus.ERROR_INPUT,
      message: 'Todos os valores de entrada devem ser positivos e maiores que zero.',
    };
  }

  // --- 1. Minimum Reinforcement by Rate (NBR 6118, Tabela 17.1) ---
  const rho_min_percent = MINIMUM_STEEL_RATES[fck] ?? 0.150;
  const as_min_by_rate = (rho_min_percent / 100) * bw * h;

  // --- 2. Resisted Moment with Minimum Reinforcement ---
  const w = (bw * h * h) / 6;
  const d = d_h_ratio * h;

  if (d <= 0) {
      return {
      ...baseEmptyResult,
      status: MinimumSteelStatus.ERROR_INPUT,
      message: 'Altura útil (d) inválida. Verifique a altura e a relação d/h.',
    };
  }

  const As = as_min_by_rate;
  const fcd = (fck / GAMMA_C) / 10; // kN/cm²
  const fyd = (fyk / GAMMA_S) / 10; // kN/cm²
  
  // Force equilibrium to find neutral axis (x)
  // 0.68 * bw * x * fcd = As * fyd
  const x_numerator = As * fyd;
  const x_denominator = 0.68 * bw * fcd;
  
  if (x_denominator === 0) {
     return {
      ...baseEmptyResult,
      status: MinimumSteelStatus.ERROR_INPUT,
      message: 'Erro no cálculo. Verifique os dados de entrada.',
    };
  }
  const x = x_numerator / x_denominator;
  
  // Resisted Design Moment (Md)
  const Md_resisted_kn_cm = As * fyd * (d - 0.4 * x);

  // Convert to tf.m for display
  // 1 kN.cm = 1/1000 tf.m (approx. 1 tf = 10 kN)
  const md_resisted_tf_m = Md_resisted_kn_cm / 1000;

  return {
    status: MinimumSteelStatus.SUCCESS,
    message: 'Cálculo da armadura mínima concluído.',
    rho_min_percent,
    as_min_by_rate,
    w,
    md_resisted: md_resisted_tf_m,
    x,
    d,
    fcd,
    fyd,
    md_resisted_kn_cm: Md_resisted_kn_cm,
  };
};