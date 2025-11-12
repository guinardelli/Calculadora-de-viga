import { GAMMA_C, GAMMA_F, GAMMA_S } from '../constants';
import type { BeamInput, CalculationResult } from '../types';
import { CalculationStatus } from '../types';

export const calculateBeam = (inputs: BeamInput): CalculationResult => {
  const { bw, h, fck, fyk, mk, cover } = inputs;

  const baseEmptyResult: Omit<CalculationResult, 'status' | 'message'> = {
    as: 0, asMin: 0, asMax: 0, x: 0, d: 0, x_d_ratio: 0, x_d_limit: 0,
    fcd: 0, fyd: 0, md: 0, asCalc: 0, fctm: 0, rhoMin: 0,
  };

  // Input validation
  if (!bw || !h || !fck || !fyk || !mk || !cover || bw <= 0 || h <= 0 || fck <= 0 || fyk <= 0 || mk <= 0 || cover <= 0) {
    return {
      ...baseEmptyResult,
      status: CalculationStatus.ERROR_INPUT,
      message: 'Todos os valores de entrada devem ser positivos e maiores que zero.',
    };
  }

  // Design strengths (in kN/cm²)
  const fcd = (fck / GAMMA_C) / 10;
  const fyd = (fyk / GAMMA_S) / 10;

  // Design moment (in kN.cm) - Input mk is in tf.m
  // 1 tf.m ≈ 10 kN.m
  // 10 kN.m * 100 cm/m = 1000 kN.cm
  const Md = mk * 10 * GAMMA_F * 100;

  // Effective depth (d) - assuming 10mm stirrup and 16mm main bar
  const d = h - cover - 1.0 - (1.6 / 2);

  // Position of neutral axis (x)
  // Md = 0.68 * bw * x * fcd * (d - 0.4 * x)
  // 0.272 * bw * fcd * x² - 0.68 * bw * fcd * d * x + Md = 0
  // The coefficients 0.68 and 0.272 already account for alpha_c = 0.85 and lambda = 0.8 for fck <= 50MPa.
  const a = 0.272 * bw * fcd;
  const b = -0.68 * bw * fcd * d;
  const c = Md;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return {
      ...baseEmptyResult,
      status: CalculationStatus.ERROR_X_D_LIMIT,
      message: 'Erro: Seção de concreto insuficiente. O momento solicitante é maior que o momento resistente máximo. Aumente a seção ou adote armadura de compressão.',
      d, fcd, fyd, md: Md,
    };
  }
  
  const x = (-b - Math.sqrt(discriminant)) / (2 * a);
  
  // Ductility check (x/d)
  const x_d_limit = fck <= 50 ? 0.45 : 0.35;
  const x_d_ratio = x / d;

  // Minimum and Maximum steel area (As,min, As,max)
  const fctm = fck <= 50 ? 0.3 * Math.pow(fck, 2/3) : 2.12 * Math.log(1 + 0.11 * fck);
  const rho_min = (0.4 * fctm) / fyk;
  const As_min = Math.max(rho_min * bw * d, (0.15 / 100) * bw * h);
  const As_max = (4 / 100) * bw * h;

  if (x_d_ratio > x_d_limit) {
    return {
      ...baseEmptyResult,
      asMin: As_min, asMax: As_max,
      x, d, x_d_ratio, x_d_limit,
      fcd, fyd, md: Md, fctm, rhoMin: rho_min,
      status: CalculationStatus.ERROR_X_D_LIMIT,
      message: `Limite de ductilidade excedido (x/d = ${x_d_ratio.toFixed(2)} > ${x_d_limit}). A seção necessita de armadura de compressão. Recomenda-se aumentar as dimensões da viga.`,
    };
  }

  // Required steel area (As)
  const As_calc = Md / (fyd * (d - 0.4 * x));
  
  const As_final = Math.max(As_calc, As_min);

  const commonResult = {
      asMin: As_min, asMax: As_max, x, d, x_d_ratio, x_d_limit,
      fcd, fyd, md: Md, asCalc: As_calc, fctm, rhoMin: rho_min,
  };

  if (As_final > As_max) {
    return {
      ...commonResult,
      as: As_final,
      status: CalculationStatus.ERROR_MAX_STEEL,
      message: `Armadura máxima excedida (As = ${As_final.toFixed(2)} cm² > ${As_max.toFixed(2)} cm²). Aumente a seção de concreto.`,
    };
  }

  if (As_calc < As_min) {
     return {
      ...commonResult,
      as: As_final,
      status: CalculationStatus.WARNING_MIN_STEEL,
      message: `Cálculo OK. A armadura calculada (${As_calc.toFixed(2)} cm²) é menor que a mínima. Adotada armadura mínima.`,
    };
  }

  return {
    ...commonResult,
    as: As_final,
    status: CalculationStatus.SUCCESS,
    message: 'Dimensionamento concluído com sucesso.',
  };
};