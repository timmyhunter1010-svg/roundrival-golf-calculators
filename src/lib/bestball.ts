import { offTheLow } from './handicap';
import { netCard, compareHoles, summarize } from './match';

/** Four-ball: players 0 & 1 vs 2 & 3. Each team's best (lowest) score counts. */
export function scoreBestBall(inp: { scores: number[][]; handicaps: number[]; strokeIndex: number[]; net: boolean; format: 'match' | 'stroke' }) {
  const hc = offTheLow(inp.handicaps);
  const cards = inp.scores.map((row, p) => netCard(row, hc[p], inp.strokeIndex, inp.net));
  const team = (a: number, b: number) => cards[a].map((s, h) => Math.min(s, cards[b][h]));
  const A = team(0, 1), B = team(2, 3);
  const totals = [A.reduce((x, y) => x + y, 0), B.reduce((x, y) => x + y, 0)];
  const results = compareHoles(A, B);
  const match = summarize(results);
  const winner = inp.format === 'match' ? Math.sign(match.up) : Math.sign(totals[1] - totals[0]);
  return { teamScores: [A, B], totals, results, match, winner };
}
