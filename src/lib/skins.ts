import { netScore } from './handicap';

export interface SkinsInput {
  /** scores[player][hole] gross strokes */
  scores: number[][];
  handicaps: number[];
  strokeIndex: number[];
  net: boolean;
  carryovers: boolean;
  /** Skins only count if the winner makes par or better (net when playing net). */
  validate: boolean;
  par: number[];
  value: number;
}

export interface SkinsHole { hole: number; winner: number | null; skins: number; carried: boolean }
export interface SkinsResult {
  holes: SkinsHole[];
  skinsWon: number[];
  /** Skins still carrying after the last hole (nobody wins them). */
  unclaimed: number;
  /** Net winnings: every other player pays the winner `value` per skin. */
  totals: number[];
}

export function scoreSkins(inp: SkinsInput): SkinsResult {
  const n = inp.scores.length;
  const holesCount = inp.strokeIndex.length;
  const skinsWon = Array(n).fill(0);
  const holes: SkinsHole[] = [];
  let pot = 0;
  for (let h = 0; h < holesCount; h++) {
    pot += 1;
    const s = inp.scores.map((row, p) =>
      inp.net ? netScore(row[h], inp.handicaps[p], inp.strokeIndex[h], inp.strokeIndex) : row[h]);
    const best = Math.min(...s);
    const at = s.flatMap((v, p) => (v === best ? [p] : []));
    const valid = !inp.validate || best <= inp.par[h];
    if (at.length === 1 && valid) {
      skinsWon[at[0]] += pot;
      holes.push({ hole: h + 1, winner: at[0], skins: pot, carried: false });
      pot = 0;
    } else {
      holes.push({ hole: h + 1, winner: null, skins: 0, carried: inp.carryovers });
      if (!inp.carryovers) pot = 0;
    }
  }
  const total = skinsWon.reduce((a, b) => a + b, 0);
  const totals = skinsWon.map((w) => inp.value * (w * n - total));
  return { holes, skinsWon, unclaimed: pot, totals };
}
