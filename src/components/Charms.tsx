import { RoundedBox } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CharmTheme } from '../game/themes'
import { THEME_EMOJI } from '../game/themes'

/** Cached canvas textures so every cell of the same charm shares one emoji atlas. */
const textureCache = new Map<string, THREE.CanvasTexture>()

export function emojiTexture(emoji: string): THREE.CanvasTexture {
  const hit = textureCache.get(emoji)
  if (hit) return hit

  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  // System color-emoji fonts read clearly on Android Chrome / tablets.
  ctx.font =
    '190px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, size / 2 + 10)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  textureCache.set(emoji, tex)
  return tex
}

interface CharmVisualProps {
  theme: CharmTheme
  /** Candy body tint — matches pedestal / theme color. */
  color?: THREE.Color
  ghost?: boolean
}

/**
 * Volumetric “Emoji Movie” charm: chunky rounded candy body + glossy
 * materials + emoji face sticker. Fits one Tetris cell; stacking unchanged.
 */
export function CharmVisual({ theme, color, ghost }: CharmVisualProps) {
  const emoji = THEME_EMOJI[theme]
  const map = useMemo(() => emojiTexture(emoji), [emoji])
  const bodyColor = useMemo(
    () => (color ? color.clone() : new THREE.Color('#ffd6ef')),
    [color],
  )
  const hiColor = useMemo(() => bodyColor.clone().lerp(new THREE.Color('#ffffff'), 0.35), [bodyColor])
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!group.current || ghost) return
    // Tiny idle bob so charms feel alive (like movie emoji characters).
    const t = clock.getElapsedTime()
    group.current.position.y = Math.sin(t * 2.4 + theme.length) * 0.018
  })

  const opacity = ghost ? 0.32 : 1

  return (
    <group ref={group} scale={ghost ? 0.92 : 1}>
      {/* Deep candy shell — rounded extrusion for volumetric read */}
      <RoundedBox
        args={[0.82, 0.82, 0.58]}
        radius={0.2}
        smoothness={4}
        castShadow={!ghost}
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color={bodyColor}
          roughness={0.22}
          metalness={0.12}
          clearcoat={ghost ? 0 : 0.85}
          clearcoatRoughness={0.18}
          transparent={ghost}
          opacity={opacity}
        />
      </RoundedBox>

      {/* Soft cheek / side bulge for face-like depth */}
      <mesh position={[-0.28, -0.06, 0.12]} castShadow={!ghost}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshPhysicalMaterial
          color={hiColor}
          roughness={0.28}
          metalness={0.08}
          clearcoat={0.6}
          transparent={ghost}
          opacity={opacity * 0.85}
        />
      </mesh>
      <mesh position={[0.28, -0.06, 0.12]} castShadow={!ghost}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshPhysicalMaterial
          color={hiColor}
          roughness={0.28}
          metalness={0.08}
          clearcoat={0.6}
          transparent={ghost}
          opacity={opacity * 0.85}
        />
      </mesh>

      {/* Slightly inset front plate so the emoji sits like a face sticker */}
      <mesh position={[0, 0.02, 0.3]} castShadow={!ghost} renderOrder={2}>
        <circleGeometry args={[0.34, 24]} />
        <meshPhysicalMaterial
          color="#fff8f0"
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.5}
          transparent={ghost}
          opacity={opacity}
        />
      </mesh>

      {/* Emoji glyph — front-facing “character” face */}
      <mesh position={[0, 0.02, 0.32]} renderOrder={3}>
        <planeGeometry args={[0.62, 0.62]} />
        <meshBasicMaterial
          map={map}
          transparent
          opacity={opacity}
          depthWrite={!ghost}
          toneMapped={false}
        />
      </mesh>

      {/* Glossy crown highlight */}
      <mesh position={[0, 0.22, 0.2]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={ghost ? 0.1 : 0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** Lightweight emoji chunk for bust explosion particles. */
export function EmojiChunk({
  emoji,
  color,
}: {
  emoji: string
  color: THREE.Color | string
}) {
  const map = useMemo(() => emojiTexture(emoji), [emoji])
  const c = useMemo(
    () => (typeof color === 'string' ? new THREE.Color(color) : color),
    [color],
  )
  return (
    <group>
      <RoundedBox args={[0.45, 0.45, 0.32]} radius={0.12} smoothness={3}>
        <meshPhysicalMaterial
          color={c}
          roughness={0.25}
          metalness={0.12}
          clearcoat={0.7}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.18]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshBasicMaterial map={map} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}
