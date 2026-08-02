import type { ComponentType } from 'react'
import type { Item, Pillar } from '../content/types'

/**
 * A Placement is the ONLY thing a world may compute from content.
 *
 * The rule that makes two worlds affordable:
 *   content -> abstract spatial properties -> placement -> geometry
 *
 * Content never stores coordinates. A world turns magnitude/depth/pillar
 * into its own idiom. Adding a third world in 2027 is a new mapping table,
 * not a content migration.
 */
export interface Placement {
  id: string
  /** World-space position. Metres, y-up, arrival point at origin. */
  position: [number, number, number]
  /** Uniform scale hint, 0.5–3. Derived from magnitude. */
  scale: number
  /** Emission-line colour for the item's primary pillar. */
  colour: string
  /** 0–1. Worlds must render anchors legibly from the arrival point. */
  prominence: number
  /** IDs this item should be visibly linked to. */
  links: string[]
}

/** Camera and control scheme per input class. Spatial sites die on device diversity. */
export type InputClass = 'touch' | 'pointer' | 'keyboard' | 'gamepad'

export interface ControlScheme {
  /** Degrees of freedom offered. Keep low on touch. */
  mode: 'orbit' | 'fly' | 'rail' | 'teleport'
  /** Clamp so nobody gets lost or nauseous. */
  minDistance: number
  maxDistance: number
  /** Vertical look limits in radians. */
  polarRange: [number, number]
  /** Honoured when prefers-reduced-motion is set. */
  reducedMotion: boolean
}

export interface QualityTier {
  name: 'low' | 'medium' | 'high'
  maxItems: number
  shadows: boolean
  antialias: boolean
  pixelRatioCap: number
}

export interface World {
  id: string
  /** Shown in the world switcher. */
  label: string
  /** One line explaining the metaphor to a first-time visitor. */
  blurb: string

  /** THE mapping. Pure function, no side effects, deterministic. */
  place(items: Item[]): Placement[]

  /** Where the camera sits on arrival, and what it looks at. */
  arrival: { position: [number, number, number]; target: [number, number, number] }

  controls(input: InputClass): ControlScheme

  /** Progressive degradation. Called with measured device capability. */
  quality(tier: QualityTier['name']): QualityTier

  /** Lazily loaded R3F scene. Never imported eagerly — keeps first paint fast. */
  Scene: () => Promise<{ default: ComponentType<{ placements: Placement[] }> }>
}

/**
 * Emission-line palette. Each pillar is a real spectral line, ordered by
 * wavelength. This is the site's signature: the spectral index bar uses the
 * same order in the document renderer and as the world legend.
 */
export const PILLAR_SPECTRUM: Record<Pillar, { nm: number; colour: string; line: string }> = {
  cyber:     { nm: 435, colour: '#A97BFF', line: 'Hg 435.8' },
  materials: { nm: 486, colour: '#5B8CFF', line: 'H-beta 486.1' },
  quantum:   { nm: 501, colour: '#3DE0C0', line: 'O III 500.7' },
  ai:        { nm: 589, colour: '#FFB020', line: 'Na D 589.0' },
  energy:    { nm: 656, colour: '#FF5A47', line: 'H-alpha 656.3' },
}

export const PILLAR_ORDER: Pillar[] = ['cyber', 'materials', 'quantum', 'ai', 'energy']
