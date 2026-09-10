interface Props {
  onDismiss: () => void
}

export default function ParentTip({ onDismiss }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal tip-modal">
        <h2>Install on a phone or tablet</h2>
        <p>
          Division Drop works great as an app on Android. In Chrome, tap{' '}
          <strong>⋮</strong> → <strong>Add to Home screen</strong> or{' '}
          <strong>Install app</strong>.
        </p>
        <ul>
          <li>Portrait mode is best</li>
          <li>Big buttons for little fingers</li>
          <li>Math is optional — she can just stack if she wants</li>
        </ul>
        <button type="button" className="primary-btn" onClick={onDismiss}>
          Got it — let&apos;s play!
        </button>
      </div>
    </div>
  )
}
