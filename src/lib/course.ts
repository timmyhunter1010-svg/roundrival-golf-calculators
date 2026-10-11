// Course scorecards from OpenGolfAPI (open data, ODbL) and how a round's holes are laid out.
import { DEFAULT_PAR_18, DEFAULT_SI_18 } from './handicap';

export interface Tee { name: string; gender: string; rating: number; slope: number; par: number }
export interface Course {
  id: string;
  name: string;
  place: string;
  /** One entry per hole on the course (9 or 18). null when the course has no scorecard. */
  par: number[] | null;
  si: number[] | null;
  tees: Tee[];
}

/** Turns an OpenGolfAPI course-detail response into what the calculators need. */
export function parseCourse(d: any): Course {
  const holes = [...(d.holes_data ?? [])].sort((a, b) => a.number - b.number);
  const okPar = holes.length >= 9 && holes.every((h) => h.par >= 3 && h.par <= 6);
  const siVals = holes.map((h) => h.handicap_index);
  const okSi = okPar && siVals.every((v) => Number.isInteger(v) && v >= 1 && v <= 18)
    && new Set(siVals).size === siVals.length;
  return {
    id: d.id,
    name: d.course_name || d.name || 'Course',
    place: [d.city, d.state].filter(Boolean).join(', '),
    par: okPar ? holes.map((h) => h.par) : null,
    si: okSi ? siVals : null,
    tees: (d.tees ?? [])
      .filter((t: any) => t.slope && t.course_rating)
      .map((t: any) => ({ name: t.tee_name, gender: t.gender ?? '', rating: t.course_rating, slope: t.slope, par: t.par ?? d.par ?? 72 })),
  };
}

export type HoleMode = '18' | 'front' | 'back';
export interface Layout { par: number[]; si: number[]; start: number }

/**
 * The holes being played. A 9-hole course played as 18 goes around twice:
 * hole handicaps become odd on the first trip and even on the second.
 */
export function layoutHoles(course: Pick<Course, 'par' | 'si'> | null, mode: HoleMode): Layout {
  let par = course?.par ?? DEFAULT_PAR_18;
  let si = course?.par ? course.si ?? defaultSi(course.par.length) : DEFAULT_SI_18;
  if (par.length === 9) {
    if (mode !== '18') return { par: [...par], si: rank(si), start: 0 };
    return { par: [...par, ...par], si: [...rank(si).map((s) => s * 2 - 1), ...rank(si).map((s) => s * 2)], start: 0 };
  }
  if (mode === 'front') return { par: par.slice(0, 9), si: si.slice(0, 9), start: 0 };
  if (mode === 'back') return { par: par.slice(9, 18), si: si.slice(9, 18), start: 9 };
  return { par: [...par], si: [...si], start: 0 };
}

/** Re-numbers stroke indexes 1..n by difficulty (9-hole cards often use odd or 1–18 values). */
function rank(si: number[]): number[] {
  const order = [...si].sort((a, b) => a - b);
  return si.map((s) => order.indexOf(s) + 1);
}

function defaultSi(n: number): number[] {
  return n === 9 ? rank(DEFAULT_SI_18.slice(0, 9)) : DEFAULT_SI_18.slice(0, n);
}
