import { COLOR_HEX, COLS, ROWS } from '../game/constants'
import { mergeGhost } from '../game/board'
import type { Cell, Piece } from '../game/types'

interface Props {
  board: Cell[][]
  piece: Piece | null
  shake?: boolean
  slowMo?: boolean
}

export default function Board({ board, piece, shake, slowMo }: Props) {
  const view = mergeGhost(board, piece)

  return (
    <div
      className={`board-wrap ${shake ? 'shake' : ''} ${slowMo ? 'slowmo' : ''}`}
      role="grid"
      aria-label="Game board"
    >
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {view.map((row, y) =>
          row.map((cell, x) => {
            const ghost = (cell as Cell & { ghost?: boolean }).ghost
            const active = (cell as Cell & { active?: boolean }).active
            const filled = cell.color !== 'empty'
            const bg =
              filled && cell.color !== 'empty'
                ? COLOR_HEX[cell.color]
                : undefined
            return (
              <div
                key={`${x}-${y}`}
                className={[
                  'cell',
                  filled ? 'filled' : '',
                  ghost && !active ? 'ghost' : '',
                  active ? 'active' : '',
                  cell.hasMath ? 'has-math' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={bg ? { backgroundColor: bg } : undefined}
              >
                {cell.hasMath && <span className="math-badge">÷</span>}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
