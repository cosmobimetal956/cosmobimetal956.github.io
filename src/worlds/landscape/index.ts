import type { World, Placement, InputClass, QualityTier } from '../types'
import { PILLAR_SPECTRUM } from '../types'
import type { Item } from '../../content/types'

/**
 * LANDSCAPE — you walk a city of five districts.
 *
 * Phase 5. The mapping is written now, deliberately, to prove the abstraction
 * holds: the same content produces a completely different geometry with no
 * change to a single content file. The Scene is a stub until Phase 5.
 *
 *   pillar      -> district
 *   magnitude   -> building height
 *   depth       -> distance from the district's high street
 *   connections -> street adjacency
 *   anchor      -> corner plot on the main square
 */

const DISTRICTS: Record<string, [number, number]> = {
  cyber: [-60, -60],
  materials: [60, -60],
  quantum: [0, 0],
  ai: [-60, 60],
  energy: [60, 60],
}

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
    const [cx, cz] = DISTRICTS[primary]
    const setback = item.spatial.depth * 34
    const along = (hash(item.id) - 0.5) * 44
    const height = 2 + item.spatial.magnitude * 22

    return {
      id: item.id,
      position: [cx + along, height / 2, cz + (item.spatial.anchor ? 0 : setback + 6)],
      scale: height,
      colour: PILLAR_SPECTRUM[primary].colour,
      prominence: item.spatial.anchor ? 1 : item.spatial.magnitude,
      links: item.spatial.connections ?? [],
    }
  })
}

function controls(input: InputClass) {
  switch (input) {
    case 'touch':
      return { mode: 'rail' as const, minDistance: 8, maxDistance: 30, polarRange: [1.0, 1.7] as [number, number], reducedMotion: false }
    case 'pointer':
      return { mode: 'fly' as const, minDistance: 4, maxDistance: 140, polarRange: [0.3, 1.9] as [number, number], reducedMotion: false }
    case 'keyboard':
      return { mode: 'teleport' as const, minDistance: 8, maxDistance: 40, polarRange: [1.1, 1.6] as [number, number], reducedMotion: true }
    case 'gamepad':
      return { mode: 'fly' as const, minDistance: 3, maxDistance: 160, polarRange: [0.2, 2.0] as [number, number], reducedMotion: false }
  }
}

function quality(tier: QualityTier['name']): QualityTier {
  const tiers: Record<QualityTier['name'], QualityTier> = {
    low: { name: 'low', maxItems: 30, shadows: false, antialias: false, pixelRatioCap: 1 },
    medium: { name: 'medium', maxItems: 70, shadows: false, antialias: true, pixelRatioCap: 1.5 },
    high: { name: 'high', maxItems: 160, shadows: true, antialias: true, pixelRatioCap: 2 },
  }
  return tiers[tier]
}

export const landscape: World = {
  id: 'landscape',
  label: 'Landscape',
  blurb: 'A city of five districts. Taller buildings are the bigger pieces. Arriving Phase 5.',
  place,
  arrival: { position: [0, 14, 70], target: [0, 4, 0] },
  controls,
  quality,
  Scene: () => import('./Scene'),
}
