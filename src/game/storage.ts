import { STORAGE_KEY } from './constants'
import type { FactFamily, Progress } from './types'

const DEFAULT: Progress = {
  highScore: 0,
  bestLevel: 1,
  unlockedFamilies: ['div2', 'div5', 'div10'],
  gamesPlayed: 0,
  problemsSolved: 0,
  tipSeen: false,
  muted: false,
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<Progress>
    return { ...DEFAULT, ...parsed }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* ignore quota */
  }
}

export function mergeUnlocks(
  current: FactFamily[],
  next: FactFamily[],
): FactFamily[] {
  return [...new Set([...current, ...next])]
}
