export type Pillar = 'ai' | 'quantum' | 'materials' | 'energy' | 'cyber'
export type ItemType = 'article' | 'observatory' | 'note' | 'talk' | 'pillar'
export type Status = 'draft' | 'review' | 'published' | 'archived'

export interface Spatial {
  magnitude: number
  depth: number
  connections?: string[]
  anchor?: boolean
}

export interface Item {
  schema: 'item/v1'
  id: string
  title: string
  summary?: string
  type: ItemType
  pillars: Pillar[]
  status: Status
  published?: string
  updated?: string
  url?: string
  poster?: string
  spatial: Spatial
  access?: 'public' | 'registered' | 'paid'
  dataLicence?: string
  locked?: string[]
  lastHumanEdit?: string
  lastAgentEdit?: string
  author?: string
  liveness?: { lastChecked?: string; state?: 'ok' | 'slow' | 'broken' | 'stale'; note?: string }
  /** Markdown body. Absent for external items. */
  body?: string
}

export interface SiteMeta {
  title: string
  tagline: string
  disclaimer: string
  byline: string
}
