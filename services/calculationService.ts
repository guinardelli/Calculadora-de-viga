import { GAMMA_C, GAMMA_F, GAMMA_S } from '../constants';
import type { BeamInput, CalculationResult } from '../types';
import { CalculationStatus } from '../types';

export const calculateBeam = (inputs: BeamInput, allowCompression: boolean): CalculationResult => {
  const { bw, h, fck, fyk, mk, cover, dPrime } = inputs;

  const baseEmptyResult: Omit<CalculationResult, 'status' | 'message'> = {
    as: 0, asPrime: 0, asMin: 0, asMax: 0, x: 0, d: 0, x_d_ratio: 0, x_d_limit: 0,
    fcd: 0, fyd: 0, md: 0, asCalc: 0, fctm: 0, rhoMin: 0,
    asPrimeCalc: 0, as1: 0, as2: 0, m1d: 0, m2d: 0, sigma_sd: 0,
  };

  // Input validation
  if (!bw || !h || !fck || !fyk || !mk || !cover || !dPrime || bw <= 0 || h <= 0 || fck <= 0 || fyk <= 0 || mk <= 0 || cover <= 0 || dPrime <= 0) {
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
  const Md = mk * 10 * GAMMA_F * 100;

  // Effective depth (d) - assuming 10mm stirrup and 16mm main bar
  const d = h - cover - 1.0 - (1.6 / 2);

  if (d <= 0) {
     return {
      ...baseEmptyResult,
      status: CalculationStatus.ERROR_INPUT,
      message: 'Altura útil (d) inválida. Verifique as dimensões e o cobrimento da viga.',
    };
  }

  // Position of neutral axis (x)
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
    if (!allowCompression) {
        return {
          ...baseEmptyResult,
          asMin: As_min, asMax: As_max, x, d, x_d_ratio, x_d_limit,
          fcd, fyd, md: Md, fctm, rhoMin: rho_min,
          status: CalculationStatus.ERROR_X_D_LIMIT,
          message: `Limite de ductilidade excedido (x/d = ${x_d_ratio.toFixed(2)} > ${x_d_limit}). Aumente a seção da viga ou dimensione com armadura de compressão.`,
        };
    }

    // --- Compression Reinforcement Calculation ---
    if (dPrime >= d) {
      return {
          ...baseEmptyResult,
          status: CalculationStatus.ERROR_INPUT,
          message: "d' (cobrimento da armadura de compressão) deve ser menor que a altura útil (d).",
      };
    }
    const x_lim = x_d_limit * d;
    const M1d = 0.68 * bw * x_lim * fcd * (d - 0.4 * x_lim);
    const M2d = Md - M1d;

    const epsilon_cu = 0.0035;
    const epsilon_sc = epsilon_cu * (x_lim - dPrime) / x_lim;
    const E_s = 21000; // kN/cm²
    const epsilon_yd = fyd / E_s;
    
    const sigma_sd = Math.min(fyd, epsilon_sc * E_s);

    const As_prime_calc = M2d / (sigma_sd * (d - dPrime));
    const As2 = (As_prime_calc * sigma_sd) / fyd;
    const As1 = M1d / (fyd * (d - 0.4 * x_lim));
    const As_calc_total = As1 + As2;
    const As_final = Math.max(As_calc_total, As_min);

    const commonResultWithCompression = {
        asMin: As_min, asMax: As_max, x: x_lim, d, x_d_ratio: x_lim/d, x_d_limit,
        fcd, fyd, md: Md, asCalc: As_calc_total, fctm, rhoMin: rho_min,
        asPrime: As_prime_calc, asPrimeCalc: As_prime_calc, 
        as1: As1, as2: As2, m1d: M1d, m2d: M2d, sigma_sd
    };

    if (As_final > As_max) {
      return {
        ...commonResultWithCompression, as: As_final,
        status: CalculationStatus.ERROR_MAX_STEEL,
        message: `Armadura dupla calculada, porém a armadura de tração máxima foi excedida (As = ${As_final.toFixed(2)} cm² > ${As_max.toFixed(2)} cm²). Aumente a seção de concreto.`
      };
    }
    
    return {
      ...commonResultWithCompression, as: As_final,
      status: CalculationStatus.SUCCESS_COMPRESSION_STEEL,
      message: 'Limite de ductilidade excedido. Viga dimensionada com armadura de compressão.'
    };
  }

  // Required steel area (As) - Simple Reinforcement
  const As_calc = Md / (fyd * (d - 0.4 * x));
  const As_final = Math.max(As_calc, As_min);

  const commonResult = {
      ...baseEmptyResult,
      asMin: As_min, asMax: As_max, x, d, x_d_ratio, x_d_limit,
      fcd, fyd, md: Md, asCalc: As_calc, fctm, rhoMin: rho_min,
  };

  if (As_final > As_max) {
    return {
      ...commonResult, as: As_final,
      status: CalculationStatus.ERROR_MAX_STEEL,
      message: `Armadura máxima excedida (As = ${As_final.toFixed(2)} cm² > ${As_max.toFixed(2)} cm²). Aumente a seção de concreto.`,
    };
  }

  if (As_calc < As_min) {
     return {
      ...commonResult, as: As_final,
      status: CalculationStatus.WARNING_MIN_STEEL,
      message: `Cálculo OK. A armadura calculada (${As_calc.toFixed(2)} cm²) é menor que a mínima. Adotada armadura mínima.`,
    };
  }

  return {
    ...commonResult, as: As_final,
    status: CalculationStatus.SUCCESS,
    message: 'Dimensionamento concluído com sucesso.',
  };
};