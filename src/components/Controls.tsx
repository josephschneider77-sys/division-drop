interface Props {
  onLeft: () => void
  onRight: () => void
  onSoftDrop: () => void
  onHardDrop: () => void
  onRotate: () => void
  disabled?: boolean
  /** Soft hint when a pulsing math piece can be tapped. */
  mathHint?: boolean
}

export default function Controls({
  onLeft,
  onRight,
  onSoftDrop,
  onHardDrop,
  onRotate,
  disabled,
  mathHint,
}: Props) {
  return (
    <div className={`controls ${disabled ? 'disabled' : ''}`}>
      {mathHint && (
        <p className="math-hint" aria-live="polite">
          Tap the glowing brick to solve ÷ and clear!
        </p>
      )}
      <div className="control-row main-row">
        <button
          type="button"
          className="ctrl primary"
          onClick={onLeft}
          aria-label="Left"
        >
          ◀
        </button>
        <button
          type="button"
          className="ctrl primary rotate"
          onClick={onRotate}
          aria-label="Rotate"
        >
          ↻
        </button>
        <button
          type="button"
          className="ctrl primary"
          onClick={onRight}
          aria-label="Right"
        >
          ▶
        </button>
      </div>

      <div className="control-row drop-row">
        <button
          type="button"
          className="ctrl secondary"
          onClick={onSoftDrop}
          aria-label="Soft drop"
        >
          ▼ Soft
        </button>
        <button
          type="button"
          className="ctrl secondary hard"
          onClick={onHardDrop}
          aria-label="Hard drop"
        >
          ⬇ Drop
        </button>
      </div>
    </div>
  )
}
