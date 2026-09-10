import type { CellColor, FactFamily, ShapeId } from './types'

export const COLS = 8
export const ROWS = 18
export const VISIBLE_ROWS = 18

export const COLORS: CellColor[] = [
  'cyan',
  'pink',
  'lime',
  'amber',
  'violet',
  'sky',
  'coral',
]

/** Loud Lisa Frank folder palette — hot pink / purple / teal / neon yellow (tablet-readable). */
export const COLOR_HEX: Record<Exclude<CellColor, 'empty'>, string> = {
  cyan: '#2EFFF0',
  pink: '#FF4FD8',
  lime: '#C8FF3D',
  amber: '#FFE600',
  violet: '#B44CFF',
  sky: '#4DCFFF',
  coral: '#FF6B9A',
}

/** Relative cell offsets for each shape / rotation (0–3). */
export const SHAPES: Record<ShapeId, number[][][]> = {
  Dot: [[[0, 0]]],
  O: [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  ],
  I: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
  ],
  T: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
  ],
  L: [
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  ],
  J: [
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
  ],
  S: [
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  Z: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
  ],
}

export const SHAPE_BAG: ShapeId[] = [
  'Dot',
  'Dot',
  'O',
  'I',
  'I',
  'T',
  'L',
  'J',
  'S',
  'Z',
]

export const FAMILY_ORDER: FactFamily[] = [
  'div2',
  'div5',
  'div10',
  'div3',
  'div4',
  'div6',
  'div7',
  'div8',
  'div9',
  'twoDigit',
  'remainder',
]

export const FAMILY_LABELS: Record<FactFamily, string> = {
  div2: '÷2',
  div5: '÷5',
  div10: '÷10',
  div3: '÷3',
  div4: '÷4',
  div6: '÷6',
  div7: '÷7',
  div8: '÷8',
  div9: '÷9',
  twoDigit: '2-digit ÷ 1',
  remainder: 'Remainders',
}

/** Level from lines cleared + pieces locked (speeds up as play goes on). */
export function computeLevel(lines: number, piecesLocked: number): number {
  return Math.max(1, 1 + Math.floor(lines / 5) + Math.floor(piecesLocked / 10))
}

/** Drop interval (ms) by level — starts gentle, ramps clearly, kid-safe floor. */
export function dropInterval(level: number): number {
  // L1 ~1000ms → L10 ~280ms floor
  return Math.max(280, 1000 - (level - 1) * 80)
}

export const MATH_TIME_MS = 15000
export const MATH_CHANCE = 0.55
export const STORAGE_KEY = 'division-drop-v1'
