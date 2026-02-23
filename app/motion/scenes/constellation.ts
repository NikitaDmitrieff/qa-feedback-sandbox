import type { SceneContext, SceneModule } from './types'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  highlighted: boolean
}

let nodes: Node[] = []
let mouseX = -9999
let mouseY = -9999
let nodeColor = '#60a5fa'
let lineColor = '#bfdbfe'
let highlightColor = '#2563eb'
let w = 0
let h = 0

export const scene: SceneModule = {
  init({ colors, width, height, density }: SceneContext) {
    w = width
    h = height

    // primary[4] = primary-400, primary[2] = primary-200, primary[6] = primary-600
    nodeColor = colors.primary[4] || '#60a5fa'
    lineColor = colors.primary[2] || '#bfdbfe'
    highlightColor = colors.primary[6] || '#2563eb'

    const count = Math.round(120 * density)
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      highlighted: false,
    }))
  },

  update({ width, height }: SceneContext, delta: number) {
    w = width
    h = height
    const dt = delta / 16

    let nearestDist = Infinity
    let nearestIdx = -1

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]

      // Mouse pull
      const dx = mouseX - n.x
      const dy = mouseY - n.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150 && dist > 0) {
        n.vx += (dx / dist) * 0.04
        n.vy += (dy / dist) * 0.04
      }

      // Damping
      n.vx *= 0.97
      n.vy *= 0.97

      // Speed cap
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
      if (speed > 1.5) {
        n.vx = (n.vx / speed) * 1.5
        n.vy = (n.vy / speed) * 1.5
      }

      n.x += n.vx * dt
      n.y += n.vy * dt

      // Bounce off edges
      if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx) }
      else if (n.x > width) { n.x = width; n.vx = -Math.abs(n.vx) }
      if (n.y < 0) { n.y = 0; n.vy = Math.abs(n.vy) }
      else if (n.y > height) { n.y = height; n.vy = -Math.abs(n.vy) }

      n.highlighted = false

      if (dist < nearestDist) {
        nearestDist = dist
        nearestIdx = i
      }
    }

    if (nearestIdx >= 0 && nearestDist < 200) {
      nodes[nearestIdx].highlighted = true
    }
  },

  draw({ ctx, width, height }: SceneContext) {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, width, height)

    // Draw connecting lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const isHighlighted = a.highlighted || b.highlighted
          const alpha = (1 - dist / 150) * (isHighlighted ? 0.8 : 0.3)
          ctx.strokeStyle = lineColor
          ctx.globalAlpha = alpha
          ctx.lineWidth = isHighlighted ? 1.5 : 0.7
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    // Draw nodes
    ctx.globalAlpha = 1
    for (const n of nodes) {
      ctx.fillStyle = n.highlighted ? highlightColor : nodeColor
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.highlighted ? 5 : 3, 0, Math.PI * 2)
      ctx.fill()
    }
  },

  destroy() {
    nodes = []
  },

  onMouseMove(x: number, y: number) {
    mouseX = x
    mouseY = y
  },
}
