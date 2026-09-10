import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearFullLines,
  clearMathCluster,
  emptyBoard,
  fits,
  lockPiece,
  pieceCells,
} from '../game/board'
import { dropInterval } from '../game/constants'
import { generateProblem, unlockedFamilies } from '../game/math'
import { resetBag, rotatePiece, spawnPiece } from '../game/pieces'
import { loadProgress, mergeUnlocks, saveProgress } from '../game/storage'
import type {
  Cell,
  DivisionProblem,
  GamePhase,
  GameStats,
  Piece,
  Progress,
} from '../game/types'

const LINE_SCORES = [0, 100, 300, 500, 800]

export function useGame() {
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard())
  const [piece, setPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece>(() => spawnPiece())
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    problemsSolved: 0,
  })
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [problem, setProblem] = useState<DivisionProblem | null>(null)
  const [shake, setShake] = useState(false)
  const [slowMo, setSlowMo] = useState(false)
  const [flashMsg, setFlashMsg] = useState<string | null>(null)

  const phaseRef = useRef(phase)
  const pieceRef = useRef(piece)
  const boardRef = useRef(board)
  const statsRef = useRef(stats)
  const nextRef = useRef(nextPiece)
  const progressRef = useRef(progress)
  const slowMoRef = useRef(slowMo)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    pieceRef.current = piece
  }, [piece])
  useEffect(() => {
    boardRef.current = board
  }, [board])
  useEffect(() => {
    statsRef.current = stats
  }, [stats])
  useEffect(() => {
    nextRef.current = nextPiece
  }, [nextPiece])
  useEffect(() => {
    progressRef.current = progress
  }, [progress])
  useEffect(() => {
    slowMoRef.current = slowMo
  }, [slowMo])

  const persist = useCallback((p: Progress) => {
    setProgress(p)
    saveProgress(p)
  }, [])

  const showFlash = useCallback((msg: string) => {
    setFlashMsg(msg)
    window.setTimeout(() => setFlashMsg(null), 1400)
  }, [])

  const spawnNext = useCallback(() => {
    const incoming = nextRef.current
    const following = spawnPiece()
    setNextPiece(following)
    nextRef.current = following

    if (!fits(boardRef.current, incoming)) {
      setPiece(null)
      setPhase('gameover')
      const s = statsRef.current
      const prev = progressRef.current
      const fams = unlockedFamilies(
        prev.problemsSolved + s.problemsSolved,
        Math.max(s.level, prev.bestLevel),
      )
      persist({
        ...prev,
        highScore: Math.max(prev.highScore, s.score),
        bestLevel: Math.max(prev.bestLevel, s.level),
        gamesPlayed: prev.gamesPlayed + 1,
        problemsSolved: prev.problemsSolved + s.problemsSolved,
        unlockedFamilies: mergeUnlocks(prev.unlockedFamilies, fams),
      })
      return
    }
    setPiece(incoming)
    pieceRef.current = incoming
  }, [persist])

  const startGame = useCallback(() => {
    resetBag()
    const b = emptyBoard()
    setBoard(b)
    boardRef.current = b
    const first = spawnPiece(true)
    const nxt = spawnPiece()
    setPiece(first)
    pieceRef.current = first
    setNextPiece(nxt)
    nextRef.current = nxt
    setStats({ score: 0, level: 1, lines: 0, combo: 0, problemsSolved: 0 })
    setProblem(null)
    setSlowMo(false)
    setPhase('playing')
  }, [])

  const lockAndContinue = useCallback(
    (p: Piece) => {
      let locked = lockPiece(boardRef.current, p)
      const lineResult = clearFullLines(locked)
      locked = lineResult.board
      boardRef.current = locked
      setBoard(locked)

      const s = statsRef.current
      let scoreAdd = 0
      let lines = s.lines
      let level = s.level
      let combo = s.combo

      if (lineResult.cleared > 0) {
        combo += 1
        scoreAdd +=
          LINE_SCORES[lineResult.cleared] * level +
          combo * 25 +
          lineResult.mathBonus * 50
        lines += lineResult.cleared
        level = Math.floor(lines / 8) + 1
        showFlash(
          lineResult.cleared === 1
            ? 'Nice line!'
            : lineResult.cleared === 2
              ? 'Double!'
              : lineResult.cleared === 3
                ? 'Triple!'
                : 'SUPER CLEAR!',
        )
      } else {
        combo = 0
        scoreAdd += 8
      }

      const nextStats = {
        ...s,
        score: s.score + scoreAdd,
        lines,
        level,
        combo,
      }
      statsRef.current = nextStats
      setStats(nextStats)
      setPiece(null)
      spawnNext()
    },
    [showFlash, spawnNext],
  )

  const tryMove = useCallback(
    (dx: number, dy: number) => {
      if (phaseRef.current !== 'playing') return false
      const p = pieceRef.current
      if (!p) return false
      const moved = { ...p, x: p.x + dx, y: p.y + dy }
      if (fits(boardRef.current, moved)) {
        setPiece(moved)
        pieceRef.current = moved
        return true
      }
      if (dy > 0) {
        lockAndContinue(p)
      }
      return false
    },
    [lockAndContinue],
  )

  const hardDrop = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    const p = pieceRef.current
    if (!p) return
    let cur = p
    let dist = 0
    while (fits(boardRef.current, { ...cur, y: cur.y + 1 })) {
      cur = { ...cur, y: cur.y + 1 }
      dist++
    }
    const s = {
      ...statsRef.current,
      score: statsRef.current.score + dist * 2,
    }
    statsRef.current = s
    setStats(s)
    lockAndContinue(cur)
  }, [lockAndContinue])

  const rotate = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    const p = pieceRef.current
    if (!p) return
    const rotated = rotatePiece(p)
    // wall kicks
    const kicks = [0, -1, 1, -2, 2]
    for (const k of kicks) {
      const candidate = { ...rotated, x: rotated.x + k }
      if (fits(boardRef.current, candidate)) {
        setPiece(candidate)
        pieceRef.current = candidate
        return
      }
    }
  }, [])

  const openMath = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    const p = pieceRef.current
    if (!p || !p.hasMath || p.mathSolved) return
    const fams = unlockedFamilies(
      progressRef.current.problemsSolved + statsRef.current.problemsSolved,
      statsRef.current.level,
    )
    const prob = generateProblem(fams, statsRef.current.level >= 4)
    setProblem(prob)
    setPhase('math')
  }, [])

  const answerMath = useCallback(
    (choice: number) => {
      const prob = problem
      const p = pieceRef.current
      if (!prob || !p) {
        setPhase('playing')
        return
      }

      if (choice === prob.answer) {
        const solved = { ...p, mathSolved: true, hasMath: false }
        setPiece(solved)
        pieceRef.current = solved

        // Clear cluster at piece cells after a brief slow-mo
        setSlowMo(true)
        showFlash('Math power-up! ✨')

        const cells = pieceCells(solved)
        const anchor = cells[Math.floor(cells.length / 2)] ?? cells[0]

        window.setTimeout(() => {
          // Lock first then clear cluster around anchor
          let locked = lockPiece(boardRef.current, solved)
          const cluster = clearMathCluster(locked, anchor.x, anchor.y)
          locked = cluster.board
          const lines = clearFullLines(locked)
          locked = lines.board
          boardRef.current = locked
          setBoard(locked)

          const bonus =
            150 +
            cluster.cleared * 40 +
            LINE_SCORES[lines.cleared] * statsRef.current.level
          const nextStats: GameStats = {
            ...statsRef.current,
            score: statsRef.current.score + bonus,
            lines: statsRef.current.lines + lines.cleared,
            level: Math.floor((statsRef.current.lines + lines.cleared) / 8) + 1,
            problemsSolved: statsRef.current.problemsSolved + 1,
            combo: statsRef.current.combo + 1,
          }
          statsRef.current = nextStats
          setStats(nextStats)

          const fams = unlockedFamilies(
            progressRef.current.problemsSolved + nextStats.problemsSolved,
            nextStats.level,
          )
          persist({
            ...progressRef.current,
            unlockedFamilies: mergeUnlocks(
              progressRef.current.unlockedFamilies,
              fams,
            ),
          })

          setSlowMo(false)
          setProblem(null)
          setPhase('playing')
          setPiece(null)
          spawnNext()
        }, 650)
      } else {
        // Soft fail
        setShake(true)
        showFlash('Oops — keep going!')
        window.setTimeout(() => setShake(false), 400)
        setProblem(null)
        setPhase('playing')
      }
    },
    [problem, persist, showFlash, spawnNext],
  )

  const skipMath = useCallback(() => {
    setProblem(null)
    setPhase('playing')
  }, [])

  const togglePause = useCallback(() => {
    if (phaseRef.current === 'playing') setPhase('paused')
    else if (phaseRef.current === 'paused') setPhase('playing')
  }, [])

  const toggleMute = useCallback(() => {
    const next = { ...progressRef.current, muted: !progressRef.current.muted }
    persist(next)
  }, [persist])

  const dismissTip = useCallback(() => {
    persist({ ...progressRef.current, tipSeen: true })
  }, [persist])

  // Gravity tick
  useEffect(() => {
    if (phase !== 'playing') return
    const ms = slowMo ? dropInterval(stats.level) * 3 : dropInterval(stats.level)
    const id = window.setInterval(() => {
      tryMove(0, 1)
    }, ms)
    return () => window.clearInterval(id)
  }, [phase, stats.level, slowMo, tryMove])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault()
        togglePause()
        return
      }
      if (phaseRef.current === 'math') return
      if (phaseRef.current !== 'playing') return
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          tryMove(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          tryMove(1, 0)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          tryMove(0, 1)
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault()
          if (e.key === ' ') hardDrop()
          else rotate()
          break
        case 'Enter':
          e.preventDefault()
          openMath()
          break
        case 'x':
        case 'X':
          e.preventDefault()
          hardDrop()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tryMove, rotate, hardDrop, openMath, togglePause])

  return {
    board,
    piece,
    nextPiece,
    phase,
    stats,
    progress,
    problem,
    shake,
    slowMo,
    flashMsg,
    startGame,
    tryMove,
    hardDrop,
    rotate,
    openMath,
    answerMath,
    skipMath,
    togglePause,
    toggleMute,
    dismissTip,
  }
}
