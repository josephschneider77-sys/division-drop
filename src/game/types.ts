import type { CharmTheme } from './themes'

export type CellColor =
  | 'cyan'
  | 'pink'
  | 'lime'
  | 'amber'
  | 'violet'
  | 'sky'
  | 'coral'
  | 'empty'

export interface Cell {
  color: CellColor
  hasMath: boolean
  locked: boolean
  /** Charm theme for emoji cell; set when a piece locks / is active. */
  theme?: CharmTheme
}

export type ShapeId = 'O' | 'I' | 'T' | 'L' | 'J' | 'S' | 'Z' | 'Dot'

export interface Piece {
  shape: ShapeId
  rotation: number
  x: number
  y: number
  color: CellColor
  hasMath: boolean
  mathSolved: boolean
}

export interface DivisionProblem {
  dividend: number
  divisor: number
  answer: number
  choices: number[]
  family: FactFamily
  stretch?: boolean
}

export type FactFamily =
  | 'div2'
  | 'div5'
  | 'div10'
  | 'div3'
  | 'div4'
  | 'div6'
  | 'div7'
  | 'div8'
  | 'div9'
  | 'twoDigit'
  | 'remainder'

export interface Progress {
  highScore: number
  bestLevel: number
  unlockedFamilies: FactFamily[]
  gamesPlayed: number
  problemsSolved: number
  tipSeen: boolean
  /** Hide “Tap to bust!” after first math open / division. */
  bustTipSeen: boolean
  muted: boolean
}

export interface GameStats {
  score: number
  level: number
  lines: number
  combo: number
  problemsSolved: number
  piecesLocked: number
}

export type GamePhase = 'ready' | 'playing' | 'paused' | 'math' | 'gameover'
