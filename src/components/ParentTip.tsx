interface Props {
  onDismiss: () => void
}

export default function ParentTip({ onDismiss }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal tip-modal">
        <h2>Add Division Drop to your home screen</h2>
        <p>
          Open this link in the phone or tablet browser, then install it like an
          app (no App Store / Play Store needed).
        </p>
        <ul>
          <li>
            <strong>Android (Chrome):</strong> tap <strong>⋮</strong> →{' '}
            <strong>Install app</strong> or <strong>Add to Home screen</strong>
          </li>
          <li>
            <strong>iPhone / iPad (Safari):</strong> tap Share{' '}
            <strong>□↑</strong> → <strong>Add to Home Screen</strong> →{' '}
            <strong>Add</strong>
          </li>
          <li>Portrait mode is best</li>
          <li>Tap a glowing ÷ brick to solve and power-clear</li>
          <li>Math is optional — she can just stack if she wants</li>
        </ul>
        <button type="button" className="primary-btn" onClick={onDismiss}>
          Got it — let&apos;s play!
        </button>
      </div>
    </div>
  )
}
