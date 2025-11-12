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

// --- Shear Calculation Types ---

export interface ShearInput {
  bw: number;
  h: number;
  fck: number;
  fyk: number;
  vk: number;
  cover: number;
  stirrupDiameter: number;
  numLegs: number;
}

export enum ShearCalculationStatus {
  SUCCESS = 'success',
  ERROR_VRD2 = 'error_vrd2',
  WARNING_MIN_STEEL = 'warning_min_steel',
  ERROR_INPUT = 'error_input',
  IDLE = 'idle',
}

export interface ShearCalculationResult {
  status: ShearCalculationStatus;
  message: string;
  s_calc: number;
  s_max: number;
  s_adopted: number;
  vrd2: number;
  vc: number;
  vsw: number;
  vd: number;
  asw_s_min: number;
}

// --- Anchorage Calculation Types ---

export enum SteelRatioOption {
  EQUAL = 'equal',
  CUSTOM = 'custom',
}

export enum AnchorageType {
  STRAIGHT = 'straight',
  HOOK = 'hook',
}

export enum BarType {
  CA25 = 'CA-25',
  CA50 = 'CA-50',
  CA60 = 'CA-60',
}

export enum BondCondition {
  GOOD = 'good',
  POOR = 'poor',
}

export interface AnchorageInput {
  diameter: number;
  fck: number;
  barType: BarType;
  steelRatioOption: SteelRatioOption;
  asCalc: number;
  asEff: number;
  anchorageType: AnchorageType;
  bondCondition: BondCondition;
}

export enum AnchorageCalculationStatus {
  SUCCESS = 'success',
  ERROR_INPUT = 'error_input',
  IDLE = 'idle',
}

export interface AnchorageCalculationResult {
  status: AnchorageCalculationStatus;
  message: string;
  lb: number;
  lb_min: number;
  lb_nec: number;
  // Intermediate values for calculation memory
  fyd: number;
  fctd: number;
  n1: number;
  n2: number;
  n3: number;
  fbd: number;
  alpha: number;
  steelRatio: number;
  lb_nec_calc: number;
  phi: number;
}