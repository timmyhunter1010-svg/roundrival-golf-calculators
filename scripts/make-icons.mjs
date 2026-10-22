// Builds the site icons (browser tab, Google results, iPhone home screen) from the RoundRival logo.
// Run: node scripts/make-icons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const GREEN = '#0c3b23';
const logo = 'assets/roundrival-logo.png';

async function icon(size, { rounded = false, pad = 0.14 } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(logo).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const r = rounded ? Math.round(size * 0.22) : 0;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="${GREEN}"/></svg>`);
  return sharp(bg).composite([{ input: mark, gravity: 'center' }]).png().toBuffer();
}

const out = {
  'public/favicon-48.png': await icon(48, { rounded: true, pad: 0.1 }),
  'public/favicon-96.png': await icon(96, { rounded: true, pad: 0.1 }),
  'public/favicon-192.png': await icon(192, { rounded: true }),
  'public/icon-512.png': await icon(512, { rounded: true }),
  'public/apple-touch-icon.png': await icon(180), // iOS rounds the corners itself
};
for (const [p, buf] of Object.entries(out)) writeFileSync(p, buf);

// favicon.ico (PNG-in-ICO, 48px) for crawlers that ask for /favicon.ico.
const png = out['public/favicon-48.png'];
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(48, 6); head.writeUInt8(48, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9);
head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([head, png]));
console.log('icons written');
