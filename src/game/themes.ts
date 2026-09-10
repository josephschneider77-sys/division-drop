import type { CellColor, ShapeId } from './types'

/** Cute charm identity for each tetromino footprint (collision unchanged). */
export type CharmTheme =
  | 'star'
  | 'moon'
  | 'cat'
  | 'witchHat'
  | 'potion'
  | 'broom'
  | 'crystal'
  | 'pumpkin'

export const SHAPE_THEME: Record<ShapeId, CharmTheme> = {
  Dot: 'crystal',
  O: 'cat',
  I: 'broom',
  T: 'witchHat',
  L: 'potion',
  J: 'moon',
  S: 'star',
  Z: 'pumpkin',
}

/** Stable pastel color per theme so pieces read clearly on Android. */
export const THEME_COLOR: Record<CharmTheme, Exclude<CellColor, 'empty'>> = {
  star: 'amber',
  moon: 'sky',
  cat: 'pink',
  witchHat: 'violet',
  potion: 'lime',
  broom: 'amber',
  crystal: 'cyan',
  pumpkin: 'coral',
}

export const THEME_EMOJI: Record<CharmTheme, string> = {
  star: '⭐',
  moon: '🌙',
  cat: '🐱',
  witchHat: '🧙',
  potion: '🧪',
  broom: '🧹',
  crystal: '💎',
  pumpkin: '🎃',
}

export const THEME_LABEL: Record<CharmTheme, string> = {
  star: 'Star',
  moon: 'Moon',
  cat: 'Kitty',
  witchHat: 'Witch hat',
  potion: 'Potion',
  broom: 'Broom',
  crystal: 'Crystal',
  pumpkin: 'Pumpkin',
}
