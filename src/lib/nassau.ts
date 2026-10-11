import { netScore, offTheLow } from './handicap';

export interface NassauInput {
  /** Two players, 18 gross scores each. */
  scores: [number[], number[]];
  handicaps: [number, number];
  strokeIndex: number[];
  net: boolean;
  stakes: { front: number; back: number; overall: number };
}

export interface NassauBet { label: string; status: number; stake: number; result: number }
export interface NassauResult { holeResults: number[]; bets: NassauBet[]; totals: [number, number] }

/** +1 = player 1 wins the hole, −1 = player 2, 0 = halved. Strokes off the low. */
export function holeResults(inp: Pick<NassauInput, 'scores' | 'handicaps' | 'strokeIndex' | 'net'>): number[] {
  const hc = offTheLow(inp.handicaps);
  return inp.strokeIndex.map((si, h) => {
    const [a, b] = inp.scores.map((row, p) =>
      inp.net ? netScore(row[h], hc[p], si, inp.strokeIndex) : row[h]);
    return a < b ? 1 : a > b ? -1 : 0;
  });
}

/** Three matches: front 9, back 9, overall 18. Each is won by whoever wins more holes. */
export function scoreNassau(inp: NassauInput): NassauResult {
  const res = holeResults(inp);
  const sum = (a: number, b: number) => res.slice(a, b).reduce((x, y) => x + y, 0);
  const bet = (label: string, status: number, stake: number): NassauBet =>
    ({ label, status, stake, result: Math.sign(status) * stake || 0 });
  const bets = [
    bet('Front 9', sum(0, 9), inp.stakes.front),
    bet('Back 9', sum(9, 18), inp.stakes.back),
    bet('Overall', sum(0, 18), inp.stakes.overall),
  ];
  const p1 = bets.reduce((a, b) => a + b.result, 0);
  return { holeResults: res, bets, totals: [p1, -p1 || 0] };
}
