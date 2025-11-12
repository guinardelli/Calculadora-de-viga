import { GAMMA_C, GAMMA_S } from '../constants';
import type { AnchorageInput, AnchorageCalculationResult } from '../types';
import { AnchorageCalculationStatus, BarType, BondCondition, SteelRatioOption, AnchorageType } from '../types';

export const calculateAnchorage = (inputs: AnchorageInput): AnchorageCalculationResult => {
    const { diameter, fck, barType, steelRatioOption, asCalc, asEff, anchorageType, bondCondition } = inputs;
    
    const initialResult = { 
        lb: 0, lb_min: 0, lb_nec: 0, fyd: 0, fctd: 0, n1: 0, n2: 0, n3: 0, fbd: 0, 
        alpha: 0, steelRatio: 0, lb_nec_calc: 0, phi: 0 
    };
    
    if (!diameter || !fck || (steelRatioOption === SteelRatioOption.CUSTOM && (!asCalc || !asEff)) || [diameter, fck, asCalc, asEff].some(v => v < 0)) {
        return {
            ...initialResult,
            status: AnchorageCalculationStatus.ERROR_INPUT,
            message: 'Valores de entrada devem ser positivos. Verifique os campos.',
        };
    }

    if (steelRatioOption === SteelRatioOption.CUSTOM && asCalc > asEff) {
         return {
            ...initialResult,
            status: AnchorageCalculationStatus.ERROR_INPUT,
            message: 'A área de aço efetiva (As,ef) deve ser maior ou igual à área de aço calculada (As,calc).',
        };
    }
    
    // --- Material Properties ---
    const fyk = { [BarType.CA25]: 250, [BarType.CA50]: 500, [BarType.CA60]: 600 }[barType];
    const fyd = (fyk / GAMMA_S) / 10; // kN/cm²

    const fctm = fck <= 50 ? 0.3 * Math.pow(fck, 2/3) : 2.12 * Math.log(1 + 0.11 * fck); // MPa
    const fctk_inf = 0.7 * fctm;
    const fctd = (fctk_inf / GAMMA_C) / 10; // kN/cm²
    
    // --- Bond Stress (fbd) ---
    const n1 = { [BarType.CA25]: 1.0, [BarType.CA50]: 2.25, [BarType.CA60]: 2.25 }[barType]; // Bar surface
    const n2 = bondCondition === BondCondition.GOOD ? 1.0 : 0.7; // Bond condition
    const n3 = diameter <= 32 ? 1.0 : (132 - diameter) / 100; // Diameter
    
    const fbd = n1 * n2 * n3 * fctd; // kN/cm²

    // --- Basic Anchorage Length (lb) ---
    const phi = diameter / 10; // diameter in cm
    let lb = (phi / 4) * (fyd / fbd);

    // According to NBR 6118:2014, item 9.4.2.4, straight anchorage for plain bars (CA-25)
    // must be doubled.
    if (barType === BarType.CA25) {
        lb = lb * 2;
    }

    // --- Necessary Anchorage Length (lb,nec) ---
    // According to NBR 6118, hooks cannot be used for plain bars.
    const alpha = (anchorageType === AnchorageType.HOOK && barType !== BarType.CA25) ? 0.7 : 1.0;
    const steelRatio = steelRatioOption === SteelRatioOption.EQUAL ? 1.0 : (asCalc > 0 && asEff > 0 ? asCalc / asEff : 1.0);
    const lb_nec_calc = alpha * lb * steelRatio;

    // --- Minimum Anchorage Length (lb,min) ---
    const lb_min = Math.max(0.3 * lb, 10 * phi, 10);
    
    const lb_nec = Math.max(lb_nec_calc, lb_min);

    return {
        status: AnchorageCalculationStatus.SUCCESS,
        message: 'Cálculo do comprimento de ancoragem concluído.',
        lb,
        lb_min,
        lb_nec,
        fyd,
        fctd,
        n1,
        n2,
        n3,
        fbd,
        alpha,
        steelRatio,
        lb_nec_calc,
        phi
    };
};