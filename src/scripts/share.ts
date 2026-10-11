// Draws a branded receipt image of the result and opens the share sheet (or downloads it).
import type { View } from './round';
import { SITE_URL } from '../config';

const W = 1080, H = 1350;
const strip = (html: string) => html.replace(/<br\/?>/g, ' ').replace(/<[^>]+>/g, '');

function fit(ctx: CanvasRenderingContext2D, text: string, max: number, size: number, weight = 800) {
  let s = size;
  do { ctx.font = `${weight} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`; s -= 2; }
  while (ctx.measureText(text).width > max && s > 20);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(' ');
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > max && line) { out.push(line); line = w; } else line = t;
  }
  if (line) out.push(line);
  return out;
}

export function drawReceipt(v: View): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(W, 0, 100, W, 0, 1500);
  g.addColorStop(0, '#134d2e'); g.addColorStop(1, '#0c3b23');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const title = document.querySelector('h1')?.textContent?.replace(/\s*\(.*\)/, '') ?? 'Golf Calculator';
  ctx.fillStyle = '#e8c874';
  ctx.font = '700 34px -apple-system, system-ui, sans-serif';
  ctx.fillText(title.toUpperCase(), 80, 130);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 92px -apple-system, system-ui, sans-serif';
  const head = wrap(ctx, strip(v.headline), W - 160);
  let y = 260;
  for (const l of head.slice(0, 3)) { fit(ctx, l, W - 160, 92); ctx.fillText(l, 80, y); y += 104; }
  if (v.sub) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '500 36px -apple-system, system-ui, sans-serif'; ctx.fillText(v.sub, 80, y + 4); y += 60; }

  y += 30;
  const rows = v.lines.slice(0, 11);
  for (const l of rows) {
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(W - 80, y); ctx.stroke();
    y += 58;
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    fit(ctx, l.label, W - 420, 36, 500); ctx.fillText(l.label, 80, y);
    ctx.fillStyle = l.tone === 'neg' ? '#f2b8a8' : '#f2d98c';
    ctx.font = '700 36px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'right'; ctx.fillText(l.value, W - 80, y); ctx.textAlign = 'left';
    y += 28;
  }
  if (v.lines.length > rows.length) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '500 30px system-ui'; ctx.fillText(`+${v.lines.length - rows.length} more`, 80, y + 40); }

  // Crop to the content (never shorter than a square), then add the gold footer.
  const h = Math.max(1080, Math.min(H, y + 110 + 150));
  const out = document.createElement('canvas');
  out.width = W; out.height = h;
  const o = out.getContext('2d')!;
  o.drawImage(c, 0, 0);
  o.fillStyle = '#e8c874'; o.fillRect(0, h - 150, W, 150);
  o.fillStyle = '#0c3b23';
  o.font = '800 40px -apple-system, system-ui, sans-serif';
  o.fillText('Scored with RoundRival', 80, h - 82);
  o.font = '600 30px -apple-system, system-ui, sans-serif';
  o.fillText(SITE_URL.replace('https://', ''), 80, h - 38);
  return out;
}

export async function shareReceipt(v: View) {
  const blob: Blob | null = await new Promise((res) => drawReceipt(v).toBlob(res, 'image/png'));
  if (!blob) return;
  const file = new File([blob], 'roundrival-result.png', { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  const mobile = matchMedia('(pointer: coarse)').matches;
  if (mobile && nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file] }); return; }
    catch (e) { if ((e as Error).name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
