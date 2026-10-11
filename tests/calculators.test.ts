import { describe, it, expect } from 'vitest';
import { courseHandicap, playingHandicap, offTheLow, strokesOnHole } from '../src/lib/handicap';
import { settle, money } from '../src/lib/settle';
import { scoreSkins } from '../src/lib/skins';
import { scoreNassau } from '../src/lib/nassau';
import { scoreWolf } from '../src/lib/wolf';
import { scrambleHandicap, rankTeams } from '../src/lib/scramble';

const SI4 = [1, 2, 3, 4];
const SI18 = Array.from({ length: 18 }, (_, i) => i + 1);
const PAR4 = [4, 4, 4, 4];

describe('handicaps', () => {
  it('course handicap from index, slope, rating, par', () => {
    expect(courseHandicap(10.4, 130, 71.2, 72)).toBe(11); // 11.16
    expect(courseHandicap(-2.1, 125, 73.0, 72)).toBe(-1); // plus handicap
    expect(courseHandicap(18.0, 113, 72, 72)).toBe(18);
  });
  it('allowance % and off the low', () => {
    expect(playingHandicap(15, 85)).toBe(13); // 12.75
    expect(playingHandicap(10, 85)).toBe(9); // 8.5 rounds up
    expect(offTheLow([8, 14, 3])).toEqual([5, 11, 0]);
  });
  it('18 holes: 20 handicap gets 2 on SI 1–2, 1 elsewhere', () => {
    expect(strokesOnHole(20, 1, SI18)).toBe(2);
    expect(strokesOnHole(20, 2, SI18)).toBe(2);
    expect(strokesOnHole(20, 3, SI18)).toBe(1);
    expect(strokesOnHole(0, 1, SI18)).toBe(0);
  });
  it('plus 2 gives strokes back on SI 17 and 18', () => {
    expect(strokesOnHole(-2, 18, SI18)).toBe(-1);
    expect(strokesOnHole(-2, 17, SI18)).toBe(-1);
    expect(strokesOnHole(-2, 16, SI18)).toBe(0);
  });
  it('9 holes: ranks by stroke index among holes played', () => {
    const nine = [7, 3, 15, 1, 11, 5, 17, 9, 13];
    const got = nine.map((si) => strokesOnHole(5, si, nine));
    expect(got).toEqual([1, 1, 0, 1, 0, 1, 0, 1, 0]); // SI 1,3,5,7,9
    expect(nine.map((si) => strokesOnHole(12, si, nine)).reduce((a, b) => a + b)).toBe(12);
  });
});

describe('settle up', () => {
  it('fewest lines', () => {
    expect(settle([25, -5, -20])).toEqual([
      { from: 2, to: 0, amount: 20 },
      { from: 1, to: 0, amount: 5 },
    ]);
    expect(settle([0, 0])).toEqual([]);
  });
  it('formats money', () => {
    expect(money(35)).toBe('$35');
    expect(money(-7.5)).toBe('$7.50');
  });
});

describe('skins', () => {
  const scores = [[4, 4, 5, 3], [4, 5, 4, 4], [4, 5, 5, 4]];
  const base = { scores, handicaps: [0, 0, 0], strokeIndex: SI4, par: PAR4, net: false, validate: false, value: 5 };

  it('carryovers: tie on 1 rolls into 2', () => {
    const r = scoreSkins({ ...base, carryovers: true });
    expect(r.skinsWon).toEqual([3, 1, 0]);
    expect(r.holes[1]).toMatchObject({ winner: 0, skins: 2 });
    expect(r.totals).toEqual([25, -5, -20]);
    expect(r.totals.reduce((a, b) => a + b)).toBe(0);
  });
  it('no carryovers: tied skin dies', () => {
    const r = scoreSkins({ ...base, carryovers: false });
    expect(r.skinsWon).toEqual([2, 1, 0]);
    expect(r.totals).toEqual([15, 0, -15]);
  });
  it('tie on the last hole leaves skins unclaimed', () => {
    const r = scoreSkins({ ...base, scores: [[4, 4, 4, 4], [5, 4, 4, 4]], handicaps: [0, 0], carryovers: true });
    expect(r.skinsWon).toEqual([1, 0]);
    expect(r.unclaimed).toBe(3);
  });
  it('net: a stroke on SI 1 turns a tie into a win', () => {
    const r = scoreSkins({ ...base, scores: [[4, 4, 4, 4], [4, 5, 5, 5]], handicaps: [0, 1], net: true, carryovers: false });
    expect(r.holes[0].winner).toBe(1);
    expect(r.skinsWon).toEqual([3, 1]);
  });
  it('plus handicap gives a stroke back', () => {
    // −1 player gives a stroke on SI 4 (hardest-last); their 4 becomes a net 5.
    const r = scoreSkins({ ...base, scores: [[4, 4, 4, 4], [5, 5, 5, 4]], handicaps: [-1, 0], net: true, carryovers: false });
    expect(r.holes[3].winner).toBe(1);
  });
  it('validation: a bogey cannot win a skin', () => {
    const r = scoreSkins({ ...base, scores: [[5, 4, 4, 4], [6, 4, 4, 4]], handicaps: [0, 0], validate: true, carryovers: true });
    expect(r.holes[0].winner).toBeNull();
    expect(r.unclaimed).toBe(4);
  });
});

