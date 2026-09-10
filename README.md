# Division Drop

Kid-friendly falling-block PWA that practices **3rd-grade division**. Math is a voluntary power-up — she can still play by only moving pieces.

**Live:** https://josephschneider77-sys.github.io/division-drop/

## Play on Android (phone or tablet)

1. Open the live URL in **Chrome**.
2. Tap **⋮** (menu) → **Add to Home screen** or **Install app**.
3. Launch from the home screen like a normal app (portrait works best).
4. Big on-screen controls; swipe left/right on the board, tap to rotate, swipe down to drop.

No accounts, no ads, no tracking. Progress (high score, level, unlocked families) stays in local storage on the device.

## How math power-ups work

- Some falling pieces glow with a **÷** badge.
- Tap the big juicy **÷ POWER UP!** button when it lights up (or press Enter on a keyboard).
- **Correct answer:** punchy 3D clear burst + points + a short slow-mo moment.
- **Wrong answer:** soft fail — brief shake, piece keeps falling, game continues.
- **Skip** anytime (secondary) and keep stacking. Math is an advantage, not a gate.

### Curriculum (unlocks behind the scenes as she plays)

1. ÷2, ÷5, ÷10  
2. ÷3, ÷4, ÷6  
3. ÷7, ÷8, ÷9  
4. 2-digit ÷ 1-digit (no remainder)  
5. Optional stretch: simple remainders  

v1 uses **3 multiple-choice** answers (fat-finger friendly) plus an optional on-screen number pad.

## Look & feel

Playfield is a **Three.js / react-three-fiber** mild orthographic 3D stack. Each tetromino keeps classic grid footprints (rotate / collide / stack like Tetris) but renders as a cute charm — stars, moons, cats, witch hats, potions, brooms, crystals, and pumpkins — in a pastel candy / midnight-sparkle palette. Slim left/right side boards mark the move edges; a mostly face-on camera zooms the board to fill the screen on phone/tablet. Compact HUD and controls keep the play area dominant.

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

Live site: https://josephschneider77-sys.github.io/division-drop/

Vite `base` is `/division-drop/`. Built `dist/` is published from the `gh-pages` branch (root).

```bash
npm run build
# then publish contents of dist/ to the gh-pages branch
```

## Controls

| Action | Touch | Keyboard |
|--------|-------|----------|
| Move | ◀ ▶ or swipe | ← → / A D |
| Rotate | ↻ or tap board | ↑ / W |
| Soft drop | ▼ or swipe down | ↓ / S |
| Hard drop | ⬇ or long swipe down | Space / X |
| Math power-up | ÷ POWER UP! button | Enter |
| Pause | ⏸ | P / Esc |

Built for Joe Schneider’s 8-year-old — cheerful, not babyish, Android-first.
