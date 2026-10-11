// Handicap math using the standard World Handicap System formulas.

/** Course Handicap = Index × (Slope ÷ 113) + (Course Rating − Par), rounded. */
export function courseHandicap(index: number, slope: number, rating: number, par: number): number {
  return roundHalfUp(index * (slope / 113) + (rating - par));
}

/** Playing handicap = course handicap × allowance %, rounded. */
export function playingHandicap(course: number, allowancePct = 100): number {
  return roundHalfUp((course * allowancePct) / 100);
}

/** "Play off the low": everyone gives up the lowest handicap's strokes. */
export function offTheLow(handicaps: number[]): number[] {
  const low = Math.min(...handicaps);
  return handicaps.map((h) => h - low);
}

/**
 * Strokes a player gets (or gives, if negative) on one hole.
 * Holes are ranked by stroke index among the holes being played, so a
 * 9-hole round with indexes 1,3,5…17 still allocates hardest-first.
 * Plus handicaps give strokes back starting on the easiest hole.
 */
export function strokesOnHole(handicap: number, holeSI: number, allSI: number[]): number {
  const n = allSI.length;
  const rank = [...allSI].sort((a, b) => a - b).indexOf(holeSI) + 1; // 1 = hardest
  const h = Math.abs(handicap);
  const base = Math.floor(h / n);
  const extra = h % n;
  if (handicap >= 0) return base + (rank <= extra ? 1 : 0);
  return -(base + (rank > n - extra ? 1 : 0)) || 0;
}

export function netScore(gross: number, handicap: number, holeSI: number, allSI: number[]): number {
  return gross - strokesOnHole(handicap, holeSI, allSI);
}

/** Rounds .5 away from zero (so −2.5 → −3 and 2.5 → 3), matching the usual handicap rounding. */
export function roundHalfUp(x: number): number {
  return Math.sign(x) * Math.round(Math.abs(x) + 1e-9) || 0;
}

/** A common stroke-index layout used as a starting point. Users edit it to match their card. */
export const DEFAULT_SI_18 = [7, 3, 15, 1, 11, 5, 17, 9, 13, 8, 4, 16, 2, 12, 6, 18, 10, 14];
export const DEFAULT_PAR_18 = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];
