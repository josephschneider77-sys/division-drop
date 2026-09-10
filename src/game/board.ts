import { COLS, ROWS, SHAPES } from './constants'
import type { Cell, CellColor, Piece } from './types'

export function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      color: 'empty' as const,
      hasMath: false,
      locked: false,
    })),
  )
}

export function pieceCells(piece: Piece): { x: number; y: number }[] {
  const rotations = SHAPES[piece.shape]
  const rot = rotations[piece.rotation % rotations.length]
  return rot.map(([dx, dy]) => ({ x: piece.x + dx, y: piece.y + dy }))
}

export function fits(board: Cell[][], piece: Piece): boolean {
  return pieceCells(piece).every(({ x, y }) => {
    if (x < 0 || x >= COLS || y >= ROWS) return false
    if (y < 0) return true
    return board[y][x].color === 'empty'
  })
}

export function lockPiece(board: Cell[][], piece: Piece): Cell[][] {
  const next = board.map((row) => row.map((c) => ({ ...c })))
  for (const { x, y } of pieceCells(piece)) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      next[y][x] = {
        color: piece.color,
        hasMath: piece.hasMath && !piece.mathSolved,
        locked: true,
      }
    }
  }
  return next
}

export function clearFullLines(board: Cell[][]): {
  board: Cell[][]
  cleared: number
  mathBonus: number
} {
  const remaining: Cell[][] = []
  let cleared = 0
  let mathBonus = 0
  for (const row of board) {
    if (row.every((c) => c.color !== 'empty')) {
      cleared++
      mathBonus += row.filter((c) => c.hasMath).length
    } else {
      remaining.push(row)
    }
  }
  while (remaining.length < ROWS) {
    remaining.unshift(
      Array.from({ length: COLS }, () => ({
        color: 'empty' as const,
        hasMath: false,
        locked: false,
      })),
    )
  }
  return { board: remaining, cleared, mathBonus }
}

/** Clear a cluster around a solved math cell (3×3-ish flood of same color + math). */
export function clearMathCluster(
  board: Cell[][],
  originX: number,
  originY: number,
): { board: Cell[][]; cleared: number } {
  const next = board.map((row) => row.map((c) => ({ ...c })))
  let cleared = 0
  const queue: [number, number][] = [[originX, originY]]
  const seen = new Set<string>()

  while (queue.length) {
    const [x, y] = queue.shift()!
    const key = `${x},${y}`
    if (seen.has(key)) continue
    seen.add(key)
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) continue
    const cell = next[y][x]
    if (cell.color === 'empty') continue

    // Clear this cell
    next[y][x] = { color: 'empty', hasMath: false, locked: false }
    cleared++

    // Neighbors within Manhattan distance 1 of same color or any math badge nearby
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ] as const) {
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue
      const n = next[ny][nx]
      if (n.color === 'empty') continue
      if (n.color === cell.color || n.hasMath) {
        queue.push([nx, ny])
      }
    }
  }

  // Gravity: pack cells down per column
  for (let x = 0; x < COLS; x++) {
    const stack: Cell[] = []
    for (let y = ROWS - 1; y >= 0; y--) {
      if (next[y][x].color !== 'empty') stack.push(next[y][x])
    }
    for (let y = ROWS - 1; y >= 0; y--) {
      next[y][x] =
        stack.length > 0
          ? stack.shift()!
          : { color: 'empty', hasMath: false, locked: false }
    }
  }

  return { board: next, cleared }
}

export function mergeGhost(
  board: Cell[][],
  piece: Piece | null,
): (Cell & { ghost?: boolean; active?: boolean })[][] {
  const view = board.map((row) => row.map((c) => ({ ...c })))
  if (!piece) return view

  // Ghost
  let ghost = { ...piece }
  while (fits(board, { ...ghost, y: ghost.y + 1 })) {
    ghost = { ...ghost, y: ghost.y + 1 }
  }
  for (const { x, y } of pieceCells(ghost)) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS && view[y][x].color === 'empty') {
      ;(view[y][x] as Cell & { ghost?: boolean }).ghost = true
      view[y][x].color = piece.color
    }
  }

  // Active piece
  for (const { x, y } of pieceCells(piece)) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      view[y][x] = {
        color: piece.color,
        hasMath: piece.hasMath && !piece.mathSolved,
        locked: false,
      }
      ;(view[y][x] as Cell & { active?: boolean }).active = true
    }
  }
  return view
}

export function randomColor(): CellColor {
  const opts: CellColor[] = [
    'cyan',
    'pink',
    'lime',
    'amber',
    'violet',
    'sky',
    'coral',
  ]
  return opts[Math.floor(Math.random() * opts.length)]
}
