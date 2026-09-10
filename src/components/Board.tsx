import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { COLOR_HEX, COLS, ROWS } from '../game/constants'
import { mergeGhost } from '../game/board'
import type { Cell, Piece } from '../game/types'

interface Props {
  board: Cell[][]
  piece: Piece | null
  shake?: boolean
  slowMo?: boolean
}

type ViewCell = Cell & { ghost?: boolean; active?: boolean }

const CELL = 1
const GAP = 0.08
const STEP = CELL + GAP
const BOARD_W = COLS * STEP - GAP
const BOARD_H = ROWS * STEP - GAP
/** Extra world units of padding around the grid so bricks aren't edge-clipped. */
const FRAME_PAD = 0.55

function cellPos(x: number, y: number): [number, number, number] {
  return [
    x * STEP - BOARD_W / 2 + CELL / 2,
    (ROWS - 1 - y) * STEP - BOARD_H / 2 + CELL / 2,
    0,
  ]
}

function Brick({
  x,
  y,
  color,
  ghost,
  active,
  hasMath,
  burst,
}: {
  x: number
  y: number
  color: Exclude<Cell['color'], 'empty'>
  ghost?: boolean
  active?: boolean
  hasMath?: boolean
  burst?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const base = useMemo(() => new THREE.Color(COLOR_HEX[color]), [color])

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    let s = active ? 0.94 : 1
    if (hasMath && !ghost) s *= 1 + Math.sin(t * 4.5) * 0.04
    if (burst) s *= 1 + Math.sin(t * 18) * 0.08
    group.current.scale.setScalar(s)
    if (mat.current) {
      mat.current.emissiveIntensity = burst
        ? 0.55 + Math.sin(t * 14) * 0.25
        : hasMath && !ghost
          ? 0.28 + Math.sin(t * 3.2) * 0.12
          : ghost
            ? 0.05
            : 0.12
    }
  })

  const opacity = ghost ? 0.28 : 1

  return (
    <group ref={group} position={cellPos(x, y)}>
      <RoundedBox
        args={[CELL, CELL, CELL * 0.85]}
        radius={0.18}
        smoothness={3}
        castShadow={!ghost}
        receiveShadow
      >
        <meshStandardMaterial
          ref={mat}
          color={base}
          emissive={base}
          emissiveIntensity={0.12}
          roughness={0.35}
          metalness={0.08}
          transparent={!!ghost}
          opacity={opacity}
        />
      </RoundedBox>
      {!ghost && (
        <mesh position={[0, 0.18, 0.28]} castShadow={false}>
          <boxGeometry args={[CELL * 0.55, CELL * 0.12, 0.06]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.22}
            roughness={0.2}
          />
        </mesh>
      )}
      {hasMath && !ghost && (
        <group position={[0, 0, 0.52]}>
          <mesh>
            <circleGeometry args={[0.28, 24]} />
            <meshStandardMaterial
              color="#fff8e7"
              emissive="#ffc83d"
              emissiveIntensity={0.65}
              roughness={0.4}
            />
          </mesh>
          <MathGlyph />
        </group>
      )}
    </group>
  )
}

/** Lightweight ÷ mark without font loading (mobile-friendly). */
function MathGlyph() {
  return (
    <group position={[0, 0, 0.02]}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshBasicMaterial color="#5b2cff" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.28, 0.07, 0.04]} />
        <meshBasicMaterial color="#5b2cff" />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshBasicMaterial color="#5b2cff" />
      </mesh>
    </group>
  )
}

/**
 * Fit the full COLS×ROWS grid into the actual canvas with padding.
 * Orthographic frustum tracks canvas aspect so bricks scale with viewport
 * and never clip on phone/tablet or after orientation change.
 */
