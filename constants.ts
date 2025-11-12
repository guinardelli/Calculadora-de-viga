import { AggressivenessClass, type BeamInput, type ShearInput, type AnchorageInput, BarType, SteelRatioOption, AnchorageType, BondCondition, type MinimumSteelInput } from './types';

export const GAMMA_C = 1.4;
export const GAMMA_S = 1.15;
export const GAMMA_F = 1.4;

export const DEFAULT_INPUTS: BeamInput = {
  bw: 20,
  h: 50,
  fck: 25,
  fyk: 500,
  mk: 8,
  cover: 3.0,
  dPrime: 5.0,
  aggressiveness: AggressivenessClass.CAA2,
};

export const COVER_BY_AGGRESSIVENESS: { [key in AggressivenessClass]: number } = {
  [AggressivenessClass.CAA1]: 2.5,
  [AggressivenessClass.CAA2]: 3.0,
  [AggressivenessClass.CAA3]: 4.0,
  [AggressivenessClass.CAA4]: 5.0,
};

// --- Shear Constants ---

export const STIRRUP_DIAMETERS: readonly number[] = [5.0, 6.3, 8.0, 10.0, 12.5];

export const DEFAULT_SHEAR_INPUTS: ShearInput = {
  bw: 20,
  h: 50,
  fck: 25,
  fyk: 500,
  vk: 10,
  cover: 3.0,
  stirrupDiameter: 5.0,
  numLegs: 2,
};

// --- Anchorage Constants ---
export const BAR_DIAMETERS: readonly number[] = [6.3, 8.0, 10.0, 12.5, 16.0, 20.0, 25.0, 32.0];

export const DEFAULT_ANCHORAGE_INPUTS: AnchorageInput = {
  diameter: 10.0,
  fck: 30,
  barType: BarType.CA50,
  steelRatioOption: SteelRatioOption.EQUAL,
  asCalc: 1,
  asEff: 1,
  anchorageType: AnchorageType.STRAIGHT,
  bondCondition: BondCondition.GOOD,
};

// --- Minimum Steel Constants ---
export const FCK_VALUES: readonly number[] = [20, 25, 30, 35, 40, 45, 50];

// NBR 6118:2014 - Table 17.1 - Minimum reinforcement rates for beams (%)
export const MINIMUM_STEEL_RATES: { [key: number]: number } = {
  20: 0.150,
  25: 0.150,
  30: 0.150,
  35: 0.164,
  40: 0.179,
  45: 0.194,
  50: 0.208,
};

export const DEFAULT_MINIMUM_STEEL_INPUTS: MinimumSteelInput = {
  bw: 14,
  h: 40,
  fck: 40,
  fyk: 500,
  d_h_ratio: 0.8,
};
