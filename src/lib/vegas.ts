/**
 * Vegas: players 0 & 1 vs 2 & 3. Each team's two scores make a number, low digit first
 * (4 and 5 → 45). A score of 10+ goes first (4 and 10 → 104). Birdie flip: if a team
 * makes a birdie, the other team's number is written high first (4 and 5 → 54).
 */
export function teamNumber(a: number, b: number, flipped: boolean): number {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const first = hi >= 10 || flipped ? hi : lo;
  const second = first === hi ? lo : hi;
  return Number(`${first}${second}`);
}

export function scoreVegas(inp: { scores: number[][]; par: number[]; birdieFlip: boolean }) {
  const holes = inp.par.map((par, h) => {
    const s = inp.scores.map((row) => row[h]);
    const birdieA = Math.min(s[0], s[1]) < par, birdieB = Math.min(s[2], s[3]) < par;
    const a = teamNumber(s[0], s[1], inp.birdieFlip && birdieB);
    const b = teamNumber(s[2], s[3], inp.birdieFlip && birdieA);
    return { a, b, diff: b - a };
  });
  /** Points won by team A (negative = team B). */
  const net = holes.reduce((x, y) => x + y.diff, 0);
  return { holes, net };
}
