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
/** Brick depth — thick enough that iso shows a clear top face. */
const BRICK_D = 0.95
/** Side board (left/right edge) thickness & depth. */
const RAIL_W = 0.38
const RAIL_D = 1.35
const FLOOR_H = 0.32
/** Extra pad in camera framing — keep tight so playfield fills the canvas. */
const FRAME_MARGIN = 0.04

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
          ? 0.22 + Math.sin(t * 3.2) * 0.1
          : ghost
            ? 0.08
            : 0.06
    }
  })

  const opacity = ghost ? 0.38 : 1

  return (
    <group ref={group} position={cellPos(x, y)}>
      <RoundedBox
        args={[CELL * 0.96, CELL * 0.96, BRICK_D]}
        radius={0.16}
        smoothness={4}
        castShadow={!ghost}
        receiveShadow
      >
        <meshStandardMaterial
          ref={mat}
          color={base}
          emissive={base}
          emissiveIntensity={ghost ? 0.08 : 0.06}
          roughness={ghost ? 0.28 : 0.22}
          metalness={ghost ? 0.12 : 0.18}
          transparent={!!ghost}
          opacity={opacity}
          envMapIntensity={0.8}
        />
      </RoundedBox>
      {/* Specular “candy” highlight on the top-front bevel */}
      {!ghost && (
        <mesh position={[0.06, 0.22, BRICK_D * 0.28]} castShadow={false}>
          <boxGeometry args={[CELL * 0.42, CELL * 0.1, 0.05]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.32}
            roughness={0.12}
            metalness={0.05}
          />
        </mesh>
      )}
      {/* Ghost outline rim so translucent bricks still read as 3D cubes */}
      {ghost && (
        <RoundedBox
          args={[CELL * 0.98, CELL * 0.98, BRICK_D * 1.02]}
          radius={0.17}
          smoothness={3}
        >
          <meshBasicMaterial
            color={base}
            transparent
            opacity={0.22}
            wireframe={false}
            depthWrite={false}
          />
        </RoundedBox>
      )}
      {hasMath && !ghost && (
        <group position={[0, 0, BRICK_D * 0.52]}>
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
 * Mild orthographic 3D camera — mostly face-on so the tall stack reads
 * clearly, with a light elevation + side offset so brick tops/sides and
 * left/right rails still show. Frames the full grid on any aspect.
 */
function ResponsiveIsoCamera() {
  const { camera, size } = useThree()

  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera
    if (!cam.isOrthographicCamera) return

    const w = Math.max(1, size.width)
    const h = Math.max(1, size.height)
    const aspect = w / h

    // Dialed-back iso: mostly front, slight yaw/pitch for 3D depth.
    // Steep game-iso crushed the board; dead-flat hid brick sides.
    const dist = 36
    cam.position.set(dist * 0.22, dist * 0.16, dist * 0.96)
    cam.up.set(0, 1, 0)
    cam.lookAt(0, -0.1, 0)
    cam.updateMatrixWorld(true)

    // AABB of playfield + left/right rails + floor + brick depth
    const halfW = BOARD_W / 2 + RAIL_W + 0.15
    const halfH = BOARD_H / 2 + FLOOR_H + 0.25
    const zNear = -RAIL_D * 0.55
    const zFar = BRICK_D * 0.65
    const corners = [
      new THREE.Vector3(-halfW, -halfH, zNear),
      new THREE.Vector3(halfW, -halfH, zNear),
      new THREE.Vector3(-halfW, halfH, zNear),
      new THREE.Vector3(halfW, halfH, zNear),
      new THREE.Vector3(-halfW, -halfH, zFar),
      new THREE.Vector3(halfW, -halfH, zFar),
      new THREE.Vector3(-halfW, halfH, zFar),
      new THREE.Vector3(halfW, halfH, zFar),
    ]

    const inv = cam.matrixWorldInverse
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const v = new THREE.Vector3()
    for (const c of corners) {
      v.copy(c).applyMatrix4(inv)
      minX = Math.min(minX, v.x)
      maxX = Math.max(maxX, v.x)
      minY = Math.min(minY, v.y)
      maxY = Math.max(maxY, v.y)
    }

    const contentW = Math.max(0.001, maxX - minX)
    const contentH = Math.max(0.001, maxY - minY)
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const contentAspect = contentW / contentH

    let viewW: number
    let viewH: number
    if (aspect >= contentAspect) {
      viewH = contentH * (1 + FRAME_MARGIN)
      viewW = viewH * aspect
    } else {
      viewW = contentW * (1 + FRAME_MARGIN)
      viewH = viewW / aspect
    }

    cam.left = cx - viewW / 2
    cam.right = cx + viewW / 2
    cam.top = cy + viewH / 2
    cam.bottom = cy - viewH / 2
    cam.near = 0.1
    cam.far = 120
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  useEffect(() => {
    const refresh = () => {
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
    <mesh ref={ref} position={[0, 0, 0.85]} rotation={[0, 0, 0]}>
      <planeGeometry args={[BOARD_W + 0.8, BOARD_H + 0.8]} />
      <meshBasicMaterial color="#2ee6d6" transparent opacity={0.2} depthWrite={false} />
    </mesh>
  )
}

/**
 * Slim left/right side boards marking the horizontal playfield edges —
 * not a bulky full wooden box. Light floor + back for iso depth.
 */
function SideBoards() {
  const wood = '#5c3d2e'
  const woodHi = '#7a5540'
  const woodEdge = '#3d261c'
  const railH = BOARD_H + FLOOR_H * 0.5
  const railY = -FLOOR_H * 0.2
  const leftX = -BOARD_W / 2 - RAIL_W / 2 - 0.04
  const rightX = BOARD_W / 2 + RAIL_W / 2 + 0.04

  return (
    <group>
      {/* Soft back plane — just enough for shadows / depth, stays light */}
      <mesh position={[0, -FLOOR_H * 0.15, -RAIL_D * 0.42]} receiveShadow>
        <planeGeometry args={[BOARD_W + RAIL_W * 2.4, BOARD_H + FLOOR_H + 0.6]} />
        <meshStandardMaterial
          color="#1a0a38"
          roughness={0.92}
          metalness={0}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Left rail */}
      <group position={[leftX, railY, -0.15]}>
        <RoundedBox
          args={[RAIL_W, railH, RAIL_D]}
          radius={0.08}
          smoothness={3}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={wood}
            roughness={0.55}
            metalness={0.08}
          />
        </RoundedBox>
        {/* Inner face highlight so the boundary reads clearly */}
        <mesh position={[RAIL_W * 0.42, 0, 0.15]}>
          <boxGeometry args={[0.04, railH * 0.96, RAIL_D * 0.7]} />
          <meshStandardMaterial color={woodHi} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, railH * 0.48, 0.05]}>
          <boxGeometry args={[RAIL_W * 0.9, 0.06, RAIL_D * 0.85]} />
          <meshStandardMaterial color={woodEdge} roughness={0.5} />
        </mesh>
      </group>

      {/* Right rail */}
      <group position={[rightX, railY, -0.15]}>
        <RoundedBox
          args={[RAIL_W, railH, RAIL_D]}
          radius={0.08}
          smoothness={3}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={wood}
            roughness={0.55}
            metalness={0.08}
          />
        </RoundedBox>
        <mesh position={[-RAIL_W * 0.42, 0, 0.15]}>
          <boxGeometry args={[0.04, railH * 0.96, RAIL_D * 0.7]} />
          <meshStandardMaterial color={woodHi} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, railH * 0.48, 0.05]}>
          <boxGeometry args={[RAIL_W * 0.9, 0.06, RAIL_D * 0.85]} />
          <meshStandardMaterial color={woodEdge} roughness={0.5} />
        </mesh>
      </group>

      {/* Subtle floor strip between the rails */}
      <RoundedBox
        args={[BOARD_W + 0.12, FLOOR_H, RAIL_D * 0.85]}
        radius={0.06}
        smoothness={2}
        position={[0, -BOARD_H / 2 - FLOOR_H / 2 - 0.02, -0.12]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={woodHi} roughness={0.6} metalness={0.05} />
      </RoundedBox>

      {/* Faint column guides */}
      {Array.from({ length: COLS + 1 }).map((_, i) => (
        <mesh
          key={`vx-${i}`}
          position={[-BOARD_W / 2 + i * STEP - GAP / 2, 0, -0.55]}
        >
          <boxGeometry args={[0.02, BOARD_H, 0.01]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
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
      <ResponsiveIsoCamera />
      <color attach="background" args={['#16083a']} />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={['#e8dcff', '#1a0a3e', 0.55]} />
      {/* Key light slightly off-axis so top + side faces still separate */}
      <directionalLight
        castShadow
        position={[6, 12, 14]}
        intensity={1.25}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      {/* Fill + rim so side/top faces separate from the front */}
      <directionalLight position={[-8, 6, 4]} intensity={0.35} color="#cbb8ff" />
      <pointLight position={[-5, 10, 8]} color="#ff6bcb" intensity={0.4} />
      <pointLight position={[6, -2, 7]} color="#2ee6d6" intensity={0.38} />
      <SideBoards />
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
          position: [20, 15, 28],
          zoom: 1,
          near: 0.1,
          far: 120,
        }}
        style={{ pointerEvents: 'none', touchAction: 'none' }}
      >
        <Scene view={view} slowMo={slowMo} />
      </Canvas>
    </div>
  )
}
