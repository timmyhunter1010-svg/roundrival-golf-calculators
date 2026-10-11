import { roundHalfUp } from './handicap';

/** USGA-recommended scramble allowances (lowest handicap first). Defaults; groups can change them. */
export const SCRAMBLE_DEFAULTS: Record<number, number[]> = {
  2: [35, 15],
  3: [20, 15, 10],
  4: [25, 20, 15, 10],
};

export function scrambleHandicap(handicaps: number[], pcts = SCRAMBLE_DEFAULTS[handicaps.length]): number {
  const sorted = [...handicaps].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, h, i) => acc + (h * (pcts[i] ?? 0)) / 100, 0);
  return roundHalfUp(sum);
}

export interface ScrambleTeam { name: string; handicaps: number[]; gross?: number }
export function rankTeams(teams: ScrambleTeam[]) {
  return teams
    .map((t) => {
      const hcp = scrambleHandicap(t.handicaps);
      return { ...t, hcp, net: t.gross == null ? null : t.gross - hcp };
    })
    .sort((a, b) => (a.net ?? Infinity) - (b.net ?? Infinity));
}
