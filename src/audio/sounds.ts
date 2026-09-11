/** Juicy game SFX — no background loop; dopamine hits on play actions. */

const BASE = `${import.meta.env.BASE_URL}sounds/`

/** Highest integer with a recorded clip in vo/numbers/n-XXX.mp3 */
const NUMBER_VO_MAX = 105

/** Joe's recorded divide / division-opportunity lines. */
const DIVIDE_VO = [
  'vo/divide-1.mp3',
  'vo/divide-2.mp3',
  'vo/divide-3.mp3',
  'vo/divide-4.mp3',
  'vo/divide-5.mp3',
  'vo/divide-6.mp3',
] as const

/** Joe's recorded miss / show-correct-answer lines. */
const CORRECT_VO = [
  'vo/correct-1.mp3',
  'vo/correct-2.mp3',
  'vo/correct-3.mp3',
  'vo/correct-4.mp3',
  'vo/correct-5.mp3',
  'vo/correct-6.mp3',
] as const

let lastVo = -1
let lastCorrectVo = -1

let muted = false
let unlocked = false
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

/** Call from a user gesture (Start / tap). */
export function unlockAudio(): void {
  unlocked = true
  const c = getCtx()
  if (c && c.state === 'suspended') {
    void c.resume().catch(() => {
      /* ignore */
    })
  }
  // Prime one short file so later plays aren’t blocked.
  const ping = new Audio(`${BASE}lock.mp3`)
  ping.volume = 0.01
  void ping
    .play()
    .then(() => {
      ping.pause()
    })
    .catch(() => {
      /* ignore */
    })
}

export function setMuted(next: boolean): void {
  muted = next
}

export function isMuted(): boolean {
  return muted
}

function playUrl(file: string, volume: number): void {
  if (!unlocked || muted) return
  const a = new Audio(`${BASE}${file}`)
  a.volume = volume
  void a.play().catch(() => {
    /* ignore */
  })
}

function playUrlAsync(
  file: string,
  volume: number,
  playbackRate = 1,
): Promise<void> {
  return new Promise((resolve) => {
    if (!unlocked || muted) {
      resolve()
      return
    }
    const a = new Audio(`${BASE}${file}`)
    a.volume = volume
    a.playbackRate = playbackRate
    const done = () => resolve()
    a.addEventListener('ended', done, { once: true })
    a.addEventListener('error', done, { once: true })
    void a.play().catch(done)
  })
}

function numberVoPath(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > NUMBER_VO_MAX) return null
  return `vo/numbers/n-${String(n).padStart(3, '0')}.mp3`
}

/**
 * Speak a correct equation: "12 divided by 4 equals 3".
 * Uses Joe's number bank (0–105) + operators. Skips silently if any
 * number is out of range or the problem is a remainder stretch.
 */
export function playEquationVo(problem: {
  dividend: number
  divisor: number
  answer: number
  family: string
  stretch?: boolean
}): void {
  if (problem.family === 'remainder' || problem.stretch) return
  const dividendPath = numberVoPath(problem.dividend)
  const divisorPath = numberVoPath(problem.divisor)
  const answerPath = numberVoPath(problem.answer)
  if (!dividendPath || !divisorPath || !answerPath) return

  // 50% faster than recorded pace (kid-game snappy).
  const rate = 1.5
  void (async () => {
    await playUrlAsync(dividendPath, 1, rate)
    await playUrlAsync('vo/operators/divided-by.mp3', 1, rate)
    await playUrlAsync(divisorPath, 1, rate)
    await playUrlAsync('vo/operators/equals.mp3', 1, rate)
    await playUrlAsync(answerPath, 1, rate)
  })()
}

/** Glowing ÷ brick appeared — random VO line from Joe. */
export function playDivOpportunity(): void {
  if (!DIVIDE_VO.length) return
  let idx = Math.floor(Math.random() * DIVIDE_VO.length)
  // Avoid immediate repeat when possible.
  if (DIVIDE_VO.length > 1 && idx === lastVo) {
    idx = (idx + 1) % DIVIDE_VO.length
  }
  lastVo = idx
  playUrl(DIVIDE_VO[idx], 1)
  // Soft sparkle under the voice.
  window.setTimeout(() => playUrl('div-opportunity.mp3', 0.28), 80)
}

/** Successful ÷ bust / power-clear — big reward. */
export function playBust(): void {
  playUrl('bust.mp3', 0.95)
}

/** Piece locked into the stack. */
export function playLock(): void {
  playUrl('lock.mp3', 0.55)
}

/** Line(s) cleared. */
export function playLineClear(lines = 1): void {
  playUrl('line-clear.mp3', Math.min(1, 0.65 + lines * 0.08))
}

/** Wrong answer / timeout — random VO while correct answer is shown. */
export function playSoftFail(): void {
  if (!CORRECT_VO.length) {
    playUrl('soft-fail.mp3', 0.5)
    return
  }
  let idx = Math.floor(Math.random() * CORRECT_VO.length)
  if (CORRECT_VO.length > 1 && idx === lastCorrectVo) {
    idx = (idx + 1) % CORRECT_VO.length
  }
  lastCorrectVo = idx
  playUrl(CORRECT_VO[idx], 1)
  // Soft under the voice.
  window.setTimeout(() => playUrl('soft-fail.mp3', 0.28), 80)
}

/** Level increased — faster! */
export function playLevelUp(): void {
  playUrl('level-up.mp3', 0.8)
}

// Back-compat no-ops (BGM removed on purpose).
export function startWitchyBg(): void {}
export function stopWitchyBg(): void {}
export function pauseWitchyBg(): void {}
