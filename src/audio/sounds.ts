/** Juicy game SFX — no background loop; dopamine hits on play actions. */

const BASE = `${import.meta.env.BASE_URL}sounds/`

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

/** Glowing ÷ brick appeared — "ooh, power-up!" */
export function playDivOpportunity(): void {
  playUrl('div-opportunity.mp3', 0.85)
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

/** Wrong answer / timeout — soft, not punishing. */
export function playSoftFail(): void {
  playUrl('soft-fail.mp3', 0.5)
}

/** Level increased — faster! */
export function playLevelUp(): void {
  playUrl('level-up.mp3', 0.8)
}

// Back-compat no-ops (BGM removed on purpose).
export function startWitchyBg(): void {}
export function stopWitchyBg(): void {}
export function pauseWitchyBg(): void {}
