import { OrbitControls } from '@react-three/drei'
import type { Placement } from '../types'

/**
 * Phase 5 stub. Renders the placements as plain extrusions so the mapping can
 * be verified visually today, without committing to the final art direction.
 */
export default function Scene({ placements }: { placements: Placement[] }) {
  return (
    <>
      <color attach="background" args={['#080C15']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 60, 20]} intensity={1.1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#0E1524" />
      </mesh>
      {placements.map((p) => (
        <mesh key={p.id} position={p.position}>
          <boxGeometry args={[4, p.scale, 4]} />
          <meshStandardMaterial color={p.colour} emissive={p.colour} emissiveIntensity={0.12} />
        </mesh>
      ))}
      <OrbitControls makeDefault enableDamping maxPolarAngle={1.5} />
    </>
  )
}
