import { items } from '../../content/loader'
import { useSite } from '../../store/useSite'
import { PILLAR_SPECTRUM } from '../../worlds/types'
import { SpectralIndex } from '../../components/SpectralIndex'
import site from '../../../content/site.json'

/**
 * The document renderer. Permanently available, deliberately quiet, and
 * off-limits to redesign agents. Everything the world shows is here in a form
 * that works with a screen reader, on a slow connection, and at 320px.
 */
export function Document() {
  const active = useSite((s) => s.pillars)

  const shown = active.length
    ? items.filter((i) => i.pillars.some((p) => active.includes(p)))
    : items

  return (
    <main className="doc">
      <header className="doc-masthead">
        <p className="label">{site.byline}</p>
        <h1>{site.title}</h1>
        <p className="tagline">{site.tagline}</p>
      </header>

      <SpectralIndex />

      <ul className="item-list">
        {shown.map((item) => {
          const colour = PILLAR_SPECTRUM[item.pillars[0]].colour
          const external = Boolean(item.url)
          return (
            <li key={item.id} className="item">
              <span className="rule" style={{ color: colour }} aria-hidden="true" />
              <div>
                <div className="meta">
                  <span className="badge">{item.type}</span>
                  {item.published && <span className="badge">{item.published}</span>}
                  {item.liveness?.state && item.liveness.state !== 'ok' && (
                    <span className="badge" data-state={item.liveness.state}>
                      {item.liveness.state}
                    </span>
                  )}
                </div>
                <h3>
                  {external ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                {item.summary && <p>{item.summary}</p>}
              </div>
            </li>
          )
        })}
      </ul>

      {shown.length === 0 && (
        <p className="label" style={{ marginTop: '2rem' }}>
          No items in that part of the spectrum yet. Clear a filter to see everything.
        </p>
      )}

      <p className="disclaimer">{site.disclaimer}</p>
    </main>
  )
}
