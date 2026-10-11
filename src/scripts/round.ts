// Step-by-step flow shared by the hole-by-hole calculators:
// Players → Game → Scores → Result. Nothing is stored; it all lives in this page.
import { DEFAULT_PAR_18, DEFAULT_SI_18, courseHandicap, playingHandicap } from '../lib/handicap';
import { track } from './track';
import { shareReceipt } from './share';

export interface Player { name: string; hcp: number }
export interface Round { players: Player[]; holes: number; par: number[]; si: number[]; scores: number[][]; hole: number; touched: boolean[] }
export type Settings = Record<string, string | number | boolean>;
export interface Line { label: string; value: string; tone?: 'pos' | 'neg' }
export interface View { headline: string; sub?: string; lines: Line[]; note?: string }

export interface Options {
  min: number;
  max: number;
  start: number;
  fixedHoles?: number;
  compute(r: Round, s: Settings, hcps: number[]): View;
  /** Extra per-hole controls (wolf picks). */
  holeExtra?(r: Round, h: number, el: HTMLElement, redraw: () => void): void;
}

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const nameOf = (r: Round, i: number) => r.players[i].name.trim() || `Player ${i + 1}`;
const showHcp = (h: number) => (h < 0 ? '+' + Math.abs(h) : String(h));
const parseHcp = (s: string) => {
  const t = s.trim();
  const n = parseFloat(t.replace('+', ''));
  if (!isFinite(n)) return 0;
  return t.startsWith('+') ? -Math.abs(n) : n;
};

export function readSettings(form: HTMLFormElement): Settings {
  const out: Settings = {};
  for (const el of Array.from(form.elements) as HTMLInputElement[]) {
    if (!el.name) continue;
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else if (el.type === 'number' || el.inputMode === 'decimal') out[el.name] = parseFloat(el.value) || 0;
    else out[el.name] = el.value;
  }
  return out;
}

/** Handicaps actually used: optional Index → Course Handicap, then allowance %. */
export function playingHcps(r: Round, s: Settings): number[] {
  return r.players.map((p) => {
    const ch = s.hcpType === 'index'
      ? courseHandicap(p.hcp, Number(s.slope) || 113, Number(s.rating) || 72, Number(s.coursePar) || 72)
      : Math.round(p.hcp);
    return playingHandicap(ch, Number(s.allowance) || 100);
  });
}

export function initSegs(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-seg]').forEach((seg) => {
    const input = seg.querySelector<HTMLInputElement>('input[type=hidden]')!;
    seg.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.value === input.value));
      b.addEventListener('click', () => {
        input.value = b.value;
        seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  });
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const src = document.getElementById(el.dataset.reveal!) as HTMLInputElement;
    const want = el.dataset.when;
    const sync = () => { el.hidden = want ? src.value !== want : !src.checked; };
    src.addEventListener('change', sync); sync();
  });
}

export function renderView(el: HTMLElement, v: View) {
  el.innerHTML = `
    <div class="result-big">${v.headline}</div>
    ${v.sub ? `<p class="result-sub">${esc(v.sub)}</p>` : ''}
    <ul class="lines">${v.lines.map((l) => `<li><span>${esc(l.label)}</span><b class="${l.tone ?? ''}">${esc(l.value)}</b></li>`).join('')}</ul>
    ${v.note ? `<p class="note">${esc(v.note)}</p>` : ''}`;
}

