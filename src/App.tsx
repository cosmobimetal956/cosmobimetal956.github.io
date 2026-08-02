import { Suspense, lazy, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Document } from './renderers/document/Document'
import { RendererToggle } from './components/RendererToggle'
import { SpectralIndex } from './components/SpectralIndex'
import { useSite } from './store/useSite'
import { getWorld } from './worlds'
import { items } from './content/loader'
import { detectInput, detectTier, watchPosture } from './capability'

export default function App() {
  const renderer = useSite((s) => s.renderer)
  const worldId = useSite((s) => s.world)
  const pillars = useSite((s) => s.pillars)
  const setInput = useSite((s) => s.setInput)
  const setTier = useSite((s) => s.setTier)
  const tier = useSite((s) => s.tier)

  useEffect(() => {
    setInput(detectInput())
    detectTier().then(setTier)
    return watchPosture()
  }, [setInput, setTier])

  const world = getWorld(worldId)

  const placements = useMemo(() => {
    const subset = pillars.length
      ? items.filter((i) => i.pillars.some((p) => pillars.includes(p)))
      : items
    return world.place(subset)
  }, [world, pillars])

  const Scene = useMemo(() => lazy(world.Scene), [world])

  return (
    <>
      {renderer === 'document' ? (
        <Document />
      ) : (
        <div className="world-stage">
          <Canvas
            camera={{ position: world.arrival.position, fov: 55 }}
            dpr={[1, world.quality(tier).pixelRatioCap]}
            gl={{ antialias: world.quality(tier).antialias, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <Scene placements={placements} />
            </Suspense>
          </Canvas>

          <div
            className="app-chrome"
            style={{ position: 'fixed', left: 16, right: 16, top: 'calc(env(safe-area-inset-top) + 16px)', maxWidth: 520 }}
          >
            <SpectralIndex compact />
          </div>
        </div>
      )}

      <RendererToggle />
    </>
  )
}
