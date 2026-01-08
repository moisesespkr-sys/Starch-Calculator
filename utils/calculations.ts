
import { PARAMS } from '../constants';
import { RollData } from '../types';

/**
 * Logic:
 * 1) Applied area (m²) = (machine speed / 60) * 30 * (50 / 1000)
 * 2) Film applied (ml/m²) = collected volume / applied area
 * 3) Transferred film = ml/m² * 0.90
 * 4) Applied dry starch (g/m²) = transferred film * (solids / 100) * 1.07
 */
export const calculateRollGsm = (
  machineSpeed: number,
  solids: number,
  volumes: number[]
): number => {
  if (machineSpeed <= 0 || solids <= 0 || volumes.length === 0) return 0;

  // Filter out any 0 or undefined values to only average entered data
  const validVolumes = volumes.filter(v => v > 0);
  if (validVolumes.length === 0) return 0;

  const avgVolume = validVolumes.reduce((a, b) => a + b, 0) / validVolumes.length;

  // Area (m²) = (speed m/min / 60) * 30s * (50mm / 1000)
  // Simplified: Area = (speed / 2) * 0.05
  const area = (machineSpeed / 60) * PARAMS.collectionTime * (PARAMS.scraperWidth / 1000);
  
  if (area === 0) return 0;

  const filmApplied = avgVolume / area; // ml/m²
  const transferredFilm = filmApplied * PARAMS.transferFactor;
  const dryStarch = transferredFilm * (solids / 100) * PARAMS.starchDensity;

  return Math.round(dryStarch * 100) / 100;
};
