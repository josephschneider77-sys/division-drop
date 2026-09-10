import { useState } from 'react'
import { formatProblem } from '../game/math'
import type { DivisionProblem } from '../game/types'

interface Props {
  problem: DivisionProblem
  onAnswer: (n: number) => void
  onSkip: () => void
}

export default function MathModal({ problem, onAnswer, onSkip }: Props) {
  const [pad, setPad] = useState('')
  const [mode, setMode] = useState<'choices' | 'pad'>('choices')

  const submitPad = () => {
    if (pad === '') return
    onAnswer(Number(pad))
    setPad('')
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal math-modal">
        <p className="modal-kicker">
          {problem.stretch ? 'Stretch challenge' : 'Math power-up'}
        </p>
        <h2 className="math-question">{formatProblem(problem)}</h2>
        <p className="modal-hint">Solve for a clear bonus — or skip and keep stacking!</p>

        <div className="mode-toggle">
          <button
            type="button"
            className={mode === 'choices' ? 'chip active' : 'chip'}
            onClick={() => setMode('choices')}
          >
            Choices
          </button>
          <button
            type="button"
            className={mode === 'pad' ? 'chip active' : 'chip'}
            onClick={() => setMode('pad')}
          >
            Number pad
          </button>
        </div>

        {mode === 'choices' ? (
          <div className="choice-grid">
            {problem.choices.map((c) => (
              <button
                key={c}
                type="button"
                className="choice-btn"
                onClick={() => onAnswer(c)}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <div className="pad">
            <div className="pad-display">{pad || '—'}</div>
            <div className="pad-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'Go'].map((k) => (
                <button
                  key={String(k)}
                  type="button"
                  className={`pad-btn ${k === 'Go' ? 'go' : ''}`}
                  onClick={() => {
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
        )}

        <button type="button" className="text-btn" onClick={onSkip}>
          Skip — keep playing
        </button>
      </div>
    </div>
  )
}
