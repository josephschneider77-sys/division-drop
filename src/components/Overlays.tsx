import { FAMILY_LABELS } from '../game/constants'
import type { GameStats, Progress } from '../game/types'

interface ReadyProps {
  progress: Progress
  onStart: () => void
}

export function ReadyOverlay({ progress, onStart }: ReadyProps) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <div className="logo-mark">÷</div>
        <h1>Division Drop</h1>
        <p className="tagline">
          Stack colorful blocks. Tap ÷ when you see a math badge for a power-up clear!
        </p>
        <button type="button" className="primary-btn" onClick={onStart}>
          Play
        </button>
        <p className="overlay-meta">
          High score {progress.highScore} · Level {progress.bestLevel}
          <br />
          Unlocked:{' '}
          {progress.unlockedFamilies.map((f) => FAMILY_LABELS[f]).join(', ')}
        </p>
      </div>
    </div>
  )
}

interface PauseProps {
  onResume: () => void
  onRestart: () => void
  muted: boolean
  onMute: () => void
}

export function PauseOverlay({ onResume, onRestart, muted, onMute }: PauseProps) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <h2>Paused</h2>
        <button type="button" className="primary-btn" onClick={onResume}>
          Resume
        </button>
        <button type="button" className="secondary-btn" onClick={onRestart}>
          Restart
        </button>
        <button type="button" className="text-btn" onClick={onMute}>
          {muted ? 'Unmute sounds' : 'Mute sounds'}
        </button>
      </div>
    </div>
  )
}

interface OverProps {
  stats: GameStats
  progress: Progress
  onRestart: () => void
}

export function GameOverOverlay({ stats, progress, onRestart }: OverProps) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <h2>Nice run!</h2>
        <p className="score-big">{stats.score}</p>
        <p>
          Level {stats.level} · {stats.lines} lines · {stats.problemsSolved} problems
        </p>
        <p className="overlay-meta">All-time best {progress.highScore}</p>
        <button type="button" className="primary-btn" onClick={onRestart}>
          Play again
        </button>
      </div>
    </div>
  )
}
