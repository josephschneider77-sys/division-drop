import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { COLOR_HEX, COLS, ROWS } from '../game/constants'
import { mergeGhost, type ClusterCell } from '../game/board'
import { THEME_EMOJI, type CharmTheme } from '../game/themes'
import type { Cell, Piece } from '../game/types'
import type { BustExplosion } from '../hooks/useGame'
import { CharmVisual, EmojiChunk } from './Charms'

interface Props {
  board: Cell[][]
  piece: Piece | null
  shake?: boolean
  slowMo?: boolean
  explosion?: BustExplosion | null
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
/** Extra pad in camera framing — near-zero so playfield fills the canvas tightly. */
const FRAME_MARGIN = 0.0

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
  theme,
  ghost,
  active,
  hasMath,
  burst,
}: {
  x: number
  y: number
  color: Exclude<Cell['color'], 'empty'>
  theme?: CharmTheme
  ghost?: boolean
  active?: boolean
  hasMath?: boolean
  burst?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshStandardMaterial>(null)
  const ring = useRef<THREE.MeshStandardMaterial>(null)
  const base = useMemo(() => new THREE.Color(COLOR_HEX[color]), [color])
  const charm = theme ?? 'crystal'
  // Live ÷ interaction only on the active falling math piece — never locked stack.
  const mathLive = !!(hasMath && active && !ghost)

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    let s = active ? 0.96 : 1
    if (mathLive) s *= 1 + Math.sin(t * 5.2) * 0.12
    if (burst) s *= 1 + Math.sin(t * 18) * 0.1
    group.current.scale.setScalar(s)
    if (active && !ghost) {
      group.current.rotation.z = Math.sin(t * 1.8) * 0.05
    } else {
      group.current.rotation.z = 0
    }
    if (glow.current) {
      glow.current.emissiveIntensity = burst
        ? 0.7 + Math.sin(t * 14) * 0.3
        : mathLive
          ? 0.45 + Math.sin(t * 5.2) * 0.35
          : ghost
            ? 0.06
            : 0.08
      glow.current.opacity = ghost ? 0.28 : mathLive ? 0.75 : 0.55
    }
    if (ring.current && mathLive) {
      ring.current.emissiveIntensity = 0.55 + Math.sin(t * 5.2) * 0.4
      ring.current.opacity = 0.55 + Math.sin(t * 5.2) * 0.35
    }
  })

  return (
    <group ref={group} position={cellPos(x, y)}>
      {/* Soft candy pedestal so emoji cells still read as grid occupants */}
      <mesh
        position={[0, 0, -BRICK_D * 0.22]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow={!ghost}
      >
        <cylinderGeometry args={[CELL * 0.44, CELL * 0.44, BRICK_D * 0.22, 14]} />
        <meshStandardMaterial
          ref={glow}
          color={base}
          emissive={base}
          emissiveIntensity={ghost ? 0.05 : 0.08}
          roughness={0.45}
          metalness={0.08}
          transparent
          opacity={ghost ? 0.28 : 0.55}
        />
      </mesh>
      {mathLive && (
        <mesh position={[0, 0, -BRICK_D * 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[CELL * 0.48, 0.055, 8, 28]} />
          <meshStandardMaterial
            ref={ring}
            color="#ffe600"
            emissive="#ff4fd8"
            emissiveIntensity={0.7}
            transparent
            opacity={0.75}
            roughness={0.35}
            metalness={0.2}
            depthWrite={false}
          />
        </mesh>
      )}
      <group position={[0, 0.02, BRICK_D * 0.1]}>
        <CharmVisual theme={charm} color={base} ghost={ghost} />
      </group>
      {mathLive && (
        <group position={[0.32, 0.32, BRICK_D * 0.42]}>
          <mesh>
            <circleGeometry args={[0.22, 24]} />
            <meshStandardMaterial
              color="#fff8e7"
              emissive="#ffe600"
              emissiveIntensity={0.85}
              roughness={0.35}
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
    <group position={[0, 0, 0.02]} scale={0.78}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshBasicMaterial color="#ff4fd8" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.28, 0.07, 0.04]} />
        <meshBasicMaterial color="#ff4fd8" />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshBasicMaterial color="#ff4fd8" />
      </mesh>
    </group>
  )
}

/**
 * Soft isometric orthographic camera — more depth than face-on, but milder
 * than the earlier steep iso so the tall stack still reads clearly on tablets.
 * Frames the full grid tightly on any aspect.
 */
function ResponsiveIsoCamera() {
  const { camera, size } = useThree()

  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera
    if (!cam.isOrthographicCamera) return

    const w = Math.max(1, size.width)
    const h = Math.max(1, size.height)
    const aspect = w / h

    const dist = 36
    // Mid iso: between face-on (0.22/0.16/0.96) and steep (0.55/0.42/0.78)
    cam.position.set(dist * 0.36, dist * 0.27, dist * 0.89)
    cam.up.set(0, 1, 0)
    cam.lookAt(0, -0.16, 0)
    cam.updateMatrixWorld(true)

    const halfW = BOARD_W / 2 + RAIL_W + 0.06
    const halfH = BOARD_H / 2 + FLOOR_H + 0.1
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
      <meshBasicMaterial color="#2efff0" transparent opacity={0.22} depthWrite={false} />
    </mesh>
  )
}

