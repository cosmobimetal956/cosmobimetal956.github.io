import type { World } from './types'
import { orbital } from './orbital'
import { landscape } from './landscape'

/**
 * World registry. Adding a world = adding a folder and one line here.
 * The rest of the app knows nothing about any specific world.
 */
export const worlds: World[] = [orbital, landscape]
export const defaultWorld = orbital.id
export const getWorld = (id: string): World => worlds.find((w) => w.id === id) ?? orbital

export * from './types'
