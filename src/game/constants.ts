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

/** Pastel / candy / midnight-sparkle palette (readable on Android). */
export const COLOR_HEX: Record<Exclude<CellColor, 'empty'>, string> = {
  cyan: '#7EF5EC',
  pink: '#FF9AD8',
  lime: '#C8F57A',
  amber: '#FFD66E',
  violet: '#C9B0FF',
  sky: '#9AD0FF',
  coral: '#FFA07A',
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

/** Drop interval (ms) by level. */
export function dropInterval(level: number): number {
  return Math.max(180, 900 - (level - 1) * 55)
}

export const MATH_CHANCE = 0.42
export const STORAGE_KEY = 'division-drop-v1'