type Particle = {
  key: string
  origin: THREE.Vector3
  vel: THREE.Vector3
  spin: THREE.Vector3
  emoji: string
  color: THREE.Color
  delay: number
}

/** Emoji chunks flying apart on successful ÷ bust — Emoji-Movie energy, light for tablets. */
function BustExplosionFX({ cells }: { cells: ClusterCell[] }) {
  const group = useRef<THREE.Group>(null)
  const start = useRef(performance.now())
  const particles = useMemo(() => {
    const list: Particle[] = []
    cells.forEach((c, i) => {
      const [px, py, pz] = cellPos(c.x, c.y)
      const base = new THREE.Color(COLOR_HEX[c.color])
      const emoji = THEME_EMOJI[c.theme]
      // 2–3 chunks per cell so it reads as “exploded into pieces”
      const n = 2 + (i % 2)
      for (let k = 0; k < n; k++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2.2 + Math.random() * 3.4
        list.push({
          key: `${c.x}-${c.y}-${k}`,
          origin: new THREE.Vector3(
            px + (Math.random() - 0.5) * 0.25,
            py + (Math.random() - 0.5) * 0.25,
            pz + 0.2,
          ),
          vel: new THREE.Vector3(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed + 1.5,
            (Math.random() - 0.2) * 2.5,
          ),
          spin: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 10,
          ),
          emoji,
          color: base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.1),
          delay: Math.random() * 0.05,
        })
      }
    })
    return list
  }, [cells])

  const refs = useRef<(THREE.Group | null)[]>([])

  useFrame(() => {
    const t = (performance.now() - start.current) / 1000
    particles.forEach((p, i) => {
      const node = refs.current[i]
      if (!node) return
      const age = Math.max(0, t - p.delay)
      const grav = 6.5
      node.position.set(
        p.origin.x + p.vel.x * age,
        p.origin.y + p.vel.y * age - 0.5 * grav * age * age,
        p.origin.z + p.vel.z * age,
      )
      node.rotation.x = p.spin.x * age
      node.rotation.y = p.spin.y * age
      node.rotation.z = p.spin.z * age
      const life = 1 - Math.min(1, age / 0.85)
      const s = 0.55 + life * 0.55
      node.scale.setScalar(s * (0.7 + life * 0.3))
      node.visible = life > 0.02
    })
  })

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <group
          key={p.key}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={p.origin.toArray()}
        >
          <EmojiChunk emoji={p.emoji} color={p.color} />
        </group>
      ))}
      {/* Flash spark rings at cluster center */}
      <SparkFlash cells={cells} />
    </group>
  )
}

