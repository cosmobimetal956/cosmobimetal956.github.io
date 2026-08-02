import { useSite } from '../store/useSite'
import { worlds } from '../worlds'

/**
 * The document route is permanent and always one tap away. It is not a
 * fallback — it is the other half of the site.
 */
export function RendererToggle() {
  const renderer = useSite((s) => s.renderer)
  const world = useSite((s) => s.world)
  const setRenderer = useSite((s) => s.setRenderer)
  const setWorld = useSite((s) => s.setWorld)

  return (
    <nav className="toggle-bar app-chrome" aria-label="View">
      <button aria-pressed={renderer === 'document'} onClick={() => setRenderer('document')}>
        Read
      </button>
      {worlds.map((w) => (
        <button
          key={w.id}
          aria-pressed={renderer === 'world' && world === w.id}
          onClick={() => { setWorld(w.id); setRenderer('world') }}
          title={w.blurb}
        >
          {w.label}
        </button>
      ))}
    </nav>
  )
}
