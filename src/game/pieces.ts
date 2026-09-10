import { COLS, MATH_CHANCE, SHAPE_BAG, SHAPES } from './constants'
import { SHAPE_THEME, THEME_COLOR } from './themes'
import type { Piece, ShapeId } from './types'

function bagShuffle(): ShapeId[] {
  const bag = [...SHAPE_BAG]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

let bag: ShapeId[] = []
export function nextShape(): ShapeId {
  if (bag.length === 0) bag = bagShuffle()
  return bag.pop()!
}

export function spawnPiece(forceMath = false): Piece {
  const shape = nextShape()
  const rotations = SHAPES[shape]
  const width = Math.max(...rotations[0].map(([x]) => x)) + 1
  const theme = SHAPE_THEME[shape]
  const hasMath = forceMath || Math.random() < MATH_CHANCE
  return {
    shape,
    rotation: 0,
    x: Math.floor((COLS - width) / 2),
    y: 0,
    color: THEME_COLOR[theme],
    hasMath,
    mathSolved: false,
  }
}

export function rotatePiece(piece: Piece): Piece {
  const rotations = SHAPES[piece.shape]
  return { ...piece, rotation: (piece.rotation + 1) % rotations.length }
}

export function resetBag(): void {
  bag = []
}
