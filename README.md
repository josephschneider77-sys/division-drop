# Division Drop

Kid-friendly falling-block PWA that practices **3rd-grade division**. Math is a voluntary power-up — she can still play by only moving pieces.

**Live:** https://josephschneider77-sys.github.io/division-drop/

## Play on Android (phone or tablet)

1. Open the live URL in **Chrome**.
2. Tap **⋮** (menu) → **Add to Home screen** or **Install app**.
3. Launch from the home screen like a normal app (portrait works best).
4. Big on-screen controls: **◀ | ↻ | ▶**; soft/hard drop as smaller secondary buttons; swipe left/right on the board, swipe down to drop. Tap a **pulsing** math piece to divide.

No accounts, no ads, no tracking. Progress (high score, level, unlocked families) stays in local storage on the device.

## How math power-ups work

- Some **actively falling** pieces **pulse and glow** with a **÷** badge (locked stack cells are never tappable for math).
- A slim **“Tap to bust! ÷”** side panel sits to the **left of the well** on the **first** math piece only (persisted in localStorage; never covers the stack).
- **Tap the board** (or press Enter) to open a division question — only while that math piece is still falling.
- **Answer on the number pad only** (no multiple-choice) — quotient, or remainder in stretch mode.
- **~15 second countdown** (big number + rainbow bar) starts when the math modal opens.
- **Correct answer:** emoji chunks explode apart, then clear + points + a short slow-mo moment.
- **Wrong answer or time out:** briefly show the correct equation (remainder form when needed), then soft fail — brief shake, modal closes, piece keeps falling, no bust.
- **Skip** anytime (secondary) and keep stacking. Math is an advantage, not a gate.

### Curriculum (unlocks behind the scenes as she plays)

1. ÷2, ÷5, ÷10  
2. ÷3, ÷4, ÷6  
3. ÷7, ÷8, ÷9  
4. 2-digit ÷ 1-digit (no remainder)  
5. Optional stretch: simple remainders  

Answers are **number-pad only** with a visible **15s** timer — wrong or timeout is a soft fail.

## Look & feel

Playfield is a **Three.js / react-three-fiber** mild orthographic 3D stack. Each tetromino keeps classic grid footprints (rotate / collide / stack like Tetris) but renders **chunky volumetric 3D emoji characters** (rounded candy bodies + glossy materials + emoji faces — Emoji Movie energy) that still fit the grid:

| Shape | Emoji | Charm |
|-------|-------|-------|
| S | ⭐ | Star |
| J | 🌙 | Moon |
| O | 🐱 | Kitty |
| T | 🧙‍♀️ | Witch |
| I | 🧹 | Broom |
| L | 🧪 | Potion |
| Z | 🎃 | Pumpkin |
| Dot | ✨ | Sparkle |

Slim **Lisa Frank** folder chrome rails (hot pink / teal / neon yellow) mark the move edges; a soft isometric camera zooms the board to fill the screen on phone/tablet. Loud cute 90s folder palette — hot pink, purple, teal, neon yellow, rainbow accents, sparkles — for pedestals, rails, background, and HUD (still readable on Android tablets). Compact HUD and controls keep the play area dominant. Adaptive math — no Facts HUD.

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
| Rotate | ↻ (middle) or tap board (non-math) | ↑ / W |
| Soft drop | ▼ Soft or swipe down | ↓ / S |
| Hard drop | ⬇ Drop or long swipe down | Space / X |
| Math / divide | Tap the pulsing math piece | Enter |
| Pause | ⏸ | P / Esc |

Built for Joe Schneider’s 8-year-old — cheerful, not babyish, Android-first.
