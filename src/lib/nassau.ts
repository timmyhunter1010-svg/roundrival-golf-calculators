import { holeResults } from './match';
export { holeResults };

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
