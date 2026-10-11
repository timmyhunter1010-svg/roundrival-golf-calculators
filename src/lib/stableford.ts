import { netCard } from './match';

export type StablefordKind = 'standard' | 'modified';

/** Points for one hole from the score relative to par (−1 = birdie). */
export function stablefordPoints(toPar: number, kind: StablefordKind = 'standard'): number {
  if (kind === 'standard') return Math.max(0, 2 - toPar);
  // Modified (PGA Tour style): albatross 8, eagle 5, birdie 2, par 0, bogey −1, double or worse −3.
  if (toPar <= -3) return 8;
  return ({ [-2]: 5, [-1]: 2, 0: 0, 1: -1 } as Record<number, number>)[toPar] ?? -3;
}

export function scoreStableford(inp: { scores: number[][]; handicaps: number[]; strokeIndex: number[]; par: number[]; net: boolean; kind: StablefordKind }) {
  const perHole = inp.scores.map((row, p) =>
    netCard(row, inp.handicaps[p], inp.strokeIndex, inp.net).map((s, h) => stablefordPoints(s - inp.par[h], inp.kind)));
  return { perHole, points: perHole.map((r) => r.reduce((a, b) => a + b, 0)) };
}
