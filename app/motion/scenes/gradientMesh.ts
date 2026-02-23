import type { SceneContext, SceneModule } from './types'

interface ControlPoint {
  r: number
  g: number
  b: number
  freqX: number
  freqY: number
  phaseX: number
  phaseY: number
  ampR: number
  ampG: number
  ampB: number
}

const RENDER_RES = 100 // Low-res offscreen render size

let controlPoints: ControlPoint[] = []
let time = 0
let offCanvas: HTMLCanvasElement | null = null
let offCtx: CanvasRenderingContext2D | null = null

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ]
}

const FALLBACK_PALETTE = [
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd',
  '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
  '#1e40af', '#1e3a8a',
]

export const scene: SceneModule = {
  init({ colors }: SceneContext) {
    time = 0

    const palette = colors.primary.filter(Boolean)
    const src = palette.length >= 10 ? palette : FALLBACK_PALETTE

    // 4×4 = 16 control points
    controlPoints = Array.from({ length: 16 }, (_, i) => {
      const [r, g, b] = hexToRgb(src[i % src.length])
      return {
        r, g, b,
        freqX: 0.4 + Math.random() * 0.6,
        freqY: 0.4 + Math.random() * 0.6,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        // Small color oscillation amplitude
        ampR: 20 + Math.random() * 20,
        ampG: 15 + Math.random() * 20,
        ampB: 20 + Math.random() * 25,
      }
    })

    if (!offCanvas) {
      offCanvas = document.createElement('canvas')
      offCanvas.width = RENDER_RES
      offCanvas.height = RENDER_RES
      offCtx = offCanvas.getContext('2d')
    }
  },

  update(_ctx: SceneContext, delta: number) {
    // Full cycle ~8 seconds
    time += delta * 0.001 * ((Math.PI * 2) / 8)
  },

  draw({ ctx, width, height }: SceneContext) {
    if (!offCanvas || !offCtx) return

    const imageData = offCtx.createImageData(RENDER_RES, RENDER_RES)
    const data = imageData.data

    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

    // Animated colors for each control point
    const pts = controlPoints.map(cp => ({
      r: clamp(cp.r + cp.ampR * Math.sin(time * cp.freqX + cp.phaseX)),
      g: clamp(cp.g + cp.ampG * Math.sin(time * cp.freqY + cp.phaseY)),
      b: clamp(cp.b + cp.ampB * Math.cos(time * (cp.freqX + cp.freqY) * 0.5 + cp.phaseX)),
    }))

    // Bilinear interpolation over the 3×3 grid of patches
    for (let py = 0; py < RENDER_RES; py++) {
      for (let px = 0; px < RENDER_RES; px++) {
        const fx = (px / (RENDER_RES - 1)) * 3  // 0..3
        const fy = (py / (RENDER_RES - 1)) * 3  // 0..3
        const col = Math.min(Math.floor(fx), 2)
        const row = Math.min(Math.floor(fy), 2)
        const tx = fx - col
        const ty = fy - row

        const tl = pts[row * 4 + col]
        const tr = pts[row * 4 + col + 1]
        const bl = pts[(row + 1) * 4 + col]
        const br = pts[(row + 1) * 4 + col + 1]

        const w00 = (1 - tx) * (1 - ty)
        const w10 = tx * (1 - ty)
        const w01 = (1 - tx) * ty
        const w11 = tx * ty

        const idx = (py * RENDER_RES + px) * 4
        data[idx]     = clamp(tl.r * w00 + tr.r * w10 + bl.r * w01 + br.r * w11)
        data[idx + 1] = clamp(tl.g * w00 + tr.g * w10 + bl.g * w01 + br.g * w11)
        data[idx + 2] = clamp(tl.b * w00 + tr.b * w10 + bl.b * w01 + br.b * w11)
        data[idx + 3] = 255
      }
    }

    offCtx.putImageData(imageData, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(offCanvas, 0, 0, width, height)
  },

  destroy() {
    controlPoints = []
    time = 0
    // Keep offCanvas for reuse
  },
}
