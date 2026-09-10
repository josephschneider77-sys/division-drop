import type { DivisionProblem, FactFamily } from './types'
import { FAMILY_ORDER } from './constants'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeChoices(answer: number, maxWrong = 12): number[] {
  const set = new Set<number>([answer])
  let guard = 0
  while (set.size < 3 && guard++ < 40) {
    const delta = randInt(1, 4) * (Math.random() < 0.5 ? -1 : 1)
    const wrong = answer + delta
    if (wrong >= 0 && wrong !== answer && wrong <= maxWrong + answer) {
      set.add(wrong)
    } else {
      set.add(Math.max(0, randInt(0, Math.max(answer + 5, 9))))
    }
  }
  while (set.size < 3) set.add(set.size + answer + 1)
  return shuffle([...set])
}

function problemForFamily(family: FactFamily): DivisionProblem {
  if (family === 'twoDigit') {
    const divisor = randInt(2, 9)
    const quotient = randInt(10, 24)
    const dividend = divisor * quotient
    return {
      dividend,
      divisor,
      answer: quotient,
      choices: makeChoices(quotient, 30),
      family,
    }
  }

  if (family === 'remainder') {
    const divisor = randInt(2, 9)
    const quotient = randInt(1, 9)
    const rem = randInt(1, divisor - 1)
    const dividend = divisor * quotient + rem
    // Ask: what is the remainder?
    const distractors = new Set<number>([rem])
    while (distractors.size < 3) {
      const w = randInt(0, divisor - 1)
      distractors.add(w)
    }
    return {
      dividend,
      divisor,
      answer: rem,
      choices: shuffle([...distractors]),
      family,
      stretch: true,
    }
  }

  const divisorMap: Record<string, number> = {
    div2: 2,
    div5: 5,
    div10: 10,
    div3: 3,
    div4: 4,
    div6: 6,
    div7: 7,
    div8: 8,
    div9: 9,
  }
  const divisor = divisorMap[family] ?? 2
  const maxQ = family === 'div10' ? 10 : 12
  const quotient = randInt(1, maxQ)
  const dividend = divisor * quotient
  return {
    dividend,
    divisor,
    answer: quotient,
    choices: makeChoices(quotient, maxQ + 3),
    family,
  }
}

/** Unlock families based on problems solved + level. */
export function unlockedFamilies(problemsSolved: number, level: number): FactFamily[] {
  const unlocked: FactFamily[] = ['div2', 'div5', 'div10']
  if (problemsSolved >= 5 || level >= 2) unlocked.push('div3', 'div4', 'div6')
  if (problemsSolved >= 15 || level >= 4) unlocked.push('div7', 'div8', 'div9')
  if (problemsSolved >= 30 || level >= 6) unlocked.push('twoDigit')
  if (problemsSolved >= 50 || level >= 8) unlocked.push('remainder')
  return FAMILY_ORDER.filter((f) => unlocked.includes(f))
}

export function generateProblem(
  families: FactFamily[],
  preferHarder = false,
): DivisionProblem {
  const pool = families.length ? families : (['div2', 'div5', 'div10'] as FactFamily[])
  let family: FactFamily
  if (preferHarder && pool.length > 3) {
    family = pool[randInt(Math.floor(pool.length / 2), pool.length - 1)]
  } else {
    family = pool[randInt(0, pool.length - 1)]
  }
  return problemForFamily(family)
}

export function formatProblem(p: DivisionProblem): string {
  if (p.stretch && p.family === 'remainder') {
    return `${p.dividend} ÷ ${p.divisor} — remainder?`
  }
  return `${p.dividend} ÷ ${p.divisor}`
}

/** Full equation (or remainder form) for teaching after a miss/timeout. */
export function formatCorrectAnswer(p: DivisionProblem): string {
  if (p.stretch && p.family === 'remainder') {
    const quotient = Math.floor(p.dividend / p.divisor)
    return `${p.dividend} ÷ ${p.divisor} = ${quotient} R ${p.answer}`
  }
  return `${p.dividend} ÷ ${p.divisor} = ${p.answer}`
}

