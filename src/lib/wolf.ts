import { netScore } from './handicap';

export type WolfPick = number | 'lone' | 'blind';
/** pick = null means nobody chose; the hole doesn't count. */
export interface WolfHole { wolf: number; pick: WolfPick | null }
export interface WolfInput {
  scores: number[][];
  handicaps: number[];
  strokeIndex: number[];
  net: boolean;
  holes: WolfHole[];
  pointValue: number;
  loneMult: number;
  blindMult: number;
}
export interface WolfHoleResult { hole: number; wolfSide: number[]; winner: 'wolf' | 'field' | 'tie' | 'skipped'; mult: number }
export interface WolfResult { holes: WolfHoleResult[]; points: number[]; totals: number[] }

/** Wolf's rotation: hole 1 is player 1, hole 2 player 2, and so on. */
export const rotationWolf = (hole: number, players: number) => hole % players;

/** Lower best ball wins. Each loser pays each winner (point value × multiplier). */
export function scoreWolf(inp: WolfInput): WolfResult {
  const n = inp.scores.length;
  const points = Array(n).fill(0);
  const holes: WolfHoleResult[] = inp.holes.map(({ wolf, pick }, h) => {
    if (pick == null) return { hole: h + 1, wolfSide: [wolf], winner: 'skipped', mult: 0 };
    const s = inp.scores.map((row, p) =>
      inp.net ? netScore(row[h], inp.handicaps[p], inp.strokeIndex[h], inp.strokeIndex) : row[h]);
    const wolfSide = typeof pick === 'number' ? [wolf, pick] : [wolf];
    const field = [...Array(n).keys()].filter((p) => !wolfSide.includes(p));
    const mult = pick === 'lone' ? inp.loneMult : pick === 'blind' ? inp.blindMult : 1;
    const w = Math.min(...wolfSide.map((p) => s[p]));
    const f = Math.min(...field.map((p) => s[p]));
    const winner = w < f ? 'wolf' : w > f ? 'field' : 'tie' as const;
    if (winner !== 'tie') {
      const [win, lose] = winner === 'wolf' ? [wolfSide, field] : [field, wolfSide];
      for (const p of win) points[p] += lose.length * mult;
      for (const p of lose) points[p] -= win.length * mult;
    }
    return { hole: h + 1, wolfSide, winner, mult };
  });
  return { holes, points, totals: points.map((p) => p * inp.pointValue) };
}
