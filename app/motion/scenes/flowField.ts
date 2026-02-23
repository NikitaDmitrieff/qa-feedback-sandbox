import type { SceneContext, SceneModule } from './types'

interface Particle {
  x: number
  y: number
  colorIndex: number
  size: number
  life: number
  maxLife: number
}

// --- Module-level state (reset on init) ---
let particles: Particle[] = []
let time = 0
let mouseX = -9999
let mouseY = -9999
let palette: string[] = []
let w = 0
let h = 0

const FALLBACK_PALETTE = ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']

function noise(x: number, y: number, t: number): number {
  let v = Math.sin(x * 0.005 + t * 0.3) * Math.cos(y * 0.005 + t * 0.2)
  v += Math.sin(x * 0.011 + t * 0.5 + 2.1) * Math.cos(y * 0.011 - t * 0.4 + 1.3) * 0.5
  v += Math.sin(x * 0.022 - t * 0.7 + 4.2) * Math.cos(y * 0.022 + t * 0.6 + 0.7) * 0.25
  return v / 1.75
}

function mkParticle(): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    colorIndex: Math.floor(Math.random() * palette.length),
    size: 1.5 + Math.random() * 1.5,
    life: 0,
    maxLife: 150 + Math.random() * 300,
  }
}

export const scene: SceneModule = {
  init({ ctx, colors, width, height, density }: SceneContext) {
    w = width
    h = height
    time = 0
    // primary[3..7] = primary-300 through primary-700
    const p = colors.primary.slice(3, 8).filter(Boolean)
    palette = p.length > 0 ? p : FALLBACK_PALETTE

    const count = Math.round(800 * density)
    particles = Array.from({ length: count }, mkParticle)
    // Stagger starting lives to avoid initial flash
    for (const p of particles) {
      p.life = Math.random() * p.maxLife
    }

    // Dark background fill to start clean
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, width, height)
  },

  update({ width, height }: SceneContext, delta: number) {
    w = width
    h = height
    time += delta * 0.001
    const dt = delta / 16

    for (const p of particles) {
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const distToMouse = Math.sqrt(dx * dx + dy * dy)
      const base = noise(p.x, p.y, time) * Math.PI * 2

      let angle = base
      if (distToMouse < 120 && distToMouse > 0) {
        const strength = (1 - distToMouse / 120) * 1.5
        const mAngle = Math.atan2(dy, dx)
        angle = base + mAngle * strength
      }

      const speed = 1.5
      p.x += Math.cos(angle) * speed * dt
      p.y += Math.sin(angle) * speed * dt
      p.life++

      // Wrap around edges
      if (p.x < -10) p.x = w + 10
      else if (p.x > w + 10) p.x = -10
      if (p.y < -10) p.y = h + 10
      else if (p.y > h + 10) p.y = -10

      // Reset dead particles
      if (p.life > p.maxLife) {
        const fresh = mkParticle()
        p.x = fresh.x
        p.y = fresh.y
        p.colorIndex = fresh.colorIndex
        p.size = fresh.size
        p.life = 0
        p.maxLife = fresh.maxLife
      }
    }
  },

  draw({ ctx, width, height }: SceneContext) {
    // Fade trail effect
    ctx.fillStyle = 'rgba(10,10,15,0.05)'
    ctx.fillRect(0, 0, width, height)

    ctx.globalAlpha = 0.6
    for (const p of particles) {
      ctx.fillStyle = palette[p.colorIndex] ?? '#3b82f6'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  },

  destroy() {
    particles = []
    palette = []
  },

  onMouseMove(x: number, y: number) {
    mouseX = x
    mouseY = y
  },

  onClick(x: number, y: number) {
    const burst = Array.from({ length: 50 }, () => ({
      ...mkParticle(),
      x,
      y,
      life: 0,
      maxLife: 80 + Math.random() * 120,
    }))
    particles.push(...burst)
    // Keep total under control
    if (particles.length > 1400) {
      particles = particles.slice(particles.length - 1400)
    }
  },
}
