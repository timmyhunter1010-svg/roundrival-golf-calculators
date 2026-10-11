/** Bingo Bango Bongo: three points a hole — first on the green, closest once all are on, first in the hole. */
export type BBBHole = [number | null, number | null, number | null];

export function scoreBBB(players: number, holes: BBBHole[]) {
  const points = Array(players).fill(0);
  for (const h of holes) for (const p of h) if (p != null && p < players) points[p]++;
  return points;
}
