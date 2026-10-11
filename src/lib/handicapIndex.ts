// World Handicap System: Handicap Index from score differentials.

/** Score Differential = (113 ÷ Slope) × (Adjusted Gross Score − Course Rating), to one decimal. */
export function differential(score: number, rating: number, slope: number): number {
  return Math.round((113 / slope) * (score - rating) * 10) / 10;
}

/** How many of the lowest differentials count, and the adjustment, by number of rounds. */
const TABLE: Record<number, [number, number]> = {
  3: [1, -2], 4: [1, -1], 5: [1, 0], 6: [2, -1], 7: [2, 0], 8: [2, 0],
  9: [3, 0], 10: [3, 0], 11: [3, 0], 12: [4, 0], 13: [4, 0], 14: [4, 0],
  15: [5, 0], 16: [5, 0], 17: [6, 0], 18: [6, 0], 19: [7, 0], 20: [8, 0],
};

export function handicapIndex(diffs: number[]): { index: number; used: number[] } | null {
  const recent = diffs.slice(-20);
  if (recent.length < 3) return null;
  const [count, adj] = TABLE[recent.length];
  const used = [...recent].sort((a, b) => a - b).slice(0, count);
  const avg = used.reduce((a, b) => a + b, 0) / count;
  const index = Math.min(54, Math.round((avg + adj) * 10) / 10);
  return { index: index || 0, used };
}
