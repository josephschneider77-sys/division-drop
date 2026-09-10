import { useMemo, type Ref } from 'react'
import * as THREE from 'three'
import type { CharmTheme } from '../game/themes'

const DEPTH = 0.72

/** Shared low-poly geometries — created once, reused across all cells. */
const geos = (() => {
  const starShape = new THREE.Shape()
  const pts = 5
  const outer = 0.42
  const inner = 0.18
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) starShape.moveTo(x, y)
    else starShape.lineTo(x, y)
  }
  starShape.closePath()
  const star = new THREE.ExtrudeGeometry(starShape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 1,
    curveSegments: 1,
  })
  star.translate(0, 0, -DEPTH / 2)
  star.computeVertexNormals()

  // Crescent: outer disc minus offset inner disc (as a Shape hole)
  const moonShape = new THREE.Shape()
  const outerR = 0.4
  const segs = 20
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(a) * outerR
    const y = Math.sin(a) * outerR
    if (i === 0) moonShape.moveTo(x, y)
    else moonShape.lineTo(x, y)
  }
  const hole = new THREE.Path()
  const innerR = 0.28
  const ox = 0.16
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(a) * innerR + ox
    const y = Math.sin(a) * innerR
    if (i === 0) hole.moveTo(x, y)
    else hole.lineTo(x, y)
  }
  moonShape.holes.push(hole)
  const moon = new THREE.ExtrudeGeometry(moonShape, {
    depth: DEPTH * 0.9,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 1,
    curveSegments: 1,
  })
  moon.translate(0, 0, -DEPTH * 0.45)
  moon.computeVertexNormals()

  const crystal = new THREE.OctahedronGeometry(0.4, 0)
  crystal.scale(1, 1.15, DEPTH * 0.7)
  crystal.computeVertexNormals()

  const pumpkin = new THREE.SphereGeometry(0.4, 12, 10)
  pumpkin.scale(1.05, 0.9, DEPTH * 0.55)
  pumpkin.computeVertexNormals()

  const potionBody = new THREE.CylinderGeometry(0.28, 0.32, 0.55, 12)
  const potionNeck = new THREE.CylinderGeometry(0.12, 0.16, 0.22, 10)
  const potionCork = new THREE.SphereGeometry(0.11, 8, 8)

  const broomStick = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6)
  const broomHead = new THREE.ConeGeometry(0.28, 0.4, 8)

  const hatBrim = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16)
  const hatCone = new THREE.ConeGeometry(0.28, 0.62, 12)

  const catHead = new THREE.SphereGeometry(0.34, 12, 10)
  catHead.scale(1.05, 0.95, DEPTH * 0.5)
  const ear = new THREE.ConeGeometry(0.14, 0.22, 6)

  return {
    star,
    moon,
    crystal,
    pumpkin,
    potionBody,
    potionNeck,
    potionCork,
    broomStick,
    broomHead,
    hatBrim,
    hatCone,
    catHead,
    ear,
    stem: new THREE.CylinderGeometry(0.05, 0.07, 0.14, 6),
    eye: new THREE.SphereGeometry(0.06, 6, 6),
    nose: new THREE.SphereGeometry(0.04, 6, 6),
  }
})()

interface CharmVisualProps {
  theme: CharmTheme
  color: THREE.Color
  ghost?: boolean
  matRef?: Ref<THREE.MeshStandardMaterial>
}

function CharmMaterial({
  color,
  ghost,
  matRef,
}: {
  color: THREE.Color
  ghost?: boolean
  matRef?: Ref<THREE.MeshStandardMaterial>
}) {
  return (
    <meshStandardMaterial
      ref={matRef}
      color={color}
      emissive={color}
      emissiveIntensity={ghost ? 0.08 : 0.1}
      roughness={ghost ? 0.32 : 0.28}
      metalness={ghost ? 0.1 : 0.22}
      transparent={!!ghost}
      opacity={ghost ? 0.4 : 1}
      envMapIntensity={0.85}
    />
  )
}

/** Accent material (ears, cork, stem) — slightly lighter. */
function AccentMaterial({
  color,
  ghost,
  lighten = 0.25,
}: {
  color: THREE.Color
  ghost?: boolean
  lighten?: number
}) {
  const c = useMemo(() => {
    const n = color.clone().lerp(new THREE.Color('#ffffff'), lighten)
    return n
  }, [color, lighten])
  return (
    <meshStandardMaterial
      color={c}
      emissive={c}
      emissiveIntensity={ghost ? 0.06 : 0.08}
      roughness={0.35}
      metalness={0.12}
      transparent={!!ghost}
      opacity={ghost ? 0.4 : 1}
    />
  )
}

/**
 * Cute 3D charm that sits inside one grid cell.
 * Collision / stacking still use the polyomino footprint — this is visual only.
 */
