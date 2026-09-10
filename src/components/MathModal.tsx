import { useEffect, useRef, useState } from 'react'
import { MATH_TIME_MS } from '../game/constants'
import { formatProblem } from '../game/math'
import type { DivisionProblem } from '../game/types'

interface Props {
  problem: DivisionProblem
  onAnswer: (n: number) => void
  onSkip: () => void
  onTimeout: () => void
}

const MATH_SECS = MATH_TIME_MS / 1000

export default function MathModal({
  problem,
  onAnswer,
  onSkip,
  onTimeout,
}: Props) {
  const [pad, setPad] = useState('')
  const [secsLeft, setSecsLeft] = useState(MATH_SECS)
  const doneRef = useRef(false)

  const finish = (fn: () => void) => {
    if (doneRef.current) return
    doneRef.current = true
    fn()
  }

  useEffect(() => {
    doneRef.current = false
    setPad('')
    setSecsLeft(MATH_SECS)
    const start = performance.now()
    const id = window.setInterval(() => {
      const left = Math.max(0, MATH_SECS - (performance.now() - start) / 1000)
      setSecsLeft(left)
      if (left <= 0) {
        window.clearInterval(id)
        finish(() => onTimeout())
      }
    }, 40)
    return () => window.clearInterval(id)
    // Restart timer whenever a new problem opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  const submitPad = () => {
    if (pad === '') return
    finish(() => onAnswer(Number(pad)))
  }

  const pct = Math.max(0, Math.min(100, (secsLeft / MATH_SECS) * 100))
  const urgent = secsLeft <= 2.5
  const displaySecs = Math.ceil(secsLeft)

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal math-modal">
        <div
          className={`math-timer ${urgent ? 'urgent' : ''}`}
          aria-live="polite"
          aria-label={`${displaySecs} seconds left`}
        >
          <div className="math-timer-num">{displaySecs}</div>
          <div className="math-timer-track">
            <div
              className="math-timer-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <p className="modal-kicker">
          {problem.stretch ? 'Stretch challenge' : '÷ Power-up'}
        </p>
        <h2 className="math-question">{formatProblem(problem)}</h2>
        <p className="modal-hint">
          Type the answer on the pad before time runs out!
        </p>

        <div className="pad">
          <div className="pad-display">{pad || '—'}</div>
          <div className="pad-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'Go'].map((k) => (
              <button
                key={String(k)}
                type="button"
                className={`pad-btn ${k === 'Go' ? 'go' : ''}`}
                onClick={() => {
                  if (doneRef.current) return
                  if (k === '⌫') setPad((p) => p.slice(0, -1))
                  else if (k === 'Go') submitPad()
                  else if (pad.length < 3) setPad((p) => p + String(k))
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="text-btn skip-btn"
          onClick={() => finish(() => onSkip())}
        >
          Skip — keep playing
        </button>
      </div>
    </div>
  )
}
