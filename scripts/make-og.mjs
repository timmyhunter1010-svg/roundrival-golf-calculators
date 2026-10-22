// Renders public/og.png (link previews) and public/apple-touch-icon.png. Run: npm run og
import sharp from 'sharp';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="g" cx="100%" cy="0%" r="130%"><stop offset="0" stop-color="#134d2e"/><stop offset="1" stop-color="#0c3b23"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="160" y="120" font-family="Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="700" fill="#fff">RoundRival</text>
  <text x="80" y="300" font-family="Helvetica Neue, Arial, sans-serif" font-size="96" font-weight="800" fill="#fff" letter-spacing="-3">Golf calculators.</text>
  <text x="80" y="380" font-family="Helvetica Neue, Arial, sans-serif" font-size="40" font-weight="500" fill="#f2d98c">Skins · Nassau · Wolf · Handicaps &amp; more</text>
  <rect x="80" y="470" width="300" height="72" rx="36" fill="#e8c874"/>
  <text x="230" y="517" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" font-weight="700" fill="#0c3b23">Free. No sign-up.</text>
</svg>`;

const mark = await sharp('assets/roundrival-logo.png').resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const big = await sharp('assets/roundrival-logo.png').resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await sharp(Buffer.from(og)).composite([{ input: mark, left: 80, top: 76 }, { input: big, left: 880, top: 175 }]).png().toFile('public/og.png');
console.log('wrote public/og.png (icons: node scripts/make-icons.mjs)');
