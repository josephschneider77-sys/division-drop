/** Lightweight game audio — respects mute; unlocks on first gesture. */

const BASE = `${import.meta.env.BASE_URL}sounds/`

let muted = false
let unlocked = false
let bg: HTMLAudioElement | null = null
let bustBuf: HTMLAudioElement | null = null
let oppBuf: HTMLAudioElement | null = null

function make(src: string, loop = false): HTMLAudioElement {
  const a = new Audio(src)
  a.preload = 'auto'
  a.loop = loop
  return a
}

function ensure(): void {
  if (typeof window === 'undefined') return
  if (!bg) {
    bg = make(`${BASE}bg-witchy.mp3`, true)
    bg.volume = 0.28
  }
  if (!bustBuf) {
    bustBuf = make(`${BASE}bust.mp3`)
    bustBuf.volume = 0.7
  }
  if (!oppBuf) {
    oppBuf = make(`${BASE}div-opportunity.mp3`)
    oppBuf.volume = 0.55
  }
}

/** Call from a user gesture (Start / tap) so mobile browsers allow playback. */
export function unlockAudio(): void {
  ensure()
  unlocked = true
  // Silent prime
  const prime = [bg, bustBuf, oppBuf]
  for (const a of prime) {
    if (!a) continue
    const prev = a.volume
    a.volume = 0
    void a
      .play()
      .then(() => {
        a.pause()
        a.currentTime = 0
        a.volume = prev
      })
      .catch(() => {
        a.volume = prev
      })
  }
}

export function setMuted(next: boolean): void {
  muted = next
  ensure()
  if (muted) {
    bg?.pause()
  }
}

export function isMuted(): boolean {
  return muted
}

export function startWitchyBg(): void {
  ensure()
  if (!unlocked || muted || !bg) return
  if (bg.paused) {
    void bg.play().catch(() => {
      /* autoplay blocked until unlock */
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

function playClone(source: HTMLAudioElement | null, volume: number): void {
  if (!source || muted || !unlocked) return
  const a = source.cloneNode(true) as HTMLAudioElement
  a.volume = volume
  void a.play().catch(() => {
    /* ignore */
  })
}

/** Magical shatter when ÷ bust succeeds. */
export function playBust(): void {
  ensure()
  playClone(bustBuf, 0.72)
}

/** Chime when a glowing ÷ piece appears. */
export function playDivOpportunity(): void {
  ensure()
  playClone(oppBuf, 0.58)
}
