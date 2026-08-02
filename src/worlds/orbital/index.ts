import type { World, Placement, InputClass, QualityTier } from '../types'
import { PILLAR_SPECTRUM } from '../types'
import type { Item } from '../../content/types'

/**
 * ORBITAL — you stand at an observatory and look outward.
 *
 * Mapping table (the whole point of the abstraction):
 *   pillar      -> which body the item orbits (angular sector)
 *   magnitude   -> orbital radius (bright things closer) + body size
 *   depth       -> inclination above/below the ecliptic plane
 *   connections -> shared orbital node, drawn as a faint arc
 *   anchor      -> placed on the ecliptic, always in the arrival frustum
 */

const SECTORS: Record<string, number> = {
  cyber: 0,
  materials: (2 * Math.PI) / 5,
  quantum: (4 * Math.PI) / 5,
  ai: (6 * Math.PI) / 5,
  energy: (8 * Math.PI) / 5,
}

/** Deterministic jitter. Same input, same world, every build — agents must not shuffle the sky. */
function hash(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

export function place(items: Item[]): Placement[] {
  return items.map((item) => {
    const primary = item.pillars[0]
    const spread = 0.5 // radians of sector each pillar occupies
    const theta = SECTORS[primary] + (hash(item.id) - 0.5) * spread

    // Bright things sit closer. Anchors are pulled in further still.
    const base = 10 + (1 - item.spatial.magnitude) * 26
    const radius = item.spatial.anchor ? base * 0.8 : base

    // Depth lifts an item out of the ecliptic. Overviews stay on the plane.
    const inclination = item.spatial.depth * 0.6 * (hash(item.id + 'y') > 0.5 ? 1 : -1)

    return {
      id: item.id,
      position: [
        Math.cos(theta) * radius * Math.cos(inclination),
        Math.sin(inclination) * radius,
        Math.sin(theta) * radius * Math.cos(inclination),
      ],
      scale: 0.5 + item.spatial.magnitude * 2.5,
      colour: PILLAR_SPECTRUM[primary].colour,
      prominence: item.spatial.anchor ? 1 : item.spatial.magnitude,
      links: item.spatial.connections ?? [],
    }
  })
}

function controls(input: InputClass) {
  switch (input) {
    // Touch gets the fewest degrees of freedom. One finger orbits, two pinch.
    case 'touch':
      return { mode: 'orbit' as const, minDistance: 12, maxDistance: 48, polarRange: [0.6, 2.4] as [number, number], reducedMotion: false }
    case 'pointer':
      return { mode: 'orbit' as const, minDistance: 6, maxDistance: 70, polarRange: [0.2, 2.9] as [number, number], reducedMotion: false }
    // Keyboard never free-flies. It steps between items so nobody gets lost.
    case 'keyboard':
      return { mode: 'teleport' as const, minDistance: 10, maxDistance: 40, polarRange: [0.8, 2.2] as [number, number], reducedMotion: true }
    case 'gamepad':
      return { mode: 'fly' as const, minDistance: 4, maxDistance: 90, polarRange: [0.1, 3.0] as [number, number], reducedMotion: false }
  }
}

function quality(tier: QualityTier['name']): QualityTier {
  const tiers: Record<QualityTier['name'], QualityTier> = {
    low: { name: 'low', maxItems: 40, shadows: false, antialias: false, pixelRatioCap: 1 },
    medium: { name: 'medium', maxItems: 90, shadows: false, antialias: true, pixelRatioCap: 1.5 },
    high: { name: 'high', maxItems: 200, shadows: true, antialias: true, pixelRatioCap: 2 },
  }
  return tiers[tier]
}

export const orbital: World = {
  id: 'orbital',
  label: 'Orbital',
  blurb: 'An observatory. Everything published orbits the five pillars; the brightest sit nearest.',
  place,
  arrival: { position: [0, 6, 34], target: [0, 0, 0] },
  controls,
  quality,
  Scene: () => import('./Scene'),
}
