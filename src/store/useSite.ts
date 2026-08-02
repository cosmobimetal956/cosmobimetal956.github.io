import { create } from 'zustand'
import type { Pillar } from '../content/types'
import type { InputClass, QualityTier } from '../worlds/types'
import { defaultWorld } from '../worlds'

type Renderer = 'document' | 'world'

interface SiteState {
  renderer: Renderer
  world: string
  pillars: Pillar[]          // empty = all
  selected: string | null
  input: InputClass
  tier: QualityTier['name']
  reducedMotion: boolean

  setRenderer: (r: Renderer) => void
  setWorld: (id: string) => void
  togglePillar: (p: Pillar) => void
  select: (id: string | null) => void
  setInput: (i: InputClass) => void
  setTier: (t: QualityTier['name']) => void
}

/**
 * Document is the default renderer on first paint, always.
 * The world is opt-in and lazy — nobody waits on a 3D bundle to read a title.
 */
export const useSite = create<SiteState>((set) => ({
  renderer: 'document',
  world: defaultWorld,
  pillars: [],
  selected: null,
  input: 'pointer',
  tier: 'medium',
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  setRenderer: (renderer) => set({ renderer }),
  setWorld: (world) => set({ world }),
  togglePillar: (p) =>
    set((s) => ({
      pillars: s.pillars.includes(p) ? s.pillars.filter((x) => x !== p) : [...s.pillars, p],
    })),
  select: (selected) => set({ selected }),
  setInput: (input) => set({ input }),
  setTier: (tier) => set({ tier }),
}))