export function mountRound(o: Options) {
  const root = $('#flow');
  const form = $<HTMLFormElement>('#game');
  const r: Round = {
    players: Array.from({ length: o.start }, () => ({ name: '', hcp: 0 })),
    holes: o.fixedHoles ?? 18, par: [], si: [], scores: [], hole: 0, touched: [],
  };
  let step = 0;
  let view: View | null = null;
  initSegs(form);

  const steps = Array.from(root.querySelectorAll<HTMLElement>('.step'));
  const dots = Array.from(root.querySelectorAll<HTMLElement>('.dots span'));
  const go = (n: number, scroll = true) => {
    step = n;
    steps.forEach((s, i) => s.classList.toggle('on', i === n));
    dots.forEach((d, i) => d.classList.toggle('on', i <= n));
    if (n === 2) drawHole();
    if (n === 3) drawResult();
    if (scroll) window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
  };

  // ---------- Players ----------
  const list = $('#players');
  const drawPlayers = () => {
    list.innerHTML = r.players.map((p, i) => `
      <div class="row">
        <div class="grow"><input class="name" data-i="${i}" placeholder="Player ${i + 1}" value="${esc(p.name)}" autocomplete="off" enterkeyhint="next" maxlength="16" /></div>
        <div><div class="cap" style="text-align:center">Hcp</div>
          <div class="stepper sm"><button type="button" data-h="${i}" data-d="-1" aria-label="Lower handicap">−</button>
          <input class="val" data-hi="${i}" inputmode="decimal" value="${showHcp(p.hcp)}" aria-label="Handicap ${i + 1}" />
          <button type="button" data-h="${i}" data-d="1" aria-label="Raise handicap">+</button></div></div>
      </div>`).join('');
    $('#addp').hidden = r.players.length >= o.max;
    $('#remp').hidden = r.players.length <= o.min;
  };
  list.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.i) r.players[+t.dataset.i].name = t.value;
  });
  list.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.hi) { r.players[+t.dataset.hi].hcp = parseHcp(t.value); t.value = showHcp(r.players[+t.dataset.hi].hcp); }
  });
  list.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-h]');
    if (!b) return;
    const p = r.players[+b.dataset.h!];
    p.hcp = Math.max(-10, Math.min(54, Math.round(p.hcp) + +b.dataset.d!));
    (b.parentElement!.querySelector('.val') as HTMLInputElement).value = showHcp(p.hcp);
  });
  $('#addp').addEventListener('click', () => { r.players.push({ name: '', hcp: 0 }); drawPlayers(); });
  $('#remp').addEventListener('click', () => { r.players.pop(); drawPlayers(); });
  drawPlayers();

  // ---------- Holes ----------
  const setupHoles = () => {
    const s = readSettings(form);
    const n = o.fixedHoles ?? (Number(s.holes) || 18);
    if (n !== r.holes || r.par.length !== n) {
      r.holes = n;
      r.par = DEFAULT_PAR_18.slice(0, n);
      r.si = DEFAULT_SI_18.slice(0, n);
      r.touched = Array(n).fill(false);
      r.hole = 0;
    }
    r.scores = r.players.map((_, p) => Array.from({ length: n }, (_, h) => r.scores[p]?.[h] ?? r.par[h]));
  };

  const holeEl = $('#hole');
  const drawHole = () => {
    const h = r.hole;
    const last = h === r.holes - 1;
    holeEl.innerHTML = `
      <div class="holehead">
        <div class="holeno">${h + 1}<small> / ${r.holes}</small></div>
        <div class="holemeta">
          <div><div class="cap">Par</div><div class="stepper sm"><button type="button" data-meta="par" data-d="-1" aria-label="Lower par">−</button><span class="val">${r.par[h]}</span><button type="button" data-meta="par" data-d="1" aria-label="Raise par">+</button></div></div>
          <div><div class="cap">Hcp</div><div class="stepper sm"><button type="button" data-meta="si" data-d="-1" aria-label="Lower hole handicap">−</button><span class="val">${r.si[h]}</span><button type="button" data-meta="si" data-d="1" aria-label="Raise hole handicap">+</button></div></div>
        </div>
      </div>
      ${r.players.map((_, p) => `
        <div class="row"><span class="lbl">${esc(nameOf(r, p))}</span>
          <div class="stepper"><button type="button" data-p="${p}" data-d="-1" aria-label="Lower score">−</button><span class="val">${r.scores[p][h]}</span><button type="button" data-p="${p}" data-d="1" aria-label="Raise score">+</button></div>
        </div>`).join('')}
      <div id="extra"></div>
      <div class="actions">
        <button type="button" class="btn btn-soft" id="prev">${h === 0 ? 'Back' : '←'}</button>
        <button type="button" class="btn btn-primary" id="next">${last ? 'See result' : 'Next hole'}</button>
      </div>`;
    if (o.holeExtra) o.holeExtra(r, h, $('#extra', holeEl), drawHole);
    $('#prev', holeEl).onclick = () => { if (h === 0) go(1); else { r.hole--; drawHole(); } };
    $('#next', holeEl).onclick = () => { r.touched[h] = true; if (last) go(3); else { r.hole++; drawHole(); } };
  };
  holeEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-d]');
    if (!b) return;
    const h = r.hole, d = +b.dataset.d!;
    if (b.dataset.p) {
      const p = +b.dataset.p;
      r.scores[p][h] = Math.max(1, Math.min(15, r.scores[p][h] + d));
    } else if (b.dataset.meta === 'par') {
      const old = r.par[h];
      r.par[h] = Math.max(3, Math.min(6, old + d));
      if (!r.touched[h]) r.scores.forEach((row) => (row[h] = r.par[h]));
    } else if (b.dataset.meta === 'si') {
      r.si[h] = ((r.si[h] - 1 + d + 18) % 18) + 1;
    } else return;
    drawHole();
  });

  // ---------- Result ----------
  const resEl = $('#result');
  const drawResult = () => {
    const s = readSettings(form);
    view = o.compute(r, s, playingHcps(r, s));
    renderView(resEl, view);
    track('Calculator Completed');
  };
  $('#share').addEventListener('click', () => { if (view) { track('Share Tapped'); shareReceipt(view); } });
  $('#edit').addEventListener('click', () => { r.hole = 0; go(2); });
  $('#again').addEventListener('click', () => { r.scores = []; r.par = []; r.hole = 0; go(0); });

  root.querySelectorAll<HTMLButtonElement>('[data-go]').forEach((b) => b.addEventListener('click', () => {
    const n = +b.dataset.go!;
    if (n === 2) setupHoles();
    go(n);
  }));
  go(0, false);
}
