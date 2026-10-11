// Renders public/og.png (link previews) and public/apple-touch-icon.png. Run: npm run og
import sharp from 'sharp';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="g" cx="100%" cy="0%" r="130%"><stop offset="0" stop-color="#134d2e"/><stop offset="1" stop-color="#0c3b23"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="80" y="86" width="44" height="44" rx="12" fill="#f7f5ee"/><circle cx="102" cy="108" r="9" fill="#e8c874"/>
  <text x="140" y="120" font-family="Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="700" fill="#fff">RoundRival</text>
  <text x="80" y="300" font-family="Helvetica Neue, Arial, sans-serif" font-size="96" font-weight="800" fill="#fff" letter-spacing="-3">Golf calculators.</text>
  <text x="80" y="380" font-family="Helvetica Neue, Arial, sans-serif" font-size="40" font-weight="500" fill="#f2d98c">Skins · Nassau · Wolf · Scramble</text>
  <rect x="80" y="470" width="300" height="72" rx="36" fill="#e8c874"/>
  <text x="230" y="517" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" font-weight="700" fill="#0c3b23">Free. No sign-up.</text>
</svg>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="180" height="180" fill="#0c3b23"/><circle cx="90" cy="90" r="34" fill="#e8c874"/></svg>`;

await sharp(Buffer.from(og)).png().toFile('public/og.png');
await sharp(Buffer.from(icon)).png().toFile('public/apple-touch-icon.png');
console.log('wrote public/og.png, public/apple-touch-icon.png');
