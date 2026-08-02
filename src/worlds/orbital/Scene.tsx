import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Placement } from '../types'
import { useSite } from '../../store/useSite'
import { orbital } from './index'

function Body({ p, onSelect }: { p: Placement; onSelect: (id: string) => void }) {
  const ref = useRef<THREE.Mesh>(null)
  const reduced = useSite((s) => s.reducedMotion)

  useFrame((state) => {
    if (!ref.current || reduced) return
    // Slow breathing tied to prominence. Ambient, not decorative noise.
    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 0.4 + p.position[0]) * 0.02 * p.prominence
    ref.current.scale.setScalar(p.scale * 0.35 * pulse)
  })

  return (
    <group position={p.position}>
      <mesh
        ref={ref}
        scale={p.scale * 0.35}
        onClick={(e) => { e.stopPropagation(); onSelect(p.id) }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color={p.colour}
          emissive={p.colour}
          emissiveIntensity={0.35 + p.prominence * 0.5}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      {p.prominence > 0.7 && (
        <Html distanceFactor={22} position={[0, p.scale * 0.5, 0]} className="body-label" prepend>
          <span style={{ borderColor: p.colour }}>{p.id}</span>
        </Html>
      )}
    </group>
  )
}

export default function Scene({ placements }: { placements: Placement[] }) {
  const select = useSite((s) => s.select)
  const input = useSite((s) => s.input)
  const tier = useSite((s) => s.tier)

  const scheme = orbital.controls(input)
  const q = orbital.quality(tier)
  const visible = useMemo(
    () => [...placements].sort((a, b) => b.prominence - a.prominence).slice(0, q.maxItems),
    [placements, q.maxItems],
  )

  const byId = useMemo(() => new Map(visible.map((p) => [p.id, p])), [visible])

  return (
    <>
      <color attach="background" args={['#070B14']} />
      <fog attach="fog" args={['#070B14', 60, 170]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={40} distance={80} color="#7FA8FF" />

      {visible.map((p) => (
        <Body key={p.id} p={p} onSelect={select} />
      ))}

      {/* Connection arcs. Only drawn between items both currently visible. */}
      {visible.flatMap((p) =>
        p.links
          .filter((l) => byId.has(l))
          .map((l) => (
            <Line
              key={`${p.id}-${l}`}
              points={[p.position, byId.get(l)!.position]}
              color={p.colour}
              lineWidth={1}
              transparent
              opacity={0.16}
            />
          )),
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={scheme.minDistance}
        maxDistance={scheme.maxDistance}
        minPolarAngle={scheme.polarRange[0]}
        maxPolarAngle={scheme.polarRange[1]}
        autoRotate={!scheme.reducedMotion}
        autoRotateSpeed={0.12}
      />
    </>
  )
}