function ResponsiveCamera() {
  const { camera, size } = useThree()

  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera
    if (!cam.isOrthographicCamera) return

    const w = Math.max(1, size.width)
    const h = Math.max(1, size.height)
    const aspect = w / h

    const halfW = BOARD_W / 2 + FRAME_PAD
    const halfH = BOARD_H / 2 + FRAME_PAD
    const boardAspect = halfW / halfH

    let viewHalfW: number
    let viewHalfH: number
    if (aspect >= boardAspect) {
      // Canvas wider than board — height-limited
      viewHalfH = halfH
      viewHalfW = halfH * aspect
    } else {
      // Canvas taller/narrower — width-limited
      viewHalfW = halfW
      viewHalfH = halfW / aspect
    }

    cam.left = -viewHalfW
    cam.right = viewHalfW
    cam.top = viewHalfH
    cam.bottom = -viewHalfH
    cam.near = 0.1
    cam.far = 80
    cam.position.set(0, 0, 20)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  // Also refresh on visualViewport / orientation (iOS Safari quirks)
  useEffect(() => {
    const refresh = () => {
      // R3F size updates from ResizeObserver; force a paint path via invalidate
      // by touching the camera matrix after layout settles.
      requestAnimationFrame(() => {
        const cam = camera as THREE.OrthographicCamera
        if (cam.isOrthographicCamera) cam.updateProjectionMatrix()
      })
    }
    window.addEventListener('orientationchange', refresh)
    window.addEventListener('resize', refresh)
    const vv = window.visualViewport
    vv?.addEventListener('resize', refresh)
    return () => {
      window.removeEventListener('orientationchange', refresh)
      window.removeEventListener('resize', refresh)
      vv?.removeEventListener('resize', refresh)
    }
  }, [camera])

  return null
}

function ClearBurst({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current || !active) return
    const t = clock.getElapsedTime()
    const s = 1.05 + Math.sin(t * 10) * 0.04
    ref.current.scale.set(s, s, 1)
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.18 + Math.sin(t * 12) * 0.08
  })
  if (!active) return null
  return (
    <mesh ref={ref} position={[0, 0, 0.7]}>
      <planeGeometry args={[BOARD_W + 0.6, BOARD_H + 0.6]} />
      <meshBasicMaterial color="#2ee6d6" transparent opacity={0.2} />
    </mesh>
  )
}

/** Soft open backdrop — no walls / wooden frame / well. */
function OpenBackdrop() {
  return (
    <group>
      {/* Subtle ground plane behind the stack for depth, not a box frame */}
      <mesh position={[0, 0, -1.2]} receiveShadow>
        <planeGeometry args={[BOARD_W + 8, BOARD_H + 8]} />
        <meshStandardMaterial color="#120628" roughness={0.95} metalness={0} />
      </mesh>
      {/* Very faint column guides so kids can still sense the grid */}
      {Array.from({ length: COLS + 1 }).map((_, i) => (
        <mesh
          key={`vx-${i}`}
          position={[-BOARD_W / 2 + i * STEP - GAP / 2, 0, -0.9]}
        >
          <boxGeometry args={[0.02, BOARD_H, 0.01]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.035} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ view, slowMo }: { view: ViewCell[][]; slowMo?: boolean }) {
  const bricks = useMemo(() => {
    const list: ReactNode[] = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = view[y][x]
        if (cell.color === 'empty') continue
        list.push(
          <Brick
            key={`${x}-${y}-${cell.active ? 'a' : cell.ghost ? 'g' : 'l'}-${cell.color}`}
            x={x}
            y={y}
            color={cell.color}
            ghost={cell.ghost && !cell.active}
            active={cell.active}
            hasMath={cell.hasMath}
            burst={!!slowMo && !!cell.active}
          />,
        )
      }
    }
    return list
  }, [view, slowMo])

  return (
    <>
      <ResponsiveCamera />
      <color attach="background" args={['#16083a']} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#cbb8ff', '#1a0a3e', 0.45]} />
      <directionalLight
        castShadow
        position={[6, 14, 10]}
        intensity={1.15}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <pointLight position={[-6, 8, 8]} color="#ff6bcb" intensity={0.45} />
      <pointLight position={[5, -4, 6]} color="#2ee6d6" intensity={0.35} />
      <OpenBackdrop />
      {bricks}
      <ClearBurst active={!!slowMo} />
    </>
  )
}

export default function Board({ board, piece, shake, slowMo }: Props) {
  const view = useMemo(() => mergeGhost(board, piece), [board, piece])

  return (
    <div
      className={`board-wrap ${shake ? 'shake' : ''} ${slowMo ? 'slowmo' : ''}`}
      role="grid"
      aria-label="Game board"
    >
      <Canvas
        className="board-canvas"
        shadows
        dpr={[1, 1.5]}
        orthographic
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [0, 0, 20],
          zoom: 1,
          near: 0.1,
          far: 80,
        }}
        style={{ pointerEvents: 'none', touchAction: 'none' }}
      >
        <Scene view={view} slowMo={slowMo} />
      </Canvas>
    </div>
  )
}
