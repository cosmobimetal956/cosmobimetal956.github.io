import fm from 'front-matter'
import type { Item } from './types'

/**
 * Vite reads every markdown file in /content/items at build time.
 * No runtime fetch, no CMS, no database. The repo is the content graph.
 */
const files = import.meta.glob('/content/items/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parse(raw: string): Item {
  const { attributes, body } = fm<Omit<Item, 'body'>>(raw)
  return { ...(attributes as Omit<Item, 'body'>), body }
}

export const allItems: Item[] = Object.values(files).map(parse)

/** Only published, public items reach the renderers. Drafts stay in the repo, off the site. */
export const items: Item[] = allItems
  .filter((i) => i.status === 'published')
  .filter((i) => (i.access ?? 'public') === 'public')
  .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''))

export const byId = new Map(items.map((i) => [i.id, i]))
