import { PILLAR_ORDER, PILLAR_SPECTRUM } from '../worlds/types'
import { useSite } from '../store/useSite'

const MIN = 420
const MAX = 670

/**
 * The signature element. Five emission lines on a continuum, positioned by real
 * wavelength. Tapping a line filters the graph — in the document renderer and,
 * identically, as the world legend.
 */
export function SpectralIndex({ compact = false }: { compact?: boolean }) {
  const active = useSite((s) => s.pillars)
  const toggle = useSite((s) => s.togglePillar)
  const anyActive = active.length > 0

  return (
    <div
      className="spectral-index"
      role="group"
      aria-label="Filter by pillar"
      style={compact ? { height: 44 } : undefined}
    >
      {PILLAR_ORDER.map((p) => {
        const { nm, colour, line } = PILLAR_SPECTRUM[p]
        const left = ((nm - MIN) / (MAX - MIN)) * 100
        const on = active.includes(p)
        return (
          <button
            key={p}
            className="line"
            style={{ left: `calc(${left}% - 1.5px)`, color: colour }}
            data-dimmed={anyActive && !on}
            aria-pressed={on}
            aria-label={`${p}, ${line} nanometres`}
            title={`${p} — ${line} nm`}
            onClick={() => toggle(p)}
          />
        )
      })}

      {!compact &&
        PILLAR_ORDER.map((p) => {
          const { nm } = PILLAR_SPECTRUM[p]
          const left = ((nm - MIN) / (MAX - MIN)) * 100
          return (
            <span key={`c-${p}`} className="caption" style={{ left: `${left}%` }}>
              {p}
            </span>
          )
        })}
    </div>
  )
}
