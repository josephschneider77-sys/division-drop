/** Game audio — Web Audio unlock + HTMLAudio playback. */

const BASE = `${import.meta.env.BASE_URL}sounds/`

let muted = false
let unlocked = false
let ctx: AudioContext | null = null
let bg: HTMLAudioElement | null = null

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

function ensureBg(): HTMLAudioElement {
  if (!bg) {
    bg = new Audio(`${BASE}bg-witchy.mp3`)
    bg.preload = 'auto'
    bg.loop = true
    bg.volume = 0.55
  }
  return bg
}

/** Must run inside a user gesture (Start / tap). */
export function unlockAudio(): void {
  unlocked = true
  const c = getCtx()
  if (c && c.state === 'suspended') {
    void c.resume().catch(() => {
      /* ignore */
    })
  }
  // Prime SFX only — never pause the bg element after Start.
  const ping = new Audio(`${BASE}div-opportunity.mp3`)
  ping.volume = 0.01
  void ping.play().then(() => {
    ping.pause()
  }).catch(() => {
    /* ignore */
  })
  ensureBg().load()
}

export function setMuted(next: boolean): void {
  muted = next
  if (muted) {
    bg?.pause()
  }
}

export function isMuted(): boolean {
  return muted
}

export function startWitchyBg(): void {
  if (!unlocked || muted) return
  const a = ensureBg()
  a.volume = 0.55
  if (a.paused) {
    void a.play().catch(() => {
      /* still blocked */
    })
  }
}

export function stopWitchyBg(): void {
  if (!bg) return
  bg.pause()
  bg.currentTime = 0
}

export function pauseWitchyBg(): void {
  bg?.pause()
}

function playUrl(file: string, volume: number): void {
  if (!unlocked || muted) return
  const a = new Audio(`${BASE}${file}`)
  a.volume = volume
  void a.play().catch(() => {
    /* ignore */
  })
}

export function playBust(): void {
  playUrl('bust.mp3', 0.9)
}

export function playDivOpportunity(): void {
  playUrl('div-opportunity.mp3', 0.8)
}
