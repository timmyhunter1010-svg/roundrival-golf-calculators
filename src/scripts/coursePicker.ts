// Course search on the Game step. Talks straight to OpenGolfAPI from the browser (free, no key).
import { parseCourse, type Course } from '../lib/course';

const API = 'https://api.opengolfapi.org';
const cache = new Map<string, unknown>();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

async function getJson(url: string, signal?: AbortSignal) {
  if (cache.has(url)) return cache.get(url);
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(String(r.status));
  const j = await r.json();
  cache.set(url, j);
  return j;
}

export function mountCoursePicker(form: HTMLFormElement, onPick: (c: Course | null) => void) {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const q = $<HTMLInputElement>('cq'), res = $('cres'), search = $('csearch'), picked = $('cpicked');
  const tees = document.getElementById('ctees'), note = $('cnote');
  let timer = 0, ctl: AbortController | null = null;
  let current: Course | null = null;

  const msg = (t: string) => { res.innerHTML = `<li class="msg">${t}</li>`; };

  q.addEventListener('input', () => {
    clearTimeout(timer);
    const text = q.value.trim();
    if (text.length < 3) { res.innerHTML = ''; return; }
    timer = window.setTimeout(async () => {
      ctl?.abort(); ctl = new AbortController();
      msg('Searching…');
      try {
        const j: any = await getJson(`${API}/v1/courses/search?q=${encodeURIComponent(text)}`, ctl.signal);
        const list = (j.courses ?? []).sort((a: any, b: any) => Number(!a.city) - Number(!b.city)).slice(0, 8);
        if (!list.length) return msg('No courses found. Skip this and use a standard card.');
        res.innerHTML = list.map((c: any) => `<li><button type="button" data-id="${esc(c.id)}"><b>${esc(c.name || c.course_name)}</b><span>${esc([c.city, c.state].filter(Boolean).join(', '))}</span></button></li>`).join('');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') msg('Course search is busy. Try again, or skip it.');
      }
    }, 300);
  });

  res.addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-id]');
    if (!b) return;
    msg('Loading scorecard…');
    try {
      const c = parseCourse(await getJson(`${API}/api/v1/courses/${encodeURIComponent(b.dataset.id!)}`));
      show(c);
    } catch { msg('Couldn’t load that course. Try another, or skip it.'); }
  });

  const setField = (name: string, v: number) => {
    const el = form.elements.namedItem(name) as HTMLInputElement | null;
    if (el) el.value = String(v);
  };

  function show(c: Course) {
    res.innerHTML = ''; q.value = '';
    search.hidden = true; picked.hidden = false;
    $('cname').textContent = c.name;
    $('cplace').textContent = c.place;
    if (tees) tees.innerHTML = c.tees.map((t, i) => `<button type="button" class="chip" data-t="${i}" aria-pressed="false">${esc(t.name)}<small>${t.rating}/${t.slope}${t.gender === 'Female' ? ' · W' : ''}</small></button>`).join('');
    if (tees) tees.hidden = !c.tees.length;
    note.hidden = !!(c.par && c.si);
    note.textContent = !c.par ? 'No scorecard for this course yet. Using a standard card; edit par on each hole.'
      : 'No hole handicaps for this course. Using a standard order; edit on each hole.';
    current = c;
    onPick(c);
    if (c.tees[0]) pickTee(c, 0); else form.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function pickTee(c: Course, i: number) {
    const t = c.tees[i];
    tees?.querySelectorAll('button').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
    setField('slope', t.slope); setField('rating', t.rating); setField('coursePar', t.par);
    form.dispatchEvent(new Event('input', { bubbles: true }));
  }

  tees?.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-t]');
    if (b && current) pickTee(current, +b.dataset.t!);
  });

  $('cchange').addEventListener('click', () => {
    picked.hidden = true; search.hidden = false; current = null; onPick(null); q.focus();
    form.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
