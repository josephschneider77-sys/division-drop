import { useMemo } from 'react'
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
  /** Kept for API compatibility with Board; emoji color comes from the glyph. */
  color?: THREE.Color
  ghost?: boolean
}

/**
 * Emoji-forward charm for one grid cell.
 * Collision / stacking still use the polyomino footprint — this is visual only.
 */
export function CharmVisual({ theme, ghost }: CharmVisualProps) {
  const emoji = THEME_EMOJI[theme]
  const map = useMemo(() => emojiTexture(emoji), [emoji])

  return (
    <mesh position={[0, 0, 0.12]} castShadow={!ghost} renderOrder={2}>
      <planeGeometry args={[0.95, 0.95]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={ghost ? 0.32 : 1}
        depthWrite={!ghost}
        toneMapped={false}
      />
    </mesh>
  )
}
