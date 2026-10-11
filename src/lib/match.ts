import { netScore, offTheLow } from './handicap';

/** +1 = side 1 wins the hole, −1 = side 2, 0 = halved. */
export function compareHoles(a: number[], b: number[]): number[] {
  return a.map((x, h) => (x < b[h] ? 1 : x > b[h] ? -1 : 0));
}

/** One player's net (or gross) score on every hole. */
export function netCard(gross: number[], handicap: number, si: number[], net: boolean): number[] {
  return gross.map((g, h) => (net ? netScore(g, handicap, si[h], si) : g));
}

/** Two players, strokes off the low. */
export function holeResults(inp: { scores: number[][]; handicaps: number[]; strokeIndex: number[]; net: boolean }): number[] {
  const hc = offTheLow(inp.handicaps);
  const [a, b] = inp.scores.map((row, p) => netCard(row, hc[p], inp.strokeIndex, inp.net));
  return compareHoles(a, b);
}

export interface MatchSummary {
  /** Final holes up for side 1 (negative = side 2), counting only holes played before the match ended. */
  up: number;
  /** Hole number (1-based) where the match was won, or null if it went the distance. */
  closedOn: number | null;
  /** "3 & 2", "2 up", or "All square". */
  score: string;
}

export function summarize(results: number[]): MatchSummary {
  let up = 0;
  for (let h = 0; h < results.length; h++) {
    up += results[h];
    const left = results.length - h - 1;
    if (Math.abs(up) > left && left > 0) return { up, closedOn: h + 1, score: `${Math.abs(up)} & ${left}` };
  }
  return { up, closedOn: null, score: up === 0 ? 'All square' : `${Math.abs(up)} up` };
}
