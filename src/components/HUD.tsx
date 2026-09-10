import { COLOR_HEX, SHAPES } from '../game/constants'
import type { GameStats, Piece, Progress } from '../game/types'

interface Props {
  stats: GameStats
  progress: Progress
  next: Piece
  onPause: () => void
  onMute: () => void
}

export default function HUD({ stats, progress, next, onPause, onMute }: Props) {
  const rot = SHAPES[next.shape][0]
  const maxX = Math.max(...rot.map(([x]) => x))
  const maxY = Math.max(...rot.map(([, y]) => y))

  return (
    <header className="hud">
      <div className="hud-block">
        <span className="label">Score</span>
        <strong>{stats.score}</strong>
      </div>
      <div className="hud-block">
        <span className="label">Level</span>
        <strong>{stats.level}</strong>
      </div>
      <div className="hud-block next-block">
        <span className="label">Next</span>
        <div
          className="mini-piece"
          style={{
            gridTemplateColumns: `repeat(${maxX + 1}, 10px)`,
            gridTemplateRows: `repeat(${maxY + 1}, 10px)`,
          }}
        >
          {Array.from({ length: (maxY + 1) * (maxX + 1) }).map((_, i) => {
            const x = i % (maxX + 1)
            const y = Math.floor(i / (maxX + 1))
            const on = rot.some(([px, py]) => px === x && py === y)
            return (
              <div
                key={i}
                className={on ? 'mini-cell on' : 'mini-cell'}
                style={
                  on && next.color !== 'empty'
                    ? { background: COLOR_HEX[next.color] }
                    : undefined
                }
              />
            )
          })}
        </div>
        {next.hasMath && <span className="next-math">÷</span>}
      </div>
      <div className="hud-actions">
        <button type="button" className="icon-btn" onClick={onMute} aria-label="Mute">
          {progress.muted ? '🔇' : '🔊'}
        </button>
        <button type="button" className="icon-btn" onClick={onPause} aria-label="Pause">
          ⏸
        </button>
      </div>
      <div className="hud-meta">
        <span>Best {progress.highScore}</span>
      </div>
    </header>
  )
}
