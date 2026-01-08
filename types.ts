
export type Shift = 'A' | 'B' | 'C';

export interface RollData {
  rodNumber: string;
  solids: number;
  front: number;
  center: number;
  drive: number;
  resultGsm: number;
}

export interface CalculationEntry {
  id: string;
  date: string;
  shift: Shift;
  fabrication: string;
  machineSpeed: number;
  fixedRoll: RollData;
  pivotRoll: RollData;
  totalGsm: number;
  timestamp: number;
}

export interface FixedParameters {
  collectionTime: number; // seconds
  scraperWidth: number;   // mm
  transferFactor: number;
  starchDensity: number;  // g/cm³
}