export function CharmVisual({ theme, color, ghost, matRef }: CharmVisualProps) {
  const dark = useMemo(() => color.clone().multiplyScalar(0.55), [color])

  switch (theme) {
    case 'star':
      return (
        <mesh geometry={geos.star} castShadow={!ghost} receiveShadow>
          <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
        </mesh>
      )

    case 'moon':
      return (
        <mesh geometry={geos.moon} castShadow={!ghost} receiveShadow>
          <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
        </mesh>
      )

    case 'crystal':
      return (
        <group>
          <mesh geometry={geos.crystal} castShadow={!ghost} receiveShadow>
            <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
          </mesh>
          {!ghost && (
            <mesh position={[0.08, 0.12, DEPTH * 0.25]}>
              <boxGeometry args={[0.12, 0.2, 0.04]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.35}
                roughness={0.1}
              />
            </mesh>
          )}
        </group>
      )

    case 'pumpkin':
      return (
        <group>
          <mesh geometry={geos.pumpkin} castShadow={!ghost} receiveShadow>
            <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
          </mesh>
          <mesh
            geometry={geos.stem}
            position={[0, 0.38, 0]}
            castShadow={!ghost}
          >
            <AccentMaterial color={dark} ghost={ghost} lighten={0.1} />
          </mesh>
          {!ghost && (
            <>
              <mesh geometry={geos.eye} position={[-0.12, 0.06, DEPTH * 0.28]}>
                <meshStandardMaterial color="#3d261c" roughness={0.6} />
              </mesh>
              <mesh geometry={geos.eye} position={[0.12, 0.06, DEPTH * 0.28]}>
                <meshStandardMaterial color="#3d261c" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.1, DEPTH * 0.28]}>
                <boxGeometry args={[0.14, 0.05, 0.04]} />
                <meshStandardMaterial color="#3d261c" roughness={0.6} />
              </mesh>
            </>
          )}
        </group>
      )

    case 'potion':
      return (
        <group>
          <mesh
            geometry={geos.potionBody}
            position={[0, -0.06, 0]}
            castShadow={!ghost}
            receiveShadow
          >
            <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
          </mesh>
          <mesh
            geometry={geos.potionNeck}
            position={[0, 0.28, 0]}
            castShadow={!ghost}
          >
            <AccentMaterial color={color} ghost={ghost} lighten={0.15} />
          </mesh>
          <mesh geometry={geos.potionCork} position={[0, 0.44, 0]} castShadow={!ghost}>
            <AccentMaterial color={dark} ghost={ghost} lighten={0.05} />
          </mesh>
        </group>
      )

    case 'broom':
      return (
        <group rotation={[0, 0, -0.35]}>
          <mesh
            geometry={geos.broomStick}
            position={[0, 0.12, 0]}
            castShadow={!ghost}
            receiveShadow
          >
            <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
          </mesh>
          <mesh
            geometry={geos.broomHead}
            position={[0, -0.32, 0]}
            rotation={[0, 0, Math.PI]}
            castShadow={!ghost}
          >
            <AccentMaterial color={dark} ghost={ghost} lighten={0.2} />
          </mesh>
        </group>
      )

    case 'witchHat':
      return (
        <group>
          <mesh
            geometry={geos.hatBrim}
            position={[0, -0.22, 0]}
            castShadow={!ghost}
            receiveShadow
          >
            <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
          </mesh>
          <mesh
            geometry={geos.hatCone}
            position={[0, 0.12, 0]}
            castShadow={!ghost}
          >
            <AccentMaterial color={color} ghost={ghost} lighten={0.08} />
          </mesh>
          {!ghost && (
            <mesh position={[0, -0.1, DEPTH * 0.2]}>
              <torusGeometry args={[0.22, 0.035, 6, 16]} />
              <meshStandardMaterial
                color="#FFD66E"
                emissive="#FFD66E"
                emissiveIntensity={0.35}
                roughness={0.35}
                metalness={0.4}
              />
            </mesh>
          )}
        </group>
      )

    case 'cat':
      return (
        <group>
          <mesh geometry={geos.catHead} castShadow={!ghost} receiveShadow>
            <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
          </mesh>
          <mesh
            geometry={geos.ear}
            position={[-0.22, 0.32, 0]}
            rotation={[0.15, 0, -0.35]}
            castShadow={!ghost}
          >
            <AccentMaterial color={color} ghost={ghost} lighten={0.1} />
          </mesh>
          <mesh
            geometry={geos.ear}
            position={[0.22, 0.32, 0]}
            rotation={[0.15, 0, 0.35]}
            castShadow={!ghost}
          >
            <AccentMaterial color={color} ghost={ghost} lighten={0.1} />
          </mesh>
          {!ghost && (
            <>
              <mesh geometry={geos.eye} position={[-0.11, 0.04, DEPTH * 0.28]}>
                <meshStandardMaterial
                  color="#2a1460"
                  emissive="#9AD0FF"
                  emissiveIntensity={0.25}
                />
              </mesh>
              <mesh geometry={geos.eye} position={[0.11, 0.04, DEPTH * 0.28]}>
                <meshStandardMaterial
                  color="#2a1460"
                  emissive="#9AD0FF"
                  emissiveIntensity={0.25}
                />
              </mesh>
              <mesh geometry={geos.nose} position={[0, -0.06, DEPTH * 0.3]}>
                <meshStandardMaterial color="#FF9AD8" roughness={0.4} />
              </mesh>
            </>
          )}
        </group>
      )

    default:
      return (
        <mesh castShadow={!ghost} receiveShadow>
          <boxGeometry args={[0.85, 0.85, DEPTH]} />
          <CharmMaterial color={color} ghost={ghost} matRef={matRef} />
        </mesh>
      )
  }
}
