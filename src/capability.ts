import type { InputClass, QualityTier } from './worlds/types'

/** Input class drives the control scheme, not the layout. */
export function detectInput(): InputClass {
  if (typeof window === 'undefined') return 'pointer'
  if (navigator.getGamepads?.().some(Boolean)) return 'gamepad'
  if (window.matchMedia('(pointer: coarse)').matches) return 'touch'
  return 'pointer'
}

/**
 * Quality tier is measured, never assumed from user agent. A cheap frame probe
 * beats a device database that is wrong within six months.
 */
export function detectTier(): Promise<QualityTier['name']> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve('medium')

    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
    const cores = navigator.hardwareConcurrency ?? 4
    if (mem <= 2 || cores <= 2) return resolve('low')

    let frames = 0
    const start = performance.now()
    const tick = () => {
      frames++
      if (performance.now() - start < 400) requestAnimationFrame(tick)
      else {
        const fps = (frames / (performance.now() - start)) * 1000
        resolve(fps > 55 ? 'high' : fps > 35 ? 'medium' : 'low')
      }
    }
    requestAnimationFrame(tick)
  })
}

/**
 * Fold awareness. The Viewport Segments API reports a hinge; when one exists we
 * expose it as a CSS variable so layout can respond to posture rather than to a
 * width breakpoint that happens to correlate with it.
 */
export function watchPosture(): () => void {
  if (typeof window === 'undefined') return () => {}

  const apply = () => {
    const segments = (window.visualViewport as unknown as { segments?: DOMRect[] })?.segments
    const root = document.documentElement
    if (segments && segments.length === 2) {
      root.dataset.posture = 'folded'
      root.style.setProperty('--pane-left', `${segments[0].width}px`)
      root.style.setProperty('--pane-right', `${segments[1].width}px`)
    } else {
      root.dataset.posture = 'flat'
      root.style.setProperty('--pane-left', '1fr')
      root.style.setProperty('--pane-right', '0fr')
    }
  }

  apply()
  window.visualViewport?.addEventListener('resize', apply)
  window.addEventListener('resize', apply)
  return () => {
    window.visualViewport?.removeEventListener('resize', apply)
    window.removeEventListener('resize', apply)
  }
}
