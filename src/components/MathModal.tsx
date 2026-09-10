import { useEffect, useRef, useState } from 'react'
import { MATH_TIME_MS } from '../game/constants'
import { formatCorrectAnswer, formatProblem } from '../game/math'
import type { DivisionProblem } from '../game/types'

interface Props {
  problem: DivisionProblem
  onAnswer: (n: number) => void
  onSkip: () => void
  onSoftFail: (msg?: string) => void
}

const MATH_SECS = MATH_TIME_MS / 1000
/** Brief pause so the kid can see the correct answer before soft-fail. */
const ANSWER_REVEAL_MS = 1800

export default function MathModal({
  problem,
  onAnswer,
  onSkip,
  onSoftFail,
}: Props) {
  const [pad, setPad] = useState('')
  const [secsLeft, setSecsLeft] = useState(MATH_SECS)
  const [reveal, setReveal] = useState<string | null>(null)
  const doneRef = useRef(false)

  const finish = (fn: () => void) => {
    if (doneRef.current) return
    doneRef.current = true
    fn()
  }

  const softFailAfterReveal = (reason: 'timeout' | 'wrong') => {
    if (doneRef.current || reveal) return
    const equation = formatCorrectAnswer(problem)
    setReveal(equation)
    doneRef.current = true
    window.setTimeout(() => {
      const msg =
        reason === 'timeout'
          ? `Time's up! ${equation}`
          : `Oops! ${equation}`
      onSoftFail(msg)
    }, ANSWER_REVEAL_MS)
  }

  useEffect(() => {
    doneRef.current = false
    setPad('')
    setSecsLeft(MATH_SECS)
    setReveal(null)
    const start = performance.now()
    const id = window.setInterval(() => {
      if (doneRef.current) {
        window.clearInterval(id)
        return
      }
      const left = Math.max(0, MATH_SECS - (performance.now() - start) / 1000)
      setSecsLeft(left)
      if (left <= 0) {
        window.clearInterval(id)
        softFailAfterReveal('timeout')
      }
    }, 40)
    return () => window.clearInterval(id)
    // Restart timer whenever a new problem opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  const submitPad = () => {
    if (pad === '' || doneRef.current || reveal) return
    const n = Number(pad)
    if (n === problem.answer) {
      finish(() => onAnswer(n))
    } else {
      softFailAfterReveal('wrong')
    }
  }

  const pct = Math.max(0, Math.min(100, (secsLeft / MATH_SECS) * 100))
  const urgent = !reveal && secsLeft <= 4
  const displaySecs = Math.ceil(secsLeft)

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal math-modal ${reveal ? 'revealing' : ''}`}>
        <div
          className={`math-timer ${urgent ? 'urgent' : ''}`}
          aria-live="polite"
          aria-label={
            reveal ? 'Showing correct answer' : `${displaySecs} seconds left`
          }
        >
          <div className="math-timer-num">{reveal ? '★' : displaySecs}</div>
          <div className="math-timer-track">
            <div
              className="math-timer-fill"
              style={{ width: reveal ? '0%' : `${pct}%` }}
            />
          </div>
        </div>

        <p className="modal-kicker">
          {reveal
            ? 'Learn it!'
            : problem.stretch
              ? 'Stretch challenge'
              : '÷ Power-up'}
        </p>
        <h2 className="math-question">{formatProblem(problem)}</h2>

        {reveal ? (
          <div className="math-answer-reveal" aria-live="assertive">
            <p className="math-answer-label">Answer</p>
            <p className="math-answer-eq">{reveal}</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
