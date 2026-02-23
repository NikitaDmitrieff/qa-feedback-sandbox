import type { SceneContext, SceneModule } from './types'

type CyclePhase = 'drift' | 'converge' | 'hold' | 'explode'

const PHASE_DURATION: Record<CyclePhase, number> = {
  drift: 3000,
  converge: 2000,
  hold: 1500,
  explode: 1000,
}
const PHASE_ORDER: CyclePhase[] = ['drift', 'converge', 'hold', 'explode']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  tx: number          // target x
  ty: number          // target y
  brightness: number  // 0..1, from original pixel
  color: string
  size: number
}

let particles: Particle[] = []
let phase: CyclePhase = 'drift'
let phaseTime = 0
let palette: string[] = []
let canvasW = 0
let canvasH = 0

const FALLBACK_PALETTE = ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']

function sampleTextPixels(
  text: string,
  width: number,
  height: number
): Array<{ x: number; y: number; brightness: number }> {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const cx = c.getContext('2d')
  if (!cx) return []

  cx.fillStyle = 'white'
  cx.font = `bold 180px ${getComputedStyle(document.documentElement).getPropertyValue('--font-family-sans') || 'system-ui, sans-serif'}`
  cx.textAlign = 'center'
  cx.textBaseline = 'middle'
  cx.fillText(text, width / 2, height / 2)

  const imgData = cx.getImageData(0, 0, width, height)
  const pixels: Array<{ x: number; y: number; brightness: number }> = []

  // Sample at a stride to get ~2000 points
  const stride = Math.max(2, Math.floor(Math.sqrt((width * height) / 2000)))

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const alpha = imgData.data[(y * width + x) * 4 + 3]
      if (alpha > 128) {
        pixels.push({ x, y, brightness: alpha / 255 })
      }
    }
  }

  return pixels
}

function colorForX(x: number, width: number): string {
  const t = x / width
  const idx = Math.min(Math.floor(t * palette.length), palette.length - 1)
  return palette[idx] ?? '#3b82f6'
}

export const scene: SceneModule = {
  init({ colors, width, height, density }: SceneContext) {
    canvasW = width
    canvasH = height
    phase = 'drift'
    phaseTime = 0

    const p = colors.primary.filter(Boolean)
    palette = p.length > 0 ? p : FALLBACK_PALETTE

    const targets = sampleTextPixels('Design System', width, height)
    const targetCount = Math.round(2000 * density)

    // If we have more pixels than needed, subsample
    let sampled = targets
    if (targets.length > targetCount) {
      const step = Math.ceil(targets.length / targetCount)
      sampled = targets.filter((_, i) => i % step === 0)
    }

    particles = sampled.map(t => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      tx: t.x,
      ty: t.y,
      brightness: t.brightness,
      color: colorForX(t.x, width),
      size: 1 + Math.random() * 1.5,
    }))

    // If we got fewer pixels than target count, pad with random particles mapping to visible text area
    if (particles.length < targetCount && targets.length > 0) {
      const extra = targetCount - particles.length
      for (let i = 0; i < extra; i++) {
        const t = targets[Math.floor(Math.random() * targets.length)]
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          tx: t.x,
          ty: t.y,
          brightness: t.brightness,
          color: colorForX(t.x, width),
          size: 1 + Math.random() * 1.5,
        })
      }
    }
  },

  update({ width, height }: SceneContext, delta: number) {
    canvasW = width
    canvasH = height

    phaseTime += delta
    if (phaseTime >= PHASE_DURATION[phase]) {
      phaseTime = 0
      const nextIdx = (PHASE_ORDER.indexOf(phase) + 1) % PHASE_ORDER.length
      phase = PHASE_ORDER[nextIdx]
    }

    const t = phaseTime / PHASE_DURATION[phase] // 0..1 progress within phase
    const dt = delta / 16

    for (const p of particles) {
      if (phase === 'drift') {
        // Random drift with slight damping
        p.vx += (Math.random() - 0.5) * 0.3
        p.vy += (Math.random() - 0.5) * 0.3
        p.vx *= 0.97
        p.vy *= 0.97
        p.x += p.vx * dt
        p.y += p.vy * dt
        // Wrap
        if (p.x < -20) p.x = width + 20
        else if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        else if (p.y > height + 20) p.y = -20
      } else if (phase === 'converge') {
        // Spring toward target position
        const dx = p.tx - p.x
        const dy = p.ty - p.y
        const spring = 0.08 + t * 0.06
        p.vx += dx * spring
        p.vy += dy * spring
        p.vx *= 0.75
        p.vy *= 0.75
        p.x += p.vx * dt
        p.y += p.vy * dt
      } else if (phase === 'hold') {
        // Snap to target with light spring
        const dx = p.tx - p.x
        const dy = p.ty - p.y
        p.vx += dx * 0.12
        p.vy += dy * 0.12
        p.vx *= 0.65
        p.vy *= 0.65
        p.x += p.vx * dt
        p.y += p.vy * dt
      } else {
        // Explode: blast outward
        const cx = canvasW / 2
        const cy = canvasH / 2
        const dx = p.x - cx
        const dy = p.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (0.5 + p.brightness * 2) * (1 + t * 3)
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
        p.vx *= 0.95
        p.vy *= 0.95
        p.x += p.vx * dt
        p.y += p.vy * dt
      }
    }
  },

  draw({ ctx, width, height }: SceneContext) {
    ctx.fillStyle = 'rgba(10,10,15,0.18)'
    ctx.fillRect(0, 0, width, height)

    for (const p of particles) {
      ctx.fillStyle = p.color
      ctx.globalAlpha = phase === 'hold' ? 0.9 : 0.7
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  },

  destroy() {
    particles = []
  },
}
