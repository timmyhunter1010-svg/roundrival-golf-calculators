// Turns per-player totals into the fewest "A owes B $x" lines.

export interface Transfer { from: number; to: number; amount: number }

const cents = (x: number) => Math.round(x * 100) / 100;

export function settle(totals: number[]): Transfer[] {
  const people = totals.map((v, i) => ({ i, v: cents(v) }));
  const owe = people.filter((p) => p.v < 0).sort((a, b) => a.v - b.v);
  const get = people.filter((p) => p.v > 0).sort((a, b) => b.v - a.v);
  const out: Transfer[] = [];
  let a = 0, b = 0;
  while (a < owe.length && b < get.length) {
    const amt = cents(Math.min(-owe[a].v, get[b].v));
    if (amt > 0) out.push({ from: owe[a].i, to: get[b].i, amount: amt });
    owe[a].v = cents(owe[a].v + amt);
    get[b].v = cents(get[b].v - amt);
    if (owe[a].v === 0) a++;
    if (get[b].v === 0) b++;
  }
  return out;
}

export function money(x: number): string {
  const v = Math.abs(cents(x));
  return '$' + (Number.isInteger(v) ? v.toString() : v.toFixed(2));
}
