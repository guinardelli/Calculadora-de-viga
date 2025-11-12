import { AggressivenessClass, type BeamInput } from './types';

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
  aggressiveness: AggressivenessClass.CAA2,
};

export const COVER_BY_AGGRESSIVENESS: { [key in AggressivenessClass]: number } = {
  [AggressivenessClass.CAA1]: 2.5,
  [AggressivenessClass.CAA2]: 3.0,
  [AggressivenessClass.CAA3]: 4.0,
  [AggressivenessClass.CAA4]: 5.0,
};