function SparkFlash({ cells }: { cells: ClusterCell[] }) {
  const ref = useRef<THREE.Mesh>(null)
  const start = useRef(performance.now())
  const center = useMemo(() => {
    if (!cells.length) return new THREE.Vector3()
    const s = new THREE.Vector3()
    for (const c of cells) {
      const [x, y, z] = cellPos(c.x, c.y)
      s.x += x
      s.y += y
      s.z += z
    }
    s.multiplyScalar(1 / cells.length)
    s.z += 0.5
    return s
  }, [cells])

  useFrame(() => {
    if (!ref.current) return
    const age = (performance.now() - start.current) / 1000
    const s = 0.4 + age * 6
    ref.current.scale.set(s, s, 1)
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = Math.max(0, 0.55 - age * 0.9)
  })

  return (
    <mesh ref={ref} position={center.toArray()}>
      <circleGeometry args={[0.6, 28]} />
      <meshBasicMaterial color="#ffe600" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}

/**
 * Slim left/right side boards marking the horizontal playfield edges —
 * not a bulky full wooden box. Light floor + back for iso depth.
 */
function SideBoards() {
  // Lisa Frank folder chrome — hot pink / purple / teal / neon yellow rails
  const railL = '#ff4fd8'
  const railR = '#2efff0'
  const railHi = '#ffe600'
  const railEdge = '#b44cff'
  const railH = BOARD_H + FLOOR_H * 0.5
  const railY = -FLOOR_H * 0.2
  const leftX = -BOARD_W / 2 - RAIL_W / 2 - 0.04
  const rightX = BOARD_W / 2 + RAIL_W / 2 + 0.04

  return (
    <group>
      <mesh position={[0, -FLOOR_H * 0.15, -RAIL_D * 0.42]} receiveShadow>
        <planeGeometry args={[BOARD_W + RAIL_W * 2.4, BOARD_H + FLOOR_H + 0.6]} />
        <meshStandardMaterial
          color="#5c0f96"
          roughness={0.88}
          metalness={0.05}
          transparent
          opacity={0.48}
        />
      </mesh>

      <group position={[leftX, railY, -0.15]}>
        <RoundedBox
          args={[RAIL_W, railH, RAIL_D]}
          radius={0.08}
          smoothness={3}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={railL}
            emissive={railL}
            emissiveIntensity={0.18}
            roughness={0.4}
            metalness={0.18}
          />
        </RoundedBox>
        <mesh position={[RAIL_W * 0.42, 0, 0.15]}>
          <boxGeometry args={[0.04, railH * 0.96, RAIL_D * 0.7]} />
          <meshStandardMaterial
            color={railHi}
            emissive={railHi}
            emissiveIntensity={0.25}
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[0, railH * 0.48, 0.05]}>
          <boxGeometry args={[RAIL_W * 0.9, 0.06, RAIL_D * 0.85]} />
          <meshStandardMaterial color={railEdge} roughness={0.4} />
        </mesh>
      </group>

      <group position={[rightX, railY, -0.15]}>
        <RoundedBox
          args={[RAIL_W, railH, RAIL_D]}
          radius={0.08}
          smoothness={3}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={railR}
            emissive={railR}
            emissiveIntensity={0.18}
            roughness={0.4}
            metalness={0.18}
          />
        </RoundedBox>
        <mesh position={[-RAIL_W * 0.42, 0, 0.15]}>
          <boxGeometry args={[0.04, railH * 0.96, RAIL_D * 0.7]} />
          <meshStandardMaterial
            color={railHi}
            emissive={railHi}
            emissiveIntensity={0.25}
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[0, railH * 0.48, 0.05]}>
          <boxGeometry args={[RAIL_W * 0.9, 0.06, RAIL_D * 0.85]} />
          <meshStandardMaterial color={railEdge} roughness={0.4} />
        </mesh>
      </group>

      <RoundedBox
        args={[BOARD_W + 0.12, FLOOR_H, RAIL_D * 0.85]}
        radius={0.06}
        smoothness={2}
        position={[0, -BOARD_H / 2 - FLOOR_H / 2 - 0.02, -0.12]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#b44cff"
          emissive="#ff4fd8"
          emissiveIntensity={0.12}
          roughness={0.45}
          metalness={0.12}
        />
      </RoundedBox>

      {Array.from({ length: COLS + 1 }).map((_, i) => (
        <mesh
          key={`vx-${i}`}
          position={[-BOARD_W / 2 + i * STEP - GAP / 2, 0, -0.55]}
        >
          <boxGeometry args={[0.02, BOARD_H, 0.01]} />
          <meshBasicMaterial color="#ffe600" transparent opacity={0.07} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({
  view,
  slowMo,
  explosion,
}: {
  view: ViewCell[][]
  slowMo?: boolean
  explosion?: BustExplosion | null
}) {
  const hideKeys = useMemo(() => {
    if (!explosion) return null
    return new Set(explosion.cells.map((c) => `${c.x},${c.y}`))
  }, [explosion])

  const bricks = useMemo(() => {
    const list: ReactNode[] = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = view[y][x]
        if (cell.color === 'empty') continue
        // Hide cells mid-bust so chunks replace them.
        if (hideKeys?.has(`${x},${y}`)) continue
        list.push(
          <Brick
            key={`${x}-${y}-${cell.active ? 'a' : cell.ghost ? 'g' : 'l'}-${cell.color}-${cell.theme ?? ''}`}
            x={x}
            y={y}
            color={cell.color}
            theme={cell.theme}
            ghost={cell.ghost && !cell.active}
            active={cell.active}
            hasMath={cell.hasMath}
            burst={!!slowMo && !!cell.active}
          />,
        )
      }
    }
    return list
  }, [view, slowMo, hideKeys])

  return (
    <>
      <ResponsiveIsoCamera />
      <color attach="background" args={['#4a0a7a']} />
      <ambientLight intensity={0.48} />
      <hemisphereLight args={['#ffe6fb', '#5c0f96', 0.7]} />
      <directionalLight
        castShadow
        position={[6, 12, 14]}
        intensity={1.3}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <directionalLight position={[-8, 6, 4]} intensity={0.48} color="#ff4fd8" />
      <pointLight position={[-5, 10, 8]} color="#ff4fd8" intensity={0.7} />
      <pointLight position={[6, -2, 7]} color="#2efff0" intensity={0.62} />
      <pointLight position={[0, 8, 10]} color="#ffe600" intensity={0.42} />
      <pointLight position={[3, 4, 9]} color="#b44cff" intensity={0.35} />
      <SideBoards />
      {bricks}
      {explosion && (
        <BustExplosionFX key={explosion.id} cells={explosion.cells} />
      )}
      <ClearBurst active={!!slowMo} />
    </>
  )
}

export default function Board({ board, piece, shake, slowMo, explosion }: Props) {
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
        <Scene view={view} slowMo={slowMo} explosion={explosion} />
      </Canvas>
    </div>
  )
}
