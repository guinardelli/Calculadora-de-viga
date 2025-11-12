
export enum AggressivenessClass {
  CAA1 = 'I (Fraca)',
  CAA2 = 'II (Moderada)',
  CAA3 = 'III (Forte)',
  CAA4 = 'IV (Muito Forte)',
}

export interface BeamInput {
  bw: number;
  h: number;
  fck: number;
  fyk: number;
  mk: number;
  cover: number;
  aggressiveness: AggressivenessClass;
}

export enum CalculationStatus {
  SUCCESS = 'success',
  ERROR_X_D_LIMIT = 'error_x_d_limit',
  ERROR_MAX_STEEL = 'error_max_steel',
  WARNING_MIN_STEEL = 'warning_min_steel',
  ERROR_INPUT = 'error_input',
  IDLE = 'idle',
}

export interface CalculationResult {
  as: number;
  asMin: number;
  asMax: number;
  x: number;
  d: number;
  x_d_ratio: number;
  x_d_limit: number;
  status: CalculationStatus;
  message: string;
}
