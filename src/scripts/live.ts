// Single-screen calculators (Scramble): recompute on every change.
import { renderView, readSettings, initSegs, type View, type Settings } from './round';
import { shareReceipt } from './share';
import { track } from './track';

export function mountLive(compute: (s: Settings) => View) {
  const form = document.querySelector<HTMLFormElement>('#game')!;
  const out = document.querySelector<HTMLElement>('#result')!;
  let view: View;
  let tracked = false;
  initSegs(form);
  const run = () => { view = compute(readSettings(form)); renderView(out, view); };
  form.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-stepper] button');
    if (!b) return;
    const input = b.parentElement!.querySelector<HTMLInputElement>('input')!;
    const v = (parseInt(input.value) || 0) + +b.dataset.d!;
    input.value = String(Math.max(+input.dataset.min!, Math.min(+input.dataset.max!, v)));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  form.addEventListener('input', () => {
    run();
    if (!tracked) { tracked = true; track('Calculator Completed'); }
  });
  form.addEventListener('change', run);
  document.querySelector('#share')!.addEventListener('click', () => { track('Share Tapped'); shareReceipt(view); });
  run();
  return run;
}
