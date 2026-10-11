import { netScore, offTheLow } from './handicap';

export interface NassauInput {
  /** Two players, 18 gross scores each. */
  scores: [number[], number[]];
  handicaps: [number, number];
  strokeIndex: number[];
  net: boolean;
  stakes: { front: number; back: number; overall: number };
  autoPress: boolean;
  /** Holes (1-based) where someone pressed by hand. Each press runs to the end of its nine. */
  manualPresses: number[];
}

export interface NassauBet { label: string; start: number; end: number; status: number; stake: number; result: number }
export interface NassauResult { holeResults: number[]; bets: NassauBet[]; totals: [number, number] }

/** +1 = player 1 wins the hole, −1 = player 2, 0 = halved. */
export function holeResults(inp: Pick<NassauInput, 'scores' | 'handicaps' | 'strokeIndex' | 'net'>): number[] {
  const hc = offTheLow(inp.handicaps);
  return inp.strokeIndex.map((si, h) => {
    const [a, b] = inp.scores.map((row, p) =>
      inp.net ? netScore(row[h], hc[p], si, inp.strokeIndex) : row[h]);
    return a < b ? 1 : a > b ? -1 : 0;
  });
}

function runNine(res: number[], s: number, e: number, stake: number, name: string, auto: boolean, manual: number[]): NassauBet[] {
  const bets = [{ start: s, status: 0, fired: false, manual: false }];
  for (const m of manual) if (m - 1 > s && m - 1 <= e) bets.push({ start: m - 1, status: 0, fired: true, manual: true });
  bets.sort((x, y) => x.start - y.start);
  for (let h = s; h <= e; h++) {
    for (const b of bets) if (b.start <= h) b.status += res[h];
    if (auto && h < e) {
      const open = bets.filter((b) => b.start <= h);
      const last = open[open.length - 1];
      if (!last.fired && Math.abs(last.status) === 2) {
        last.fired = true;
        bets.push({ start: h + 1, status: 0, fired: false, manual: false });
        bets.sort((x, y) => x.start - y.start);
      }
    }
  }
  return bets.map((b, i) => ({
    label: i === 0 ? name : `${name} press ${i} (from ${b.start + 1})`,
    start: b.start + 1,
    end: e + 1,
    status: b.status,
    stake,
    result: Math.sign(b.status) * stake || 0,
  }));
}

export function scoreNassau(inp: NassauInput): NassauResult {
  const res = holeResults(inp);
  const bets = [
    ...runNine(res, 0, 8, inp.stakes.front, 'Front 9', inp.autoPress, inp.manualPresses),
    ...runNine(res, 9, 17, inp.stakes.back, 'Back 9', inp.autoPress, inp.manualPresses),
  ];
  const overall = res.reduce((a, b) => a + b, 0);
  bets.push({ label: 'Overall', start: 1, end: 18, status: overall, stake: inp.stakes.overall, result: Math.sign(overall) * inp.stakes.overall });
  const p1 = bets.reduce((a, b) => a + b.result, 0);
  return { holeResults: res, bets, totals: [p1, -p1 || 0] };
}
