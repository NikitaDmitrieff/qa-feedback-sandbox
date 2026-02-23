import type { SceneContext, SceneModule } from './types'

const CELL_SIZE = 4

// 5 crystal colors: primary steps 100, 300, 500, 700, 900 (indices 1,3,5,7,9)
const CRYSTAL_INDICES = [1, 3, 5, 7, 9]
const FALLBACK_COLORS = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a']

let gridW = 0
let gridH = 0
let claimed: Int8Array = new Int8Array(0)
let frontier: number[][] = []
let crystalColors: string[] = []
let tessellated = false
let pulse = 0

// State for pending click-triggered reset
let pendingReset = false
let pendingClickCx = 0
let pendingClickCy = 0

function cellIndex(cx: number, cy: number): number {
  return cy * gridW + cx
}

const NEIGHBORS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

function initGrid(width: number, height: number, colors: string[], seeds: [number, number][]) {
  gridW = Math.ceil(width / CELL_SIZE)
  gridH = Math.ceil(height / CELL_SIZE)
  crystalColors = colors
  claimed = new Int8Array(gridW * gridH).fill(-1)
  tessellated = false
  pulse = 0
  frontier = Array.from({ length: 5 }, () => [])

  for (let i = 0; i < seeds.length; i++) {
    const [sx, sy] = seeds[i]
    const cx = Math.max(0, Math.min(gridW - 1, sx))
    const cy = Math.max(0, Math.min(gridH - 1, sy))
    const idx = cellIndex(cx, cy)
    if (claimed[idx] === -1) {
      claimed[idx] = i
      frontier[i].push(idx)
    }
  }
}

export const scene: SceneModule = {
  init({ colors, width, height }: SceneContext) {
    const palette = CRYSTAL_INDICES.map((idx, i) => colors.primary[idx] || FALLBACK_COLORS[i])
    const seeds: [number, number][] = Array.from({ length: 5 }, () => [
      Math.floor(Math.random() * Math.ceil(width / CELL_SIZE)),
      Math.floor(Math.random() * Math.ceil(height / CELL_SIZE)),
    ])
    initGrid(width, height, palette, seeds)
  },

  update({ colors, width, height }: SceneContext, delta: number) {
    if (pendingReset) {
      pendingReset = false
      const palette = CRYSTAL_INDICES.map((idx, i) => colors.primary[idx] || FALLBACK_COLORS[i])
      const seeds: [number, number][] = [
        [pendingClickCx, pendingClickCy],
        ...Array.from({ length: 4 }, () => [
          Math.floor(Math.random() * Math.ceil(width / CELL_SIZE)),
          Math.floor(Math.random() * Math.ceil(height / CELL_SIZE)),
        ] as [number, number]),
      ]
      initGrid(width, height, palette, seeds)
      return
    }

    if (tessellated) {
      pulse += delta * 0.002
      return
    }

    // Expand frontier via BFS — process batch proportional to delta
    const batchSize = Math.max(300, Math.floor(600 * (delta / 16)))
    let remaining = batchSize
    let anyLeft = false

    for (let i = 0; i < frontier.length && remaining > 0; i++) {
      const q = frontier[i]
      const processCount = Math.min(q.length, Math.ceil(remaining / Math.max(1, frontier.length - i)))
      for (let j = 0; j < processCount && q.length > 0; j++) {
        const idx = q.shift()!
        const cx = idx % gridW
        const cy = Math.floor(idx / gridW)
        for (const [dx, dy] of NEIGHBORS) {
          const nx = cx + dx
          const ny = cy + dy
          if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue
          const nidx = cellIndex(nx, ny)
          if (claimed[nidx] === -1) {
            claimed[nidx] = i
            q.push(nidx)
          }
        }
        remaining--
      }
      if (q.length > 0) anyLeft = true
    }

    if (!anyLeft) {
      // Verify complete
      let done = true
      for (let i = 0; i < claimed.length; i++) {
        if (claimed[i] === -1) { done = false; break }
      }
      if (done) tessellated = true
    }
  },

  draw({ ctx, width, height }: SceneContext) {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, width, height)

    // Draw claimed cells
    for (let cy = 0; cy < gridH; cy++) {
      for (let cx = 0; cx < gridW; cx++) {
        const id = claimed[cellIndex(cx, cy)]
        if (id === -1) continue
        ctx.fillStyle = crystalColors[id] ?? '#3b82f6'
        ctx.fillRect(cx * CELL_SIZE, cy * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }

    // After tessellation: pulsing hairline borders between different crystals
    if (tessellated) {
      const borderAlpha = 0.25 + 0.45 * Math.abs(Math.sin(pulse))
      ctx.strokeStyle = `rgba(255,255,255,${borderAlpha})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let cy = 0; cy < gridH; cy++) {
        for (let cx = 0; cx < gridW; cx++) {
          const id = claimed[cellIndex(cx, cy)]
          // Check right neighbor
          if (cx + 1 < gridW && claimed[cellIndex(cx + 1, cy)] !== id) {
            const px = (cx + 1) * CELL_SIZE
            ctx.moveTo(px, cy * CELL_SIZE)
            ctx.lineTo(px, (cy + 1) * CELL_SIZE)
          }
          // Check bottom neighbor
          if (cy + 1 < gridH && claimed[cellIndex(cx, cy + 1)] !== id) {
            const py = (cy + 1) * CELL_SIZE
            ctx.moveTo(cx * CELL_SIZE, py)
            ctx.lineTo((cx + 1) * CELL_SIZE, py)
          }
        }
      }
      ctx.stroke()
    }
  },

  destroy() {
    claimed = new Int8Array(0)
    frontier = []
    crystalColors = []
  },

  onClick(x: number, y: number) {
    pendingReset = true
    pendingClickCx = Math.floor(x / CELL_SIZE)
    pendingClickCy = Math.floor(y / CELL_SIZE)
  },
}