describe('nassau', () => {
  const allFour = Array(18).fill(4);
  const stakes = { front: 10, back: 20, overall: 30 };
  const base = { handicaps: [0, 0] as [number, number], strokeIndex: SI18, net: false, stakes };

  it('wins front, halves back, wins overall', () => {
    const b = [5, 5, ...Array(16).fill(4)];
    const r = scoreNassau({ ...base, scores: [allFour, b] });
    expect(r.bets.map((x) => [x.label, x.status, x.result])).toEqual([
      ['Front 9', 2, 10], ['Back 9', 0, 0], ['Overall', 2, 30],
    ]);
    expect(r.totals).toEqual([40, -40]);
  });
  it('split nines: lose front, win back by more, win overall', () => {
    const a = [5, ...Array(8).fill(4), 3, 3, ...Array(7).fill(4)];
    const r = scoreNassau({ ...base, scores: [a, allFour] });
    expect(r.bets.map((x) => x.result)).toEqual([-10, 20, 30]);
    expect(r.totals[0]).toBe(40);
  });
  it('all square overall is a push', () => {
    const a = [5, ...Array(9).fill(4), 3, ...Array(7).fill(4)];
    const r = scoreNassau({ ...base, scores: [a, allFour] });
    expect(r.bets.map((x) => x.result)).toEqual([-10, 20, 0]);
  });
  it('net strokes off the low', () => {
    const b = [5, ...Array(17).fill(4)]; // 5 on SI 1 with a stroke is a halve
    const r = scoreNassau({ ...base, handicaps: [8, 9], net: true, scores: [allFour, b] });
    expect(r.totals).toEqual([0, 0]);
  });
});

describe('wolf', () => {
  const four = (a: number, b: number, c: number, d: number) => [[a], [b], [c], [d]];
  const base = { handicaps: [0, 0, 0, 0], strokeIndex: [1], net: false, pointValue: 1, loneMult: 2, blindMult: 3 };
  it('wolf + partner win', () => {
    const r = scoreWolf({ ...base, scores: four(4, 5, 5, 5), holes: [{ wolf: 0, pick: 2 }] });
    expect(r.points).toEqual([2, -2, 2, -2]);
  });
  it('lone wolf win pays double', () => {
    const r = scoreWolf({ ...base, scores: four(3, 4, 4, 4), holes: [{ wolf: 0, pick: 'lone' }] });
    expect(r.points).toEqual([6, -2, -2, -2]);
  });
  it('blind wolf loss pays triple', () => {
    const r = scoreWolf({ ...base, scores: four(5, 4, 5, 5), holes: [{ wolf: 0, pick: 'blind' }] });
    expect(r.points).toEqual([-9, 3, 3, 3]);
  });
  it('tie is a push; 3 players', () => {
    const r = scoreWolf({ ...base, handicaps: [0, 0, 0], scores: [[4, 4], [4, 5], [5, 5]], holes: [{ wolf: 0, pick: 'lone' }, { wolf: 1, pick: 2 }] });
    expect(r.holes[0].winner).toBe('tie');
    expect(r.points).toEqual([2, -1, -1]); // hole 2: wolf side (1,2) loses to 0
  });
});

describe('wolf skipped holes', () => {
  it('no pick: hole does not count', () => {
    const r = scoreWolf({ handicaps: [0, 0, 0], strokeIndex: [1], net: false, pointValue: 1, loneMult: 2, blindMult: 3, scores: [[3], [5], [5]], holes: [{ wolf: 0, pick: null }] });
    expect(r.holes[0].winner).toBe('skipped');
    expect(r.points).toEqual([0, 0, 0]);
  });
});

describe('scramble', () => {
  it('2-person 35/15', () => expect(scrambleHandicap([15, 5])).toBe(4)); // 1.75 + 2.25
  it('4-person 25/20/15/10', () => expect(scrambleHandicap([25, 2, 18, 10])).toBe(8)); // 7.7
  it('3-person 20/15/10', () => expect(scrambleHandicap([10, 20, 30])).toBe(8)); // 2+3+3
  it('plus handicap', () => expect(scrambleHandicap([-2, 10])).toBe(1)); // −0.7 + 1.5
  it('ranks teams by net', () => {
    const r = rankTeams([{ name: 'A', handicaps: [15, 5], gross: 64 }, { name: 'B', handicaps: [2, 4], gross: 62 }]);
    expect(r.map((t) => [t.name, t.net])).toEqual([['A', 60], ['B', 61]]);
  });
});
