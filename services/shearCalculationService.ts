import { GAMMA_C, GAMMA_F, GAMMA_S } from '../constants';
import type { ShearInput, ShearCalculationResult } from '../types';
import { ShearCalculationStatus } from '../types';

export const calculateShear = (inputs: ShearInput): ShearCalculationResult => {
  const { bw, h, fck, fyk, vk, cover, stirrupDiameter, numLegs } = inputs;
  
  const initialResult: Omit<ShearCalculationResult, 'status' | 'message'> = {
    s_calc: 0, s_max: 0, s_adopted: 0, vrd2: 0, vc: 0, vsw: 0, vd: 0, asw_s_min: 0,
    s_for_min_area: 0,
    d: 0, fcd: 0, fctd: 0, fywd: 0, alpha_v2: 0, asw: 0,
  };
  
  if (!bw || !h || !fck || !fyk || !vk || !cover || !stirrupDiameter || !numLegs || [bw,h,fck,fyk,vk,cover,stirrupDiameter,numLegs].some(v => v <= 0)) {
      return {
          ...initialResult,
          status: ShearCalculationStatus.ERROR_INPUT,
          message: 'Todos os valores de entrada devem ser positivos e maiores que zero.',
      };
  }
  
  // --- Basic Parameters ---
  // Assuming 16mm main bar for 'd' calculation. This is a simplification.
  const d = h - cover - (stirrupDiameter / 10) - (1.6 / 2);
  const Vd = vk * 10 * GAMMA_F; // from tf to kN
  
  // --- Concrete Strength ---
  const fcd = (fck / GAMMA_C) / 10; // kN/cm²
  const fctm = fck <= 50 ? 0.3 * Math.pow(fck, 2/3) : 2.12 * Math.log(1 + 0.11 * fck); // MPa
  const fctd = (0.7 * fctm / GAMMA_C) / 10; // kN/cm²
  
  // --- Steel Strength ---
  const fywd = (fyk / GAMMA_S) / 10; // kN/cm²
  
  // --- Verification of compressed diagonal (VRd2) ---
  const alpha_v2 = 1 - (fck / 250);
  const VRd2 = 0.27 * alpha_v2 * fcd * bw * d; // kN
  
  if (Vd > VRd2) {
    return {
      ...initialResult,
      d, vd: Vd, fcd, alpha_v2, vrd2: VRd2,
      status: ShearCalculationStatus.ERROR_VRD2,
      message: `Esforço cortante (Vd = ${Vd.toFixed(2)} kN) excede a resistência da biela de compressão (VRd2 = ${VRd2.toFixed(2)} kN). A seção de concreto é insuficiente.`,
    };
  }
  
  // --- Concrete Contribution (Vc) - Model I ---
  const Vc = 0.6 * fctd * bw * d; // kN
  
  // --- Required Stirrup Contribution (Vsw) ---
  const Vsw = Vd > Vc ? Vd - Vc : 0;
  
  // --- Stirrup Area (Asw) ---
  const stirrupArea = Math.PI * Math.pow(stirrupDiameter / 10 / 2, 2); // cm²
  const Asw = numLegs * stirrupArea; // cm²
  
  // --- Calculated Spacing (s_calc) ---
  // s = (Asw * 0.9 * d * fywd) / Vsw
  const s_calc = Vsw > 0 ? (Asw * 0.9 * d * fywd) / Vsw : Infinity; // cm
  
  // --- Minimum Stirrup Area ---
  // Asw,min / s = rho_sw * bw => s_for_min_area = Asw / (rho_sw * bw)
  const rho_sw_min = (0.2 * fctm) / fyk;
  const asw_s_min = rho_sw_min * bw;
  const s_for_min_area = Asw / (asw_s_min);
  
  // --- Maximum Spacing (s_max) ---
  let s_max;
  if (Vd <= 0.67 * VRd2) {
      s_max = Math.min(0.6 * d, 30);
  } else {
      s_max = Math.min(0.3 * d, 20);
  }
  
  // --- Adopted Spacing ---
  const s_adopted = Math.min(s_calc, s_for_min_area, s_max);

  
  let status = ShearCalculationStatus.SUCCESS;
  let message = 'Dimensionamento dos estribos concluído com sucesso.';

  if (s_calc > s_for_min_area || s_calc > s_max) {
      status = ShearCalculationStatus.WARNING_MIN_STEEL;
      message = `Cálculo OK. O espaçamento foi definido pela armadura mínima ou pelo espaçamento máximo permitido.`;
  }
  
  const fullResult = {
    s_calc, s_max, s_adopted, vrd2: VRd2, vc: Vc, vsw: Vsw, vd: Vd, asw_s_min,
    s_for_min_area,
    d, fcd, fctd, fywd, alpha_v2, asw: Asw,
  };

  return {
    ...fullResult,
    status,
    message,
  };
};