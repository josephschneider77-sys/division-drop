interface Props {
  onLeft: () => void
  onRight: () => void
  onSoftDrop: () => void
  onHardDrop: () => void
  onRotate: () => void
  onMath: () => void
  mathAvailable: boolean
  disabled?: boolean
}

export default function Controls({
  onLeft,
  onRight,
  onSoftDrop,
  onHardDrop,
  onRotate,
  onMath,
  mathAvailable,
  disabled,
}: Props) {
  return (
    <div className={`controls ${disabled ? 'disabled' : ''}`}>
      <div className="control-row">
        <button type="button" className="ctrl" onClick={onLeft} aria-label="Left">
          ◀
        </button>
        <button type="button" className="ctrl" onClick={onRotate} aria-label="Rotate">
          ↻
        </button>
        <button type="button" className="ctrl" onClick={onRight} aria-label="Right">
          ▶
        </button>
      </div>
      <div className="control-row">
        <button type="button" className="ctrl" onClick={onSoftDrop} aria-label="Soft drop">
          ▼
        </button>
        <button
          type="button"
          className="ctrl hard"
          onClick={onHardDrop}
          aria-label="Hard drop"
        >
          ⬇
        </button>
        <button
          type="button"
          className={`ctrl math ${mathAvailable ? 'lit' : ''}`}
          onClick={onMath}
          disabled={!mathAvailable}
          aria-label="Solve math power-up"
        >
          ÷
        </button>
      </div>
    </div>
  )
}
