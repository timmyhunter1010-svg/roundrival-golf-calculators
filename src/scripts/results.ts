// Turns per-player totals into the big "Mike owes Jake $35" result.
import { settle, money } from '../lib/settle';
import type { Line } from './round';

export function settleView(names: string[], totals: number[]) {
  const t = settle(totals);
  const headline = t.length
    ? `${names[t[0].from]} owes ${names[t[0].to]} <em>${money(t[0].amount)}</em>`
    : 'All square';
  const extra = t.slice(1).map((x) => `${names[x.from]} owes ${names[x.to]} ${money(x.amount)}`);
  const lines: Line[] = names.map((n, i) => ({
    label: n,
    value: (totals[i] > 0 ? '+' : totals[i] < 0 ? '−' : '') + money(totals[i]),
    tone: totals[i] > 0 ? 'pos' : totals[i] < 0 ? 'neg' : undefined,
  }));
  return { headline, sub: extra.join(' · ') || undefined, lines };
}
