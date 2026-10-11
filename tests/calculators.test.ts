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

import { parseCourse, layoutHoles } from '../src/lib/course';

describe('course scorecards', () => {
  const pebble = {
    id: 'x', course_name: 'Pebble Beach Golf Links', city: 'Pebble Beach', state: 'CA', par: 72,
    tees: [{ tee_name: 'Blue', gender: 'Male', course_rating: 74.9, slope: 144, par: 72 }, { tee_name: 'Junk', slope: null }],
    holes_data: [4, 5, 4, 4, 3, 5, 3, 4, 4, 4, 4, 3, 4, 5, 4, 4, 3, 5].map((par, i) => ({
      number: i + 1, par, handicap_index: [6, 10, 12, 16, 14, 2, 18, 4, 8, 3, 5, 17, 7, 1, 13, 11, 15, 9][i],
    })).reverse(),
  };
  it('reads par, hole handicaps, and tees', () => {
    const c = parseCourse(pebble);
    expect(c.name).toBe('Pebble Beach Golf Links');
    expect(c.place).toBe('Pebble Beach, CA');
    expect(c.par!.slice(0, 3)).toEqual([4, 5, 4]);
    expect(c.si!.slice(0, 3)).toEqual([6, 10, 12]);
    expect(c.par!.reduce((a, b) => a + b)).toBe(72);
    expect(c.tees).toEqual([{ name: 'Blue', gender: 'Male', rating: 74.9, slope: 144, par: 72 }]);
  });
  it('no scorecard → null; par but bad handicaps → par only', () => {
    expect(parseCourse({ id: 'y', course_name: 'Z' }).par).toBeNull();
    const c = parseCourse({ id: 'y', holes_data: pebble.holes_data.map((h) => ({ ...h, handicap_index: null })) });
    expect(c.par).not.toBeNull();
    expect(c.si).toBeNull();
  });
  it('front and back nine', () => {
    const c = parseCourse(pebble);
    expect(layoutHoles(c, 'back')).toMatchObject({ start: 9, par: [4, 4, 3, 4, 5, 4, 4, 3, 5] });
    expect(layoutHoles(c, 'front').si).toEqual([6, 10, 12, 16, 14, 2, 18, 4, 8]);
  });
  it('9-hole course played as 18 goes around twice', () => {
    const l = layoutHoles({ par: [4, 4, 3, 5, 4, 4, 3, 4, 5], si: [1, 3, 5, 7, 9, 11, 13, 15, 17] }, '18');
    expect(l.par).toHaveLength(18);
    expect(l.si.slice(0, 3)).toEqual([1, 3, 5]);
    expect(l.si.slice(9, 12)).toEqual([2, 4, 6]);
    expect(layoutHoles({ par: [4, 4, 3, 5, 4, 4, 3, 4, 5], si: [1, 3, 5, 7, 9, 11, 13, 15, 17] }, 'front').si).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('no course: standard layout', () => {
    expect(layoutHoles(null, '18').par).toHaveLength(18);
    expect(layoutHoles(null, 'back').start).toBe(9);
  });
});

import { summarize, holeResults } from '../src/lib/match';
import { stablefordPoints, scoreStableford } from '../src/lib/stableford';
import { scoreBestBall } from '../src/lib/bestball';
import { teamNumber, scoreVegas } from '../src/lib/vegas';
import { scoreBBB } from '../src/lib/bbb';
import { differential, handicapIndex } from '../src/lib/handicapIndex';
import { pairwise } from '../src/lib/settle';

describe('match play', () => {
  it('3 & 2 when 3 up with 2 to play', () => {
    const r = [1, 1, 0, 1, ...Array(12).fill(0), 0, 0];
    expect(summarize(r)).toMatchObject({ up: 3, closedOn: 16, score: '3 & 2' });
  });
  it('goes the distance: 1 up, all square', () => {
    expect(summarize([...Array(17).fill(0), 1]).score).toBe('1 up');
    expect(summarize([1, -1, ...Array(16).fill(0)]).score).toBe('All square');
  });
  it('2 up on the last hole is "2 up", not "2 & 0"', () => {
    expect(summarize([...Array(16).fill(0), 1, 1]).score).toBe('2 up');
  });
  it('9-hole match closed early', () => {
    expect(summarize([-1, -1, -1, -1, -1, 0, 0, 0, 0])).toMatchObject({ up: -5, closedOn: 5, score: '5 & 4' });
  });
  it('net strokes off the low', () => {
    const r = holeResults({ scores: [[4, 4], [5, 5]], handicaps: [10, 11], strokeIndex: [1, 2], net: true });
    expect(r).toEqual([0, 1]);
  });
});

describe('stableford', () => {
  it('standard points', () => {
    expect([-3, -2, -1, 0, 1, 2, 3].map((d) => stablefordPoints(d))).toEqual([5, 4, 3, 2, 1, 0, 0]);
  });
  it('modified points', () => {
    expect([-3, -2, -1, 0, 1, 2, 4].map((d) => stablefordPoints(d, 'modified'))).toEqual([8, 5, 2, 0, -1, -3, -3]);
  });
  it('net: a stroke turns bogey into a net par', () => {
    const r = scoreStableford({ scores: [[5, 4]], handicaps: [1], strokeIndex: [1, 2], par: [4, 4], net: true, kind: 'standard' });
    expect(r.points).toEqual([4]);
  });
  it('points settle pairwise', () => {
    expect(pairwise([36, 30, 30], 1)).toEqual([12, -6, -6]);
    expect(pairwise([10, 10], 5)).toEqual([0, 0]);
  });
});

describe('best ball', () => {
  const si = [1, 2, 3];
  it('match: team best ball each hole', () => {
    const r = scoreBestBall({ scores: [[4, 5, 4], [5, 4, 5], [5, 5, 4], [5, 5, 5]], handicaps: [0, 0, 0, 0], strokeIndex: si, net: false, format: 'match' });
    expect(r.teamScores).toEqual([[4, 4, 4], [5, 5, 4]]);
    expect(r.match.score).toBe('2 & 1');
    expect(r.winner).toBe(1);
  });
  it('stroke: lower team total wins; tie is 0', () => {
    const r = scoreBestBall({ scores: [[4, 4], [4, 4], [4, 4], [4, 4]], handicaps: [0, 0, 0, 0], strokeIndex: [1, 2], net: false, format: 'stroke' });
    expect(r.winner).toBe(0);
  });
  it('net off the low of all four', () => {
    const card = (first: number) => [first, ...Array(17).fill(4)];
    const r = scoreBestBall({ scores: [card(4), card(6), card(5), card(6)], handicaps: [2, 10, 3, 9], strokeIndex: SI18, net: true, format: 'match' });
    // off the low: 0, 8, 1, 7 → one stroke each on SI 1 except the low man → A: min(4, 5) = 4, B: min(4, 5) = 4
    expect(r.results[0]).toBe(0);
  });
});

describe('vegas', () => {
  it('team numbers', () => {
    expect(teamNumber(5, 4, false)).toBe(45);
    expect(teamNumber(4, 10, false)).toBe(104);
    expect(teamNumber(4, 5, true)).toBe(54);
    expect(teamNumber(4, 4, true)).toBe(44);
  });
  it('birdie flips the other team', () => {
    const r = scoreVegas({ scores: [[3], [5], [4], [5]], par: [4], birdieFlip: true });
    expect(r.holes[0]).toEqual({ a: 35, b: 54, diff: 19 });
    const off = scoreVegas({ scores: [[3], [5], [4], [5]], par: [4], birdieFlip: false });
    expect(off.net).toBe(10);
  });
});

describe('bingo bango bongo', () => {
  it('counts points, skips blanks', () => {
    expect(scoreBBB(3, [[0, 1, 0], [2, null, 2], [1, 1, 1]])).toEqual([2, 4, 2]);
  });
});

describe('handicap index (WHS)', () => {
  it('differential', () => {
    expect(differential(85, 72.1, 128)).toBe(11.4); // 113/128 × 12.9 = 11.39
    expect(differential(70, 72.0, 113)).toBe(-2);
  });
  it('needs 3 rounds; 3 rounds = lowest 1 minus 2', () => {
    expect(handicapIndex([10, 12])).toBeNull();
    expect(handicapIndex([10, 12, 15])!.index).toBe(8);
  });
  it('20 rounds: average of lowest 8', () => {
    const d = [5, 6, 7, 8, 9, 10, 11, 12, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
    expect(handicapIndex(d)!.index).toBe(8.5);
  });
  it('only the most recent 20 count', () => {
    const d = [0, ...Array(20).fill(10)];
    expect(handicapIndex(d)!.index).toBe(10);
  });
  it('6 rounds: lowest 2 minus 1', () => {
    expect(handicapIndex([10, 11, 20, 20, 20, 20])!.index).toBe(9.5);
  });
});
