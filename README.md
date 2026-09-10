# Division Drop

Kid-friendly falling-block PWA that practices **3rd-grade division**. Math is a voluntary power-up — she can still play by only moving pieces.

**Live:** https://josephschneider77-sys.github.io/division-drop/

## Play on Android (phone or tablet)

1. Open the live URL in **Chrome**.
2. Tap **⋮** (menu) → **Add to Home screen** or **Install app**.
3. Launch from the home screen like a normal app (portrait works best).
4. Big on-screen controls; swipe left/right on the board, tap to rotate, swipe down to drop.

No accounts, no ads, no tracking. Progress (high score, level, unlocked fact families) stays in local storage on the device.

## How math power-ups work

- Some falling pieces show a yellow **÷** badge.
- Tap the glowing **÷** button (or press Enter on a keyboard) to open a division problem.
- **Correct answer:** satisfying cluster clear + points + a short slow-mo moment.
- **Wrong answer:** soft fail — brief shake, piece keeps falling, game continues.
- **Skip** anytime and keep stacking. Math is an advantage, not a gate.

### Curriculum (unlocks as she plays)

1. ÷2, ÷5, ÷10  
2. ÷3, ÷4, ÷6  
3. ÷7, ÷8, ÷9  
4. 2-digit ÷ 1-digit (no remainder)  
5. Optional stretch: simple remainders  

v1 uses **3 multiple-choice** answers (fat-finger friendly) plus an optional on-screen number pad.

## Develop

```bash
npm install
npm run dev
```

Open the printed local URL (base path `/division-drop/`).

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

This repo deploys the Vite `dist/` output to GitHub Pages at  
`https://josephschneider77-sys.github.io/division-drop/`.

Vite `base` is set to `/division-drop/`. A GitHub Actions workflow builds on push to `main` and publishes Pages.

## Controls

| Action | Touch | Keyboard |
|--------|-------|----------|
| Move | ◀ ▶ or swipe | ← → / A D |
| Rotate | ↻ or tap board | ↑ / W |
| Soft drop | ▼ or swipe down | ↓ / S |
| Hard drop | ⬇ or long swipe down | Space / X |
| Math power-up | ÷ button | Enter |
| Pause | ⏸ | P / Esc |

Built for Joe Schneider’s 8-year-old — cheerful, not babyish, Android-first.
