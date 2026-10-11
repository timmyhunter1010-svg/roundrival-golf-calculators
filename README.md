# RoundRival Golf Calculators

Free, no-login golf calculators (Skins, Nassau, Wolf, Scramble) that send visitors to RoundRival.
Standalone project: no shared code, data, keys, or database with the RoundRival app.

- `npm run dev`: local site
- `npm test`: scoring tests
- `npm run build`: static site in `dist/`
- `npm run og`: regenerate `public/og.png` and the touch icon

Where every main button goes is set in `src/config.ts` (`LANDING_URL` now, `APP_STORE_URL` / `APP_STORE_ID` later).
Analytics turns on when `PLAUSIBLE_DOMAIN` is set there.
