import type { SceneContext, SceneModule } from './types'

interface WaveBand {
  baseY: number
  amplitude: number
  frequency: number
  phase: number
  phaseSpeed: number
  bandHeight: number
  color: string
  alpha: number
}

let bands: WaveBand[] = []
let time = 0

// primary indices used: 0(50), 2(200), 4(400), 5(500), 7(700), 9(900)
const BAND_INDICES = [0, 2, 4, 5, 7, 9]
const FALLBACK_COLORS = ['#eff6ff', '#bfdbfe', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a']

export const scene: SceneModule = {
  init({ colors, width, height }: SceneContext) {
    time = 0

    bands = BAND_INDICES.map((idx, i) => ({
      baseY: height * (0.1 + i * 0.14),
      amplitude: 35 + i * 12,
      frequency: 0.0025 + i * 0.0008,
      phase: i * (Math.PI / 3),
      phaseSpeed: 0.25 + i * 0.1,
      bandHeight: 90 + i * 25,
      color: colors.primary[idx] || FALLBACK_COLORS[i],
      // Per spec: alpha 0.15–0.35
      alpha: 0.15 + (i % 3) * 0.07,
    }))
  },

  update(_ctx: SceneContext, delta: number) {
    time += delta * 0.001
  },

  draw({ ctx, width, height }: SceneContext) {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, width, height)

    // Draw each wave band as a filled sinusoidal ribbon
    const steps = Math.max(160, Math.ceil(width / 5))

    for (const band of bands) {
      ctx.beginPath()

      // Top edge: wavy
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width
        const y =
          band.baseY +
          band.amplitude * Math.sin(band.frequency * x + band.phase + time * band.phaseSpeed)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      // Bottom edge: wavy (right to left, offset phase slightly)
      for (let i = steps; i >= 0; i--) {
        const x = (i / steps) * width
        const y =
          band.baseY +
          band.bandHeight +
          band.amplitude *
            Math.sin(band.frequency * x + band.phase + time * band.phaseSpeed + 0.6)
        ctx.lineTo(x, y)
      }

      ctx.closePath()
      ctx.fillStyle = band.color
      ctx.globalAlpha = band.alpha
      ctx.fill()
    }

    // Vignette overlay for depth
    ctx.globalAlpha = 1
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.1,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    )
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.65)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)
  },

  destroy() {
    bands = []
    time = 0
  },
}
