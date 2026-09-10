import { lazy, Suspense, useRef } from 'react'
import Controls from './components/Controls'
import HUD from './components/HUD'
import MathModal from './components/MathModal'
import ParentTip from './components/ParentTip'
import {
  GameOverOverlay,
  PauseOverlay,
  ReadyOverlay,
} from './components/Overlays'
import { useGame } from './hooks/useGame'

const Board = lazy(() => import('./components/Board'))

export default function App() {
  const game = useGame()
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const touchHandled = useRef(false)

  const onBoardTap = () => {
    if (game.phase !== 'playing') return
    // Tap the active math piece (pulsing ÷ block) to open division.
    if (game.piece?.hasMath && !game.piece.mathSolved) {
      game.openMath()
      return
    }
    game.rotate()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current
    touchRef.current = null
    if (!start || game.phase !== 'playing') return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    touchHandled.current = true
    window.setTimeout(() => {
      touchHandled.current = false
    }, 450)

    if (adx < 24 && ady < 24) {
      onBoardTap()
      return
    }
    if (adx > ady) {
      if (dx > 0) game.tryMove(1, 0)
      else game.tryMove(-1, 0)
    } else if (dy > 40) {
      if (dy > 120) game.hardDrop()
      else game.tryMove(0, 1)
    }
  }

  const onClick = () => {
    if (touchHandled.current) return
    onBoardTap()
  }

  const mathAvailable = !!game.piece?.hasMath && !game.piece.mathSolved

  return (
    <div className="app">
      <div className="app-shell">
        {(game.phase === 'playing' ||
          game.phase === 'paused' ||
          game.phase === 'math' ||
          game.phase === 'gameover') && (
          <HUD
            stats={game.stats}
            progress={game.progress}
            next={game.nextPiece}
            onPause={game.togglePause}
            onMute={game.toggleMute}
          />
        )}

        <main
          className="playfield"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={onClick}
        >
          {(game.phase === 'playing' ||
            game.phase === 'paused' ||
            game.phase === 'math' ||
            game.phase === 'gameover') && (
            <Suspense fallback={<div className="board-wrap board-loading" />}>
              <Board
                board={game.board}
                piece={game.piece}
                shake={game.shake}
                slowMo={game.slowMo}
              />
            </Suspense>
          )}

          {game.flashMsg && <div className="flash">{game.flashMsg}</div>}

          {game.phase === 'ready' && (
            <ReadyOverlay progress={game.progress} onStart={game.startGame} />
          )}
          {game.phase === 'paused' && (
            <PauseOverlay
              onResume={game.togglePause}
              onRestart={game.startGame}
              muted={game.progress.muted}
              onMute={game.toggleMute}
            />
          )}
          {game.phase === 'gameover' && (
            <GameOverOverlay
              stats={game.stats}
              progress={game.progress}
              onRestart={game.startGame}
            />
          )}
        </main>

        {(game.phase === 'playing' || game.phase === 'math') && (
          <Controls
            onLeft={() => game.tryMove(-1, 0)}
            onRight={() => game.tryMove(1, 0)}
            onSoftDrop={() => game.tryMove(0, 1)}
            onHardDrop={game.hardDrop}
            onRotate={game.rotate}
            mathHint={mathAvailable && game.phase === 'playing'}
            disabled={game.phase === 'math'}
          />
        )}
      </div>

      {game.phase === 'math' && game.problem && (
        <MathModal
          problem={game.problem}
          onAnswer={game.answerMath}
          onSkip={game.skipMath}
        />
      )}

      {!game.progress.tipSeen && game.phase === 'ready' && (
        <ParentTip onDismiss={game.dismissTip} />
      )}
    </div>
  )
}
